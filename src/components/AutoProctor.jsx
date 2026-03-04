import { useEffect, useRef } from "react";

/**
 * AutoProctor
 * - Detects tab switch / blur
 * - Auto submits test after max violations
 */
export default function AutoProctor({
  maxViolations = 2,
  onViolation,
  onAutoSubmit
}) {
  const violations = useRef(0);
  const submitted = useRef(false);
  const lastEvent = useRef(0);

  useEffect(() => {
    const registerViolation = () => {
      const now = Date.now();

      // debounce multiple blur events
      if (now - lastEvent.current < 1000) return;
      lastEvent.current = now;

      violations.current += 1;
      onViolation?.(violations.current);

      if (violations.current > maxViolations && !submitted.current) {
        submitted.current = true;

        // 🔥 AUTO SUBMIT (NO ALERT)
        setTimeout(() => {
          onAutoSubmit?.();
        }, 0);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) registerViolation();
    };

    const handleBlur = () => registerViolation();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return null;
}
