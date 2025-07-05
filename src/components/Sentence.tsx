import React from 'react';
import type { TranscriptSentence } from '../types';
import { formatTime } from '../utils/timeFormat';
import { useHighlightStore } from '../store/highlightStore';
import { useVideoSync } from '../hooks/useVideoSync';

interface SentenceProps {
  sentence: TranscriptSentence;
}

export const Sentence: React.FC<SentenceProps> = ({ sentence }) => {
  const { toggleSentenceSelection } = useHighlightStore();
  const { seekTo } = useVideoSync();

  const handleTimestampClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    seekTo(sentence.startTime);
  };

  const handleSentenceClick = () => {
    toggleSentenceSelection(sentence.id);
  };

  return (
    <div
      id={`sentence-${sentence.id}`}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        sentence.isHighlighted 
          ? 'bg-blue-900 border-2 border-blue-500' 
          : sentence.isSelected 
            ? 'bg-gray-700 border-2 border-green-500' 
            : 'bg-gray-700 hover:bg-gray-600'
      }`}
      onClick={handleSentenceClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <button
            onClick={handleTimestampClick}
            className="text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors"
            title="Jump to this time"
          >
            {formatTime(sentence.startTime)}
          </button>
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed">{sentence.text}</p>
        </div>
        <div className="flex-shrink-0">
          <input
            type="checkbox"
            checked={sentence.isSelected}
            onChange={handleSentenceClick}
            className="w-4 h-4 text-green-500 rounded focus:ring-green-500 focus:ring-2"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};