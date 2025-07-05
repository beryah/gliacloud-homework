import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrollToElement, scrollToPosition, isElementVisible } from '../scrollHelper';

// Mock DOM methods
const mockScrollIntoView = vi.fn();
const mockScrollTo = vi.fn();
const mockGetBoundingClientRect = vi.fn();

describe('scrollHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document.getElementById
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (id === 'existing-element') {
        return {
          scrollIntoView: mockScrollIntoView,
        } as unknown as HTMLElement;
      }
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('scrollToElement', () => {
    it('should scroll to element with default parameters', () => {
      scrollToElement('existing-element');

      expect(document.getElementById).toHaveBeenCalledWith('existing-element');
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    });

    it('should scroll to element with custom behavior', () => {
      scrollToElement('existing-element', 'auto');

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'center',
        inline: 'nearest'
      });
    });

    it('should scroll to element with custom block position', () => {
      scrollToElement('existing-element', 'smooth', 'start');

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    });

    it('should scroll to element with custom behavior and block position', () => {
      scrollToElement('existing-element', 'instant', 'end');

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'instant',
        block: 'end',
        inline: 'nearest'
      });
    });

    it('should handle non-existent element gracefully', () => {
      scrollToElement('non-existent-element');

      expect(document.getElementById).toHaveBeenCalledWith('non-existent-element');
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('should handle empty string element ID', () => {
      scrollToElement('');

      expect(document.getElementById).toHaveBeenCalledWith('');
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('scrollToPosition', () => {
    let mockContainer: HTMLElement;

    beforeEach(() => {
      mockContainer = {
        scrollTo: mockScrollTo,
      } as unknown as HTMLElement;
    });

    it('should scroll to position with default behavior', () => {
      scrollToPosition(mockContainer, 100);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 100,
        behavior: 'smooth'
      });
    });

    it('should scroll to position with custom behavior', () => {
      scrollToPosition(mockContainer, 200, 'auto');

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 200,
        behavior: 'auto'
      });
    });

    it('should scroll to position with instant behavior', () => {
      scrollToPosition(mockContainer, 0, 'instant');

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'instant'
      });
    });

    it('should handle negative positions', () => {
      scrollToPosition(mockContainer, -50);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: -50,
        behavior: 'smooth'
      });
    });

    it('should handle large positions', () => {
      scrollToPosition(mockContainer, 9999);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 9999,
        behavior: 'smooth'
      });
    });
  });

  describe('isElementVisible', () => {
    let mockElement: HTMLElement;
    let mockContainer: HTMLElement;

    beforeEach(() => {
      mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockContainer = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          top: 100,
          bottom: 400,
          left: 0,
          right: 800,
        }),
      } as unknown as HTMLElement;
    });

    it('should return true when element is fully visible', () => {
      mockGetBoundingClientRect.mockReturnValue({
        top: 150,
        bottom: 350,
        left: 50,
        right: 750,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(true);
      expect(mockGetBoundingClientRect).toHaveBeenCalled();
      expect(mockContainer.getBoundingClientRect).toHaveBeenCalled();
    });

    it('should return false when element top is above container', () => {
      mockGetBoundingClientRect.mockReturnValue({
        top: 50,
        bottom: 150,
        left: 50,
        right: 750,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(false);
    });

    it('should return false when element bottom is below container', () => {
      mockGetBoundingClientRect.mockReturnValue({
        top: 350,
        bottom: 450,
        left: 50,
        right: 750,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(false);
    });

    it('should return false when element is completely above container', () => {
      mockGetBoundingClientRect.mockReturnValue({
        top: 0,
        bottom: 50,
        left: 50,
        right: 750,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(false);
    });

    it('should return false when element is completely below container', () => {
      mockGetBoundingClientRect.mockReturnValue({
        top: 450,
        bottom: 500,
        left: 50,
        right: 750,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(false);
    });

    it('should return true when element exactly matches container bounds', () => {
      mockGetBoundingClientRect.mockReturnValue({
        top: 100,
        bottom: 400,
        left: 0,
        right: 800,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(true);
    });

    it('should return false when element partially overlaps container top', () => {
      mockGetBoundingClientRect.mockReturnValue({
        top: 80,
        bottom: 200,
        left: 50,
        right: 750,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(false);
    });

    it('should return false when element partially overlaps container bottom', () => {
      mockGetBoundingClientRect.mockReturnValue({
        top: 300,
        bottom: 450,
        left: 50,
        right: 750,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(false);
    });

    it('should handle zero-height elements', () => {
      mockGetBoundingClientRect.mockReturnValue({
        top: 200,
        bottom: 200,
        left: 50,
        right: 750,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(true);
    });

    it('should handle zero-height container', () => {
      mockContainer = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          top: 200,
          bottom: 200,
          left: 0,
          right: 800,
        }),
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        top: 200,
        bottom: 200,
        left: 50,
        right: 750,
      });

      const result = isElementVisible(mockElement, mockContainer);

      expect(result).toBe(true);
    });
  });
});