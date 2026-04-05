import { useEffect, useRef, useState } from 'react';

type UseCountUpOptions = {
  durationMs?: number;
  initialValue?: number;
};

export function useCountUp(
  targetValue: number,
  options: UseCountUpOptions = {},
) {
  const { durationMs = 1100, initialValue = 0 } = options;
  const [displayValue, setDisplayValue] = useState(initialValue);
  const frameIdRef = useRef<number | null>(null);
  const currentValueRef = useRef(initialValue);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDisplayValue(targetValue);
      currentValueRef.current = targetValue;
      return undefined;
    }

    if (frameIdRef.current != null) {
      window.cancelAnimationFrame(frameIdRef.current);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(targetValue);
      currentValueRef.current = targetValue;
      hasAnimatedRef.current = true;
      return undefined;
    }

    const startValue = hasAnimatedRef.current
      ? currentValueRef.current
      : initialValue;
    const delta = targetValue - startValue;

    hasAnimatedRef.current = true;

    if (Math.abs(delta) < 0.01) {
      setDisplayValue(targetValue);
      currentValueRef.current = targetValue;
      return undefined;
    }

    const startTime = window.performance.now();

    function step(timestamp: number) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + delta * easedProgress;

      currentValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameIdRef.current = window.requestAnimationFrame(step);
        return;
      }

      currentValueRef.current = targetValue;
      setDisplayValue(targetValue);
      frameIdRef.current = null;
    }

    frameIdRef.current = window.requestAnimationFrame(step);

    return () => {
      if (frameIdRef.current != null) {
        window.cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [durationMs, initialValue, targetValue]);

  return displayValue;
}
