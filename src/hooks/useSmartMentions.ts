import { useState, useCallback, useRef, useEffect } from "react";
import type { SmartInputConfig, SuggestionNode } from "..";
import { useSuggestions } from "./useSuggestions";
import { getCaretCoordinates } from "./getCaretCoordinates"; // <-- IMPORT THE NEW UTILITY

interface UseSmartMentionsProps {
  suggestionsData: SuggestionNode;
  config?: Partial<SmartInputConfig>;
}
interface UseSmartMentionsReturn {
  /** Current input value */
  value: string;
  /** Set the input value */
  setValue: (value: string) => void;
  /** Current suggestions based on cursor position */
  suggestions: string[];
  /** Index of highlighted suggestion */
  highlightedIndex: number;
  /** Input change handler - attach to your input's onChange */
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  /** KeyDown handler for navigation - attach to your input's onKeyDown */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Insert a suggestion at cursor position */
  insertSuggestion: (suggestion: string) => void;
  /** Ref to attach to your input element */
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  /** Position where suggestion popper should appear */
  popperPosition: { x: number; y: number } | null;
  /** Whether suggestions are visible */
  showSuggestions: boolean;
  /** Reset suggestions */
  reset: () => void;
}

interface UseSmartMentionsReturn {
  value: string;
  setValue: (value: string) => void;
  suggestions: string[];
  highlightedIndex: number;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  insertSuggestion: (suggestion: string) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  popperPosition: { x: number; y: number } | null;
  showSuggestions: boolean;
  reset: () => void;
}

export const useSmartMentions = ({
  suggestionsData,
  config = { trigger: { trigger: "@" } },
}: UseSmartMentionsProps): UseSmartMentionsReturn => {
  const [value, setValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [popperPosition, setPopperPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const fullConfig: SmartInputConfig = {
    trigger: config.trigger || { trigger: "@" },
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

  /**
   * Calculate the position for the suggestion popper using the caret's exact coordinates.
   */
  const calculatePopperPosition = useCallback(() => {
    if (!inputRef.current || suggestions.length === 0) {
      setPopperPosition(null);
      return;
    }

    // *** REPLACED LOGIC ***
    // Use the getCaretCoordinates utility to find the precise position
    const { x, y } = getCaretCoordinates(inputRef.current, cursorPosition);
    setPopperPosition({ x, y });
  }, [cursorPosition, suggestions.length]);

  // Update popper position when suggestions or cursor changes
  useEffect(() => {
    calculatePopperPosition();
  }, [calculatePopperPosition]);

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
      setPopperPosition(null); // Hide popper after insertion
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
    popperPosition,
    showSuggestions: suggestions.length > 0 && popperPosition !== null,
    reset,
  };
};
