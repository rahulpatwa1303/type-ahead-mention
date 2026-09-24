// SuggestionPopper.tsx

import React from 'react';
import { createPortal } from 'react-dom';

/** One row in the suggestion list. */
export interface PopupOption {
  id: string;
  label: string;
  /** Right-aligned secondary text: a value preview or a description */
  detail?: string;
  avatar?: string;
  /** Shows a trailing `.`: selecting opens the next level */
  branch?: boolean;
  /** A non-selectable message row, like "Searching…" */
  status?: boolean;
  /** Show an avatar box (with initials when there's no image) */
  person?: boolean;
}

export interface SuggestionPopperProps {
  options: PopupOption[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Viewport position of the list, or null to hide it */
  position: { top: number; left: number } | null;
  /** `id` of the listbox; option ids derive from it */
  id: string;
  colorScheme?: 'light' | 'dark' | 'auto';
  className?: string;
}

/** The suggestion list used by the plain-textarea field. Rendered in a portal on `document.body`. */
export const SuggestionPopper: React.FC<SuggestionPopperProps> = ({
  options,
  activeIndex,
  onSelect,
  position,
  id,
  colorScheme = 'light',
  className,
}) => {
  if (!position || options.length === 0 || typeof document === 'undefined') return null;

  return createPortal(
    <ul
      id={id}
      role="listbox"
      data-scheme={colorScheme}
      className={className ? `tam-root tam-popup ${className}` : 'tam-root tam-popup'}
      style={{ top: position.top, left: position.left }}
    >
      {options.map((option, index) => (
        <li
          key={option.id}
          id={`${id}-${index}`}
          role="option"
          aria-selected={!option.status && index === activeIndex}
          aria-disabled={option.status || undefined}
          data-branch={String(!!option.branch)}
          className={option.status ? 'tam-popup-option tam-status' : 'tam-popup-option'}
          // Keep focus in the input
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => !option.status && onSelect(index)}
        >
          {option.person && (
            <span className="tam-option-avatar" aria-hidden="true">
              {option.avatar ? <img src={option.avatar} alt="" /> : option.label.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="tam-popup-label">{option.label}</span>
          {option.detail && <span className="tam-popup-detail">{option.detail}</span>}
        </li>
      ))}
    </ul>,
    document.body
  );
};
