import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CallClient, VideoStreamRenderer, LocalVideoStream } from '@azure/communication-calling';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import axios from 'axios';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useSelector } from 'react-redux';

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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    setupMeeting();
    return () => cleanupCall();
  }, []);

  const setupMeeting = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/telemedicine/token', 
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
      setError(err.response?.data?.message || 'Failed to initialize meeting');
    }
  };

  const joinMeeting = async () => {
    try {
      const cameras = await deviceManager.getCameras();
      if (cameras.length === 0) throw new Error("No cameras found");
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

      groupCall.on('stateChanged', () => {
        if (groupCall.state === 'Disconnected') cleanupCall();
      });

      groupCall.on('remoteParticipantsUpdated', ev => {
        setRemoteParticipantCount(groupCall.remoteParticipants.length);
        ev.added.forEach(subscribeToParticipant);
      });

      const localRenderer = new VideoStreamRenderer(stream);
      const localView = await localRenderer.createView({ scalingMode: 'Crop' });
      localView.target.style.width = '100%';
      localView.target.style.height = '100%';
      if (localVideoRef.current) localVideoRef.current.appendChild(localView.target);

      groupCall.remoteParticipants.forEach(subscribeToParticipant);
    } catch(err) {
      console.error(err);
      setError('Failed to join meeting: ' + err.message);
    }
  };

  const subscribeToParticipant = (participant) => {
    participant.videoStreams.forEach(renderRemoteStream);
    participant.on('videoStreamsUpdated', e => e.added.forEach(renderRemoteStream));
  };

  const renderRemoteStream = async (stream) => {
    const displayVideo = async () => {
      const renderer = new VideoStreamRenderer(stream);
      const view = await renderer.createView({ scalingMode: 'Crop' });
      view.target.style.width = '100%';
      view.target.style.height = '100%';
      if (remoteVideoRef.current) remoteVideoRef.current.appendChild(view.target);
    };

    if (stream.isAvailable) await displayVideo();
    stream.on('isAvailableChanged', async () => {
      if (stream.isAvailable) await displayVideo();
    });
  };

  const toggleMic = async () => {
    if (!call) return;
    isMuted ? await call.unmute() : await call.mute();
    setIsMuted(!isMuted);
  };

  const toggleVideo = async () => {
    if (!call || !localStream) return;
    isVideoOn ? await call.stopVideo(localStream) : await call.startVideo(localStream);
    setIsVideoOn(!isVideoOn);
  };

  const executeEndCall = async () => {
    if (call) {
      await call.hangUp({ forEveryone: true });
    }

    if (role === 'Doctor') {
      try {
        await axios.post('http://localhost:5000/api/telemedicine/end', 
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
    if(call) {
       call.hangUp().catch(()=>{});
    }
    setCall(null);
    setCallAgent(null);
    setLocalStream(null);
    if (localVideoRef.current) localVideoRef.current.innerHTML = '';
    if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = '';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-2xl max-w-md w-full text-center">
           <h2 className="text-xl font-bold mb-2">Error</h2>
           <p>{error}</p>
           <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center">
      {showEndModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl">
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 text-center max-w-sm">
            <h3 className="text-xl font-bold mb-2">End Session?</h3>
            <p className="text-neutral-400 mb-6 text-sm">This will end the call for both you and the {role === 'Doctor' ? 'patient' : 'doctor'}.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowEndModal(false)} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition">Cancel</button>
              <button onClick={executeEndCall} className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition">End Call</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mt-4 relative">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-2xl font-bold">{role === 'Patient' ? 'Waiting Room' : 'Telemedicine Consultation'}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 flex flex-col justify-center h-full shadow-lg">
            {!callAgent ? (
              <div className="text-center p-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                 <p>Initializing Secure Connection...</p>
              </div>
            ) : !isJoined ? (
              <button onClick={joinMeeting} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 transition rounded-xl font-bold animate-pulse shadow-lg text-lg">
                Join Secure Network
              </button>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-emerald-400 font-bold mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  Connected Securely
                </div>
                <p className="text-xs text-neutral-500 font-mono mt-4">Room ID: {id.split('-')[0]}***</p>
              </div>
            )}
          </div>

          <div className="md:col-span-2 relative aspect-video bg-black rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col">
            {isJoined && remoteParticipantCount === 0 && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-900/90 backdrop-blur-md">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-6"></div>
                <h3 className="text-2xl font-bold">
                  {role === 'Patient' ? 'Waiting for your Doctor...' : 'Waiting for Patient...'}
                </h3>
                <p className="text-neutral-400 mt-2 font-medium">The consultation will begin automatically.</p>
              </div>
            )}

            <div className="flex-1 w-full h-full relative bg-neutral-950 overflow-hidden">
              {!isJoined && <div className="absolute inset-0 flex items-center justify-center"><p className="text-neutral-600 italic font-medium">Camera feed inactive</p></div>}
              
              {/* Remote Video Container - Full Screen */}
              <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full"></div>

              {/* Local Video Container - PIP */}
              {isJoined && (
                <div 
                  ref={localVideoRef} 
                  className={`absolute z-30 overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border-2 border-neutral-700 bg-neutral-900
                    ${remoteParticipantCount > 0 
                      ? "bottom-24 right-6 w-48 aspect-video rounded-2xl" 
                      : "inset-0 w-full h-full rounded-none border-0"}`}
                >
                </div>
              )}
            </div>

            {isJoined && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-lg border border-neutral-700 px-6 py-3 rounded-2xl flex gap-4 shadow-2xl z-20">
                <button onClick={toggleMic} className={`p-4 rounded-xl transition ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-neutral-800 hover:bg-neutral-700 text-white'}`}>
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-xl transition ${!isVideoOn ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-neutral-800 hover:bg-neutral-700 text-white'}`}>
                  {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
                <button onClick={() => setShowEndModal(true)} className="p-4 px-8 rounded-xl bg-red-600 hover:bg-red-500 font-bold ml-4 transition shadow-lg text-white flex items-center gap-2">
                  <PhoneOff size={24} /> End Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
