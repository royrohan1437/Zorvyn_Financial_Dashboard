type ActionToastProps = {
  eyebrow: string;
  title: string;
  message: string;
  onDismiss: () => void;
};

export function ActionToast({
  eyebrow,
  title,
  message,
  onDismiss,
}: ActionToastProps) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      <div className="action-toast" role="status">
        <div className="action-toast__icon" aria-hidden="true">
          <svg
            className="action-toast__icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 12.5L10.25 15.75L17.5 8.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="action-toast__content">
          <span className="action-toast__eyebrow">{eyebrow}</span>
          <strong>{title}</strong>
          <span>{message}</span>
        </div>

        <button
          type="button"
          className="action-toast__close"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          x
        </button>

        <span className="action-toast__progress" aria-hidden="true" />
      </div>
    </div>
  );
}
