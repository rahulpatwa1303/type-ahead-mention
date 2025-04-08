import { useRef, useState } from "react";

import Mentions from "./Mentions";
import {
  useCaretPosition,
  // useScrollToHighlight,
  useMentions,
} from "./useMention";
import styles from "./SuggestionBox.module.css";

function App() {
  const suggestionContainerRef = useRef<HTMLDivElement | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleBlur = (e: any) => {
    console.log(e.target.value);
  };

  const {
    query,
    handleChange: handleInputChange,
    handleKeyDown,
    suggestions,
    highlightedIndex,
    insertSuggestion,
    inputRef,
    scrollToHighlightedIndex,
  } = useMentions({
    triggerString: "@",
    suggestionsData: {
      users: { name: "Alice", age: 30, email: "alice@example.com" },
      orders: { id: 123, status: "shipped", date: "2024-09-25" },
      products: { name: "Laptop", price: ["tets", "me"] },
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCursorPosition(e.target.selectionStart || 0);
    handleInputChange(e);
  };

  const coord = useCaretPosition(inputRef as any, cursorPosition);
  // const scrollToHighlightedIndex = useScrollToHighlight(suggestionContainerRef);

  return (
    <>
      <Mentions
        name="text"
        placeholder="type @ to see suggestions"
        triggerString={"@"}
        as="textarea"
        onBlur={handleBlur}
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
      <div style={{ position: "relative" }}>
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type ${ to see suggestions"
        />
        {suggestions.length > 0 && (
          <ul
            className="suggestion-container"
            ref={scrollToHighlightedIndex as any}
            autoFocus={true}
            style={{
              top: `${coord.y}px`,
              left: `${coord.x}px`,
              position: "absolute",
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
