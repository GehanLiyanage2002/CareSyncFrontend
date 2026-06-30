import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CallClient, VideoStreamRenderer, LocalVideoStream } from '@azure/communication-calling';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import axios from 'axios';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, ShieldCheck, Clock, Activity, Signal, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function TelemedicineVideoRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const role = user?.role;

  const [callAgent, setCallAgent] = useState(null);
  const [deviceManager, setDeviceManager] = useState(null);
  const [call, setCall] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteParticipantCount, setRemoteParticipantCount] = useState(0);

  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localRendererRef = useRef(null);
  const remoteRendererRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setupMeeting();
    return () => cleanupCall();
  }, []);

  useEffect(() => {
    if (isJoined && remoteParticipantCount > 0) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isJoined, remoteParticipantCount]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const setupMeeting = async () => {
    try {
      const res = await axios.post('https://caresync-backend-api-gl.azurewebsites.net/api/telemedicine/token', 
        { appointmentId: id },
        { headers: { Authorization: token } }
      );

      const tokenCredential = new AzureCommunicationTokenCredential(res.data.token);
      const callClient = new CallClient();
      const agent = await callClient.createCallAgent(tokenCredential);
      const devices = await callClient.getDeviceManager();

      await devices.askDevicePermission({ video: true, audio: true });

      setCallAgent(agent);
      setDeviceManager(devices);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to initialize secure medical connection.');
    }
  };

  const joinMeeting = async () => {
    try {
      const cameras = await deviceManager.getCameras();
      if (cameras.length === 0) throw new Error("No cameras found. Please connect a webcam.");
      const stream = new LocalVideoStream(cameras[0]);
      setLocalStream(stream);

      const groupCall = callAgent.join({ groupId: id }, {
        videoOptions: { localVideoStreams: [stream] }
      });

      setCall(groupCall);
      setIsJoined(true);
      setIsMuted(false);
      setIsVideoOn(true);
      setRemoteParticipantCount(groupCall.remoteParticipants.length);
      toast.success("Joined Consultation");

      groupCall.on('stateChanged', () => {
        if (groupCall.state === 'Disconnected') {
           toast('Consultation Ended', { icon: '👋' });
           cleanupCall();
        }
      });

      groupCall.on('remoteParticipantsUpdated', ev => {
        setRemoteParticipantCount(groupCall.remoteParticipants.length);
        ev.added.forEach(subscribeToParticipant);
      });

      // Render Local Video
      localRendererRef.current = new VideoStreamRenderer(stream);
      const localView = await localRendererRef.current.createView({ scalingMode: 'Crop' });
      localView.target.style.width = '100%';
      localView.target.style.height = '100%';
      localView.target.style.objectFit = 'cover';
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = '';
        localVideoRef.current.appendChild(localView.target);
      }

      groupCall.remoteParticipants.forEach(subscribeToParticipant);
    } catch(err) {
      console.error(err);
      setError('Failed to join meeting: ' + err.message);
    }
  };

  const subscribeToParticipant = (participant) => {
    participant.videoStreams.forEach(renderRemoteStream);
    participant.on('videoStreamsUpdated', e => {
       e.added.forEach(renderRemoteStream);
       e.removed.forEach(() => {
          if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = '';
          if (remoteRendererRef.current) remoteRendererRef.current.dispose();
       });
    });
  };

  const renderRemoteStream = async (stream) => {
    const displayVideo = async () => {
      try {
        if (remoteRendererRef.current) {
          try { remoteRendererRef.current.dispose(); } catch(e){}
          remoteRendererRef.current = null;
        }
        if (remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = '';
        }
        
        const renderer = new VideoStreamRenderer(stream);
        remoteRendererRef.current = renderer;
        
        const view = await renderer.createView({ scalingMode: 'Crop' });
        view.target.style.width = '100%';
        view.target.style.height = '100%';
        view.target.style.objectFit = 'cover';
        
        if (remoteVideoRef.current) remoteVideoRef.current.appendChild(view.target);
      } catch (err) {
        console.error("Failed to render remote video", err);
      }
    };

    if (stream.isAvailable) await displayVideo();
    stream.on('isAvailableChanged', async () => {
      if (stream.isAvailable) {
        await displayVideo();
      } else {
        if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = '';
        if (remoteRendererRef.current) {
           try { remoteRendererRef.current.dispose(); } catch(e){}
           remoteRendererRef.current = null;
        }
      }
    });
  };

  const toggleMic = async () => {
    if (!call) return;
    try {
      isMuted ? await call.unmute() : await call.mute();
      setIsMuted(!isMuted);
    } catch (e) {
      toast.error('Failed to toggle microphone');
    }
  };

  const toggleVideo = async () => {
    if (!call || !localStream) return;
    try {
      if (isVideoOn) {
        await call.stopVideo(localStream);
      } else {
        await call.startVideo(localStream);
      }
      setIsVideoOn(!isVideoOn);
    } catch (e) {
      toast.error('Failed to toggle video');
    }
  };

  const executeEndCall = async () => {
    if (call) {
      await call.hangUp({ forEveryone: true });
    }

    if (role === 'Doctor') {
      try {
        await axios.post('https://caresync-backend-api-gl.azurewebsites.net/api/telemedicine/end', 
          { appointmentId: id },
          { headers: { Authorization: token } }
        );
      } catch (err) {
        console.error("Failed to mark complete", err);
      }
    }
    cleanupCall();
    navigate(role === 'Doctor' ? '/doctor/dashboard' : '/patient/dashboard');
  };

  const cleanupCall = () => {
    setIsJoined(false);
    clearInterval(timerRef.current);
    if(call) call.hangUp().catch(()=>{});
    
    if (localRendererRef.current) {
       try { localRendererRef.current.dispose(); } catch(e){}
       localRendererRef.current = null;
    }
    if (remoteRendererRef.current) {
       try { remoteRendererRef.current.dispose(); } catch(e){}
       remoteRendererRef.current = null;
    }
    
    setCall(null);
    setCallAgent(null);
    setLocalStream(null);
    
    if (localVideoRef.current) localVideoRef.current.innerHTML = '';
    if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = '';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-red-500/50 text-red-400 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl">
           <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity size={32} />
           </div>
           <h2 className="text-2xl font-black mb-2 text-white">Connection Error</h2>
           <p className="text-neutral-400 mb-8 leading-relaxed">{error}</p>
           <button onClick={() => navigate(-1)} className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-lg">
             Return to Dashboard
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden relative font-sans">
      
      {/* End Call Confirmation Modal */}
      {showEndModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-900/90 border border-neutral-800 p-8 rounded-[2rem] text-center max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black mb-2 text-white">End Consultation?</h3>
            <p className="text-neutral-400 mb-8 font-medium">This will terminate the secure connection for everyone in this session.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowEndModal(false)} className="flex-1 py-3.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition-all text-white border border-neutral-700">Cancel</button>
              <button onClick={executeEndCall} className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all text-white shadow-lg shadow-red-600/20">End Session</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Video Area (Full Screen minus padding) */}
      <div className="flex-1 w-full h-full p-2 md:p-4 relative flex items-center justify-center">
        
        {/* Pre-join or Loading State */}
        {!isJoined && (
          <div className="absolute inset-4 z-10 bg-neutral-900 rounded-[2rem] border border-neutral-800 shadow-2xl flex flex-col items-center justify-center">
            {!callAgent ? (
              <div className="text-center animate-in fade-in zoom-in duration-500">
                 <div className="relative w-24 h-24 mx-auto mb-6">
                   <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                   <div className="absolute inset-2 bg-blue-500/40 rounded-full animate-pulse"></div>
                   <div className="absolute inset-4 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                     <ShieldCheck size={32} className="text-white" />
                   </div>
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tight mb-2">Establishing Connection</h2>
                 <p className="text-neutral-400 font-medium max-w-sm mx-auto">Securing medical encryption tunnels. Please wait a moment...</p>
              </div>
            ) : (
              <div className="text-center w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <VideoIcon size={32} />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-2">Ready to Join</h2>
                <p className="text-neutral-400 font-medium mb-8">Your secure connection is established. Ensure your camera and microphone are ready.</p>
                <button onClick={joinMeeting} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 transition-all rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/50 active:scale-95 flex items-center justify-center gap-3 text-white">
                  <VideoIcon size={20} />
                  Join Consultation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Remote Video Container - Takes up full background when joined */}
        <div className={`absolute inset-2 md:inset-4 bg-black rounded-[2rem] overflow-hidden border border-neutral-800 shadow-2xl transition-all duration-700 ${isJoined ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          
          {/* Waiting for participant state */}
          {isJoined && remoteParticipantCount === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-xl">
              <div className="w-24 h-24 relative mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-neutral-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <User size={32} className="text-blue-500" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">
                {role === 'Patient' ? 'Waiting for Doctor...' : 'Waiting for Patient...'}
              </h3>
              <p className="text-blue-400 mt-3 font-bold bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 flex items-center gap-2">
                <Signal size={16} className="animate-pulse" />
                Session is active and recording
              </p>
            </div>
          )}

          <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full object-cover"></div>

          {/* Top Info Bar */}
          {isJoined && (
            <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
              <div className="flex flex-col gap-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"></div>
                  <span className="font-bold text-white tracking-wide">{role === 'Patient' ? 'Medical Consultation' : 'Patient Session'}</span>
                </div>
                {remoteParticipantCount > 0 && (
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg self-start">
                    <Clock size={14} className="text-blue-400" />
                    <span className="font-mono font-bold text-white tracking-widest">{formatTime(duration)}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-lg">
                 <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck size={14} /> End-to-End Encrypted
                 </span>
              </div>
            </div>
          )}

          {/* Local Video Container (PIP) */}
          {isJoined && (
            <div 
              className={`absolute z-30 overflow-hidden shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-2 border-white/10 bg-neutral-900
                ${remoteParticipantCount > 0 
                  ? "bottom-28 right-6 w-32 md:w-56 aspect-[3/4] md:aspect-video rounded-2xl" 
                  : "inset-0 w-full h-full rounded-none border-0"}`}
            >
              <div ref={localVideoRef} className="w-full h-full object-cover bg-neutral-800"></div>
              {!isVideoOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mb-2">
                    <VideoOff size={20} className="text-neutral-500" />
                  </div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Camera Off</span>
                </div>
              )}
            </div>
          )}

          {/* Controls Bar */}
          {isJoined && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] flex items-center gap-2 shadow-2xl shadow-black/50">
                <button 
                  onClick={toggleMic} 
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isMuted ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                
                <button 
                  onClick={toggleVideo} 
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${!isVideoOn ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  title={!isVideoOn ? "Start Video" : "Stop Video"}
                >
                  {isVideoOn ? <VideoIcon size={22} /> : <VideoOff size={22} />}
                </button>
                
                <div className="w-px h-8 bg-white/10 mx-2"></div>
                
                <button 
                  onClick={() => setShowEndModal(true)} 
                  className="h-14 px-8 rounded-full bg-red-600 hover:bg-red-500 font-black transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] text-white flex items-center gap-2"
                >
                  <PhoneOff size={20} />
                  <span className="hidden md:inline">End Call</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
