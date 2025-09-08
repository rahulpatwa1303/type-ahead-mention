import { useRef, useState } from "react";

import Mentions from "./Mentions";
import {
  useCaretPosition,
  // useScrollToHighlight,
  useMentions,
  ValidationResult,
} from "./useMention";
import styles from "./SuggestionBox.module.css";

function App() {
  const suggestionContainerRef = useRef<HTMLDivElement | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const handleBlur = (e: any) => {
    console.log(e.target.value);
  };

  // Example validation function
  const validateInput = (value: string): ValidationResult => {
    if (value.length > 100) {
      return {
        isValid: false,
        message: "Input cannot exceed 100 characters"
      };
    }
    if (value.includes("forbidden")) {
      return {
        isValid: false,
        message: "Input contains forbidden words"
      };
    }
    return { isValid: true };
  };

  // Example onInputChange handler
  const handleInputChange = (value: string) => {
    setInputValue(value);
    console.log("Real-time input evaluation:", value);
    
    // Example: Character count feedback
    if (value.length > 80) {
      setValidationMessage(`Warning: ${value.length}/100 characters used`);
    } else {
      setValidationMessage(`${value.length}/100 characters`);
    }
  };

  const {
    query,
    handleChange: handleInputChangeHook,
    handleKeyDown,
    suggestions,
    highlightedIndex,
    insertSuggestion,
    inputRef,
    scrollToHighlightedIndex,
    validationResult,
  } = useMentions({
    triggerString: "@",
    suggestionsData: {
      users: { name: "Alice", age: 30, email: "alice@example.com" },
      orders: { id: 123, status: "shipped", date: "2024-09-25" },
      products: { name: "Laptop", price: ["tets", "me"] },
    },
    onInputChange: handleInputChange,
    validator: validateInput,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCursorPosition(e.target.selectionStart || 0);
    handleInputChangeHook(e);
  };

  const coord = useCaretPosition(inputRef as any, cursorPosition);
  // const scrollToHighlightedIndex = useScrollToHighlight(suggestionContainerRef);

  return (
    <>
      <h1>Type-Ahead Mention Demo</h1>
      
      <h2>Example 1: Mentions Component with Validation</h2>
      <Mentions
        name="text"
        placeholder="Type @ to see suggestions (try typing 'forbidden' or more than 100 chars)"
        triggerString={"@"}
        as="textarea"
        onBlur={handleBlur}
        onInputChange={handleInputChange}
        validator={validateInput}
        suggestionsData={{
          users: { name: "Alice", age: 30, email: "alice@example.com" },
          orders: { id: 123, status: "shipped", date: "2024-09-25" },
          products: { name: "Laptop", price: 1000 },
          products1: { name: "Laptop", price: 1000 },
          products2: { name: "Laptop", price: 1000 },
          products3: { name: "Laptop", price: 1000 },
          products4: { name: "Laptop", price: ["tets", "me"] },
          products5: { name: "Laptop", price: { testing: "123" } },
        }}
      />
      
      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        Real-time feedback: {validationMessage}
      </div>

      <h2>Example 2: Custom Hook Usage with Validation</h2>
      <div style={{ position: "relative" }}>
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type @ to see suggestions (custom hook example)"
          style={{
            border: !validationResult.isValid ? "2px solid red" : "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            width: "100%",
            minHeight: "100px"
          }}
        />
        
        {!validationResult.isValid && validationResult.message && (
          <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
            {validationResult.message}
          </div>
        )}
        
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          Character count: {query.length}/100 | 
          Validation status: {validationResult.isValid ? "✅ Valid" : "❌ Invalid"}
        </div>
        
        {suggestions.length > 0 && (
          <ul
            className="suggestion-container"
            ref={scrollToHighlightedIndex as any}
            autoFocus={true}
            style={{
              top: `${coord.y}px`,
              left: `${coord.x}px`,
              position: "absolute",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "0",
              margin: "0",
              listStyle: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              zIndex: 1000,
            }}
          >
            {suggestions.map((sug, index) => (
              <li
                key={sug}
                className={
                  index === highlightedIndex
                    ? `${styles.suggestionItem} ${styles.suggestionItemActive}`
                    : styles.suggestionItem
                }
                onMouseDown={() => insertSuggestion(sug)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor: index === highlightedIndex ? "#e3f2fd" : "white"
                }}
              >
                {sug}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default App;
