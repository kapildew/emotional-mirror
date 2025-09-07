import React, { useState, useCallback, useRef } from 'react';
import type { EmotionJourneyEntry } from './types';
import { detectEmotion, generateInspiringArt, generateAffirmation } from './services/geminiService';
import CameraView from './components/CameraView';
import EmotionDisplay from './components/EmotionDisplay';
import JourneyTimeline from './components/JourneyTimeline';
import Loader from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { CameraIcon } from './components/icons/CameraIcon';
import { UploadIcon } from './components/icons/UploadIcon';

type AppState = 'welcome' | 'camera' | 'preview' | 'processing' | 'result';
type CaptureSource = 'camera' | 'upload';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [captureSource, setCaptureSource] = useState<CaptureSource | null>(null);
  const [capturedImage, setCapturedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionJourneyEntry | null>(null);
  const [emotionJourney, setEmotionJourney] = useState<EmotionJourneyEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'mirror' | 'journey'>('mirror');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUseCamera = () => {
    setAppState('camera');
    setActiveTab('mirror');
    setCaptureSource('camera');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const [meta, data] = result.split(',');
      const mimeType = meta.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
      
      setCapturedImage({ data, mimeType });
      setCaptureSource('upload');
      setAppState('preview');
      setActiveTab('mirror');
    };
    reader.readAsDataURL(file);
    if(event.target) {
      event.target.value = ''; // Reset file input to allow re-uploading the same file
    }
  };

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        setError("Could not get canvas context.");
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    const base64Image = imageDataUrl.split(',')[1];
    setCapturedImage({ data: base64Image, mimeType: 'image/jpeg' });
    setAppState('preview');
  }, []);

  const handleStartTransformation = useCallback(async () => {
    if (!capturedImage) return;

    setAppState('processing');
    setError(null);
    setCurrentEmotion(null);
    
    try {
      setLoadingStep('Detecting your emotion...');
      const detected = await detectEmotion(capturedImage.data, capturedImage.mimeType);

      setLoadingStep('Crafting your affirmation...');
      const affirmation = await generateAffirmation(detected);
      
      setLoadingStep('Painting your inner masterpiece...');
      const imageUrl = await generateInspiringArt(capturedImage.data, detected, affirmation, capturedImage.mimeType);

      const newEntry: EmotionJourneyEntry = {
        emotion: detected,
        affirmation,
        imageUrl,
        timestamp: new Date().toISOString(),
      };

      setCurrentEmotion(newEntry);
      setEmotionJourney(prev => [newEntry, ...prev]);
      setAppState('result');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState('preview'); // Go back to preview on error
    } finally {
      setLoadingStep('');
    }
  }, [capturedImage]);
  
  const handleReset = () => {
    setCapturedImage(null);
    setError(null);
    if (captureSource === 'camera') {
        setAppState('camera');
    } else {
        setAppState('welcome');
    }
  };
  
  const handleStartOver = () => {
      setCurrentEmotion(null);
      setCapturedImage(null);
      setCaptureSource(null);
      setAppState('welcome');
  }

  const renderContent = () => {
    if (activeTab === 'journey' && appState !== 'welcome') {
      return <JourneyTimeline journey={emotionJourney} />;
    }

    switch(appState) {
      case 'welcome':
        return (
          <div className="text-center flex flex-col items-center justify-center h-full py-16 px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-fuchsia-100 fade-in-up">Welcome to Emotion Mirror</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-fuchsia-200 mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
              Turn your self-reflection into an immersive, artistic experience. A dialogue between your feelings and AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={handleUseCamera}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 button-glow flex items-center justify-center gap-2"
              >
                <CameraIcon className="w-6 h-6"/> Use Camera
              </button>
              <button
                onClick={handleUploadClick}
                className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <UploadIcon className="w-6 h-6"/> Upload Image
              </button>
            </div>
          </div>
        );
      
      case 'camera':
        return <CameraView videoRef={videoRef} canvasRef={canvasRef} onCapture={handleCapture} />;
      
      case 'preview':
        return (
          <div className="flex flex-col items-center justify-center fade-in-up">
            <h2 className="text-3xl font-bold text-center mb-6 text-fuchsia-200">Your Captured Moment</h2>
            {capturedImage && (
              <img 
                src={`data:${capturedImage.mimeType};base64,${capturedImage.data}`} 
                alt="Captured preview" 
                className="w-full max-w-lg aspect-square object-cover rounded-2xl shadow-2xl shadow-fuchsia-900/50 border-2 border-fuchsia-500/30"
              />
            )}
            {error && <div className="mt-4 text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
            <div className="flex gap-4 mt-6">
              <button onClick={handleReset} className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
                {captureSource === 'camera' ? 'Retake Photo' : 'Choose Another'}
              </button>
              <button onClick={handleStartTransformation} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105 button-glow">
                Start Transformation
              </button>
            </div>
          </div>
        );

      case 'processing':
        return <div className="flex items-center justify-center p-4 min-h-[480px]"><Loader step={loadingStep} /></div>;

      case 'result':
        return <div className="flex items-center justify-center p-4 min-h-[480px]">{currentEmotion && <EmotionDisplay entry={currentEmotion} onStartOver={handleStartOver} />}</div>;
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-100 p-4 sm:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-gray-900/20 backdrop-blur-md border-b border-fuchsia-500/20 p-4 rounded-xl">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleStartOver}>
            <SparklesIcon className="w-8 h-8 text-fuchsia-400 animate-pulse"/>
            <h1 className="text-3xl font-bold tracking-wider text-fuchsia-100">Emotion Mirror</h1>
          </div>
          {appState !== 'welcome' && (
            <nav className="flex space-x-2 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
              <button
                onClick={() => setActiveTab('mirror')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'mirror' ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-800/50' : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                Mirror
              </button>
              <button
                onClick={() => setActiveTab('journey')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'journey' ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-800/50' : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                Journey
              </button>
            </nav>
          )}
        </header>
        <div className="bg-gray-900/20 backdrop-blur-md border border-fuchsia-500/10 rounded-xl p-4 sm:p-8 min-h-[60vh] flex flex-col justify-center">
            {renderContent()}
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg"
          onChange={handleFileSelected}
        />
      </main>
      <footer className="text-center text-xs text-gray-500 mt-8">
        Created for the NanoBanana Hackathon. The world's first emotional canvas.
      </footer>
    </div>
  );
};

export default App;