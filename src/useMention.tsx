import { useState, useEffect, useRef, useCallback } from "react";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface UseSuggestionsProps {
  triggerString: string;
  suggestionsData: Record<string, any>;
  onInputChange?: (value: string) => void;
  validator?: (value: string) => ValidationResult;
}

export const useMentions = ({ triggerString, suggestionsData, onInputChange, validator }: UseSuggestionsProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  /**
   * Extracts available suggestions based on user input.
   */
  const getSuggestionKeys = useCallback((input: string) => {
    if (!suggestionsData) return [];

    if (!input) return Object.keys(suggestionsData);

    const keys = input.split(".");
    let currentState = suggestionsData;
    const lastKey = keys.pop() as string; // Last part to match suggestions

    for (const key of keys) {
      if (currentState[key] && typeof currentState[key] === "object") {
        currentState = currentState[key];
      } else {
        return [];
      }
    }

    return Object.keys(currentState).filter((key) => key.startsWith(lastKey));
  }, [suggestionsData]);

  /**
   * Handles input change and triggers suggestion logic.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Call onInputChange callback for real-time evaluation
    if (onInputChange) {
      onInputChange(value);
    }

    // Run validation if validator is provided
    if (validator) {
      const result = validator(value);
      setValidationResult(result);
    }

    if (inputRef.current) setCursorPosition(inputRef.current.selectionStart || 0);

    const textBeforeCursor = value.slice(0, e.target.selectionStart || 0);
    const dynamicRegex = new RegExp(`${triggerString.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}([^\\s]*)$`);
    const match = textBeforeCursor.match(dynamicRegex);

    setSuggestions(match ? getSuggestionKeys(match[1].trim()) : []);
  };

  /**
   * Handles keyboard navigation for suggestions.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => {
        const newIndex = e.key === "ArrowDown"
          ? (prevIndex + 1) % suggestions.length
          : (prevIndex - 1 + suggestions.length) % suggestions.length;

        scrollToHighlightedIndex(newIndex);
        return newIndex;
      });
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      insertSuggestion(suggestions[highlightedIndex]);
    }
  };

  /**
   * Inserts the selected suggestion into the input field.
   */
  const insertSuggestion = useCallback((suggestion: string) => {
    if (!inputRef.current) return;

    const textBeforeCursor = query.slice(0, cursorPosition);
    const textAfterCursor = query.slice(cursorPosition);
    const dynamicRegex = new RegExp(`${triggerString.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}([^\\s]*)$`);
    const match = textBeforeCursor.match(dynamicRegex);

    if (!match) return;

    const typedValue = match[1]; // Extract last typed key
    const lastDotIndex = typedValue.lastIndexOf(".");
    const newTextBeforeCursor = lastDotIndex !== -1
      ? textBeforeCursor.slice(0, match.index) + `${triggerString}${typedValue.slice(0, lastDotIndex + 1)}${suggestion}`
      : textBeforeCursor.slice(0, match.index) + `${triggerString}${suggestion}`;

    const updatedQuery = newTextBeforeCursor + textAfterCursor;
    const newCursorPosition = newTextBeforeCursor.length;

    setTimeout(() => inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition), 0);

    setQuery(updatedQuery);
    setCursorPosition(newCursorPosition);
    setSuggestions([]);
    setHighlightedIndex(-1);
  }, [cursorPosition, query, triggerString]);

  /**
   * Scrolls to the highlighted suggestion in the list.
   */
  const scrollToHighlightedIndex = (index: number) => {
    const container = document.querySelector(".suggestions-container") as HTMLElement;
    if (!container) return;

    const highlightedItem = container.children[index] as HTMLElement;
    if (!highlightedItem) return;

    if (highlightedItem.offsetTop + highlightedItem.clientHeight > container.scrollTop + container.clientHeight) {
      container.scrollTop = highlightedItem.offsetTop + highlightedItem.clientHeight - container.clientHeight;
    } else if (highlightedItem.offsetTop < container.scrollTop) {
      container.scrollTop = highlightedItem.offsetTop;
    }
  };

  return { query, setQuery, suggestions, highlightedIndex, handleChange, handleKeyDown, insertSuggestion, inputRef, scrollToHighlightedIndex, validationResult };
};

/**
 * Custom hook to calculate the caret (cursor) position in a textarea.
 */
export const useCaretPosition = (textareaRef: React.RefObject<HTMLTextAreaElement>, cursorPosition: number) => {
  const [coord, setCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (textareaRef.current && cursorPosition !== null) {
      const { x, y } = getCaretCoordinates(textareaRef.current, cursorPosition);
      setCoord({ x, y });
    }
  }, [cursorPosition]);

  return coord;
};

/**
 * Gets the cursor position in a textarea.
 */
const getCaretCoordinates = (textarea: HTMLTextAreaElement, position: number) => {
  const div = document.createElement("div");
  const style = window.getComputedStyle(textarea) as any;

  for (const prop of style) {
    div.style.setProperty(prop, style.getPropertyValue(prop));
  }

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";

  div.textContent = textarea.value.slice(0, position);
  const span = document.createElement("span");
  span.textContent = textarea.value.slice(position) || ".";
  div.appendChild(span);

  document.body.appendChild(div);
  const { offsetLeft, offsetTop } = span;
  document.body.removeChild(div);

  return { x: offsetLeft, y: offsetTop + 10 };
};
