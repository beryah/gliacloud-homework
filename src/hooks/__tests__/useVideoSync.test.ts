import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVideoSync } from '../useVideoSync';
import type { TranscriptSentence } from '../../types';

// Mock store
vi.mock('../../store/highlightStore', () => ({
  useHighlightStore: vi.fn(() => ({
    getState: vi.fn()
  })),
}));

import { useHighlightStore } from '../../store/highlightStore';

const mockUseHighlightStore = vi.mocked(useHighlightStore);

const mockSentences: TranscriptSentence[] = [
  { id: 'sentence1', text: 'First', startTime: 0, endTime: 5, isSelected: true, isHighlighted: false },
  { id: 'sentence2', text: 'Second', startTime: 10, endTime: 15, isSelected: true, isHighlighted: false },
];

describe('useVideoSync', () => {
  const mockVideo = {
    currentTime: 0,
    pause: vi.fn(),
    play: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLVideoElement;

  const mockActions = {
    setCurrentTime: vi.fn(),
    setIsPlaying: vi.fn(),
    setIsPlayingSelected: vi.fn(),
    goToNextSentence: vi.fn(),
    stopSelectedPlayback: vi.fn(),
    setCurrentSentenceIndex: vi.fn(),
    startSelectedPlayback: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseHighlightStore.mockReturnValue({
      videoElement: mockVideo,
      currentTime: 0,
      isPlaying: false,
      isPlayingSelected: false,
      currentSentenceIndex: 0,
      selectedSentences: [],
      ...mockActions,
    });
  });

  it('should return hook interface', () => {
    const { result } = renderHook(() => useVideoSync());

    expect(result.current).toEqual({
      currentTime: 0,
      isPlaying: false,
      togglePlayPause: expect.any(Function),
      seekTo: expect.any(Function),
      seekToSentence: expect.any(Function),
      getCurrentSentenceInfo: expect.any(Function),
      currentSentenceIndex: 0,
      isPlayingSelected: false,
      selectedSentences: [],
    });
  });

  it('should setup and cleanup video event listeners', () => {
    const { unmount } = renderHook(() => useVideoSync());

    expect(mockVideo.addEventListener).toHaveBeenCalledTimes(4);
    expect(mockVideo.addEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function));
    expect(mockVideo.addEventListener).toHaveBeenCalledWith('play', expect.any(Function));
    expect(mockVideo.addEventListener).toHaveBeenCalledWith('pause', expect.any(Function));
    expect(mockVideo.addEventListener).toHaveBeenCalledWith('seeked', expect.any(Function));

    unmount();

    expect(mockVideo.removeEventListener).toHaveBeenCalledTimes(4);
  });

  it('should not setup listeners when video element is null', () => {
    mockUseHighlightStore.mockReturnValue({
      videoElement: null,
      currentTime: 0,
      isPlaying: false,
      isPlayingSelected: false,
      currentSentenceIndex: 0,
      selectedSentences: [],
      ...mockActions,
    });

    renderHook(() => useVideoSync());

    expect(mockVideo.addEventListener).not.toHaveBeenCalled();
  });

  describe('togglePlayPause', () => {
    it('should play/pause normal video', () => {
      const { result, rerender } = renderHook(() => useVideoSync());

      // Play
      act(() => result.current.togglePlayPause());
      expect(mockVideo.play).toHaveBeenCalled();

      // Update to playing state and test pause
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: true,
        isPlayingSelected: false,
        currentSentenceIndex: 0,
        selectedSentences: [],
        ...mockActions,
      });
      rerender();

      act(() => result.current.togglePlayPause());
      expect(mockVideo.pause).toHaveBeenCalled();
    });

    it('should handle selected sentences playback', () => {
      const mockGetState = vi.fn(() => ({ startSelectedPlayback: mockActions.startSelectedPlayback }));
      (useHighlightStore as any).getState = mockGetState;

      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: false,
        currentSentenceIndex: 0,
        selectedSentences: mockSentences,
        ...mockActions,
      });

      const { result } = renderHook(() => useVideoSync());

      act(() => result.current.togglePlayPause());

      expect(mockActions.startSelectedPlayback).toHaveBeenCalled();
      expect(mockVideo.currentTime).toBe(0); // First sentence start time
      expect(mockVideo.play).toHaveBeenCalled();
    });

    it('should pause selected playback', () => {
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: true,
        currentSentenceIndex: 0,
        selectedSentences: mockSentences,
        ...mockActions,
      });

      const { result } = renderHook(() => useVideoSync());

      act(() => result.current.togglePlayPause());
      expect(mockVideo.pause).toHaveBeenCalled();
    });

    it('should handle null video element', () => {
      mockUseHighlightStore.mockReturnValue({
        videoElement: null,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: false,
        currentSentenceIndex: 0,
        selectedSentences: [],
        ...mockActions,
      });

      const { result } = renderHook(() => useVideoSync());

      act(() => result.current.togglePlayPause());
      expect(mockVideo.play).not.toHaveBeenCalled();
    });
  });

  describe('video event handlers', () => {
    let eventHandlers: Record<string, (event: Event) => void>;

    beforeEach(() => {
      eventHandlers = {};
      mockVideo.addEventListener = vi.fn((event, handler) => {
        eventHandlers[event] = handler as (event: Event) => void;
      });
    });

    it('should handle timeupdate event', () => {
      renderHook(() => useVideoSync());

      mockVideo.currentTime = 8;
      act(() => eventHandlers.timeupdate(new Event('timeupdate')));

      expect(mockActions.setCurrentTime).toHaveBeenCalledWith(8);
    });

    it('should handle timeupdate with selected playback - next sentence', () => {
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: true,
        currentSentenceIndex: 0,
        selectedSentences: mockSentences,
        ...mockActions,
      });

      renderHook(() => useVideoSync());

      // End of first sentence
      mockVideo.currentTime = 5;
      act(() => eventHandlers.timeupdate(new Event('timeupdate')));

      expect(mockActions.goToNextSentence).toHaveBeenCalled();
    });

    it('should handle timeupdate with selected playback - end of last sentence', () => {
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: true,
        currentSentenceIndex: 1, // Last sentence
        selectedSentences: mockSentences,
        ...mockActions,
      });

      renderHook(() => useVideoSync());

      // End of last sentence
      mockVideo.currentTime = 15;
      act(() => eventHandlers.timeupdate(new Event('timeupdate')));

      expect(mockVideo.pause).toHaveBeenCalled();
      expect(mockActions.stopSelectedPlayback).toHaveBeenCalled();
    });

    it('should handle play/pause events', () => {
      renderHook(() => useVideoSync());

      act(() => eventHandlers.play(new Event('play')));
      expect(mockActions.setIsPlaying).toHaveBeenCalledWith(true);

      act(() => eventHandlers.pause(new Event('pause')));
      expect(mockActions.setIsPlaying).toHaveBeenCalledWith(false);
    });

    it('should handle pause event with selected playback', () => {
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: true,
        currentSentenceIndex: 0,
        selectedSentences: mockSentences,
        ...mockActions,
      });

      renderHook(() => useVideoSync());

      act(() => eventHandlers.pause(new Event('pause')));

      expect(mockActions.setIsPlaying).toHaveBeenCalledWith(false);
      expect(mockActions.setIsPlayingSelected).toHaveBeenCalledWith(false);
    });

    it('should handle seeked event', () => {
      renderHook(() => useVideoSync());

      mockVideo.currentTime = 12;
      act(() => eventHandlers.seeked(new Event('seeked')));

      expect(mockActions.setCurrentTime).toHaveBeenCalledWith(12);
    });
  });

  describe('seeking functions', () => {
    it('should seek to time and update sentence index', () => {
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: false,
        currentSentenceIndex: 0,
        selectedSentences: mockSentences,
        ...mockActions,
      });

      const { result } = renderHook(() => useVideoSync());

      act(() => result.current.seekTo(12)); // Within second sentence

      expect(mockVideo.currentTime).toBe(12);
      expect(mockActions.setCurrentTime).toHaveBeenCalledWith(12);
      expect(mockActions.setCurrentSentenceIndex).toHaveBeenCalledWith(1);
    });

    it('should seek to time without updating index when no match', () => {
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: false,
        currentSentenceIndex: 0,
        selectedSentences: mockSentences,
        ...mockActions,
      });

      const { result } = renderHook(() => useVideoSync());

      act(() => result.current.seekTo(20)); // Outside sentence range

      expect(mockVideo.currentTime).toBe(20);
      expect(mockActions.setCurrentTime).toHaveBeenCalledWith(20);
      expect(mockActions.setCurrentSentenceIndex).not.toHaveBeenCalled();
    });

    it('should seek to sentence by index', () => {
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: false,
        currentSentenceIndex: 0,
        selectedSentences: mockSentences,
        ...mockActions,
      });

      const { result } = renderHook(() => useVideoSync());

      act(() => result.current.seekToSentence(1));

      expect(mockActions.setCurrentSentenceIndex).toHaveBeenCalledWith(1);
      expect(mockVideo.currentTime).toBe(10); // Second sentence start time
      expect(mockActions.setCurrentTime).toHaveBeenCalledWith(10);
    });
  });

  describe('sentence info and playing state', () => {
    it('should return sentence info when sentences selected', () => {
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: false,
        currentSentenceIndex: 1,
        selectedSentences: mockSentences,
        ...mockActions,
      });

      const { result } = renderHook(() => useVideoSync());

      expect(result.current.getCurrentSentenceInfo()).toEqual({
        current: 2,
        total: 2,
        sentence: mockSentences[1],
      });
    });

    it('should return null when no sentences selected', () => {
      const { result } = renderHook(() => useVideoSync());

      expect(result.current.getCurrentSentenceInfo()).toBeNull();
    });

    it('should return correct playing state - normal vs selected', () => {
      // Normal playback
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: true,
        isPlayingSelected: false,
        currentSentenceIndex: 0,
        selectedSentences: [],
        ...mockActions,
      });

      let { result } = renderHook(() => useVideoSync());
      expect(result.current.isPlaying).toBe(true);

      // Selected playback
      mockUseHighlightStore.mockReturnValue({
        videoElement: mockVideo,
        currentTime: 0,
        isPlaying: false,
        isPlayingSelected: true,
        currentSentenceIndex: 0,
        selectedSentences: mockSentences,
        ...mockActions,
      });

      ({ result } = renderHook(() => useVideoSync()));
      expect(result.current.isPlaying).toBe(true);
    });
  });

  it('should jump to sentence start when index changes during selected playback', () => {
    mockUseHighlightStore.mockReturnValue({
      videoElement: mockVideo,
      currentTime: 0,
      isPlaying: false,
      isPlayingSelected: true,
      currentSentenceIndex: 1,
      selectedSentences: mockSentences,
      ...mockActions,
    });

    renderHook(() => useVideoSync());

    expect(mockVideo.currentTime).toBe(10); // Second sentence start time
  });
});