import { useCallback, useEffect, useRef, useState } from 'react';

type UseLongPressOptions = {
  onStart?: () => void; // called when press starts
  onFinish?: () => void; // called when press is released
  threshold?: number; // ms required to trigger long press (default 500)
};

export function useLongPress(
  callback: () => void,
  { onStart, onFinish, threshold = 500 }: UseLongPressOptions = {}
) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const targetRef = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      onStart?.();
      targetRef.current = event.target;

      timeoutRef.current = window.setTimeout(() => {
        callback?.();
        setIsLongPressing(true);
      }, threshold);
    },
    [callback, onStart, threshold]
  );

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isLongPressing) {
      onFinish?.();
      setIsLongPressing(false);
    }
  }, [isLongPressing, onFinish]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
  };
}
