import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTranscript } from '../useTranscript';
import type { VideoData, TranscriptSection } from '../../types';

// Mock dependencies
vi.mock('../../services/transcriptService', () => ({
  processVideoFile: vi.fn(),
}));

vi.mock('../../store/highlightStore', () => ({
  useHighlightStore: vi.fn(),
}));

// Import mocked functions
import { processVideoFile } from '../../services/transcriptService';
import { useHighlightStore } from '../../store/highlightStore';

const mockProcessVideoFile = vi.mocked(processVideoFile);
const mockUseHighlightStore = vi.mocked(useHighlightStore);

// Helper function to create mock transcript data
const createMockTranscriptSection = (id: string, title: string): TranscriptSection => ({
  id,
  title,
  sentences: [
    {
      id: `${id}-sentence1`,
      text: 'This is the first sentence.',
      startTime: 0,
      endTime: 2,
      isSelected: false,
      isHighlighted: false,
    },
    {
      id: `${id}-sentence2`,
      text: 'This is the second sentence.',
      startTime: 2,
      endTime: 4,
      isSelected: false,
      isHighlighted: false,
    },
  ],
});

const createMockVideoData = (): VideoData => ({
  url: 'blob:test-video-url',
  duration: 120,
  transcript: [
    createMockTranscriptSection('section1', 'Introduction'),
    createMockTranscriptSection('section2', 'Main Content'),
  ],
});

