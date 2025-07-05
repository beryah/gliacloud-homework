/**
 * Scroll an element into view with smooth animation
 * @param elementId - The ID of the element to scroll to
 * @param behavior - Scroll behavior (smooth, auto, instant)
 * @param block - Vertical alignment (start, center, end, nearest)
 */
export const scrollToElement = (
  elementId: string,
  behavior: ScrollBehavior = 'smooth',
  block: ScrollLogicalPosition = 'center'
): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior,
      block,
      inline: 'nearest'
    });
  }
};

/**
 * Scroll to a specific position within a container
 * @param container - The container element to scroll
 * @param position - The scroll position
 * @param behavior - Scroll behavior
 */
export const scrollToPosition = (
  container: HTMLElement,
  position: number,
  behavior: ScrollBehavior = 'smooth'
): void => {
  container.scrollTo({
    top: position,
    behavior
  });
};

/**
 * Check if an element is visible in its container
 * @param element - The element to check
 * @param container - The container element
 * @returns Whether the element is fully visible
 */
export const isElementVisible = (element: HTMLElement, container: HTMLElement): boolean => {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  return (
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom
  );
};