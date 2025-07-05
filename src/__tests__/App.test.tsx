import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import type { VideoData } from '../types';

// Mock components
vi.mock('../components/VideoPlayer', () => ({
  VideoPlayer: () => <div data-testid="video-player">Video Player</div>,
}));

vi.mock('../components/TranscriptEditor', () => ({
  TranscriptEditor: () => <div data-testid="transcript-editor">Transcript Editor</div>,
}));

vi.mock('../components/Loader', () => ({
  Loader: ({ message }: { message: string }) => <div data-testid="loader">{message}</div>,
}));

// Mock hooks
vi.mock('../hooks/useTranscript', () => ({
  useTranscript: vi.fn(),
}));

import { useTranscript } from '../hooks/useTranscript';

const mockUseTranscript = vi.mocked(useTranscript);
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

const mockVideoData: VideoData = {
  url: 'blob:test-video',
  duration: 120,
  transcript: [
    {
      id: 'section1',
      title: 'Test Section',
      sentences: [
        {
          id: 'sentence1',
          text: 'Test sentence',
          startTime: 0,
          endTime: 5,
          isSelected: false,
          isHighlighted: false,
        },
      ],
    },
  ],
};

describe('App', () => {
  const mockProcessVideo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseTranscript.mockReturnValue({
      videoData: null,
      isProcessing: false,
      processVideo: mockProcessVideo,
      clearVideo: vi.fn(),
    });
  });

  it('should render header with responsive title', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText('Video Editor')).toBeInTheDocument();
    expect(screen.getByText('Video Highlight Editor')).toBeInTheDocument();
  });

  it('should show upload section when no video', () => {
    render(<App />);

    expect(screen.getByText('Upload a video file to get started')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose Video File' })).toBeInTheDocument();
  });

  it('should show loader when processing', () => {
    mockUseTranscript.mockReturnValue({
      videoData: null,
      isProcessing: true,
      processVideo: mockProcessVideo,
      clearVideo: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByText('Upload a video file to get started')).not.toBeInTheDocument();
  });

  it('should show video interface when video loaded', () => {
    mockUseTranscript.mockReturnValue({
      videoData: mockVideoData,
      isProcessing: false,
      processVideo: mockProcessVideo,
      clearVideo: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId('video-player')).toBeInTheDocument();
    expect(screen.getByTestId('transcript-editor')).toBeInTheDocument();
    expect(screen.queryByText('Upload a video file to get started')).not.toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    render(<App />);

    const file = new File([''], 'test.mp4', { type: 'video/mp4' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockProcessVideo).toHaveBeenCalledWith(file);
  });

  it('should trigger file input on button click', () => {
    render(<App />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    fireEvent.click(screen.getByText('Choose Video File'));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should handle upload errors', async () => {
    mockProcessVideo.mockRejectedValue(new Error('Upload failed'));

    render(<App />);

    const file = new File([''], 'test.mp4', { type: 'video/mp4' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Upload failed');
    });
  });

  it('should have responsive layout for video interface', () => {
    mockUseTranscript.mockReturnValue({
      videoData: mockVideoData,
      isProcessing: false,
      processVideo: mockProcessVideo,
      clearVideo: vi.fn(),
    });

    render(<App />);

    const mainInterface = document.querySelector('.flex.flex-col.md\\:flex-row');
    expect(mainInterface).toBeInTheDocument();
    
    const transcriptContainer = screen.getByTestId('transcript-editor').parentElement;
    const videoContainer = screen.getByTestId('video-player').parentElement;
    
    expect(transcriptContainer).toHaveClass('order-2', 'md:order-1');
    expect(videoContainer).toHaveClass('order-1', 'md:order-2');
  });

  it('should not process when no file selected', () => {
    render(<App />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [] } });

    expect(mockProcessVideo).not.toHaveBeenCalled();
  });
});