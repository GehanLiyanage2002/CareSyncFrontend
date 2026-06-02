import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const FaceCapture = ({ onCapture, mode = 'register', buttonText = 'Capture Face ID' }) => {
  const videoRef = useRef();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, scanning, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        
        // Reverted: Use ssdMobilenetv1 for all modes to maintain compatibility with old data
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        
        setIsModelLoaded(true);
        startVideo();
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setErrorMessage('Failed to load face recognition models.');
        setStatus('error');
      }
    };
    loadModels();

    return () => {
      stopVideo();
    };
  }, [mode]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => { 
        if (videoRef.current) {
          videoRef.current.srcObject = stream; 
        }
      })
      .catch((err) => {
        console.error("Webcam Error:", err);
        setErrorMessage('Could not access webcam. Please allow camera permissions.');
        setStatus('error');
      });
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleCapture = async () => {
    if (!isModelLoaded || !videoRef.current) return;
    setStatus('scanning');
    setErrorMessage('');

    try {
      let detection;
      // Reverted: Use ssdMobilenetv1 for ALL modes to maintain data compatibility
      detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
      
      if (!detection) {
        setStatus('error');
        setErrorMessage('No face detected. Please look clearly at the camera.');
        setTimeout(() => setStatus('idle'), 3000);
        return;
      }

      setStatus('success');
      
      // Turn off camera access immediately after a successful scan
      stopVideo();
      
      onCapture(Array.from(detection.descriptor));
      
    } catch (err) {
      console.error("Capture Error:", err);
      setStatus('error');
      setErrorMessage('An error occurred during scanning.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-3xl relative overflow-hidden shadow-2xl border border-slate-700/50">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-900/40 z-0 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          {status === 'scanning' ? (
            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : status === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <Camera className="w-5 h-5 text-indigo-400" />
          )}
          Biometric Scan
        </h3>

        <div className={`relative w-64 h-64 rounded-full overflow-hidden border-4 shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-all duration-300 ${
          status === 'success' ? 'border-green-400 shadow-[0_0_40px_rgba(74,222,128,0.4)]' :
          status === 'error' ? 'border-red-400 shadow-[0_0_40px_rgba(248,113,113,0.4)]' :
          status === 'scanning' ? 'border-indigo-400 animate-pulse' : 'border-slate-700'
        }`}>
          {!isModelLoaded && status !== 'error' && (
            <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center z-20">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
              <span className="text-sm font-medium text-slate-300">Initializing AI...</span>
            </div>
          )}
          
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
          
          {/* Scanning Overlay Effect */}
          {status === 'scanning' && (
            <div className="absolute inset-0 bg-indigo-500/20 z-10">
              <div className="w-full h-1 bg-indigo-400/80 shadow-[0_0_15px_rgba(129,140,248,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="mt-4 text-red-400 text-sm font-medium text-center bg-red-900/30 px-4 py-2 rounded-lg border border-red-800/50">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleCapture}
          disabled={!isModelLoaded || status === 'scanning' || status === 'success'}
          className="mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-900/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'scanning' ? 'Verifying...' : status === 'success' ? 'Face Captured' : buttonText}
        </button>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(256px); }
        }
      `}</style>
    </div>
  );
};

export default FaceCapture;
