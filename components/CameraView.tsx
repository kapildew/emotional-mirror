import React, { useEffect } from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCapture: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ videoRef, canvasRef, onCapture }) => {
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        // Handle camera access error (e.g., show a message to the user)
      }
    };

    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-fuchsia-900/50 border-2 border-fuchsia-500/30 animate-fade-in">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 bg-black/20 flex items-end justify-center p-6">
        <button
          onClick={onCapture}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <CameraIcon className="w-6 h-6" />
          <span>Capture</span>
        </button>
      </div>
    </div>
  );
};

export default CameraView;