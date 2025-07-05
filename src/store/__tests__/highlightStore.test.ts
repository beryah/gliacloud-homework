import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHighlightStore } from '../highlightStore';
import { createMockVideoData, createMockSentence } from '../../test/utils';

describe('highlightStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useHighlightStore.getState().resetState();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useHighlightStore());
      
      expect(result.current.videoData).toBeNull();
      expect(result.current.currentTime).toBe(0);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.selectedSentences).toEqual([]);
      expect(result.current.videoElement).toBeNull();
    });
  });

  describe('setVideoData', () => {
    it('should set video data and update selected sentences', () => {
      const { result } = renderHook(() => useHighlightStore());
      const mockData = createMockVideoData({
        transcript: [{
          id: 'section1',
          title: 'Test Section',
          sentences: [
            createMockSentence({ id: 's1', isSelected: true }),
            createMockSentence({ id: 's2', isSelected: false })
          ]
        }]
      });

      act(() => {
        result.current.setVideoData(mockData);
      });

      expect(result.current.videoData).toEqual(mockData);
      expect(result.current.selectedSentences).toHaveLength(1);
      expect(result.current.selectedSentences[0].id).toBe('s1');
    });
  });

  describe('setCurrentTime', () => {
    it('should set current time and highlight current sentence', () => {
      const { result } = renderHook(() => useHighlightStore());
      
      act(() => {
        result.current.setCurrentTime(10);
      });

      expect(result.current.currentTime).toBe(10);
    });
  });

  describe('toggleSentenceSelection', () => {
    it('should toggle sentence selection state', () => {
      const { result } = renderHook(() => useHighlightStore());
      const mockData = createMockVideoData({
        transcript: [{
          id: 'section1',
          title: 'Test Section',
          sentences: [createMockSentence({ id: 's1', isSelected: false })]
        }]
      });

      act(() => {
        result.current.setVideoData(mockData);
      });

      // Toggle to selected
      act(() => {
        result.current.toggleSentenceSelection('s1');
      });

      expect(result.current.videoData?.transcript[0].sentences[0].isSelected).toBe(true);
      expect(result.current.selectedSentences).toHaveLength(1);

      // Toggle back to unselected
      act(() => {
        result.current.toggleSentenceSelection('s1');
      });

      expect(result.current.videoData?.transcript[0].sentences[0].isSelected).toBe(false);
      expect(result.current.selectedSentences).toHaveLength(0);
    });

    it('should not affect other sentences', () => {
      const { result } = renderHook(() => useHighlightStore());
      const mockData = createMockVideoData({
        transcript: [{
          id: 'section1',
          title: 'Test Section',
          sentences: [
            createMockSentence({ id: 's1', isSelected: false }),
            createMockSentence({ id: 's2', isSelected: true })
          ]
        }]
      });

      act(() => {
        result.current.setVideoData(mockData);
      });

      act(() => {
        result.current.toggleSentenceSelection('s1');
      });

      expect(result.current.videoData?.transcript[0].sentences[0].isSelected).toBe(true);
      expect(result.current.videoData?.transcript[0].sentences[1].isSelected).toBe(true);
      expect(result.current.selectedSentences).toHaveLength(2);
    });
  });

  describe('highlightCurrentSentence', () => {
    it('should highlight sentence based on current time', () => {
      const { result } = renderHook(() => useHighlightStore());
      const mockData = createMockVideoData({
        transcript: [{
          id: 'section1',
          title: 'Test Section',
          sentences: [
            createMockSentence({ 
              id: 's1', 
              startTime: 0, 
              endTime: 5, 
              isSelected: true 
            }),
            createMockSentence({ 
              id: 's2', 
              startTime: 5, 
              endTime: 10, 
              isSelected: true 
            })
          ]
        }]
      });

      act(() => {
        result.current.setVideoData(mockData);
      });

      act(() => {
        result.current.highlightCurrentSentence(3);
      });

      expect(result.current.videoData?.transcript[0].sentences[0].isHighlighted).toBe(true);
      expect(result.current.videoData?.transcript[0].sentences[1].isHighlighted).toBe(false);
    });
  });

  describe('setVideoElement', () => {
    it('should set video element', () => {
      const { result } = renderHook(() => useHighlightStore());
      const mockElement = document.createElement('video') as HTMLVideoElement;

      act(() => {
        result.current.setVideoElement(mockElement);
      });

      expect(result.current.videoElement).toBe(mockElement);
    });
  });

  describe('resetState', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useHighlightStore());
      
      // Set some state
      act(() => {
        result.current.setVideoData(createMockVideoData());
        result.current.setCurrentTime(10);
        result.current.setIsPlaying(true);
        result.current.setIsProcessing(true);
      });

      // Reset
      act(() => {
        result.current.resetState();
      });

      expect(result.current.videoData).toBeNull();
      expect(result.current.currentTime).toBe(0);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.selectedSentences).toEqual([]);
      expect(result.current.videoElement).toBeNull();
    });
  });
});