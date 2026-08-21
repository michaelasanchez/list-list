import { useCallback, useEffect, useRef, useState } from 'react';

type Point = {
  x: number;
  y: number;
};

type UseLongPressOptions = {
  onStart?: () => void;
  onFinish?: () => void;
  threshold?: number; // ms required to trigger long press (default 500)
  moveThreshold?: number; // px of movement allowed before canceling (default 12)
};

function getPoint(event: MouseEvent | TouchEvent): Point {
  if ('touches' in event && event.touches.length > 0) {
    const touch = event.touches[0];
    return { x: touch.clientX, y: touch.clientY };
  }

  return {
    x: (event as MouseEvent).clientX,
    y: (event as MouseEvent).clientY,
  };
}

export function useLongPress(
  callback: (() => void) | undefined,
  elementRef: React.RefObject<HTMLElement | null>,
  {
    onStart,
    onFinish,
    threshold = 500,
    moveThreshold = 12,
  }: UseLongPressOptions = {},
) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const startPointRef = useRef<Point | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cancelPress = useCallback(
    (event?: MouseEvent | TouchEvent) => {
      clearTimer();

      if (startPointRef.current) {
        startPointRef.current = null;
      }

      if (isLongPressing) {
        event?.preventDefault?.();
        event?.stopPropagation?.();

        onFinish?.();
        setIsLongPressing(false);
      }
    },
    [clearTimer, isLongPressing, onFinish],
  );

  const handleStart = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const point = getPoint(event);

      startPointRef.current = point;
      onStart?.();

      clearTimer();
      timeoutRef.current = window.setTimeout(() => {
        callback?.();
        setIsLongPressing(true);
      }, threshold);
    },
    [callback, clearTimer, onStart, threshold],
  );

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!startPointRef.current) {
        return;
      }

      const point = getPoint(event);
      const dx = point.x - startPointRef.current.x;
      const dy = point.y - startPointRef.current.y;
      const distance = Math.hypot(dx, dy);

      if (distance > moveThreshold) {
        cancelPress(event);
      }
    },
    [cancelPress, moveThreshold],
  );

  const handleEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (isLongPressing) {
        event.preventDefault();
        event.stopPropagation();
        onFinish?.();
      }

      clearTimer();
      startPointRef.current = null;
      setIsLongPressing(false);
    },
    [clearTimer, isLongPressing, onFinish],
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    element.addEventListener('mousedown', handleStart);
    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseup', handleEnd);
    element.addEventListener('mouseleave', handleEnd);

    element.addEventListener('touchstart', handleStart, { passive: true });
    element.addEventListener('touchmove', handleMove, { passive: false });
    element.addEventListener('touchend', handleEnd, { passive: true });
    element.addEventListener('touchcancel', handleEnd, { passive: true });

    return () => {
      element.removeEventListener('mousedown', handleStart);
      element.removeEventListener('mousemove', handleMove);
      element.removeEventListener('mouseup', handleEnd);
      element.removeEventListener('mouseleave', handleEnd);

      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchmove', handleMove);
      element.removeEventListener('touchend', handleEnd);
      element.removeEventListener('touchcancel', handleEnd);

      clearTimer();
    };
  }, [clearTimer, elementRef, handleEnd, handleMove, handleStart]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    isLongPressing,
  };
}
