import React from 'react';
import type { EmotionJourneyEntry } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface JourneyTimelineProps {
  journey: EmotionJourneyEntry[];
}

const JourneyCard: React.FC<{ entry: EmotionJourneyEntry }> = ({ entry }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    const link = document.createElement('a');
    link.href = entry.imageUrl;
    const safeEmotion = entry.emotion.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `EmotionMirror_${safeEmotion}_${new Date(entry.timestamp).getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg border border-fuchsia-500/20 group transform hover:scale-105 hover:shadow-fuchsia-700/40 transition-all duration-300 flex flex-col">
      <div className="relative">
        <img src={entry.imageUrl} alt={`Inspiring art for ${entry.emotion}`} className="w-full h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
           <h3 className="text-2xl font-bold text-fuchsia-300">{entry.emotion}</h3>
           <p className="text-sm text-gray-400">{new Date(entry.timestamp).toLocaleString()}</p>
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-fuchsia-100 italic text-sm mb-4 flex-grow">"{entry.affirmation}"</p>
        <div className="text-right">
            <button
                onClick={handleDownload}
                title="Download Art"
                className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 hover:bg-fuchsia-600 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
            >
                <DownloadIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  )
}

const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ journey }) => {
  if (journey.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16 fade-in-up">
        <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-fuchsia-400" />
        <h2 className="text-3xl font-semibold mb-2">Your Journey Begins</h2>
        <p className="max-w-md mx-auto">Capture your first emotion in the 'Mirror' tab to start building your personal timeline of self-reflection.</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <h2 className="text-4xl font-bold text-center mb-8 text-fuchsia-200">Your Emotional Journey</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {journey.map((entry, index) => (
          <JourneyCard key={index} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default JourneyTimeline;