/**
 * Convert seconds to MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "1:23", "10:45")
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Convert MM:SS format to seconds
 * @param timeString - Time in MM:SS format
 * @returns Time in seconds
 */
export const parseTime = (timeString: string): number => {
  const [mins, secs] = timeString.split(':').map(Number);
  return mins * 60 + secs;
};

/**
 * Get percentage of current time in total duration
 * @param currentTime - Current playback time in seconds
 * @param duration - Total video duration in seconds
 * @returns Percentage (0-100)
 */
export const getTimePercentage = (currentTime: number, duration: number): number => {
  if (duration === 0) return 0;
  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
};