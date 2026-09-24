// SuggestionPopper.tsx

import React from 'react';
import { createPortal } from 'react-dom';
import { previewValue, type SuggestionItem } from './template';

export interface SuggestionPopperProps {
  items: SuggestionItem[];
  activeIndex: number;
  onSelect: (item: SuggestionItem) => void;
  /** Viewport position of the list, or null to hide it */
  position: { top: number; left: number } | null;
  /** `id` of the listbox; option ids derive from it */
  id: string;
  /** Show a value preview next to each item */
  showValues?: boolean;
  className?: string;
}

/** The suggestion list used by `useMentionSuggestions`. Rendered in a portal on `document.body`. */
export const SuggestionPopper: React.FC<SuggestionPopperProps> = ({
  items,
  activeIndex,
  onSelect,
  position,
  id,
  showValues = true,
  className,
}) => {
  if (!position || items.length === 0 || typeof document === 'undefined') return null;

  return createPortal(
    <ul
      id={id}
      role="listbox"
      className={className ? `tam-root tam-popup ${className}` : 'tam-root tam-popup'}
      style={{ top: position.top, left: position.left }}
    >
      {items.map((item, index) => (
        <li
          key={item.path}
          id={`${id}-${index}`}
          role="option"
          aria-selected={index === activeIndex}
          data-branch={String(item.isBranch)}
          className="tam-popup-option"
          // Keep focus in the input
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(item)}
        >
          <span className="tam-popup-label">{item.key}</span>
          {showValues && <span className="tam-popup-detail">{previewValue(item.value)}</span>}
        </li>
      ))}
    </ul>,
    document.body
  );
};
