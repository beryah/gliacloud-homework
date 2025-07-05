import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPlayer } from '../VideoPlayer';
import { useHighlightStore } from '../../store/highlightStore';
import { createMockVideoData, createMockSentence } from '../../test/utils';

// Mock the hooks
const mockUseVideoSync = vi.fn();
vi.mock('../../hooks/useVideoSync', () => ({
  useVideoSync: () => mockUseVideoSync()
}));

describe('VideoPlayer Component', () => {
  beforeEach(() => {
    useHighlightStore.getState().resetState();
    vi.clearAllMocks();
    
    // Default mock return value
    mockUseVideoSync.mockReturnValue({
      currentTime: 30,
      isPlaying: false,
      togglePlayPause: vi.fn(),
      seekTo: vi.fn()
    });
  });

  it('should render "No video loaded" when no video data', () => {
    render(<VideoPlayer />);
    
    expect(screen.getByText('No video loaded')).toBeInTheDocument();
  });

  it('should render video player when video data exists', () => {
    const mockData = createMockVideoData();
    
    useHighlightStore.getState().setVideoData(mockData);
    render(<VideoPlayer />);

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument(); // Play button
  });

  it('should render video element with correct src', () => {
    const mockData = createMockVideoData({ url: 'test-video-url.mp4' });
    
    useHighlightStore.getState().setVideoData(mockData);
    render(<VideoPlayer />);

    const videoElement = document.querySelector('video');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveAttribute('src', 'test-video-url.mp4');
  });

  it('should show play button when video is not playing', () => {
    const mockData = createMockVideoData();
    useHighlightStore.getState().setVideoData(mockData);
    
    mockUseVideoSync.mockReturnValue({
      currentTime: 30,
      isPlaying: false,
      togglePlayPause: vi.fn(),
      seekTo: vi.fn()
    });
    
    render(<VideoPlayer />);

    // Should show play icon (not pause)
    const playButton = screen.getByRole('button');
    expect(playButton).toBeInTheDocument();
  });

  it('should show pause button when video is playing', () => {
    const mockData = createMockVideoData();
    useHighlightStore.getState().setVideoData(mockData);
    
    mockUseVideoSync.mockReturnValue({
      currentTime: 30,
      isPlaying: true,
      togglePlayPause: vi.fn(),
      seekTo: vi.fn()
    });
    
    render(<VideoPlayer />);

    const pauseButton = screen.getByRole('button');
    expect(pauseButton).toBeInTheDocument();
  });

  it('should call togglePlayPause when play/pause button is clicked', () => {
    const mockTogglePlayPause = vi.fn();
    const mockData = createMockVideoData();
    useHighlightStore.getState().setVideoData(mockData);
    
    mockUseVideoSync.mockReturnValue({
      currentTime: 30,
      isPlaying: false,
      togglePlayPause: mockTogglePlayPause,
      seekTo: vi.fn()
    });
    
    render(<VideoPlayer />);

    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);

    expect(mockTogglePlayPause).toHaveBeenCalled();
  });

  it('should display current time and duration', () => {
    const mockData = createMockVideoData({ duration: 180 }); // 3:00
    useHighlightStore.getState().setVideoData(mockData);
    
    mockUseVideoSync.mockReturnValue({
      currentTime: 75, // 1:15
      isPlaying: false,
      togglePlayPause: vi.fn(),
      seekTo: vi.fn()
    });
    
    render(<VideoPlayer />);

    expect(screen.getByText('1:15 / 3:00')).toBeInTheDocument();
  });

  it('should render progress bar with correct percentage', () => {
    const mockData = createMockVideoData({ duration: 120 }); // 2:00
    useHighlightStore.getState().setVideoData(mockData);
    
    mockUseVideoSync.mockReturnValue({
      currentTime: 60, // 1:00
      isPlaying: false,
      togglePlayPause: vi.fn(),
      seekTo: vi.fn()
    });
    
    render(<VideoPlayer />);

    // 60 seconds out of 120 = 50%
    const progressBar = document.querySelector('.bg-blue-500');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('should render highlight markers for selected sentences', () => {
    const mockData = createMockVideoData({
      duration: 120,
      transcript: [{
        id: 'section1',
        title: 'Test Section',
        sentences: [
          createMockSentence({ 
            id: 's1', 
            startTime: 10, 
            endTime: 20, 
            isSelected: true 
          }),
          createMockSentence({ 
            id: 's2', 
            startTime: 30, 
            endTime: 40, 
            isSelected: true 
          })
        ]
      }]
    });

    useHighlightStore.getState().setVideoData(mockData);
    render(<VideoPlayer />);

    // Should have highlight markers for selected sentences
    const highlightMarkers = document.querySelectorAll('.bg-green-500');
    expect(highlightMarkers).toHaveLength(2);
  });

  it('should register video element with store when video mounts', () => {
    const setVideoElementSpy = vi.spyOn(useHighlightStore.getState(), 'setVideoElement');
    const mockData = createMockVideoData();
    
    useHighlightStore.getState().setVideoData(mockData);
    render(<VideoPlayer />);

    // The ref callback should have been called with the video element
    expect(setVideoElementSpy).toHaveBeenCalled();
  });

  it('should disable play button when no video data', () => {
    render(<VideoPlayer />);
    
    // When no video data, should show "No video loaded" instead of controls
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render HighlightOverlay component', () => {
    const mockData = createMockVideoData();
    useHighlightStore.getState().setVideoData(mockData);
    
    render(<VideoPlayer />);

    // HighlightOverlay should be rendered (even if not visible due to no current sentence)
    const videoContainer = document.querySelector('.relative.bg-black');
    expect(videoContainer).toBeInTheDocument();
  });
});