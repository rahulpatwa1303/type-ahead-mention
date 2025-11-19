// SuggestionPopper.tsx

import React from "react";
import { usePopper } from "react-popper";

interface SuggestionPopperProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  activeIndex: number;
  referenceElement: HTMLElement | null;
}

export const SuggestionPopper: React.FC<SuggestionPopperProps> = ({
  suggestions,
  onSelect,
  activeIndex,
  referenceElement,
}) => {
  const [popperElement, setPopperElement] =
    React.useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
  });

  if (suggestions.length === 0 || !referenceElement) {
    return null;
  }

  return (
    <div
      ref={setPopperElement}
      style={{
        ...styles.popper,
        zIndex: 1000,
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        minWidth: "150px",
      }}
      {...attributes.popper}
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {suggestions.map((suggestion, index) => (
          <li
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              backgroundColor:
                index === activeIndex ? "#f0f0f0" : "transparent",
            }}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};
