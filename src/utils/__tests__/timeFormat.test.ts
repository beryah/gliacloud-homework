import { describe, it, expect } from 'vitest';
import { formatTime, parseTime, getTimePercentage } from '../timeFormat';

describe('timeFormat utilities', () => {
  describe('formatTime', () => {
    it('should format seconds correctly for values under 1 minute', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(30)).toBe('0:30');
      expect(formatTime(59)).toBe('0:59');
    });

    it('should format seconds correctly for values over 1 minute', () => {
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(125)).toBe('2:05');
    });

    it('should format seconds correctly for large values', () => {
      expect(formatTime(600)).toBe('10:00');
      expect(formatTime(661)).toBe('11:01');
      expect(formatTime(3600)).toBe('60:00');
      expect(formatTime(3665)).toBe('61:05');
    });

    it('should handle decimal values by flooring them', () => {
      expect(formatTime(65.7)).toBe('1:05');
      expect(formatTime(90.9)).toBe('1:30');
      expect(formatTime(59.99)).toBe('0:59');
    });

    it('should handle zero and negative values', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(-5)).toBe('0:00'); // Math.floor of negative becomes 0 for seconds
    });
  });

  describe('parseTime', () => {
    it('should parse time strings correctly', () => {
      expect(parseTime('0:00')).toBe(0);
      expect(parseTime('0:30')).toBe(30);
      expect(parseTime('1:00')).toBe(60);
      expect(parseTime('1:30')).toBe(90);
      expect(parseTime('2:05')).toBe(125);
    });

    it('should handle large minute values', () => {
      expect(parseTime('10:00')).toBe(600);
      expect(parseTime('60:30')).toBe(3630);
      expect(parseTime('99:59')).toBe(5999);
    });

    it('should handle edge cases', () => {
      expect(parseTime('0:59')).toBe(59);
      expect(parseTime('1:01')).toBe(61);
    });
  });

  describe('getTimePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(getTimePercentage(0, 100)).toBe(0);
      expect(getTimePercentage(25, 100)).toBe(25);
      expect(getTimePercentage(50, 100)).toBe(50);
      expect(getTimePercentage(75, 100)).toBe(75);
      expect(getTimePercentage(100, 100)).toBe(100);
    });

    it('should handle decimal values', () => {
      expect(getTimePercentage(33.33, 100)).toBe(33.33);
      expect(getTimePercentage(66.67, 100)).toBe(66.67);
    });

    it('should handle zero duration', () => {
      expect(getTimePercentage(10, 0)).toBe(0);
      expect(getTimePercentage(0, 0)).toBe(0);
    });

    it('should clamp values between 0 and 100', () => {
      expect(getTimePercentage(-10, 100)).toBe(0);
      expect(getTimePercentage(150, 100)).toBe(100);
      expect(getTimePercentage(110, 100)).toBe(100);
    });

    it('should handle different duration values', () => {
      expect(getTimePercentage(30, 120)).toBe(25);  // 30/120 = 25%
      expect(getTimePercentage(45, 180)).toBe(25);  // 45/180 = 25%
      expect(getTimePercentage(90, 180)).toBe(50);  // 90/180 = 50%
    });

    it('should handle edge cases with very small numbers', () => {
      expect(getTimePercentage(0.1, 1)).toBe(10);
      expect(getTimePercentage(0.001, 0.01)).toBe(10);
    });
  });

  describe('formatTime and parseTime integration', () => {
    it('should be inverse operations for valid inputs', () => {
      const testCases = [0, 30, 60, 90, 125, 600, 3665];
      
      testCases.forEach(seconds => {
        const formatted = formatTime(seconds);
        const parsed = parseTime(formatted);
        expect(parsed).toBe(Math.floor(seconds));
      });
    });

    it('should handle round trip conversions', () => {
      const timeString = '5:30';
      const seconds = parseTime(timeString);
      const backToString = formatTime(seconds);
      expect(backToString).toBe(timeString);
    });
  });
});