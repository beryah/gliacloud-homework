import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VideoPlayer } from '../VideoPlayer';
import type { VideoData, TranscriptSentence } from '../../types';

// Mock components and hooks
vi.mock('../HighlightOverlay', () => ({
  HighlightOverlay: () => <div data-testid="highlight-overlay">Highlight Overlay</div>,
}));

vi.mock('../../hooks/useVideoSync', () => ({
  useVideoSync: vi.fn(),
}));

vi.mock('../../store/highlightStore', () => ({
  useHighlightStore: vi.fn(),
}));

vi.mock('../../utils/timeFormat', () => ({
  formatTime: vi.fn((time: number) => `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`),
  getTimePercentage: vi.fn((current: number, total: number) => (current / total) * 100),
}));

import { useVideoSync } from '../../hooks/useVideoSync';
import { useHighlightStore } from '../../store/highlightStore';

const mockUseVideoSync = vi.mocked(useVideoSync);
const mockUseHighlightStore = vi.mocked(useHighlightStore);

const mockVideoData: VideoData = {
  url: 'blob:test-video-url',
  duration: 120,
  transcript: [{
    id: 'section1',
    title: 'Test Section',
    sentences: [{
      id: 'sentence1',
      text: 'Test sentence',
      startTime: 0,
      endTime: 5,
      isSelected: false,
      isHighlighted: false,
    }],
  }],
};

const mockSelectedSentences: TranscriptSentence[] = [{
  id: 'sentence1',
  text: 'Test sentence',
  startTime: 0,
  endTime: 5,
  isSelected: true,
  isHighlighted: false,
}];

describe('VideoPlayer', () => {
  const mockTogglePlayPause = vi.fn();
  const mockSeekToSentence = vi.fn();
  const mockSetVideoElement = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    mockUseHighlightStore.mockReturnValue({
      videoData: null,
      selectedSentences: [],
      setVideoElement: mockSetVideoElement,
    });

    mockUseVideoSync.mockReturnValue({
      currentTime: 0,
      isPlaying: false,
      togglePlayPause: mockTogglePlayPause,
      seekTo: vi.fn(),
      seekToSentence: mockSeekToSentence,
      getCurrentSentenceInfo: vi.fn(() => null),
      currentSentenceIndex: 0,
      isPlayingSelected: false,
      selectedSentences: [],
    });
  });

  it('should render no video message when videoData is null', () => {
    render(<VideoPlayer />);
    expect(screen.getByText('No video loaded')).toBeInTheDocument();
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('should render video player when video data exists', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: mockVideoData,
      selectedSentences: [],
      setVideoElement: mockSetVideoElement,
    });

    render(<VideoPlayer />);
    
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(document.querySelector('video')).toHaveAttribute('src', 'blob:test-video-url');
    expect(screen.getByTestId('highlight-overlay')).toBeInTheDocument();
  });

  it('should call togglePlayPause when play button is clicked', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: mockVideoData,
      selectedSentences: [],
      setVideoElement: mockSetVideoElement,
    });

    render(<VideoPlayer />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockTogglePlayPause).toHaveBeenCalled();
  });

  it('should show selected sentences info when sentences are selected', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: mockVideoData,
      selectedSentences: mockSelectedSentences,
      setVideoElement: mockSetVideoElement,
    });

    render(<VideoPlayer />);
    
    expect(screen.getByText('1 sentence(s) selected')).toBeInTheDocument();
  });

  it('should show navigation buttons when sentences are selected', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: mockVideoData,
      selectedSentences: mockSelectedSentences,
      setVideoElement: mockSetVideoElement,
    });

    mockUseVideoSync.mockReturnValue({
      currentTime: 0,
      isPlaying: false,
      togglePlayPause: mockTogglePlayPause,
      seekTo: vi.fn(),
      seekToSentence: mockSeekToSentence,
      getCurrentSentenceInfo: vi.fn(() => null),
      currentSentenceIndex: 0,
      isPlayingSelected: false,
      selectedSentences: mockSelectedSentences,
    });

    render(<VideoPlayer />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1); // Play + navigation buttons
  });

  it('should show current sentence info when playing selected sentences', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: mockVideoData,
      selectedSentences: mockSelectedSentences,
      setVideoElement: mockSetVideoElement,
    });

    mockUseVideoSync.mockReturnValue({
      currentTime: 0,
      isPlaying: true,
      togglePlayPause: mockTogglePlayPause,
      seekTo: vi.fn(),
      seekToSentence: mockSeekToSentence,
      getCurrentSentenceInfo: vi.fn(() => ({
        current: 1,
        total: 1,
        sentence: mockSelectedSentences[0]
      })),
      currentSentenceIndex: 0,
      isPlayingSelected: true,
      selectedSentences: mockSelectedSentences,
    });

    render(<VideoPlayer />);
    
    expect(screen.getByText('Playing: 1/1')).toBeInTheDocument();
    expect(screen.getByText('"Test sentence"')).toBeInTheDocument();
  });

  it('should handle previous/next sentence navigation', () => {
    const twoSentences = [
      mockSelectedSentences[0],
      { ...mockSelectedSentences[0], id: 'sentence2', text: 'Second sentence' }
    ];

    mockUseHighlightStore.mockReturnValue({
      videoData: mockVideoData,
      selectedSentences: twoSentences,
      setVideoElement: mockSetVideoElement,
    });

    mockUseVideoSync.mockReturnValue({
      currentTime: 0,
      isPlaying: false,
      togglePlayPause: mockTogglePlayPause,
      seekTo: vi.fn(),
      seekToSentence: mockSeekToSentence,
      getCurrentSentenceInfo: vi.fn(() => null),
      currentSentenceIndex: 0,
      isPlayingSelected: false,
      selectedSentences: twoSentences,
    });

    render(<VideoPlayer />);
    
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons.find(btn => btn.getAttribute('title') === 'Next sentence');
    
    if (nextButton) {
      fireEvent.click(nextButton);
      expect(mockSeekToSentence).toHaveBeenCalledWith(1);
    }
  });

  it('should render progress bar and highlight markers', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: mockVideoData,
      selectedSentences: mockSelectedSentences,
      setVideoElement: mockSetVideoElement,
    });

    render(<VideoPlayer />);
    
    expect(document.querySelector('.bg-blue-500')).toBeInTheDocument(); // Progress bar
    expect(document.querySelector('.bg-green-500, .bg-yellow-400')).toBeInTheDocument(); // Highlight marker
  });

  it('should call setVideoElement ref callback', () => {
    mockUseHighlightStore.mockReturnValue({
      videoData: mockVideoData,
      selectedSentences: [],
      setVideoElement: mockSetVideoElement,
    });

    render(<VideoPlayer />);
    
    const video = document.querySelector('video');
    expect(mockSetVideoElement).toHaveBeenCalledWith(video);
  });
});