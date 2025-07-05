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
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 px-6 py-3 rounded-lg max-w-4xl mx-4">
      <p className="text-white text-center text-lg leading-relaxed">
        {currentSentence.text}
      </p>
    </div>
  );
};