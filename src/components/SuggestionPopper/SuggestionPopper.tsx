import React, { useEffect, useRef } from 'react';

interface SuggestionPopperProps {
  suggestions: string[];
  position: { x: number; y: number } | null;
  highlightedIndex: number;
  onSelect: (suggestion: string) => void;
  renderItem?: (suggestion: string, isActive: boolean) => React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const SuggestionPopper: React.FC<SuggestionPopperProps> = ({
  suggestions,
  position,
  highlightedIndex,
  onSelect,
  renderItem,
  style = {},
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && highlightedIndex >= 0) {
      const container = containerRef.current;
      const activeItem = container.children[highlightedIndex] as HTMLElement;

      if (activeItem) {
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.clientHeight;

        if (itemBottom > containerBottom) {
          container.scrollTop = itemBottom - container.clientHeight;
        } else if (itemTop < containerTop) {
          container.scrollTop = itemTop;
        }
      }
    }
  }, [highlightedIndex]);

  if (!position || suggestions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        maxHeight: '200px',
        overflowY: 'auto',
        minWidth: '150px',
        zIndex: 9999,
        ...style,
      }}
    >
      {suggestions.map((suggestion, index) => {
        const isActive = index === highlightedIndex;

        return (
          <div
            key={`${suggestion}-${index}`}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(suggestion);
            }}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: isActive ? '#f0f0f0' : 'transparent',
              borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            {renderItem ? renderItem(suggestion, isActive) : suggestion}
          </div>
        );
      })}
    </div>
  );
};
