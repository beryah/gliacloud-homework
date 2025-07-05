import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollIntoView } from '../useScrollIntoView';

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

describe('useScrollIntoView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Default mock implementation
    mockUseHighlightStore.mockReturnValue({
      videoData: { id: 'test-video' },
      currentTime: 0,
      selectedSentences: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return scrollToSentence and scrollToSection functions', () => {
    const { result } = renderHook(() => useScrollIntoView());

    expect(result.current.scrollToSentence).toBeInstanceOf(Function);
    expect(result.current.scrollToSection).toBeInstanceOf(Function);
  });

  it('should not scroll when videoData is null', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: null,
      currentTime: 5,
      selectedSentences: [
        { id: 'sentence1', startTime: 0, endTime: 10 }
      ],
    });

    renderHook(() => useScrollIntoView());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockScrollToElement).not.toHaveBeenCalled();
  });

  it('should not scroll when selectedSentences is empty', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: { id: 'test-video' },
      currentTime: 5,
      selectedSentences: [],
    });

    renderHook(() => useScrollIntoView());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockScrollToElement).not.toHaveBeenCalled();
  });

  it('should scroll to current sentence when it becomes active', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: { id: 'test-video' },
      currentTime: 5,
      selectedSentences: [
        { id: 'sentence1', startTime: 0, endTime: 10 },
        { id: 'sentence2', startTime: 15, endTime: 20 }
      ],
    });

    renderHook(() => useScrollIntoView());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockScrollToElement).toHaveBeenCalledWith(
      'sentence-sentence1',
      'smooth',
      'center'
    );
  });

  it('should not scroll to the same sentence twice', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: { id: 'test-video' },
      currentTime: 5,
      selectedSentences: [
        { id: 'sentence1', startTime: 0, endTime: 10 }
      ],
    });

    const { rerender } = renderHook(() => useScrollIntoView());

    // First render should trigger scroll
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockScrollToElement).toHaveBeenCalledTimes(1);

    // Clear mocks and rerender with same data
    mockScrollToElement.mockClear();
    rerender();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should not scroll again for the same sentence
    expect(mockScrollToElement).not.toHaveBeenCalled();
  });

  it('should scroll when current sentence changes', () => {
    const { rerender } = renderHook(() => useScrollIntoView());

    // First sentence is active
    mockUseHighlightStore.mockReturnValue({
      videoData: { id: 'test-video' },
      currentTime: 5,
      selectedSentences: [
        { id: 'sentence1', startTime: 0, endTime: 10 },
        { id: 'sentence2', startTime: 15, endTime: 20 }
      ],
    });

    rerender();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockScrollToElement).toHaveBeenCalledWith(
      'sentence-sentence1',
      'smooth',
      'center'
    );

    // Clear mocks and change to second sentence
    mockScrollToElement.mockClear();
    mockUseHighlightStore.mockReturnValue({
      videoData: { id: 'test-video' },
      currentTime: 16,
      selectedSentences: [
        { id: 'sentence1', startTime: 0, endTime: 10 },
        { id: 'sentence2', startTime: 15, endTime: 20 }
      ],
    });

    rerender();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockScrollToElement).toHaveBeenCalledWith(
      'sentence-sentence2',
      'smooth',
      'center'
    );
  });

  it('should scroll with 100ms delay', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: { id: 'test-video' },
      currentTime: 5,
      selectedSentences: [
        { id: 'sentence1', startTime: 0, endTime: 10 }
      ],
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
    expect(mockScrollToElement).toHaveBeenCalled();
  });

  it('should call scrollToElement with correct parameters when scrollToSentence is called', () => {
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

  it('should call scrollToElement with correct parameters when scrollToSection is called', () => {
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

  it('should not scroll when no current sentence matches the time', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: { id: 'test-video' },
      currentTime: 25, // Outside any sentence time range
      selectedSentences: [
        { id: 'sentence1', startTime: 0, endTime: 10 },
        { id: 'sentence2', startTime: 15, endTime: 20 }
      ],
    });

    renderHook(() => useScrollIntoView());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockScrollToElement).not.toHaveBeenCalled();
  });
});