import React from 'react';
import type { TranscriptSection } from '../types';
import { Sentence } from './Sentence';

interface SegmentProps {
  section: TranscriptSection;
}

export const Segment: React.FC<SegmentProps> = ({ section }) => {
  return (
    <div className="space-y-2">
      <h3 
        id={`section-${section.id}`}
        className="text-lg font-medium text-blue-400 sticky top-0 bg-gray-800 py-2 z-10"
      >
        {section.title}
      </h3>
      <div className="space-y-2">
        {section.sentences.map((sentence) => (
          <Sentence 
            key={sentence.id} 
            sentence={sentence}
          />
        ))}
      </div>
    </div>
  );
};