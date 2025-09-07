import React from 'react';
import type { EmotionJourneyEntry } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface EmotionDisplayProps {
  entry: EmotionJourneyEntry;
  onStartOver: () => void;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ entry, onStartOver }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = entry.imageUrl;
    // Sanitize emotion name for filename
    const safeEmotion = entry.emotion.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `EmotionMirror_${safeEmotion}_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800/50 rounded-2xl shadow-lg backdrop-blur-sm border border-fuchsia-500/20 p-6 fade-in-up">
      <div className="aspect-square w-full rounded-lg overflow-hidden mb-6 shadow-2xl shadow-fuchsia-900/40">
        <img src={entry.imageUrl} alt={`Inspiring art for ${entry.emotion}`} className="w-full h-full object-cover" />
      </div>
      <div className="text-center">
        <h2 className="text-4xl font-bold text-fuchsia-300 mb-2">{entry.emotion}</h2>
        <p className="text-lg text-fuchsia-100 italic">"{entry.affirmation}"</p>
      </div>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
            onClick={onStartOver}
            className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 button-glow"
        >
            Create Another Reflection
        </button>
        <button
            onClick={handleDownload}
            title="Download Art"
            className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 hover:bg-gray-600 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110"
        >
            <DownloadIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default EmotionDisplay;