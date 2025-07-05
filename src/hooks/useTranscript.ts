import { useCallback } from 'react';
import { processVideoFile } from '../services/transcriptService';
import { useHighlightStore } from '../store/highlightStore';

export const useTranscript = () => {
  const {
    videoData,
    isProcessing,
    setVideoData,
    setIsProcessing,
    resetState
  } = useHighlightStore();

  const processVideo = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) {
      throw new Error('Please upload a video file');
    }

    setIsProcessing(true);
    try {
      const data = await processVideoFile(file);
      setVideoData(data);
      return data;
    } catch (error) {
      console.error('Error processing video:', error);
      throw new Error('Error processing video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [setVideoData, setIsProcessing]);

  const clearVideo = useCallback(() => {
    resetState();
  }, [resetState]);

  return {
    videoData,
    isProcessing,
    processVideo,
    clearVideo
  };
};