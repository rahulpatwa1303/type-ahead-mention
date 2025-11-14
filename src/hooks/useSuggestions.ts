import { useState, useCallback } from 'react';
import type { SmartInputConfig, SuggestionNode } from '..';
import { findNodeForPath } from '../utils/path-resolver';

interface UseSuggestionsProps {
  value: string;
  cursorPosition: number;
  suggestionsData: SuggestionNode;
  config: SmartInputConfig;
  onInsert?: (newValue: string, newCursorPosition: number) => void;
}

interface UseSuggestionsReturn {
  suggestions: string[];
  highlightedIndex: number;
  handleChange: (value: string, position: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  insertSuggestion: (suggestion: string) => void;
  reset: () => void;
}

export const useSuggestions = ({
  value,
  cursorPosition,
  suggestionsData,
  config,
  onInsert,
}: UseSuggestionsProps): UseSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [triggerIndex, setTriggerIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const { trigger, caseSensitive = false } = config;

  const filterFn = (suggestions: string[], query: string) => {
    return suggestions.filter((s) =>
      caseSensitive
        ? s.startsWith(query)
        : s.toLowerCase().startsWith(query.toLowerCase())
    );
  };

  const reset = useCallback(() => {
    setSuggestions([]);
    setHighlightedIndex(0);
    setTriggerIndex(-1);
    setCurrentPath([]);
  }, []);

  const handleChange = useCallback(
    (newValue: string, newPosition: number) => {
      const textBeforeCursor = newValue.substring(0, newPosition);
      const lastTriggerIndex = textBeforeCursor.lastIndexOf(trigger.trigger);

      if (lastTriggerIndex === -1) {
        reset();
        return;
      }

      // Check if there's a space after the trigger (which would close it)
      const textAfterTrigger = textBeforeCursor.substring(lastTriggerIndex + trigger.trigger.length);
      if (textAfterTrigger.includes(' ')) {
        reset();
        return;
      }

      setTriggerIndex(lastTriggerIndex);

      const query = textBeforeCursor.substring(
        lastTriggerIndex + trigger.trigger.length
      );

      // Parse the path
      const pathParts = query.split('.').filter((p) => p);
      const incompletePart = query.endsWith('.') ? '' : pathParts.pop() || '';
      
      setCurrentPath(pathParts);

      // Find the node at the current path
      const targetNode = findNodeForPath(pathParts, suggestionsData);

      if (targetNode && typeof targetNode === 'object' && !Array.isArray(targetNode)) {
        let availableSuggestions = Object.keys(targetNode);

        // Apply filter
        if (incompletePart) {
          if (filterFn) {
            availableSuggestions = filterFn(availableSuggestions, incompletePart);
          } else {
            availableSuggestions = availableSuggestions.filter((s) =>
              caseSensitive
                ? s.startsWith(incompletePart)
                : s.toLowerCase().startsWith(incompletePart.toLowerCase())
            );
          }
        }

        setSuggestions(availableSuggestions);
        setHighlightedIndex(0);
      } else {
        reset();
      }
    },
    [trigger, suggestionsData, filterFn, caseSensitive, reset]
  );

  const insertSuggestion = useCallback(
    (suggestion: string) => {
      if (triggerIndex === -1) return;

      const beforeTrigger = value.substring(0, triggerIndex);
      const afterCursor = value.substring(cursorPosition);

      const pathPrefix = currentPath.length > 0 ? currentPath.join('.') + '.' : '';
      const fullPath = pathPrefix + suggestion;

      const newValue = `${beforeTrigger}${trigger.trigger}${fullPath}${afterCursor}`;
      const newCursorPosition = beforeTrigger.length + trigger.trigger.length + fullPath.length;

      onInsert?.(newValue, newCursorPosition);
      reset();
    },
    [value, cursorPosition, triggerIndex, currentPath, trigger, config, onInsert, reset]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          insertSuggestion(suggestions[highlightedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          reset();
          break;
      }
    },
    [suggestions, highlightedIndex, insertSuggestion, reset]
  );

  return {
    suggestions,
    highlightedIndex,
    handleChange,
    handleKeyDown,
    insertSuggestion,
    reset,
  };
};
