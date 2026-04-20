import React, { useEffect } from 'react';

type Props = {
  title?: string;
  text?: string;
  onClose?: () => void;
};

export default function Toast({
  title = 'Готово',
  text = 'Сохранено',
  onClose,
}: Props) {
  useEffect(() => {
    const id = setTimeout(() => onClose && onClose(), 2800);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <div role="status" aria-live="polite" className="toast">
      <div className="toast__icon">✓</div>
      <div className="toast__content">
        <div className="toast__title">{title}</div>
        <div className="toast__text">{text}</div>
      </div>
      <button
        className="toast__close"
        aria-label="Закрыть"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export {};
