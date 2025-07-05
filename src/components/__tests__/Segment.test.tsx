import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Segment } from '../Segment';
import { useHighlightStore } from '../../store/highlightStore';
import { createMockSection, createMockSentence } from '../../test/utils';

describe('Segment Component', () => {
  beforeEach(() => {
    useHighlightStore.getState().resetState();
  });

  it('should render section title', () => {
    const mockSection = createMockSection({
      id: 'test-section',
      title: 'Test Section Title',
      sentences: []
    });

    render(<Segment section={mockSection} />);

    expect(screen.getByText('Test Section Title')).toBeInTheDocument();
  });

  it('should render section title with correct styling', () => {
    const mockSection = createMockSection({
      id: 'test-section',
      title: 'Styled Section Title',
      sentences: []
    });

    render(<Segment section={mockSection} />);

    const titleElement = screen.getByText('Styled Section Title');
    expect(titleElement).toHaveClass('text-lg');
    expect(titleElement).toHaveClass('font-medium');
    expect(titleElement).toHaveClass('text-blue-400');
  });

  it('should have correct section id for scroll targeting', () => {
    const mockSection = createMockSection({
      id: 'scrollable-section',
      title: 'Scrollable Section',
      sentences: []
    });

    render(<Segment section={mockSection} />);

    const titleElement = document.getElementById('section-scrollable-section');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toContainElement(screen.getByText('Scrollable Section'));
  });

  it('should render section title as sticky header', () => {
    const mockSection = createMockSection({
      id: 'sticky-section',
      title: 'Sticky Header',
      sentences: []
    });

    render(<Segment section={mockSection} />);

    const titleElement = screen.getByText('Sticky Header');
    expect(titleElement).toHaveClass('sticky');
    expect(titleElement).toHaveClass('top-0');
    expect(titleElement).toHaveClass('bg-gray-800');
    expect(titleElement).toHaveClass('py-2');
    expect(titleElement).toHaveClass('z-10');
  });

  it('should render all sentences in the section', () => {
    const mockSection = createMockSection({
      id: 'multi-sentence-section',
      title: 'Multiple Sentences',
      sentences: [
        createMockSentence({
          id: 's1',
          text: 'First sentence in section',
          startTime: 0,
          endTime: 3
        }),
        createMockSentence({
          id: 's2',
          text: 'Second sentence in section',
          startTime: 3,
          endTime: 6
        }),
        createMockSentence({
          id: 's3',
          text: 'Third sentence in section',
          startTime: 6,
          endTime: 9
        })
      ]
    });

    render(<Segment section={mockSection} />);

    expect(screen.getByText('First sentence in section')).toBeInTheDocument();
    expect(screen.getByText('Second sentence in section')).toBeInTheDocument();
    expect(screen.getByText('Third sentence in section')).toBeInTheDocument();
  });

  it('should render empty section with no sentences', () => {
    const mockSection = createMockSection({
      id: 'empty-section',
      title: 'Empty Section',
      sentences: []
    });

    render(<Segment section={mockSection} />);

    expect(screen.getByText('Empty Section')).toBeInTheDocument();
    
    // Should not have any sentence elements
    const sentenceElements = document.querySelectorAll('[id^="sentence-"]');
    expect(sentenceElements).toHaveLength(0);
  });

  it('should have correct container structure and spacing', () => {
    const mockSection = createMockSection({
      id: 'structured-section',
      title: 'Structured Section',
      sentences: [
        createMockSentence({
          id: 's1',
          text: 'Test sentence',
          startTime: 0,
          endTime: 3
        })
      ]
    });

    render(<Segment section={mockSection} />);

    // Main container should have correct spacing
    const mainContainer = screen.getByText('Structured Section').closest('.space-y-2');
    expect(mainContainer).toBeInTheDocument();

    // Sentences container should have correct spacing
    const sentencesContainer = document.querySelector('.space-y-2:not(:first-child)');
    expect(sentencesContainer).toBeInTheDocument();
  });

  it('should render sentences with different states', () => {
    const mockSection = createMockSection({
      id: 'state-section',
      title: 'Different States',
      sentences: [
        createMockSentence({
          id: 's1',
          text: 'Selected sentence',
          isSelected: true,
          startTime: 0,
          endTime: 3
        }),
        createMockSentence({
          id: 's2',
          text: 'Unselected sentence',
          isSelected: false,
          startTime: 3,
          endTime: 6
        }),
        createMockSentence({
          id: 's3',
          text: 'Highlighted sentence',
          isSelected: true,
          isHighlighted: true,
          startTime: 6,
          endTime: 9
        })
      ]
    });

    render(<Segment section={mockSection} />);

    expect(screen.getByText('Selected sentence')).toBeInTheDocument();
    expect(screen.getByText('Unselected sentence')).toBeInTheDocument();
    expect(screen.getByText('Highlighted sentence')).toBeInTheDocument();

    // Check that different sentences have different styling
    const selectedContainer = document.getElementById('sentence-s1');
    const unselectedContainer = document.getElementById('sentence-s2');
    const highlightedContainer = document.getElementById('sentence-s3');

    expect(selectedContainer).toHaveClass('border-green-500');
    expect(highlightedContainer).toHaveClass('border-blue-500');
    expect(unselectedContainer).not.toHaveClass('border-green-500');
    expect(unselectedContainer).not.toHaveClass('border-blue-500');
  });

  it('should maintain sentence order', () => {
    const mockSection = createMockSection({
      id: 'ordered-section',
      title: 'Ordered Section',
      sentences: [
        createMockSentence({
          id: 's1',
          text: 'First',
          startTime: 0,
          endTime: 1
        }),
        createMockSentence({
          id: 's2',
          text: 'Second',
          startTime: 1,
          endTime: 2
        }),
        createMockSentence({
          id: 's3',
          text: 'Third',
          startTime: 2,
          endTime: 3
        })
      ]
    });

    render(<Segment section={mockSection} />);

    const sentences = screen.getAllByText(/First|Second|Third/);
    expect(sentences[0]).toHaveTextContent('First');
    expect(sentences[1]).toHaveTextContent('Second');
    expect(sentences[2]).toHaveTextContent('Third');
  });

  it('should handle long section titles', () => {
    const longTitle = 'This is a very long section title that might need to wrap or be handled specially in the user interface';
    
    const mockSection = createMockSection({
      id: 'long-title-section',
      title: longTitle,
      sentences: []
    });

    render(<Segment section={mockSection} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
    
    // Title should still have correct styling
    const titleElement = screen.getByText(longTitle);
    expect(titleElement).toHaveClass('text-lg', 'font-medium', 'text-blue-400');
  });

  it('should render with special characters in title and content', () => {
    const mockSection = createMockSection({
      id: 'special-chars-section',
      title: 'Section with "Quotes" & Symbols!',
      sentences: [
        createMockSentence({
          id: 's1',
          text: 'Sentence with <html> tags & "quotes"',
          startTime: 0,
          endTime: 3
        })
      ]
    });

    render(<Segment section={mockSection} />);

    expect(screen.getByText('Section with "Quotes" & Symbols!')).toBeInTheDocument();
    expect(screen.getByText('Sentence with <html> tags & "quotes"')).toBeInTheDocument();
  });

  it('should handle sections with many sentences efficiently', () => {
    const manySentences = Array.from({ length: 50 }, (_, index) => 
      createMockSentence({
        id: `s${index + 1}`,
        text: `Sentence number ${index + 1}`,
        startTime: index * 2,
        endTime: (index + 1) * 2
      })
    );

    const mockSection = createMockSection({
      id: 'large-section',
      title: 'Large Section',
      sentences: manySentences
    });

    render(<Segment section={mockSection} />);

    expect(screen.getByText('Large Section')).toBeInTheDocument();
    expect(screen.getByText('Sentence number 1')).toBeInTheDocument();
    expect(screen.getByText('Sentence number 50')).toBeInTheDocument();

    // All sentences should be rendered
    const sentenceElements = document.querySelectorAll('[id^="sentence-s"]');
    expect(sentenceElements).toHaveLength(50);
  });
});