import { useState, useCallback, useRef } from 'react';
import type { SmartInputConfig, SuggestionNode } from '..';
import { useSuggestions } from './useSuggestions';

interface UseMentionsProps {
  suggestionsData: SuggestionNode;
  config?: Partial<SmartInputConfig>;
}

interface UseMentionsReturn {
  value: string;
  setValue: (value: string) => void;
  suggestions: string[];
  highlightedIndex: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  insertSuggestion: (suggestion: string) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  reset: () => void;
}

export const useMentions = ({
  suggestionsData,
  config = { trigger: { trigger: '@' } },
}: UseMentionsProps): UseMentionsReturn => {
  const [value, setValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const fullConfig: SmartInputConfig = {
    trigger: config.trigger || { trigger: '@' },
    allowMultiple: config.allowMultiple ?? true,
    caseSensitive: config.caseSensitive ?? false,
  };

  const {
    suggestions,
    highlightedIndex,
    handleChange: handleSuggestionChange,
    handleKeyDown,
    insertSuggestion: insertSuggestionInternal,
    reset,
  } = useSuggestions({
    value,
    cursorPosition,
    suggestionsData,
    config: fullConfig,
    onInsert: (newValue, newPosition) => {
      setValue(newValue);
      setCursorPosition(newPosition);
      
      setTimeout(() => {
        inputRef.current?.setSelectionRange(newPosition, newPosition);
        inputRef.current?.focus();
      }, 0);
    },
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const newPosition = e.target.selectionStart || 0;

      setValue(newValue);
      setCursorPosition(newPosition);
      handleSuggestionChange(newValue, newPosition);
    },
    [handleSuggestionChange]
  );

  const insertSuggestion = useCallback(
    (suggestion: string) => {
      insertSuggestionInternal(suggestion);
    },
    [insertSuggestionInternal]
  );

  return {
    value,
    setValue,
    suggestions,
    highlightedIndex,
    handleChange,
    handleKeyDown,
    insertSuggestion,
    inputRef,
    reset,
  };
};
