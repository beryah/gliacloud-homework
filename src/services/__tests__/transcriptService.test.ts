import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTranscript, processVideoFile } from '../transcriptService';
import { mockFetchResponse, createMockVideoFile } from '../../test/utils';

// Mock fetch
const mockFetch = global.fetch as any;

describe('transcriptService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTranscript', () => {
    it('should fetch transcript data successfully', async () => {
      const mockData = {
        videoData: {
          duration: 180,
          transcript: [
            {
              id: 'intro',
              title: 'Introduction',
              sentences: [
                {
                  id: 's1',
                  text: 'Welcome to our presentation.',
                  startTime: 0,
                  endTime: 3,
                  isSelected: false
                }
              ]
            }
          ]
        }
      };

      mockFetch.mockResolvedValueOnce(mockFetchResponse(mockData) as any);

      const result = await getTranscript();

      expect(mockFetch).toHaveBeenCalledWith('/mock/transcript.json');
      expect(result).toEqual(mockData.videoData);
    });

    it('should return fallback data when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getTranscript();

      expect(result).toHaveProperty('duration', 180);
      expect(result).toHaveProperty('transcript');
      expect(Array.isArray(result.transcript)).toBe(true);
    });

    it('should return fallback data when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse({}, false) as any);

      const result = await getTranscript();

      expect(result).toHaveProperty('duration', 180);
      expect(result).toHaveProperty('transcript');
    });
  });

  describe('processVideoFile', () => {
    it('should process video file and return video data', async () => {
      const mockTranscriptData = {
        duration: 120,
        transcript: []
      };

      mockFetch.mockResolvedValueOnce(
        mockFetchResponse({ videoData: mockTranscriptData }) as any
      );

      const videoFile = createMockVideoFile();
      const startTime = Date.now();

      const result = await processVideoFile(videoFile);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should take at least 2 seconds (1000ms + 1000ms delays)
      expect(processingTime).toBeGreaterThanOrEqual(1800);

      expect(result).toHaveProperty('url', 'mocked-video-url');
      expect(result).toHaveProperty('duration', mockTranscriptData.duration);
      expect(result).toHaveProperty('transcript', mockTranscriptData.transcript);
    });

    it('should create object URL for video file', async () => {
      mockFetch.mockResolvedValueOnce(
        mockFetchResponse({ videoData: { duration: 120, transcript: [] } }) as any
      );

      const videoFile = createMockVideoFile();
      await processVideoFile(videoFile);

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(videoFile);
    });
  });
});