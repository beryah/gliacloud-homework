import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from '../Loader';

describe('Loader Component', () => {
  it('should render with default props', () => {
    render(<Loader />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Check for spinner element
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-12', 'w-12'); // Default medium size
  });

  it('should render with custom message', () => {
    const customMessage = 'Processing your request...';
    render(<Loader message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should render small size spinner', () => {
    render(<Loader size="small" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('should render medium size spinner (default)', () => {
    render(<Loader size="medium" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('should render large size spinner', () => {
    render(<Loader size="large" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-16', 'w-16');
  });

  it('should have correct spinner styling', () => {
    render(<Loader />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('border-b-2');
    expect(spinner).toHaveClass('border-blue-500');
  });

  it('should have correct container layout', () => {
    render(<Loader />);

    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
    expect(container).toHaveClass('p-8');
  });

  it('should have correct text styling', () => {
    render(<Loader />);

    const text = screen.getByText('Loading...');
    expect(text).toHaveClass('text-lg');
    expect(text).toHaveClass('text-gray-300');
  });

  it('should render with all size variants correctly', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    const expectedClasses = {
      small: ['h-6', 'w-6'],
      medium: ['h-12', 'w-12'],
      large: ['h-16', 'w-16']
    };

    sizes.forEach(size => {
      const { unmount } = render(<Loader size={size} />);
      
      const spinner = document.querySelector('.animate-spin');
      expectedClasses[size].forEach(className => {
        expect(spinner).toHaveClass(className);
      });
      
      unmount();
    });
  });

  it('should render with custom message and size combination', () => {
    const customMessage = 'Analyzing video content...';
    render(<Loader message={customMessage} size="large" />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-16', 'w-16');
  });

  it('should have correct spacing between spinner and text', () => {
    render(<Loader />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('mb-4');
  });

  it('should handle empty message', () => {
    render(<Loader message="" />);

    // Check that the p element exists even with empty message
    const textElement = document.querySelector('p.text-lg.text-gray-300');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveTextContent('');
    
    // Spinner should still be rendered
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render consistently with different props combinations', () => {
    const testCases = [
      { message: 'Test 1', size: 'small' as const },
      { message: 'Test 2', size: 'medium' as const },
      { message: 'Test 3', size: 'large' as const },
      { size: 'small' as const },
      { message: 'Custom message only' }
    ];

    testCases.forEach((props) => {
      const { unmount } = render(<Loader {...props} />);
      
      // Should always have spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      // Should always have container structure
      const container = document.querySelector('.flex.flex-col.items-center.justify-center.p-8');
      expect(container).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should be accessible', () => {
    render(<Loader message="Loading content" />);

    // Check that the loading message is accessible to screen readers
    const text = screen.getByText('Loading content');
    expect(text).toBeInTheDocument();
    
    // The component should have proper structure for screen readers
    const container = text.parentElement;
    expect(container).toHaveClass('flex', 'flex-col');
  });
});