import React, { useState, useEffect } from 'react';

interface LoaderProps {
  step: string;
}

const loadingMessages: { [key: string]: string[] } = {
  'Detecting your emotion...': [
    "Reading the colors of your spirit...", 
    "Listening to your silent story...", 
    "Translating your unique expression..."
  ],
  'Crafting your affirmation...': [
    "Crafting a mantra just for you...", 
    "Weaving words of power...", 
    "Finding your inner anthem..."
  ],
  'Painting your inner masterpiece...': [
    "Painting your inner landscape...", 
    "Gathering starlight for your reflection...", 
    "Revealing your masterpiece..."
  ],
};

const Loader: React.FC<LoaderProps> = ({ step }) => {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const messages = loadingMessages[step] || [step];
    let messageIndex = 0;
    setCurrentMessage(messages[messageIndex]);

    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setCurrentMessage(messages[messageIndex]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [step]);
  
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 fade-in-up">
       <div className="w-32 h-32 relative mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{ animationDuration: '20s' }}>
          {/* Orbit paths */}
          <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(192, 38, 211, 0.1)" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(192, 38, 211, 0.1)" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(192, 38, 211, 0.1)" strokeWidth="0.5"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-fuchsia-500 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }}></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-fuchsia-300 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
        </div>
        {/* Sparkles */}
        <div className="absolute top-[25%] left-[25%] w-2 h-2 bg-fuchsia-200 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-[75%] left-[75%] w-1.5 h-1.5 bg-fuchsia-200 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute top-[10%] left-[50%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
        <div className="absolute top-[90%] left-[50%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
      </div>
      
      <h3 className="text-2xl font-semibold text-fuchsia-200 mb-2">Creating Your Reflection...</h3>
      <p className="text-fuchsia-300 transition-opacity duration-500 min-h-[24px]">{currentMessage}</p>
    </div>
  );
};

export default Loader;