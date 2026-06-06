import { useState, useEffect } from 'react';

/** Animate a number from 0 → target using eased RAF loop */
export function useAnimVal(target: number, duration = 1600, start = false): number {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3); // cubic ease-out
      setVal(Math.round(ease * target * 100) / 100);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return val;
}
