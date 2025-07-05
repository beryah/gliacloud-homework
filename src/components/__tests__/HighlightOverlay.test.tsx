import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HighlightOverlay } from '../HighlightOverlay';
import type { TranscriptSentence } from '../../types';

// Mock store
vi.mock('../../store/highlightStore', () => ({
  useHighlightStore: vi.fn(),
}));

import { useHighlightStore } from '../../store/highlightStore';

const mockUseHighlightStore = vi.mocked(useHighlightStore);

const mockSelectedSentences: TranscriptSentence[] = [
  {
    id: 'sentence1',
    text: 'Welcome to the presentation.',
    startTime: 0,
    endTime: 5,
    isSelected: true,
    isHighlighted: false,
  },
  {
    id: 'sentence2',
    text: 'Today we will discuss various topics.',
    startTime: 10,
    endTime: 15,
    isSelected: true,
    isHighlighted: false,
  },
];

describe('HighlightOverlay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseHighlightStore.mockReturnValue({
      currentTime: 0,
      selectedSentences: [],
    });
  });

  it('should render nothing when no current sentence', () => {
    mockUseHighlightStore.mockReturnValue({
      currentTime: 20, // Outside any sentence range
      selectedSentences: mockSelectedSentences,
    });

    const { container } = render(<HighlightOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when no selected sentences', () => {
    mockUseHighlightStore.mockReturnValue({
      currentTime: 3,
      selectedSentences: [],
    });

    const { container } = render(<HighlightOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when current time is outside sentence range', () => {
    mockUseHighlightStore.mockReturnValue({
      currentTime: 7, // Between sentences (5-10 gap)
      selectedSentences: mockSelectedSentences,
    });

    const { container } = render(<HighlightOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('should render overlay when current sentence is playing', () => {
    mockUseHighlightStore.mockReturnValue({
      currentTime: 3, // Within first sentence (0-5)
      selectedSentences: mockSelectedSentences,
    });

    render(<HighlightOverlay />);
    
    expect(screen.getByText('Welcome to the presentation.')).toBeInTheDocument();
  });

  it('should have correct responsive overlay styling and positioning', () => {
    mockUseHighlightStore.mockReturnValue({
      currentTime: 3,
      selectedSentences: mockSelectedSentences,
    });

    render(<HighlightOverlay />);
    
    const overlay = screen.getByText('Welcome to the presentation.').parentElement;
    
    // Check responsive positioning classes
    expect(overlay).toHaveClass('absolute');
    expect(overlay).toHaveClass('bottom-2'); // Mobile positioning
    expect(overlay).toHaveClass('md:bottom-8'); // Desktop positioning
    expect(overlay).toHaveClass('left-1/2');
    expect(overlay).toHaveClass('transform');
    expect(overlay).toHaveClass('-translate-x-1/2');
    
    // Check responsive styling classes
    expect(overlay).toHaveClass('bg-black');
    expect(overlay).toHaveClass('bg-opacity-80');
    expect(overlay).toHaveClass('px-3'); // Mobile padding
    expect(overlay).toHaveClass('md:px-6'); // Desktop padding
    expect(overlay).toHaveClass('py-2'); // Mobile padding
    expect(overlay).toHaveClass('md:py-3'); // Desktop padding
    expect(overlay).toHaveClass('rounded-lg');
    
    // Check responsive width classes
    expect(overlay).toHaveClass('max-w-xs'); // Mobile width
    expect(overlay).toHaveClass('sm:max-w-sm'); // Small screen width
    expect(overlay).toHaveClass('md:max-w-4xl'); // Desktop width
    expect(overlay).toHaveClass('mx-2'); // Mobile margin
    expect(overlay).toHaveClass('md:mx-4'); // Desktop margin
  });

  it('should render text with correct responsive styling', () => {
    mockUseHighlightStore.mockReturnValue({
      currentTime: 3,
      selectedSentences: mockSelectedSentences,
    });

    render(<HighlightOverlay />);
    
    const textElement = screen.getByText('Welcome to the presentation.');
    
    expect(textElement).toHaveClass('text-white');
    expect(textElement).toHaveClass('text-center');
    expect(textElement).toHaveClass('text-sm'); // Mobile text size
    expect(textElement).toHaveClass('md:text-lg'); // Desktop text size
    expect(textElement).toHaveClass('leading-relaxed');
    expect(textElement).toHaveClass('break-words'); // For mobile word wrapping
  });

  it('should update when current time changes to different sentence', () => {
    // Start with first sentence
    mockUseHighlightStore.mockReturnValue({
      currentTime: 3,
      selectedSentences: mockSelectedSentences,
    });

    const { rerender } = render(<HighlightOverlay />);
    expect(screen.getByText('Welcome to the presentation.')).toBeInTheDocument();

    // Change to second sentence
    mockUseHighlightStore.mockReturnValue({
      currentTime: 12,
      selectedSentences: mockSelectedSentences,
    });

    rerender(<HighlightOverlay />);
    expect(screen.getByText('Today we will discuss various topics.')).toBeInTheDocument();
    expect(screen.queryByText('Welcome to the presentation.')).not.toBeInTheDocument();
  });

  it('should handle multiple selected sentences across sections', () => {
    const crossSectionSentences = [
      ...mockSelectedSentences,
      {
        id: 'sentence3',
        text: 'This is from another section.',
        startTime: 20,
        endTime: 25,
        isSelected: true,
        isHighlighted: false,
      },
    ];

    mockUseHighlightStore.mockReturnValue({
      currentTime: 22, // Within third sentence
      selectedSentences: crossSectionSentences,
    });

    render(<HighlightOverlay />);
    
    expect(screen.getByText('This is from another section.')).toBeInTheDocument();
  });

  it('should handle long text with responsive width constraints', () => {
    const longTextSentence = {
      id: 'long-sentence',
      text: 'This is a very long sentence that might need to be wrapped or truncated on mobile devices to ensure it fits properly within the screen boundaries and maintains good readability.',
      startTime: 0,
      endTime: 5,
      isSelected: true,
      isHighlighted: false,
    };

    mockUseHighlightStore.mockReturnValue({
      currentTime: 3,
      selectedSentences: [longTextSentence],
    });

    render(<HighlightOverlay />);
    
    const overlay = screen.getByText(longTextSentence.text).parentElement;
    const textElement = screen.getByText(longTextSentence.text);
    
    // Check that responsive width constraints are applied
    expect(overlay).toHaveClass('max-w-xs'); // Mobile constraint
    expect(overlay).toHaveClass('sm:max-w-sm'); // Small screen constraint
    expect(overlay).toHaveClass('md:max-w-4xl'); // Desktop constraint
    
    // Check that text can break properly
    expect(textElement).toHaveClass('break-words');
    
    expect(screen.getByText(longTextSentence.text)).toBeInTheDocument();
  });
});