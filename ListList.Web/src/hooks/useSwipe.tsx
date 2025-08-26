import { useRef } from 'react';

export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const startX = useRef(0);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX.current;

    if (deltaX > 50) onSwipeRight();
    if (deltaX < -50) onSwipeLeft();
  }

  return {
    onTouchStart,
    onTouchEnd,
  };
}
