import { useCallback, useEffect } from 'react';
import { useHighlightStore } from '../store/highlightStore';

export const useVideoSync = () => {
  const {
    videoElement,
    currentTime,
    isPlaying,
    isPlayingSelected,
    currentSentenceIndex,
    selectedSentences,
    setCurrentTime,
    setIsPlaying,
    setIsPlayingSelected,
    goToNextSentence,
    stopSelectedPlayback,
    setCurrentSentenceIndex
  } = useHighlightStore();

  // Handle video time updates
  useEffect(() => {
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const newTime = videoElement.currentTime;
      setCurrentTime(newTime);
      
      // Check if we're in selected playback mode
      if (isPlayingSelected && selectedSentences.length > 0) {
        const currentSentence = selectedSentences[currentSentenceIndex];
        
        // If we've reached the end of current sentence, move to next
        if (newTime >= currentSentence.endTime) {
          if (currentSentenceIndex < selectedSentences.length - 1) {
            // Move to next sentence
            goToNextSentence();
            // Jump to next sentence start
            const nextSentence = selectedSentences[currentSentenceIndex + 1];
            if (nextSentence) {
              videoElement.currentTime = nextSentence.startTime;
            }
          } else {
            // No more sentences, stop playback
            videoElement.pause();
            stopSelectedPlayback();
          }
        }
        
        // Ensure we don't play before the current sentence starts
        if (newTime < currentSentence.startTime) {
          videoElement.currentTime = currentSentence.startTime;
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    
    const handlePause = () => {
      setIsPlaying(false);
      if (isPlayingSelected) {
        setIsPlayingSelected(false);
      }
    };

    const handleSeeked = () => {
      // When user manually seeks, update current time
      setCurrentTime(videoElement.currentTime);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('seeked', handleSeeked);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('seeked', handleSeeked);
    };
  }, [videoElement, setCurrentTime, setIsPlaying, isPlayingSelected, 
      currentSentenceIndex, selectedSentences, goToNextSentence, 
      stopSelectedPlayback, setIsPlayingSelected]);

  // Jump to current sentence when index changes during selected playback
  useEffect(() => {
    if (isPlayingSelected && selectedSentences.length > 0 && videoElement) {
      const currentSentence = selectedSentences[currentSentenceIndex];
      if (currentSentence && Math.abs(videoElement.currentTime - currentSentence.startTime) > 0.1) {
        videoElement.currentTime = currentSentence.startTime;
      }
    }
  }, [currentSentenceIndex, isPlayingSelected, selectedSentences, videoElement]);

  const togglePlayPause = useCallback(() => {
    if (!videoElement) return;
    
    // If there are selected sentences, use selected playback mode
    if (selectedSentences.length > 0) {
      if (isPlayingSelected) {
        // Pause selected playback
        videoElement.pause();
      } else {
        // Start selected playback
        const store = useHighlightStore.getState();
        store.startSelectedPlayback();
        
        // Jump to first selected sentence
        const firstSentence = selectedSentences[0];
        videoElement.currentTime = firstSentence.startTime;
        videoElement.play();
      }
    } else {
      // No selected sentences, use normal full video playback
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
    }
  }, [videoElement, isPlaying, isPlayingSelected, selectedSentences]);

  const seekTo = useCallback((time: number) => {
    if (videoElement) {
      videoElement.currentTime = time;
      setCurrentTime(time);
      
      // If we have selected sentences, find which sentence this time belongs to
      if (selectedSentences.length > 0) {
        const sentenceIndex = selectedSentences.findIndex(
          sentence => time >= sentence.startTime && time <= sentence.endTime
        );
        if (sentenceIndex !== -1) {
          setCurrentSentenceIndex(sentenceIndex);
        }
      }
    }
  }, [videoElement, setCurrentTime, selectedSentences, setCurrentSentenceIndex]);

  // Helper function to seek to a specific sentence
  const seekToSentence = useCallback((sentenceIndex: number) => {
    if (selectedSentences[sentenceIndex] && videoElement) {
      const sentence = selectedSentences[sentenceIndex];
      setCurrentSentenceIndex(sentenceIndex);
      videoElement.currentTime = sentence.startTime;
      setCurrentTime(sentence.startTime);
    }
  }, [selectedSentences, videoElement, setCurrentSentenceIndex, setCurrentTime]);

  // Get the currently playing sentence info
  const getCurrentSentenceInfo = useCallback(() => {
    if (selectedSentences.length > 0) {
      return {
        current: currentSentenceIndex + 1,
        total: selectedSentences.length,
        sentence: selectedSentences[currentSentenceIndex]
      };
    }
    return null;
  }, [selectedSentences, currentSentenceIndex]);

  return {
    currentTime,
    isPlaying: selectedSentences.length > 0 ? isPlayingSelected : isPlaying,
    togglePlayPause,
    seekTo,
    seekToSentence,
    getCurrentSentenceInfo,
    // Expose playback state
    currentSentenceIndex,
    isPlayingSelected,
    selectedSentences
  };
};