import { useRef, useState } from "react";

import Mentions from "./Mentions";
import {
  useCaretPosition,
  useMentions,
} from "./useMention";
import styles from "./SuggestionBox.module.css";

// Enhanced demo data with more examples
const demoData = {
  users: { 
    name: "Alice", 
    age: 30, 
    email: "alice@example.com",
    role: "Developer"
  },
  orders: { 
    id: 123, 
    status: "shipped", 
    date: "2024-09-25",
    total: 599.99
  },
  products: { 
    name: "MacBook Pro", 
    price: 2999,
    category: "Electronics",
    inStock: true
  },
  company: {
    name: "Tech Corp",
    founded: 2010,
    employees: 250,
    location: "San Francisco"
  }
};

function App() {
  const suggestionContainerRef = useRef<HTMLDivElement | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleBlur = (e: any) => {
    console.log("Final text:", e.target.value);
  };

  const resolvedQuery = replaceMentions(query, "@", suggestionsData);
  
  const {
    query,
    handleChange: handleInputChange,
    handleKeyDown,
    suggestions,
    highlightedIndex,
    insertSuggestion,
    inputRef,
    scrollToHighlightedIndex,
    evaluateQuery,
  } = useMentions({
    triggerString: "@",
    suggestionsData: demoData,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCursorPosition(e.target.selectionStart || 0);
    handleInputChange(e);
  };

  const coord = useCaretPosition(inputRef as any, cursorPosition);

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      background: "white",
      borderRadius: "12px",
      marginTop: "20px",
      marginBottom: "20px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
    }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ 
          color: "#2d3748", 
          fontSize: "2.5em", 
          marginBottom: "10px" 
        }}>
          🚀 Type-Ahead Mention Demo
        </h1>
        <p style={{ 
          color: "#718096", 
          fontSize: "1.2em", 
          marginBottom: "20px" 
        }}>
          Interactive mention suggestions with <strong>value evaluation</strong> feature
        </p>
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px"
        }}>
          <h2 style={{ margin: "0 0 10px 0" }}>✨ New Feature: Type Value Evaluation</h2>
          <p style={{ margin: 0 }}>
            Type <code>@users.name</code> and press <strong>Tab</strong> to replace it with the actual value (<strong>"Alice"</strong>)!
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
        <div>
          <h3 style={{ color: "#2d3748", marginBottom: "15px" }}>📊 Sample Data Structure</h3>
          <pre style={{
            background: "#2d3748",
            color: "#e2e8f0",
            padding: "15px",
            borderRadius: "8px",
            fontSize: "0.9em",
            overflow: "auto"
          }}>
{JSON.stringify(demoData, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 style={{ color: "#2d3748", marginBottom: "15px" }}>🎯 How to Use</h3>
          <div style={{ fontSize: "0.95em", lineHeight: "1.6" }}>
            <div style={{ marginBottom: "12px", padding: "10px", background: "#f7fafc", borderRadius: "6px" }}>
              <strong>1.</strong> Type <code>@</code> to see suggestions
            </div>
            <div style={{ marginBottom: "12px", padding: "10px", background: "#f7fafc", borderRadius: "6px" }}>
              <strong>2.</strong> Navigate with arrow keys or click
            </div>
            <div style={{ marginBottom: "12px", padding: "10px", background: "#f7fafc", borderRadius: "6px" }}>
              <strong>3.</strong> Type <code>.</code> for nested properties
            </div>
            <div style={{ marginBottom: "12px", padding: "10px", background: "#f7fafc", borderRadius: "6px" }}>
              <strong>4.</strong> Press <code>Tab</code> to evaluate!
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ color: "#2d3748", marginBottom: "15px" }}>💡 Try These Examples</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
          {[
            { example: "@users.name", result: "Alice" },
            { example: "@orders.id", result: "123" },
            { example: "@products.price", result: "2999" },
            { example: "@company.location", result: "San Francisco" }
          ].map(({ example, result }) => (
            <div key={example} style={{
              background: "#f7fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "15px",
              borderLeft: "4px solid #667eea"
            }}>
              <code style={{ fontWeight: "bold" }}>{example}</code> + Tab → <strong>"{result}"</strong>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ color: "#2d3748", marginBottom: "15px" }}>🧪 Interactive Demo</h3>
        
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#4a5568", marginBottom: "10px" }}>Demo 1: Enhanced Mentions Component</h4>
          <Mentions
            name="demo1"
            placeholder="Type @ to see suggestions, then Tab to evaluate values..."
            triggerString="@"
            as="textarea"
            onBlur={handleBlur}
            suggestionsData={demoData}
            style={{
              width: "100%",
              minHeight: "120px",
              fontSize: "16px",
              padding: "15px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#4a5568", marginBottom: "10px" }}>Demo 2: Custom Hook Implementation</h4>
          <div style={{ position: "relative" }}>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type @ to see suggestions (Custom hook demo)"
              style={{
                width: "100%",
                minHeight: "120px",
                fontSize: "16px",
                padding: "15px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                resize: "vertical"
              }}
            />
            {suggestions.length > 0 && (
              <ul
                className="suggestion-container"
                ref={scrollToHighlightedIndex as any}
                style={{
                  position: "absolute",
                  top: `${coord.y}px`,
                  left: `${coord.x}px`,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  listStyle: "none",
                  padding: "5px",
                  margin: 0,
                  zIndex: 1000,
                  maxHeight: "200px",
                  overflowY: "auto"
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
                      borderRadius: "4px",
                      backgroundColor: index === highlightedIndex ? "#667eea" : "transparent",
                      color: index === highlightedIndex ? "white" : "#2d3748"
                    }}
                  >
                    {sug}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div style={{
        textAlign: "center",
        padding: "20px",
        background: "#f7fafc",
        borderRadius: "8px",
        marginTop: "40px"
      }}>
        <p style={{ margin: "0 0 10px 0" }}>
          <a 
            href="https://github.com/rahulpatwa1303/type-ahead-mention" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: "#667eea", 
              textDecoration: "none", 
              fontWeight: "600",
              fontSize: "1.1em"
            }}
          >
            📚 View Documentation & Source Code on GitHub
          </a>
        </p>
        <p style={{ margin: 0 }}>
          <a 
            href="https://www.npmjs.com/package/type-ahead-mention" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: "#667eea", 
              textDecoration: "none", 
              fontWeight: "600"
            }}
          >
            📦 Install from NPM
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
