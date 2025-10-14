import cn from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import * as styles from './SlideTransition.module.scss';

interface ViewParams {
  renderKey: string;
  depth: number;
}

interface SlideTransitionProps<T extends ViewParams> {
  current: T;
  render: (vm: T) => React.ReactNode;
}

interface RenderedView {
  renderKey: string;
  view: React.ReactNode;
}

export function SlideTransition<T extends ViewParams>({
  current,
  render,
}: SlideTransitionProps<T>) {
  const [displayed, setDisplayed] = useState<{
    prev: RenderedView | null;
    current: RenderedView;
  }>({
    prev: null,
    current:
      current && render
        ? { renderKey: current.renderKey, view: render(current) }
        : null,
  });

  const prevParams = useRef<ViewParams | null>(null);

  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animating, setAnimating] = useState(false);

  // Re-render (and detect change)
  useEffect(() => {
    const rendered =
      current && render
        ? { renderKey: current.renderKey, view: render(current) }
        : null;

    if (
      prevParams.current !== null &&
      prevParams.current.renderKey !== current.renderKey
    ) {
      const newDirection =
        current.depth > prevParams.current.depth ? 'left' : 'right';

      setDisplayed((d) => ({
        prev: d.current,
        current: rendered,
      }));
      setDirection(newDirection);
      setAnimating(false);

      requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimating(true))
      );
    } else {
      setDisplayed((d) => ({
        ...d,
        current: rendered,
      }));
    }

    prevParams.current = current;
  }, [current]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName == 'transform') {
      setAnimating(false);
      setDisplayed((d) => ({ prev: null, current: d.current }));
      setDirection(null);
    }
  };

  return (
    <div
      className={cn(
        styles.SlideContainer,
        animating && styles.animating,
        direction
          ? direction == 'left'
            ? styles.SlideLeft
            : styles.SlideRight
          : ''
      )}
    >
      {displayed.prev && (
        <div
          key={displayed.prev.renderKey}
          className={cn(styles.SlideView, styles.prev)}
          onTransitionEnd={handleTransitionEnd}
        >
          {displayed.prev.view}
        </div>
      )}
      <div
        key={displayed.current.renderKey}
        className={cn(styles.SlideView, styles.current)}
      >
        {displayed.current.view}
      </div>
    </div>
  );
}
