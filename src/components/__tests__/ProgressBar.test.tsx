import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';
import { createMockSentence } from '../../test/utils';

describe('ProgressBar Component', () => {
  it('should render progress based on current time and duration', () => {
    render(
      <ProgressBar
        currentTime={25}
        duration={100}
        selectedSentences={[]}
      />
    );

    const progress = document.querySelector('.bg-blue-500') as HTMLElement;
    expect(progress).toHaveStyle('width: 25%');
  });

  it('should render markers for selected sentences with correct positioning', () => {
    const sentences = [
      createMockSentence({ id: 's1', startTime: 10, endTime: 20, isSelected: true }),
      createMockSentence({ id: 's2', startTime: 50, endTime: 60, isSelected: true })
    ];

    render(
      <ProgressBar
        currentTime={0}
        duration={100}
        selectedSentences={sentences}
      />
    );

    const markers = document.querySelectorAll('.bg-green-500');
    expect(markers).toHaveLength(2);

    const first = markers[0] as HTMLElement;
    expect(first.style.left).toBe('10%');
    expect(first.style.width).toBe('10%');
  });

  it('should apply a minimum width for very short sentences', () => {
    const sentences = [
      createMockSentence({ id: 's1', startTime: 10, endTime: 10.1, isSelected: true })
    ];

    render(
      <ProgressBar
        currentTime={0}
        duration={100}
        selectedSentences={sentences}
      />
    );

    const marker = document.querySelector('.bg-green-500') as HTMLElement;
    const widthValue = parseFloat(marker.style.width);
    expect(widthValue).toBeGreaterThanOrEqual(0.5);
  });
});
