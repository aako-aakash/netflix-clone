import { useEffect, useRef, useState } from "react";

export function useHoverPreview(delay = 500) {
  const [active, setActive] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const timerRef = useRef<number | null>(null);

  const onEnter = () => {
    setActive(true);
    timerRef.current = window.setTimeout(() => {
      setShouldLoad(true);
    }, delay);
  };

  const onLeave = () => {
    setActive(false);
    setShouldLoad(false);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    active,
    shouldLoad,
    onEnter,
    onLeave,
  };
}