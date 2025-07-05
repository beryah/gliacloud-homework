// src/hooks/useVideoSync.ts

import { useCallback, useRef, useEffect } from 'react';
import { useHighlightStore } from '../store/highlightStore';
import type { VideoPlayerRef } from '../types';

export const useVideoSync = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    currentTime,
    isPlaying,
    setCurrentTime,
    setIsPlaying
  } = useHighlightStore();

  // Create video player interface
  const playerRef = useRef<VideoPlayerRef>({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    getCurrentTime: () => videoRef.current?.currentTime || 0
  });

  // Handle video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [setCurrentTime, setIsPlaying]);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  return {
    videoRef,
    playerRef: playerRef.current,
    currentTime,
    isPlaying,
    togglePlayPause,
    seekTo
  };
};