import { useEffect, useState } from 'react';

const scrollThreshold = 360;

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    function syncVisibility() {
      setIsVisible((currentValue) => {
        const nextValue = window.scrollY > scrollThreshold;
        return currentValue === nextValue ? currentValue : nextValue;
      });
    }

    syncVisibility();
    window.addEventListener('scroll', syncVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', syncVisibility);
    };
  }, []);

  function handleScrollToTop() {
    if (typeof window === 'undefined') {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  return (
    <button
      type="button"
      className={`scroll-top-button${
        isVisible ? ' scroll-top-button--visible' : ''
      }`}
      onClick={handleScrollToTop}
      aria-label="Scroll back to top"
      title="Back to top"
    >
      <span className="scroll-top-button__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          className="scroll-top-button__icon-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 18V6M12 6L7 11M12 6L17 11"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="scroll-top-button__copy">Top</span>
    </button>
  );
}
