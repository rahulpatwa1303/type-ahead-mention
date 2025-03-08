import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SuggestionBox.module.css";

type FormData = {
  query: string;
};

function Mentions({
  suggestionsData,
  triggerString = "${",
  as = "textarea",
  ...props
}: {
  suggestionsData: Record<string, any> | string[];
  triggerString: string;
  as?: "textarea" | "input";
} & React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  React.InputHTMLAttributes<HTMLInputElement>) {
  const [formData, setFormData] = useState<FormData>({
    query: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [coord, setCoord] = useState<{ x: number; y: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const getSuggestionKeys = useCallback((refState: any, input: string) => {
    if (!refState) return [];
  
    // If input is empty, return top-level keys
    if (!input) return Object.keys(refState);
  
    // Split input into levels
    const keys = input.split(".");
    let currentState = refState;
    let lastKey = keys[keys.length - 1];
  
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
  
      // If the key exists and is an object, traverse deeper
      if (currentState[key] && typeof currentState[key] === "object") {
        currentState = currentState[key];
      } else {
        return []; // Stop if the key does not exist
      }
    }
  
    // If the last key is incomplete, suggest matching keys at this level
    return Object.keys(currentState).filter((key) => key.startsWith(lastKey));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const newQuery = e.target.value;

    setFormData({ query: newQuery });

    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
    const selectionStart =
      e.target.selectionStart !== null ? e.target.selectionStart : 0;
    const textBeforeCursor = newQuery.slice(0, selectionStart);
    // Escape special characters in matchString for regex
    const escapedMatchString = triggerString.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );

    // Dynamically create regex using the escaped match string
    const dynamicRegex = new RegExp(`${escapedMatchString}([^\\s]*)$`);

    const match = textBeforeCursor.match(dynamicRegex);
    if (match) {
      const userQuery = match[1].trim();
      const sug = getSuggestionKeys(suggestionsData, userQuery);

      setSuggestions(sug);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % suggestions.length;
        scrollToHighlightedIndex(newIndex); // Scroll to the new index
        return newIndex;
      });
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) => {
        const newIndex =
          (prevIndex - 1 + suggestions.length) % suggestions.length;
        scrollToHighlightedIndex(newIndex); // Scroll to the new index
        return newIndex;
      });
      e.preventDefault();
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      insertSuggestion(suggestions[highlightedIndex]);
    }
  };

  const insertSuggestion = useCallback(
    (suggestion: string) => {
      if (!textareaRef.current) return;
  
      setFormData((prev) => {
        const { query } = prev;
        const textBeforeCursor = query.slice(0, cursorPosition);
        const textAfterCursor = query.slice(cursorPosition);
  
        const escapedMatchString = triggerString.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const dynamicRegex = new RegExp(`${escapedMatchString}([^\\s]*)$`);
        const match = textBeforeCursor.match(dynamicRegex);
  
        if (!match) return prev;
  
        // Extract already typed part (parent and child)
        const typedValue = match[1]; // e.g., "users.n"
        
        // Preserve parent key if dot exists, replace only the last portion
        const lastDotIndex = typedValue.lastIndexOf(".");
        let newTextBeforeCursor;
  
        if (lastDotIndex !== -1) {
          // Preserve "users." and replace "n" → "name"
          newTextBeforeCursor = 
            textBeforeCursor.slice(0, match.index) +
            `${triggerString}${typedValue.slice(0, lastDotIndex + 1)}${suggestion}`;
        } else {
          // No dot, replace entire value (e.g., "us" → "users")
          newTextBeforeCursor = 
            textBeforeCursor.slice(0, match.index) +
            `${triggerString}${suggestion}`;
        }
  
        const updatedQuery = newTextBeforeCursor + textAfterCursor;
        const newCursorPosition = newTextBeforeCursor.length;
  
        // Ensure cursor updates correctly
        setTimeout(() => {
          textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
  
        setCursorPosition(newCursorPosition);
        setSuggestions([]);
        setHighlightedIndex(-1);
  
        return { ...prev, query: updatedQuery };
      });
    },
    [cursorPosition, triggerString]
  );
  

  const getCaretCoordinates = (
    textarea: HTMLTextAreaElement,
    position: number
  ) => {
    const div = document.createElement("div");
    const style = window.getComputedStyle(textarea);

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

    return {
      x: offsetLeft,
      y: offsetTop + 10,
    };
  };

  const scrollToHighlightedIndex = (index: number) => {
    const suggestionContainer = document.querySelector(
      ".suggestion-container"
    ) as HTMLElement;
    const highlightedItem = suggestionContainer?.children[index] as HTMLElement;

    if (suggestionContainer && highlightedItem) {
      const containerTop = suggestionContainer.scrollTop;
      const containerHeight = suggestionContainer.clientHeight;
      const itemTop = highlightedItem.offsetTop;
      const itemHeight = highlightedItem.clientHeight;

      if (itemTop + itemHeight > containerTop + containerHeight) {
        // Scroll down if item is below the visible area
        suggestionContainer.scrollTop = itemTop + itemHeight - containerHeight;
      } else if (itemTop < containerTop) {
        // Scroll up if item is above the visible area
        suggestionContainer.scrollTop = itemTop;
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current && cursorPosition >= 0) {
      const { x, y } = getCaretCoordinates(textareaRef.current, cursorPosition);
      setCoord({ x, y });
    }
  }, [cursorPosition, formData.query]); // Add formData.query for reactivity

  const Component = as || "textarea";

  const textAreaProps =
    Component === "textarea"
      ? { rows: props.rows || 4, cols: props.cols || 50 }
      : {};

  return (
    <div className={styles.wrapper}>
      <Component
        {...(props as React.ElementType<
          HTMLTextAreaElement | HTMLInputElement
        >)}
        ref={textareaRef as any}
        value={formData?.query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={(e) => props.onBlur?.(e as any)}
        {...textAreaProps}
        onKeyDownCapture={(e) => {
          if (e.key === "Escape") {
            setCoord(null);
            setSuggestions([]);
          }
        }}
        className={styles.inputField}
      />

      {suggestions.length > 0 && coord && (
        <div
          className={`suggestion-container ${styles.suggestionBox}`}
          style={{ top: `${coord.y}px`, left: `${coord.x}px` }} // Keep dynamic positioning
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              onClick={() => insertSuggestion(suggestion)}
              className={
                index === highlightedIndex
                  ? `${styles.suggestionItem} ${styles.suggestionItemActive}`
                  : styles.suggestionItem
              }
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Mentions;
