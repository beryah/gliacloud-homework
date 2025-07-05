import React from 'react';
import { useHighlightStore } from '../store/highlightStore';

export const HighlightOverlay: React.FC = () => {
  const { currentTime, selectedSentences } = useHighlightStore();

  // Find the current sentence being played
  const currentSentence = selectedSentences.find(sentence => 
    currentTime >= sentence.startTime && currentTime <= sentence.endTime
  );

  if (!currentSentence) {
    return null;
  }

  return (
    <div className="absolute bottom-2 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 px-3 md:px-6 py-2 md:py-3 rounded-lg max-w-xs sm:max-w-sm md:max-w-4xl mx-2 md:mx-4">
      <p className="text-white text-center text-sm md:text-lg leading-relaxed break-words">
        {currentSentence.text}
      </p>
    </div>
  );
};