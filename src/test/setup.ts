import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// Mock window.fs.readFile for testing
global.window = global.window || {};
(global.window as any).fs = {
  readFile: vi.fn()
};

// Mock fetch for transcript service tests
global.fetch = vi.fn();

// Mock URL.createObjectURL for video file handling
global.URL.createObjectURL = vi.fn(() => 'mocked-video-url');
global.URL.revokeObjectURL = vi.fn();

// Mock HTMLVideoElement methods
Object.defineProperty(global.HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: vi.fn(() => Promise.resolve())
});

Object.defineProperty(global.HTMLVideoElement.prototype, 'pause', {
  writable: true,
  value: vi.fn()
});

Object.defineProperty(global.HTMLVideoElement.prototype, 'currentTime', {
  writable: true,
  value: 0
});

// Mock addEventListener and removeEventListener
Object.defineProperty(global.HTMLVideoElement.prototype, 'addEventListener', {
  writable: true,
  value: vi.fn()
});

Object.defineProperty(global.HTMLVideoElement.prototype, 'removeEventListener', {
  writable: true,
  value: vi.fn()
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});