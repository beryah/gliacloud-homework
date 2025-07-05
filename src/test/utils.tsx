import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import type { VideoData, TranscriptSentence, TranscriptSection } from '../types';

// Mock data generators
export const createMockSentence = (overrides?: Partial<TranscriptSentence>): TranscriptSentence => ({
  id: 's1',
  text: 'Test sentence',
  startTime: 0,
  endTime: 3,
  isSelected: false,
  ...overrides
});

export const createMockSection = (overrides?: Partial<TranscriptSection>): TranscriptSection => ({
  id: 'section1',
  title: 'Test Section',
  sentences: [createMockSentence()],
  ...overrides
});

export const createMockVideoData = (overrides?: Partial<VideoData>): VideoData => ({
  url: 'test-video.mp4',
  duration: 180,
  transcript: [createMockSection()],
  ...overrides
});

// Create a video file for testing
export const createMockVideoFile = (name = 'test-video.mp4'): File => {
  return new File(['test'], name, { type: 'video/mp4' });
};

// Mock fetch response for transcript service
export const mockFetchResponse = (data: any, ok = true) => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request'
  });
};

// Custom render function (if we need providers in the future)
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render with our custom render
export { customRender as render };