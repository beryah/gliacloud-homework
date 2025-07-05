import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVideoSync } from '../useVideoSync';
import { useHighlightStore } from '../../store/highlightStore';

describe('useVideoSync', () => {
  let mockVideoElement: HTMLVideoElement;

  beforeEach(() => {
    // Reset store
    act(() => {
      useHighlightStore.getState().resetState();
    });
    
    // Create mock video element
    mockVideoElement = document.createElement('video') as HTMLVideoElement;
    mockVideoElement.currentTime = 0;
    mockVideoElement.play = vi.fn(() => Promise.resolve());
    mockVideoElement.pause = vi.fn();
    mockVideoElement.addEventListener = vi.fn();
    mockVideoElement.removeEventListener = vi.fn();
  });

  it('should return initial values from store', () => {
    const { result } = renderHook(() => useVideoSync());

    expect(result.current.currentTime).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(typeof result.current.togglePlayPause).toBe('function');
    expect(typeof result.current.seekTo).toBe('function');
  });

  describe('seekTo', () => {
    it('should set video currentTime when video element exists', () => {
      const { result } = renderHook(() => useVideoSync());

      // Set video element in store
      act(() => {
        useHighlightStore.getState().setVideoElement(mockVideoElement);
      });

      act(() => {
        result.current.seekTo(30);
      });

      expect(mockVideoElement.currentTime).toBe(30);
    });

    it('should update store currentTime', () => {
      const { result } = renderHook(() => useVideoSync());

      act(() => {
        useHighlightStore.getState().setVideoElement(mockVideoElement);
      });

      act(() => {
        result.current.seekTo(45);
      });

      expect(useHighlightStore.getState().currentTime).toBe(45);
    });

    it('should not crash when video element is null', () => {
      const { result } = renderHook(() => useVideoSync());

      expect(() => {
        act(() => {
          result.current.seekTo(30);
        });
      }).not.toThrow();
    });
  });

  describe('togglePlayPause', () => {
    it('should call play when video is not playing', () => {
      const { result } = renderHook(() => useVideoSync());

      act(() => {
        useHighlightStore.getState().setVideoElement(mockVideoElement);
        useHighlightStore.getState().setIsPlaying(false);
      });

      act(() => {
        result.current.togglePlayPause();
      });

      expect(mockVideoElement.play).toHaveBeenCalled();
    });

    it('should call pause when video is playing', () => {
      const { result } = renderHook(() => useVideoSync());

      act(() => {
        useHighlightStore.getState().setVideoElement(mockVideoElement);
        useHighlightStore.getState().setIsPlaying(true);
      });

      act(() => {
        result.current.togglePlayPause();
      });

      expect(mockVideoElement.pause).toHaveBeenCalled();
    });

    it('should not crash when video element is null', () => {
      const { result } = renderHook(() => useVideoSync());

      expect(() => {
        act(() => {
          result.current.togglePlayPause();
        });
      }).not.toThrow();
    });
  });

  describe('event listeners', () => {
    it('should add event listeners when video element is set', () => {
      renderHook(() => useVideoSync());

      act(() => {
        useHighlightStore.getState().setVideoElement(mockVideoElement);
      });

      expect(mockVideoElement.addEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function));
      expect(mockVideoElement.addEventListener).toHaveBeenCalledWith('play', expect.any(Function));
      expect(mockVideoElement.addEventListener).toHaveBeenCalledWith('pause', expect.any(Function));
    });

    it('should remove event listeners on cleanup', () => {
      const { unmount } = renderHook(() => useVideoSync());

      act(() => {
        useHighlightStore.getState().setVideoElement(mockVideoElement);
      });

      unmount();

      expect(mockVideoElement.removeEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function));
      expect(mockVideoElement.removeEventListener).toHaveBeenCalledWith('play', expect.any(Function));
      expect(mockVideoElement.removeEventListener).toHaveBeenCalledWith('pause', expect.any(Function));
    });
  });
});