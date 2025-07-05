import { useEffect, useRef } from 'react';
import { scrollToElement } from '../utils/scrollHelper';
import { useHighlightStore } from '../store/highlightStore';

export const useScrollIntoView = () => {
  const { videoData, currentTime, selectedSentences } = useHighlightStore();
  const lastHighlightedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!videoData || selectedSentences.length === 0) return;

    // Find the currently highlighted sentence
    const currentSentence = selectedSentences.find(sentence => 
      currentTime >= sentence.startTime && currentTime <= sentence.endTime
    );

    if (currentSentence && currentSentence.id !== lastHighlightedRef.current) {
      lastHighlightedRef.current = currentSentence.id;
      
      // Scroll to the highlighted sentence with a small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToElement(`sentence-${currentSentence.id}`, 'smooth', 'center');
      }, 100);
    }
  }, [videoData, currentTime, selectedSentences]);

  const scrollToSentence = (sentenceId: string) => {
    scrollToElement(`sentence-${sentenceId}`, 'smooth', 'center');
  };

  const scrollToSection = (sectionId: string) => {
    scrollToElement(`section-${sectionId}`, 'smooth', 'start');
  };

  return {
    scrollToSentence,
    scrollToSection
  };
};