import { useCallback, useEffect } from 'react';
import { useHighlightStore } from '../store/highlightStore';

export const useVideoSync = () => {
  const {
    videoElement,
    currentTime,
    isPlaying,
    setCurrentTime,
    setIsPlaying
  } = useHighlightStore();

  // Handle video time updates
  useEffect(() => {
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [videoElement, setCurrentTime, setIsPlaying]);

  const togglePlayPause = useCallback(() => {
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
    }
  }, [videoElement, isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (videoElement) {
      videoElement.currentTime = time;
      setCurrentTime(time);
    }
  }, [videoElement, setCurrentTime]);

  return {
    currentTime,
    isPlaying,
    togglePlayPause,
    seekTo
  };
};