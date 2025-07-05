import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sentence } from '../Sentence';
import type { TranscriptSentence } from '../../types';

// Mock dependencies
vi.mock('../../utils/timeFormat', () => ({
  formatTime: vi.fn((time: number) => `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`),
}));

vi.mock('../../store/highlightStore', () => ({
  useHighlightStore: vi.fn(),
}));

vi.mock('../../hooks/useVideoSync', () => ({
  useVideoSync: vi.fn(),
}));

import { useHighlightStore } from '../../store/highlightStore';
import { useVideoSync } from '../../hooks/useVideoSync';

const mockUseHighlightStore = vi.mocked(useHighlightStore);
const mockUseVideoSync = vi.mocked(useVideoSync);

const mockSentence: TranscriptSentence = {
  id: 'sentence1',
  text: 'This is a test sentence.',
  startTime: 30,
  endTime: 35,
  isSelected: false,
  isHighlighted: false,
};

describe('Sentence', () => {
  const mockToggleSentenceSelection = vi.fn();
  const mockSeekTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseHighlightStore.mockReturnValue({
      toggleSentenceSelection: mockToggleSentenceSelection,
    });

    mockUseVideoSync.mockReturnValue({
      currentTime: 0,
      isPlaying: false,
      togglePlayPause: vi.fn(),
      seekTo: mockSeekTo,
      seekToSentence: vi.fn(),
      getCurrentSentenceInfo: vi.fn(() => null),
      currentSentenceIndex: 0,
      isPlayingSelected: false,
      selectedSentences: [],
    });
  });

  it('should render sentence content with timestamp and checkbox', () => {
    render(<Sentence sentence={mockSentence} />);

    expect(screen.getByText('This is a test sentence.')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should apply correct styling based on state', () => {
    // Test highlighted state
    const highlightedSentence = { ...mockSentence, isHighlighted: true };
    const { rerender } = render(<Sentence sentence={highlightedSentence} />);
    
    let container = document.getElementById('sentence-sentence1');
    expect(container).toHaveClass('bg-blue-900', 'border-blue-500');

    // Test selected state
    const selectedSentence = { ...mockSentence, isSelected: true, isHighlighted: false };
    rerender(<Sentence sentence={selectedSentence} />);
    
    container = document.getElementById('sentence-sentence1');
    expect(container).toHaveClass('bg-gray-700', 'border-green-500');

    // Test default state
    rerender(<Sentence sentence={mockSentence} />);
    
    container = document.getElementById('sentence-sentence1');
    expect(container).toHaveClass('bg-gray-700', 'hover:bg-gray-600');
  });

  it('should toggle selection when clicked', () => {
    render(<Sentence sentence={mockSentence} />);

    const container = document.getElementById('sentence-sentence1');
    fireEvent.click(container!);

    expect(mockToggleSentenceSelection).toHaveBeenCalledWith('sentence1');
  });

  it('should seek to timestamp when timestamp button is clicked', () => {
    render(<Sentence sentence={mockSentence} />);

    const timestampButton = screen.getByTitle('Jump to this time');
    fireEvent.click(timestampButton);

    expect(mockSeekTo).toHaveBeenCalledWith(30);
    expect(mockToggleSentenceSelection).not.toHaveBeenCalled(); // Propagation stopped
  });

  it('should reflect checkbox state and handle changes', () => {
    const selectedSentence = { ...mockSentence, isSelected: true };
    render(<Sentence sentence={selectedSentence} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(mockToggleSentenceSelection).toHaveBeenCalledWith('sentence1');
  });

  it('should have correct DOM ID for scrolling', () => {
    render(<Sentence sentence={mockSentence} />);

    const container = document.getElementById('sentence-sentence1');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('id', 'sentence-sentence1');
  });
});