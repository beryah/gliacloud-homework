import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TranscriptEditor } from '../TranscriptEditor';
import { useHighlightStore } from '../../store/highlightStore';
import { createMockVideoData, createMockSection, createMockSentence } from '../../test/utils';

// Mock the useScrollIntoView hook
vi.mock('../../hooks/useScrollIntoView', () => ({
  useScrollIntoView: vi.fn()
}));

describe('TranscriptEditor Component', () => {
  beforeEach(() => {
    act(() => {
      useHighlightStore.getState().resetState();
    });
    vi.clearAllMocks();
  });

  it('should render "No transcript available" when no video data', () => {
    render(<TranscriptEditor />);

    expect(screen.getByText('No transcript available')).toBeInTheDocument();
  });

  it('should render transcript header when video data exists', () => {
    const mockData = createMockVideoData();
    
    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    expect(screen.getByText('Transcript')).toBeInTheDocument();
  });

  it('should display correct sentence count with no selections', () => {
    const mockData = createMockVideoData({
      transcript: [
        createMockSection({
          sentences: [
            createMockSentence({ isSelected: false }),
            createMockSentence({ isSelected: false }),
            createMockSentence({ isSelected: false })
          ]
        })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    expect(screen.getByText('0 sentences selected')).toBeInTheDocument();
  });

  it('should display correct sentence count with single selection', () => {
    const mockData = createMockVideoData({
      transcript: [
        createMockSection({
          sentences: [
            createMockSentence({ isSelected: true }),
            createMockSentence({ isSelected: false }),
            createMockSentence({ isSelected: false })
          ]
        })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    expect(screen.getByText('1 sentence selected')).toBeInTheDocument();
  });

  it('should display correct sentence count with multiple selections', () => {
    const mockData = createMockVideoData({
      transcript: [
        createMockSection({
          sentences: [
            createMockSentence({ isSelected: true }),
            createMockSentence({ isSelected: true }),
            createMockSentence({ isSelected: false })
          ]
        })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    expect(screen.getByText('2 sentences selected')).toBeInTheDocument();
  });

  it('should use plural form correctly', () => {
    // Test singular
    const mockDataSingle = createMockVideoData({
      transcript: [
        createMockSection({
          sentences: [createMockSentence({ isSelected: true })]
        })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockDataSingle);
    });
    
    const { rerender } = render(<TranscriptEditor />);
    expect(screen.getByText('1 sentence selected')).toBeInTheDocument();

    // Test plural
    const mockDataPlural = createMockVideoData({
      transcript: [
        createMockSection({
          sentences: [
            createMockSentence({ isSelected: true }),
            createMockSentence({ isSelected: true })
          ]
        })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockDataPlural);
    });
    
    rerender(<TranscriptEditor />);
    expect(screen.getByText('2 sentences selected')).toBeInTheDocument();
  });

  it('should render all sections from transcript', () => {
    const mockData = createMockVideoData({
      transcript: [
        createMockSection({
          id: 'section1',
          title: 'First Section',
          sentences: [createMockSentence({ text: 'First sentence' })]
        }),
        createMockSection({
          id: 'section2',
          title: 'Second Section',
          sentences: [createMockSentence({ text: 'Second sentence' })]
        }),
        createMockSection({
          id: 'section3',
          title: 'Third Section',
          sentences: [createMockSentence({ text: 'Third sentence' })]
        })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    expect(screen.getByText('First Section')).toBeInTheDocument();
    expect(screen.getByText('Second Section')).toBeInTheDocument();
    expect(screen.getByText('Third Section')).toBeInTheDocument();
    expect(screen.getByText('First sentence')).toBeInTheDocument();
    expect(screen.getByText('Second sentence')).toBeInTheDocument();
    expect(screen.getByText('Third sentence')).toBeInTheDocument();
  });

  it('should have correct container structure and layout', () => {
    const mockData = createMockVideoData();
    
    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    // Main container should be full height with flex layout
    const mainContainer = screen.getByText('Transcript').closest('.h-full.flex.flex-col');
    expect(mainContainer).toBeInTheDocument();

    // Header should have border
    const header = screen.getByText('Transcript').closest('.border-b.border-gray-700');
    expect(header).toBeInTheDocument();

    // Content area should be scrollable
    const contentArea = document.querySelector('.flex-1.overflow-y-auto.p-4');
    expect(contentArea).toBeInTheDocument();
  });

  it('should handle empty transcript sections', () => {
    const mockData = createMockVideoData({
      transcript: [
        createMockSection({
          id: 'empty-section',
          title: 'Empty Section',
          sentences: []
        })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    expect(screen.getByText('Empty Section')).toBeInTheDocument();
    expect(screen.getByText('0 sentences selected')).toBeInTheDocument();
  });

  it('should count sentences across multiple sections', () => {
    const mockData = createMockVideoData({
      transcript: [
        createMockSection({
          sentences: [
            createMockSentence({ isSelected: true }),
            createMockSentence({ isSelected: false })
          ]
        }),
        createMockSection({
          sentences: [
            createMockSentence({ isSelected: true }),
            createMockSentence({ isSelected: true })
          ]
        })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    // Should count selected sentences from all sections: 1 + 2 = 3
    expect(screen.getByText('3 sentences selected')).toBeInTheDocument();
  });

  it('should update sentence count when selections change', () => {
    const mockData = createMockVideoData({
      transcript: [
        createMockSection({
          sentences: [
            createMockSentence({ id: 's1', isSelected: false }),
            createMockSentence({ id: 's2', isSelected: false })
          ]
        })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });
    
    const { rerender } = render(<TranscriptEditor />);

    expect(screen.getByText('0 sentences selected')).toBeInTheDocument();

    // Simulate selection change
    act(() => {
      useHighlightStore.getState().toggleSentenceSelection('s1');
    });
    
    rerender(<TranscriptEditor />);

    expect(screen.getByText('1 sentence selected')).toBeInTheDocument();
  });

  it('should handle large numbers of sections and sentences', () => {
    const manySections = Array.from({ length: 10 }, (_, sectionIndex) => 
      createMockSection({
        id: `section${sectionIndex + 1}`,
        title: `Section ${sectionIndex + 1}`,
        sentences: Array.from({ length: 5 }, (_, sentenceIndex) =>
          createMockSentence({
            id: `s${sectionIndex + 1}-${sentenceIndex + 1}`,
            text: `Sentence ${sentenceIndex + 1} in section ${sectionIndex + 1}`,
            isSelected: sentenceIndex % 2 === 0 // Every other sentence selected
          })
        )
      })
    );

    const mockData = createMockVideoData({
      transcript: manySections
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    // Should render all sections
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 10')).toBeInTheDocument();

    // Should count selected sentences correctly (3 per section * 10 sections = 30)
    expect(screen.getByText('30 sentences selected')).toBeInTheDocument();
  });

  it('should have proper spacing between sections', () => {
    const mockData = createMockVideoData({
      transcript: [
        createMockSection({ title: 'Section 1' }),
        createMockSection({ title: 'Section 2' })
      ]
    });

    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    const sectionsContainer = document.querySelector('.space-y-6');
    expect(sectionsContainer).toBeInTheDocument();
  });

  it('should center "No transcript available" message', () => {
    render(<TranscriptEditor />);

    const messageContainer = screen.getByText('No transcript available').closest('.flex.items-center.justify-center.h-full');
    expect(messageContainer).toBeInTheDocument();
  });

  it('should apply correct text styling to "No transcript available"', () => {
    render(<TranscriptEditor />);

    const message = screen.getByText('No transcript available');
    expect(message).toHaveClass('text-gray-400');
  });

  it('should maintain header layout with proper spacing', () => {
    const mockData = createMockVideoData();
    
    act(() => {
      useHighlightStore.getState().setVideoData(mockData);
    });

    render(<TranscriptEditor />);

    const header = screen.getByText('Transcript').closest('.flex.items-center.justify-between.p-4.border-b.border-gray-700');
    expect(header).toBeInTheDocument();

    const title = screen.getByText('Transcript');
    expect(title).toHaveClass('text-xl', 'font-semibold');

    const counter = screen.getByText(/sentences? selected/);
    expect(counter).toHaveClass('text-sm', 'text-gray-400');
  });
});