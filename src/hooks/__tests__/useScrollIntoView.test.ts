import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollIntoView } from '../useScrollIntoView';
import type { VideoData, TranscriptSentence } from '../../types';

// Mock dependencies
vi.mock('../../utils/scrollHelper', () => ({
  scrollToElement: vi.fn(),
}));

vi.mock('../../store/highlightStore', () => ({
  useHighlightStore: vi.fn(),
}));

// Import mocked functions
import { scrollToElement } from '../../utils/scrollHelper';
import { useHighlightStore } from '../../store/highlightStore';

const mockScrollToElement = vi.mocked(scrollToElement);
const mockUseHighlightStore = vi.mocked(useHighlightStore);

// Helper function to create mock video data
const createMockVideoData = (): VideoData => ({
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
});

// Helper function to create mock selected sentences
const createMockSelectedSentences = (): TranscriptSentence[] => [
  {
    id: 'sentence1',
    text: 'Welcome to the presentation.',
    startTime: 0,
    endTime: 5,
    isSelected: true,
    isHighlighted: false,
  },
  {
    id: 'sentence3',
    text: 'Let us begin with the first topic.',
    startTime: 15,
    endTime: 20,
    isSelected: true,
    isHighlighted: false,
  },
];

describe('useScrollIntoView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Default mock implementation
    mockUseHighlightStore.mockReturnValue({
      videoData: null,
      currentTime: 0,
      selectedSentences: [],
      currentSentenceIndex: 0,
      isPlayingSelected: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Return values', () => {
    it('should return scrollToSentence and scrollToSection functions', () => {
      const { result } = renderHook(() => useScrollIntoView());

      expect(result.current.scrollToSentence).toBeInstanceOf(Function);
      expect(result.current.scrollToSection).toBeInstanceOf(Function);
      expect(result.current.scrollToCurrentSelectedSentence).toBeInstanceOf(Function);
    });
  });

  describe('No video data scenarios', () => {
    it('should not scroll when videoData is null', () => {
      mockUseHighlightStore.mockReturnValue({
        videoData: null,
        currentTime: 5,
        selectedSentences: createMockSelectedSentences(),
        currentSentenceIndex: 0,
        isPlayingSelected: false,
      });

      renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(mockScrollToElement).not.toHaveBeenCalled();
    });

    it('should not scroll when videoData has no transcript', () => {
      mockUseHighlightStore.mockReturnValue({
        videoData: { url: 'test', duration: 120, transcript: undefined } as any,
        currentTime: 5,
        selectedSentences: createMockSelectedSentences(),
        currentSentenceIndex: 0,
        isPlayingSelected: false,
      });

      renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(mockScrollToElement).not.toHaveBeenCalled();
    });
  });

  describe('Selected sentences playback mode', () => {
    it('should scroll to current sentence by index when playing selected sentences', () => {
      const mockVideoData = createMockVideoData();
      const mockSelectedSentences = createMockSelectedSentences();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 3,
        selectedSentences: mockSelectedSentences,
        currentSentenceIndex: 0,
        isPlayingSelected: true,
      });

      renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(mockScrollToElement).toHaveBeenCalledWith(
        'sentence-sentence1',
        'smooth',
        'center'
      );
    });

    it('should scroll to different sentence when sentence index changes', () => {
      const mockVideoData = createMockVideoData();
      const mockSelectedSentences = createMockSelectedSentences();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 3,
        selectedSentences: mockSelectedSentences,
        currentSentenceIndex: 0,
        isPlayingSelected: true,
      });

      const { rerender } = renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(mockScrollToElement).toHaveBeenCalledWith(
        'sentence-sentence1',
        'smooth',
        'center'
      );

      // Clear previous calls and change to next sentence
      mockScrollToElement.mockClear();
      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 18,
        selectedSentences: mockSelectedSentences,
        currentSentenceIndex: 1,
        isPlayingSelected: true,
      });

      rerender();

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(mockScrollToElement).toHaveBeenCalledWith(
        'sentence-sentence3',
        'smooth',
        'center'
      );
    });

    it('should not scroll to same sentence twice in selected mode', () => {
      const mockVideoData = createMockVideoData();
      const mockSelectedSentences = createMockSelectedSentences();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 3,
        selectedSentences: mockSelectedSentences,
        currentSentenceIndex: 0,
        isPlayingSelected: true,
      });

      const { rerender } = renderHook(() => useScrollIntoView());

      // First render should trigger scroll
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(mockScrollToElement).toHaveBeenCalledTimes(1);

      // Clear mocks and rerender with same data
      mockScrollToElement.mockClear();
      rerender();

      act(() => {
        vi.advanceTimersByTime(150);
      });

      // Should not scroll again for the same sentence
      expect(mockScrollToElement).not.toHaveBeenCalled();
    });
  });

  describe('Time-based scrolling mode', () => {
    it('should scroll based on current time when not playing selected sentences', () => {
      const mockVideoData = createMockVideoData();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 7, // Should match sentence2 (5-10)
        selectedSentences: [],
        currentSentenceIndex: 0,
        isPlayingSelected: false,
      });

      renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(mockScrollToElement).toHaveBeenCalledWith(
        'sentence-sentence2',
        'smooth',
        'center'
      );
    });

    it('should scroll based on current time within selected sentences when not playing', () => {
      const mockVideoData = createMockVideoData();
      const mockSelectedSentences = createMockSelectedSentences();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 17, // Should match sentence3 from selected sentences
        selectedSentences: mockSelectedSentences,
        currentSentenceIndex: 0,
        isPlayingSelected: false, // Not playing selected, so use time-based lookup
      });

      renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(mockScrollToElement).toHaveBeenCalledWith(
        'sentence-sentence3',
        'smooth',
        'center'
      );
    });

    it('should not scroll when no sentence matches current time', () => {
      const mockVideoData = createMockVideoData();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 25, // No sentence covers this time
        selectedSentences: [],
        currentSentenceIndex: 0,
        isPlayingSelected: false,
      });

      renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(mockScrollToElement).not.toHaveBeenCalled();
    });
  });

  describe('Timing behavior', () => {
    it('should scroll with 100ms delay', () => {
      const mockVideoData = createMockVideoData();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 3, // Should match sentence1 (0-5)
        selectedSentences: [],
        currentSentenceIndex: 0,
        isPlayingSelected: false,
      });

      renderHook(() => useScrollIntoView());

      // Should not scroll immediately
      expect(mockScrollToElement).not.toHaveBeenCalled();

      // Should not scroll before 100ms
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(mockScrollToElement).not.toHaveBeenCalled();

      // Should scroll after 100ms
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(mockScrollToElement).toHaveBeenCalledWith(
        'sentence-sentence1',
        'smooth',
        'center'
      );
    });

    it('should not scroll multiple times for rapid changes within delay period', () => {
      const mockVideoData = createMockVideoData();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 3,
        selectedSentences: [],
        currentSentenceIndex: 0,
        isPlayingSelected: false,
      });

      const { rerender } = renderHook(() => useScrollIntoView());

      // Change time quickly before delay expires
      act(() => {
        vi.advanceTimersByTime(50);
      });

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 4, // Still same sentence
        selectedSentences: [],
        currentSentenceIndex: 0,
        isPlayingSelected: false,
      });

      rerender();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should only scroll once despite multiple changes
      expect(mockScrollToElement).toHaveBeenCalledTimes(1);
    });
  });

  describe('Manual scroll functions', () => {
    it('should call scrollToElement with correct parameters for scrollToSentence', () => {
      const { result } = renderHook(() => useScrollIntoView());

      act(() => {
        result.current.scrollToSentence('test-sentence');
      });

      expect(mockScrollToElement).toHaveBeenCalledWith(
        'sentence-test-sentence',
        'smooth',
        'center'
      );
    });

    it('should call scrollToElement with correct parameters for scrollToSection', () => {
      const { result } = renderHook(() => useScrollIntoView());

      act(() => {
        result.current.scrollToSection('test-section');
      });

      expect(mockScrollToElement).toHaveBeenCalledWith(
        'section-test-section',
        'smooth',
        'start'
      );
    });

    it('should scroll to current selected sentence when available', () => {
      const mockVideoData = createMockVideoData();
      const mockSelectedSentences = createMockSelectedSentences();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 3,
        selectedSentences: mockSelectedSentences,
        currentSentenceIndex: 1,
        isPlayingSelected: false,
      });

      const { result } = renderHook(() => useScrollIntoView());

      act(() => {
        result.current.scrollToCurrentSelectedSentence();
      });

      expect(mockScrollToElement).toHaveBeenCalledWith(
        'sentence-sentence3',
        'smooth',
        'center'
      );
    });

    it('should not scroll when no selected sentences available', () => {
      mockUseHighlightStore.mockReturnValue({
        videoData: createMockVideoData(),
        currentTime: 3,
        selectedSentences: [],
        currentSentenceIndex: 0,
        isPlayingSelected: false,
      });

      const { result } = renderHook(() => useScrollIntoView());

      act(() => {
        result.current.scrollToCurrentSelectedSentence();
      });

      expect(mockScrollToElement).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty transcript gracefully', () => {
      mockUseHighlightStore.mockReturnValue({
        videoData: {
          url: 'test',
          duration: 120,
          transcript: [],
        },
        currentTime: 5,
        selectedSentences: [],
        currentSentenceIndex: 0,
        isPlayingSelected: false,
      });

      renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(mockScrollToElement).not.toHaveBeenCalled();
    });

    it('should handle out of bounds sentence index', () => {
      const mockVideoData = createMockVideoData();
      const mockSelectedSentences = createMockSelectedSentences();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 3,
        selectedSentences: mockSelectedSentences,
        currentSentenceIndex: 999, // Out of bounds
        isPlayingSelected: true,
      });

      renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(150);
      });

      // Should not crash and not scroll
      expect(mockScrollToElement).not.toHaveBeenCalled();
    });

    it('should handle negative sentence index', () => {
      const mockVideoData = createMockVideoData();
      const mockSelectedSentences = createMockSelectedSentences();

      mockUseHighlightStore.mockReturnValue({
        videoData: mockVideoData,
        currentTime: 3,
        selectedSentences: mockSelectedSentences,
        currentSentenceIndex: -1, // Negative index
        isPlayingSelected: true,
      });

      renderHook(() => useScrollIntoView());

      act(() => {
        vi.advanceTimersByTime(150);
      });

      // Should not crash and not scroll
      expect(mockScrollToElement).not.toHaveBeenCalled();
    });
  });
});