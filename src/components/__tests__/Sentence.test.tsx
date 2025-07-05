import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sentence } from '../Sentence';
import { useHighlightStore } from '../../store/highlightStore';
import { createMockSentence } from '../../test/utils';

// Mock the hooks
vi.mock('../../hooks/useVideoSync', () => ({
  useVideoSync: vi.fn(() => ({
    currentTime: 0,
    isPlaying: false,
    togglePlayPause: vi.fn(),
    seekTo: vi.fn()
  }))
}));

describe('Sentence Component', () => {
  const mockSentence = createMockSentence({
    id: 'test-sentence',
    text: 'This is a test sentence',
    startTime: 10,
    endTime: 15,
    isSelected: false
  });

  beforeEach(() => {
    useHighlightStore.getState().resetState();
    vi.clearAllMocks();
  });

  it('should render sentence text and timestamp', () => {
    render(<Sentence sentence={mockSentence} />);

    expect(screen.getByText('This is a test sentence')).toBeInTheDocument();
    expect(screen.getByText('0:10')).toBeInTheDocument();
  });

  it('should render checkbox in unchecked state when not selected', () => {
    render(<Sentence sentence={mockSentence} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checkbox in checked state when selected', () => {
    const selectedSentence = { ...mockSentence, isSelected: true };
    render(<Sentence sentence={selectedSentence} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should apply highlight styles when sentence is highlighted', () => {
    const highlightedSentence = { ...mockSentence, isHighlighted: true };
    render(<Sentence sentence={highlightedSentence} />);

    // Find the main sentence container div
    const sentenceContainer = document.getElementById('sentence-test-sentence');
    expect(sentenceContainer).toHaveClass('bg-blue-900');
    expect(sentenceContainer).toHaveClass('border-blue-500');
  });

  it('should apply selected styles when sentence is selected', () => {
    const selectedSentence = { ...mockSentence, isSelected: true };
    render(<Sentence sentence={selectedSentence} />);

    // Find the main sentence container div
    const sentenceContainer = document.getElementById('sentence-test-sentence');
    expect(sentenceContainer).toHaveClass('bg-gray-700');
    expect(sentenceContainer).toHaveClass('border-green-500');
  });

  it('should call toggleSentenceSelection when sentence is clicked', () => {
    const toggleSpy = vi.spyOn(useHighlightStore.getState(), 'toggleSentenceSelection');
    render(<Sentence sentence={mockSentence} />);

    const sentenceContainer = document.getElementById('sentence-test-sentence');
    fireEvent.click(sentenceContainer!);

    expect(toggleSpy).toHaveBeenCalledWith('test-sentence');
  });

  it('should call toggleSentenceSelection when checkbox is clicked', () => {
    const toggleSpy = vi.spyOn(useHighlightStore.getState(), 'toggleSentenceSelection');
    render(<Sentence sentence={mockSentence} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(toggleSpy).toHaveBeenCalledWith('test-sentence');
  });

  it('should call seekTo when timestamp button is clicked', async () => {
    const mockSeekTo = vi.fn();
    
    // Mock the hook to return our mock function
    const { useVideoSync } = await import('../../hooks/useVideoSync');
    vi.mocked(useVideoSync).mockReturnValue({
      currentTime: 0,
      isPlaying: false,
      togglePlayPause: vi.fn(),
      seekTo: mockSeekTo
    });

    render(<Sentence sentence={mockSentence} />);

    const timestampButton = screen.getByText('0:10');
    fireEvent.click(timestampButton);

    expect(mockSeekTo).toHaveBeenCalledWith(10);
  });

  it('should prevent event propagation when timestamp is clicked', () => {
    const toggleSpy = vi.spyOn(useHighlightStore.getState(), 'toggleSentenceSelection');
    render(<Sentence sentence={mockSentence} />);

    const timestampButton = screen.getByText('0:10');
    fireEvent.click(timestampButton);

    // Should not trigger sentence selection
    expect(toggleSpy).not.toHaveBeenCalled();
  });

  it('should have correct element id for scroll targeting', () => {
    render(<Sentence sentence={mockSentence} />);

    const sentenceElement = document.getElementById('sentence-test-sentence');
    expect(sentenceElement).toBeInTheDocument();
    expect(sentenceElement).toContainElement(screen.getByText('This is a test sentence'));
  });

  it('should apply hover styles on non-selected sentences', () => {
    render(<Sentence sentence={mockSentence} />);

    const sentenceContainer = document.getElementById('sentence-test-sentence');
    expect(sentenceContainer).toHaveClass('hover:bg-gray-600');
  });
});