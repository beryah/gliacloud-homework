import React from 'react';
import { Segment } from './Segment';
import { useHighlightStore } from '../store/highlightStore';
import { useScrollIntoView } from '../hooks/useScrollIntoView';

export const TranscriptEditor: React.FC = () => {
  const { videoData, selectedSentences } = useHighlightStore();
  
  // Initialize scroll behavior
  useScrollIntoView();

  if (!videoData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">No transcript available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Transcript</h2>
        <div className="text-sm text-gray-400">
          {selectedSentences.length} sentence{selectedSentences.length !== 1 ? 's' : ''} selected
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {videoData.transcript.map((section) => (
            <Segment 
              key={section.id} 
              section={section}
            />
          ))}
        </div>
      </div>
    </div>
  );
};