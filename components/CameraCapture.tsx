
import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Default to back camera for color scanning
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsReady(true);
      } catch (err) {
        setError("Camera access denied. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(dataUrl.split(',')[1]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden glass border-2 border-white/20">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-400">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
            <button onClick={onClose} className="mt-6 px-6 py-2 bg-white/10 rounded-xl">Go Back</button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Scanning Overlay UI */}
            <div className="absolute inset-0 border-2 border-indigo-500/50 m-12 rounded-xl pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-500/50 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 flex justify-center px-8 gap-4">
              <button 
                onClick={onClose}
                className="w-14 h-14 rounded-full glass flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button 
                onClick={captureFrame}
                disabled={!isReady}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 rounded-full border-4 border-slate-900"></div>
              </button>
              <div className="w-14 h-14"></div> {/* Spacer for symmetry */}
            </div>
          </>
        )}
      </div>
      <p className="mt-8 text-slate-400 text-sm text-center">Position the object in the frame<br/>to analyze its colors</p>
    </div>
  );
};

export default CameraCapture;
