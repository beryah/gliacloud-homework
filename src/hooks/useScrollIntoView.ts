import { useEffect, useRef } from 'react';
import { scrollToElement } from '../utils/scrollHelper';
import { useHighlightStore } from '../store/highlightStore';

export const useScrollIntoView = () => {
  const { 
    videoData, 
    currentTime, 
    selectedSentences, 
    currentSentenceIndex,
    isPlayingSelected 
  } = useHighlightStore();
  const lastHighlightedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!videoData || !videoData.transcript) return;
    
    let currentSentence;
    
    if (selectedSentences.length > 0 && isPlayingSelected) {
      // When playing selected sentences, use the current sentence from the index
      currentSentence = selectedSentences[currentSentenceIndex];
    } else {
      // Otherwise, find sentence by time from all sentences or selected ones
      const sentencesToCheck = selectedSentences.length > 0 ? selectedSentences : 
        videoData.transcript.flatMap(section => section.sentences);
      
      currentSentence = sentencesToCheck.find(sentence => 
        currentTime >= sentence.startTime && currentTime <= sentence.endTime
      );
    }

    if (currentSentence && currentSentence.id !== lastHighlightedRef.current) {
      lastHighlightedRef.current = currentSentence.id;
      
      // Scroll to the highlighted sentence with a small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToElement(`sentence-${currentSentence.id}`, 'smooth', 'center');
      }, 100);
    }
  }, [videoData, currentTime, selectedSentences, currentSentenceIndex, isPlayingSelected]);

  const scrollToSentence = (sentenceId: string) => {
    scrollToElement(`sentence-${sentenceId}`, 'smooth', 'center');
  };

  const scrollToSection = (sectionId: string) => {
    scrollToElement(`section-${sectionId}`, 'smooth', 'start');
  };

  // Helper to scroll to current sentence when sentences are selected
  const scrollToCurrentSelectedSentence = () => {
    if (selectedSentences.length > 0) {
      const currentSentence = selectedSentences[currentSentenceIndex];
      if (currentSentence) {
        scrollToSentence(currentSentence.id);
      }
    }
  };

  return {
    scrollToSentence,
    scrollToSection,
    scrollToCurrentSelectedSentence
  };
};