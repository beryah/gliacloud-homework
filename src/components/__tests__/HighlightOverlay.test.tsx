import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HighlightOverlay } from '../HighlightOverlay';
import { useHighlightStore } from '../../store/highlightStore';
import { createMockVideoData, createMockSentence } from '../../test/utils';

describe('HighlightOverlay Component', () => {
  beforeEach(() => {
    useHighlightStore.getState().resetState();
  });

  it('should render nothing when no current sentence', () => {
    const { container } = render(<HighlightOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when no selected sentences', () => {
    const mockData = createMockVideoData({
      transcript: [{
        id: 'section1',
        title: 'Test Section',
        sentences: [
          createMockSentence({ 
            id: 's1', 
            startTime: 0, 
            endTime: 5, 
            isSelected: false // Not selected
          })
        ]
      }]
    });

    useHighlightStore.getState().setVideoData(mockData);
    useHighlightStore.getState().setCurrentTime(3); // Within sentence time range

    const { container } = render(<HighlightOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when current time is outside sentence range', () => {
    const mockData = createMockVideoData({
      transcript: [{
        id: 'section1',
        title: 'Test Section',
        sentences: [
          createMockSentence({ 
            id: 's1', 
            text: 'Test sentence text',
            startTime: 10, 
            endTime: 15, 
            isSelected: true
          })
        ]
      }]
    });

    useHighlightStore.getState().setVideoData(mockData);
    useHighlightStore.getState().setCurrentTime(20); // Outside sentence range

    const { container } = render(<HighlightOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('should render overlay when current sentence is playing', () => {
    const mockData = createMockVideoData({
      transcript: [{
        id: 'section1',
        title: 'Test Section',
        sentences: [
          createMockSentence({ 
            id: 's1', 
            text: 'This is the current sentence being displayed',
            startTime: 10, 
            endTime: 15, 
            isSelected: true
          })
        ]
      }]
    });

    useHighlightStore.getState().setVideoData(mockData);
    useHighlightStore.getState().setCurrentTime(12); // Within sentence time range

    render(<HighlightOverlay />);

    expect(screen.getByText('This is the current sentence being displayed')).toBeInTheDocument();
  });

  it('should have correct overlay styling and positioning', () => {
    const mockData = createMockVideoData({
      transcript: [{
        id: 'section1',
        title: 'Test Section',
        sentences: [
          createMockSentence({ 
            id: 's1', 
            text: 'Styled overlay text',
            startTime: 0, 
            endTime: 5, 
            isSelected: true
          })
        ]
      }]
    });

    useHighlightStore.getState().setVideoData(mockData);
    useHighlightStore.getState().setCurrentTime(3);

    render(<HighlightOverlay />);

    const overlayContainer = screen.getByText('Styled overlay text').parentElement;
    
    // Check for positioning classes
    expect(overlayContainer).toHaveClass('absolute');
    expect(overlayContainer).toHaveClass('bottom-20');
    expect(overlayContainer).toHaveClass('left-1/2');
    expect(overlayContainer).toHaveClass('transform');
    expect(overlayContainer).toHaveClass('-translate-x-1/2');
    
    // Check for styling classes
    expect(overlayContainer).toHaveClass('bg-black');
    expect(overlayContainer).toHaveClass('bg-opacity-80');
    expect(overlayContainer).toHaveClass('px-6');
    expect(overlayContainer).toHaveClass('py-3');
    expect(overlayContainer).toHaveClass('rounded-lg');
    expect(overlayContainer).toHaveClass('max-w-4xl');
    expect(overlayContainer).toHaveClass('mx-4');
  });

  it('should render text with correct styling', () => {
    const mockData = createMockVideoData({
      transcript: [{
        id: 'section1',
        title: 'Test Section',
        sentences: [
          createMockSentence({ 
            id: 's1', 
            text: 'Text with correct styling',
            startTime: 0, 
            endTime: 5, 
            isSelected: true
          })
        ]
      }]
    });

    useHighlightStore.getState().setVideoData(mockData);
    useHighlightStore.getState().setCurrentTime(3);

    render(<HighlightOverlay />);

    const textElement = screen.getByText('Text with correct styling');
    
    expect(textElement).toHaveClass('text-white');
    expect(textElement).toHaveClass('text-center');
    expect(textElement).toHaveClass('text-lg');
    expect(textElement).toHaveClass('leading-relaxed');
  });

  it('should update when current time changes to different sentence', () => {
    const mockData = createMockVideoData({
      transcript: [{
        id: 'section1',
        title: 'Test Section',
        sentences: [
          createMockSentence({ 
            id: 's1', 
            text: 'First sentence',
            startTime: 0, 
            endTime: 5, 
            isSelected: true
          }),
          createMockSentence({ 
            id: 's2', 
            text: 'Second sentence',
            startTime: 5, 
            endTime: 10, 
            isSelected: true
          })
        ]
      }]
    });

    useHighlightStore.getState().setVideoData(mockData);
    useHighlightStore.getState().setCurrentTime(3); // First sentence

    const { rerender } = render(<HighlightOverlay />);
    
    expect(screen.getByText('First sentence')).toBeInTheDocument();
    expect(screen.queryByText('Second sentence')).not.toBeInTheDocument();

    // Change to second sentence
    useHighlightStore.getState().setCurrentTime(7);
    rerender(<HighlightOverlay />);

    expect(screen.queryByText('First sentence')).not.toBeInTheDocument();
    expect(screen.getByText('Second sentence')).toBeInTheDocument();
  });

  it('should handle multiple selected sentences across sections', () => {
    const mockData = createMockVideoData({
      transcript: [
        {
          id: 'section1',
          title: 'Section 1',
          sentences: [
            createMockSentence({ 
              id: 's1', 
              text: 'Sentence from section 1',
              startTime: 0, 
              endTime: 5, 
              isSelected: true
            })
          ]
        },
        {
          id: 'section2',
          title: 'Section 2',
          sentences: [
            createMockSentence({ 
              id: 's2', 
              text: 'Sentence from section 2',
              startTime: 10, 
              endTime: 15, 
              isSelected: true
            })
          ]
        }
      ]
    });

    useHighlightStore.getState().setVideoData(mockData);
    useHighlightStore.getState().setCurrentTime(12); // Second section

    render(<HighlightOverlay />);

    expect(screen.getByText('Sentence from section 2')).toBeInTheDocument();
    expect(screen.queryByText('Sentence from section 1')).not.toBeInTheDocument();
  });

  it('should handle long text properly', () => {
    const longText = 'This is a very long sentence that should be displayed in the overlay and should wrap properly within the maximum width constraints of the overlay container.';
    
    const mockData = createMockVideoData({
      transcript: [{
        id: 'section1',
        title: 'Test Section',
        sentences: [
          createMockSentence({ 
            id: 's1', 
            text: longText,
            startTime: 0, 
            endTime: 5, 
            isSelected: true
          })
        ]
      }]
    });

    useHighlightStore.getState().setVideoData(mockData);
    useHighlightStore.getState().setCurrentTime(3);

    render(<HighlightOverlay />);

    expect(screen.getByText(longText)).toBeInTheDocument();
    
    // Check that max-width constraint is applied
    const overlayContainer = screen.getByText(longText).parentElement;
    expect(overlayContainer).toHaveClass('max-w-4xl');
  });
});