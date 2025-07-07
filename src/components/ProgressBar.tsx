import React from 'react';
import type { TranscriptSentence } from '../types';
import { getTimePercentage } from '../utils/timeFormat';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  selectedSentences: TranscriptSentence[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  selectedSentences
}) => {
  const progress = getTimePercentage(currentTime, duration);

  return (
    <div
      className="relative w-full bg-gray-700 rounded-full h-1.5 md:h-2 touch-manipulation"
      data-testid="progress-bar"
    >
      <div
        className="bg-blue-500 h-1.5 md:h-2 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
      {selectedSentences.map(sentence => {
        const startPercent = getTimePercentage(sentence.startTime, duration);
        const widthPercent = getTimePercentage(
          sentence.endTime - sentence.startTime,
          duration
        );
        return (
          <div
            key={sentence.id}
            className="absolute h-1.5 md:h-2 bg-green-500 rounded-full top-0 min-w-[2px]"
            style={{
              left: `${startPercent}%`,
              width: `${Math.max(widthPercent, 0.5)}%`
            }}
          />
        );
      })}
    </div>
  );
};
