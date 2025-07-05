import { describe, it, expect, beforeEach } from 'vitest';
import { useHighlightStore } from '../highlightStore';
import type { VideoData } from '../../types';

const mockVideoData: VideoData = {
  url: 'blob:test-video-url',
  duration: 120,
  transcript: [
    {
      id: 'section1',
      title: 'Introduction',
      sentences: [
        {
          id: 'sentence1',
          text: 'Welcome to the presentation.',
          startTime: 0,
          endTime: 5,
          isSelected: false,
          isHighlighted: false,
        },
        {
          id: 'sentence2',
          text: 'Today we will discuss various topics.',
          startTime: 5,
          endTime: 10,
          isSelected: false,
          isHighlighted: false,
        },
      ],
    },
    {
      id: 'section2',
      title: 'Main Content',
      sentences: [
        {
          id: 'sentence3',
          text: 'Let us begin with the first topic.',
          startTime: 15,
          endTime: 20,
          isSelected: false,
          isHighlighted: false,
        },
      ],
    },
  ],
};

describe('useHighlightStore', () => {
  beforeEach(() => {
    useHighlightStore.getState().resetState();
  });

  it('should have initial state', () => {
    const state = useHighlightStore.getState();

    expect(state.videoData).toBeNull();
    expect(state.currentTime).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.isProcessing).toBe(false);
    expect(state.selectedSentences).toEqual([]);
    expect(state.videoElement).toBeNull();
    expect(state.isPlayingSelected).toBe(false);
    expect(state.currentSentenceIndex).toBe(0);
  });

  it('should set video element', () => {
    const mockElement = document.createElement('video');
    
    useHighlightStore.getState().setVideoElement(mockElement);
    
    expect(useHighlightStore.getState().videoElement).toBe(mockElement);
  });

  it('should set video data and update selected sentences', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    
    const state = useHighlightStore.getState();
    expect(state.videoData).toEqual(mockVideoData);
    expect(state.selectedSentences).toEqual([]); // No sentences selected initially
  });

  it('should set current time and trigger highlighting', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    useHighlightStore.getState().setCurrentTime(3);
    
    const state = useHighlightStore.getState();
    expect(state.currentTime).toBe(3);
    // Should highlight sentence1 (0-5)
    expect(state.videoData?.transcript[0].sentences[0].isHighlighted).toBe(true);
    expect(state.videoData?.transcript[0].sentences[1].isHighlighted).toBe(false);
  });

  it('should set playing states', () => {
    useHighlightStore.getState().setIsPlaying(true);
    expect(useHighlightStore.getState().isPlaying).toBe(true);

    useHighlightStore.getState().setIsPlayingSelected(true);
    expect(useHighlightStore.getState().isPlayingSelected).toBe(true);
  });

  it('should set processing state', () => {
    useHighlightStore.getState().setIsProcessing(true);
    expect(useHighlightStore.getState().isProcessing).toBe(true);
  });

  it('should toggle sentence selection', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    
    // Select sentence1
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    
    let state = useHighlightStore.getState();
    expect(state.videoData?.transcript[0].sentences[0].isSelected).toBe(true);
    expect(state.selectedSentences).toHaveLength(1);
    expect(state.selectedSentences[0].id).toBe('sentence1');
    
    // Deselect sentence1
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    
    state = useHighlightStore.getState();
    expect(state.videoData?.transcript[0].sentences[0].isSelected).toBe(false);
    expect(state.selectedSentences).toHaveLength(0);
  });

  it('should select multiple sentences and sort by start time', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    
    // Select sentence3 first (later in time)
    useHighlightStore.getState().toggleSentenceSelection('sentence3');
    // Then select sentence1 (earlier in time)
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    
    const state = useHighlightStore.getState();
    expect(state.selectedSentences).toHaveLength(2);
    // Should be sorted by start time
    expect(state.selectedSentences[0].id).toBe('sentence1'); // startTime: 0
    expect(state.selectedSentences[1].id).toBe('sentence3'); // startTime: 15
  });

  it('should highlight current sentence from selected sentences', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    useHighlightStore.getState().toggleSentenceSelection('sentence3');
    
    // Set time within sentence3 range
    useHighlightStore.getState().setCurrentTime(17);
    
    const state = useHighlightStore.getState();
    expect(state.videoData?.transcript[0].sentences[0].isHighlighted).toBe(false); // sentence1
    expect(state.videoData?.transcript[1].sentences[0].isHighlighted).toBe(true);  // sentence3
  });

  it('should highlight from all sentences when no sentences selected', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    
    // Set time within sentence2 range
    useHighlightStore.getState().setCurrentTime(7);
    
    const state = useHighlightStore.getState();
    expect(state.videoData?.transcript[0].sentences[0].isHighlighted).toBe(false); // sentence1
    expect(state.videoData?.transcript[0].sentences[1].isHighlighted).toBe(true);  // sentence2
  });

  it('should set current sentence index', () => {
    useHighlightStore.getState().setCurrentSentenceIndex(2);
    expect(useHighlightStore.getState().currentSentenceIndex).toBe(2);
  });

  it('should start selected playback', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    
    useHighlightStore.getState().startSelectedPlayback();
    
    const state = useHighlightStore.getState();
    expect(state.isPlayingSelected).toBe(true);
    expect(state.currentSentenceIndex).toBe(0);
  });

  it('should not start selected playback without sentences', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    
    useHighlightStore.getState().startSelectedPlayback();
    
    const state = useHighlightStore.getState();
    expect(state.isPlayingSelected).toBe(false);
    expect(state.currentSentenceIndex).toBe(0);
  });

  it('should stop selected playback', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    useHighlightStore.getState().startSelectedPlayback();
    useHighlightStore.getState().setCurrentSentenceIndex(1);
    
    useHighlightStore.getState().stopSelectedPlayback();
    
    const state = useHighlightStore.getState();
    expect(state.isPlayingSelected).toBe(false);
    expect(state.currentSentenceIndex).toBe(0);
  });

  it('should go to next sentence', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    useHighlightStore.getState().toggleSentenceSelection('sentence3');
    useHighlightStore.getState().setCurrentSentenceIndex(0);
    
    const hasNext = useHighlightStore.getState().goToNextSentence();
    
    expect(hasNext).toBe(true);
    expect(useHighlightStore.getState().currentSentenceIndex).toBe(1);
  });

  it('should stop playback when reaching last sentence', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    useHighlightStore.getState().setCurrentSentenceIndex(0); // Last sentence (only one selected)
    
    const hasNext = useHighlightStore.getState().goToNextSentence();
    
    expect(hasNext).toBe(false);
    expect(useHighlightStore.getState().isPlayingSelected).toBe(false);
    expect(useHighlightStore.getState().currentSentenceIndex).toBe(0);
  });

  it('should go to previous sentence', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    useHighlightStore.getState().toggleSentenceSelection('sentence3');
    useHighlightStore.getState().setCurrentSentenceIndex(1);
    
    const hasPrev = useHighlightStore.getState().goToPreviousSentence();
    
    expect(hasPrev).toBe(true);
    expect(useHighlightStore.getState().currentSentenceIndex).toBe(0);
  });

  it('should not go to previous sentence when at first', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    useHighlightStore.getState().setCurrentSentenceIndex(0);
    
    const hasPrev = useHighlightStore.getState().goToPreviousSentence();
    
    expect(hasPrev).toBe(false);
    expect(useHighlightStore.getState().currentSentenceIndex).toBe(0);
  });

  it('should handle toggle selection without video data', () => {
    useHighlightStore.getState().toggleSentenceSelection('sentence1');
    
    // Should not crash and state should remain unchanged
    const state = useHighlightStore.getState();
    expect(state.videoData).toBeNull();
    expect(state.selectedSentences).toEqual([]);
  });

  it('should handle highlighting without video data', () => {
    useHighlightStore.getState().highlightCurrentSentence(5);
    
    // Should not crash
    expect(useHighlightStore.getState().videoData).toBeNull();
  });

  it('should reset state completely', () => {
    // Set up some state
    useHighlightStore.getState().setVideoData(mockVideoData);
    useHighlightStore.getState().setCurrentTime(10);
    useHighlightStore.getState().setIsPlaying(true);
    useHighlightStore.getState().setIsPlayingSelected(true);
    useHighlightStore.getState().setCurrentSentenceIndex(2);
    useHighlightStore.getState().setVideoElement(document.createElement('video'));
    
    // Reset
    useHighlightStore.getState().resetState();
    
    const state = useHighlightStore.getState();
    expect(state.videoData).toBeNull();
    expect(state.currentTime).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.isProcessing).toBe(false);
    expect(state.selectedSentences).toEqual([]);
    expect(state.videoElement).toBeNull();
    expect(state.isPlayingSelected).toBe(false);
    expect(state.currentSentenceIndex).toBe(0);
  });

  it('should clear highlighting when no sentence matches current time', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    
    // First highlight a sentence
    useHighlightStore.getState().setCurrentTime(3); // sentence1
    expect(useHighlightStore.getState().videoData?.transcript[0].sentences[0].isHighlighted).toBe(true);
    
    // Then move to time with no sentence
    useHighlightStore.getState().setCurrentTime(25); // No sentence covers this time
    
    const state = useHighlightStore.getState();
    expect(state.videoData?.transcript[0].sentences[0].isHighlighted).toBe(false);
    expect(state.videoData?.transcript[0].sentences[1].isHighlighted).toBe(false);
    expect(state.videoData?.transcript[1].sentences[0].isHighlighted).toBe(false);
  });

  it('should handle sentence selection with non-existent sentence ID', () => {
    useHighlightStore.getState().setVideoData(mockVideoData);
    
    useHighlightStore.getState().toggleSentenceSelection('non-existent');
    
    // Should not crash and no sentences should be selected
    const state = useHighlightStore.getState();
    expect(state.selectedSentences).toHaveLength(0);
    expect(state.videoData?.transcript[0].sentences[0].isSelected).toBe(false);
  });
});