describe('useTranscript', () => {
  const mockSetVideoData = vi.fn();
  const mockSetIsProcessing = vi.fn();
  const mockResetState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseHighlightStore.mockReturnValue({
      videoData: null,
      currentTime: 0,
      isPlaying: false,
      isProcessing: false,
      selectedSentences: [],
      setVideoData: mockSetVideoData,
      setIsProcessing: mockSetIsProcessing,
      resetState: mockResetState,
    });
  });

  it('should return videoData, isProcessing, processVideo, and clearVideo', () => {
    const { result } = renderHook(() => useTranscript());

    expect(result.current.videoData).toBe(null);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.processVideo).toBeInstanceOf(Function);
    expect(result.current.clearVideo).toBeInstanceOf(Function);
  });

  it('should return current state from store', () => {
    const mockVideoData = createMockVideoData();
    
    mockUseHighlightStore.mockReturnValue({
      videoData: mockVideoData,
      currentTime: 0,
      isPlaying: false,
      isProcessing: true,
      selectedSentences: [],
      setVideoData: mockSetVideoData,
      setIsProcessing: mockSetIsProcessing,
      resetState: mockResetState,
    });

    const { result } = renderHook(() => useTranscript());

    expect(result.current.videoData).toBe(mockVideoData);
    expect(result.current.isProcessing).toBe(true);
  });

  it('should throw error for non-video files', async () => {
    const { result } = renderHook(() => useTranscript());
    
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });

    await act(async () => {
      await expect(result.current.processVideo(invalidFile)).rejects.toThrow(
        'Please upload a video file'
      );
    });

    expect(mockSetIsProcessing).not.toHaveBeenCalled();
    expect(mockProcessVideoFile).not.toHaveBeenCalled();
  });

  it('should successfully process video file', async () => {
    const { result } = renderHook(() => useTranscript());
    
    const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    const mockVideoData = createMockVideoData();
    
    mockProcessVideoFile.mockResolvedValue(mockVideoData);

    let processedData;
    await act(async () => {
      processedData = await result.current.processVideo(videoFile);
    });

    expect(mockSetIsProcessing).toHaveBeenCalledWith(true);
    expect(mockProcessVideoFile).toHaveBeenCalledWith(videoFile);
    expect(mockSetVideoData).toHaveBeenCalledWith(mockVideoData);
    expect(mockSetIsProcessing).toHaveBeenCalledWith(false);
    expect(processedData).toBe(mockVideoData);
  });

  it('should handle processing errors', async () => {
    const { result } = renderHook(() => useTranscript());
    
    const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    const mockError = new Error('Service error');
    
    mockProcessVideoFile.mockRejectedValue(mockError);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await expect(result.current.processVideo(videoFile)).rejects.toThrow(
        'Error processing video. Please try again.'
      );
    });

    expect(mockSetIsProcessing).toHaveBeenCalledWith(true);
    expect(mockProcessVideoFile).toHaveBeenCalledWith(videoFile);
    expect(mockSetVideoData).not.toHaveBeenCalled();
    expect(mockSetIsProcessing).toHaveBeenCalledWith(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error processing video:', mockError);

    consoleErrorSpy.mockRestore();
  });

  it('should set isProcessing to false even if error occurs', async () => {
    const { result } = renderHook(() => useTranscript());
    
    const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    mockProcessVideoFile.mockRejectedValue(new Error('Service error'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      try {
        await result.current.processVideo(videoFile);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(mockSetIsProcessing).toHaveBeenCalledWith(true);
    expect(mockSetIsProcessing).toHaveBeenCalledWith(false);
    expect(mockSetIsProcessing).toHaveBeenCalledTimes(2);

    consoleErrorSpy.mockRestore();
  });

  it('should clear video data when clearVideo is called', () => {
    const { result } = renderHook(() => useTranscript());

    act(() => {
      result.current.clearVideo();
    });

    expect(mockResetState).toHaveBeenCalled();
  });

  it('should accept different video file types', async () => {
    const { result } = renderHook(() => useTranscript());
    
    const videoTypes = [
      { name: 'test.mp4', type: 'video/mp4' },
      { name: 'test.avi', type: 'video/avi' },
      { name: 'test.mov', type: 'video/quicktime' },
      { name: 'test.webm', type: 'video/webm' },
    ];

    const mockVideoData = createMockVideoData();
    mockProcessVideoFile.mockResolvedValue(mockVideoData);

    for (const videoType of videoTypes) {
      const videoFile = new File([''], videoType.name, { type: videoType.type });
      
      await act(async () => {
        await result.current.processVideo(videoFile);
      });

      expect(mockProcessVideoFile).toHaveBeenCalledWith(videoFile);
    }
  });

  it('should maintain callback stability', () => {
    const { result, rerender } = renderHook(() => useTranscript());

    const firstProcessVideo = result.current.processVideo;
    const firstClearVideo = result.current.clearVideo;

    rerender();

    // Callbacks should be stable due to useCallback
    expect(result.current.processVideo).toBe(firstProcessVideo);
    expect(result.current.clearVideo).toBe(firstClearVideo);
  });

  it('should recreate callbacks when dependencies change', () => {
    const { result, rerender } = renderHook(() => useTranscript());

    const firstProcessVideo = result.current.processVideo;
    const firstClearVideo = result.current.clearVideo;

    // Change the mock functions to simulate dependency change
    const newSetVideoData = vi.fn();
    const newSetIsProcessing = vi.fn();
    const newResetState = vi.fn();

    mockUseHighlightStore.mockReturnValue({
      videoData: null,
      currentTime: 0,
      isPlaying: false,
      isProcessing: false,
      selectedSentences: [],
      setVideoData: newSetVideoData,
      setIsProcessing: newSetIsProcessing,
      resetState: newResetState,
    });

    rerender();

    // Callbacks should be recreated when dependencies change
    expect(result.current.processVideo).not.toBe(firstProcessVideo);
    expect(result.current.clearVideo).not.toBe(firstClearVideo);
  });

  it('should handle complex video data structure', async () => {
    const { result } = renderHook(() => useTranscript());
    
    const videoFile = new File([''], 'complex-video.mp4', { type: 'video/mp4' });
    const complexVideoData: VideoData = {
      url: 'blob:complex-video-url',
      duration: 300,
      transcript: [
        {
          id: 'intro',
          title: 'Introduction',
          sentences: [
            {
              id: 'intro-1',
              text: 'Welcome to our presentation.',
              startTime: 0,
              endTime: 3,
              isSelected: false,
              isHighlighted: true,
            },
            {
              id: 'intro-2',
              text: 'Today we will cover several topics.',
              startTime: 3,
              endTime: 7,
              isSelected: true,
              isHighlighted: false,
            },
          ],
        },
        {
          id: 'main',
          title: 'Main Content',
          sentences: [
            {
              id: 'main-1',
              text: 'Let us begin with the first topic.',
              startTime: 7,
              endTime: 11,
              isSelected: false,
              isHighlighted: false,
            },
          ],
        },
      ],
    };
    
    mockProcessVideoFile.mockResolvedValue(complexVideoData);

    let processedData;
    await act(async () => {
      processedData = await result.current.processVideo(videoFile);
    });

    expect(mockSetVideoData).toHaveBeenCalledWith(complexVideoData);
    expect(processedData).toEqual(complexVideoData);
    
    // Type assertion since we know processedData is defined after successful processing
    const typedData = processedData as unknown as VideoData;
    expect(typedData.transcript).toHaveLength(2);
    expect(typedData.transcript[0].sentences).toHaveLength(2);
    expect(typedData.transcript[1].sentences).toHaveLength(1);
  });
});