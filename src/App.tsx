import { useState, useMemo } from "react";
import { useCodeMirrorMentions } from "./hooks/useCodeMirrorMentions";
import { useSmartMentions } from "./hooks/useSmartMentions";
import { SuggestionPopper } from "./components/SuggestionPopper/SuggestionPopper";
import { evaluateTemplateString } from "./utils/template-evaluator";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import "./landing.css";

function App() {
  // CodeMirror example
  const [codeMirrorValue, setCodeMirrorValue] = useState('Hello {{user.name}}, your order #{{orders.id}} is {{orders.status}}!');
  
  // HTML Input example
  const [htmlInputValue, setHtmlInputValue] = useState('');
  
  const suggestionsData = {
    user: { 
      name: "Alice", 
      age: 30, 
      email: "alice@example.com",
      role: "Developer" 
    },
    orders: { 
      id: 123, 
      status: "shipped", 
      date: "2024-09-25",
      total: 299.99
    },
    products: { 
      name: "Laptop", 
      price: 1299,
      category: "Electronics"
    },
  };

  // CodeMirror with useCodeMirrorMentions hook
  const { autocompletionExtension } = useCodeMirrorMentions({
    suggestionsData,
    config: {
      trigger: { trigger: '{{', closingTrigger: '}}' },
      caseSensitive: false,
    },
  });

  const codeMirrorExtensions = useMemo(() => [
    javascript(),
    autocompletionExtension,
  ], [autocompletionExtension]);

  // HTML Input with useSmartMentions hook
  const {
    value: htmlValue,
    handleChange: htmlHandleChange,
    handleKeyDown: htmlHandleKeyDown,
    suggestions: htmlSuggestions,
    highlightedIndex: htmlHighlightedIndex,
    inputRef: htmlInputRef,
    popperPosition: htmlPopperPosition,
    showSuggestions: htmlShowSuggestions,
    insertSuggestion: htmlInsertSuggestion,
  } = useSmartMentions({
    suggestionsData,
    config: {
      trigger: { trigger: '@' },
      caseSensitive: false,
    },
  });

  const evaluatedCodeMirror = evaluateTemplateString(codeMirrorValue, suggestionsData);
  const evaluatedHtml = evaluateTemplateString(htmlValue, suggestionsData);

  return (
    <div className="landing-page">
      <header className="hero">
        <div className="container">
          <div className="hero-badge">
            <span className="badge-text">✨ v2.0</span>
          </div>
          <h1 className="hero-title">SmartInput</h1>
          <p className="hero-subtitle">
            Two powerful ways to add intelligent autocomplete to your app
          </p>
          <div className="hero-features">
            <span className="feature-badge">🎨 CodeMirror</span>
            <span className="feature-badge">📝 HTML Input</span>
            <span className="feature-badge">🪝 Hook-Based</span>
          </div>
        </div>
      </header>

      <section className="demo-section">
        <div className="container">
          <div className="section-header">
            <h2>Interactive Demo</h2>
          </div>

          {/* CodeMirror Example */}
          <div className="demo-card featured">
            <div className="demo-header">
              <div className="demo-title">
                <span className="demo-icon">📝</span>
                <div>
                  <h3>CodeMirror Editor</h3>
                  <p>Type <code>{"{{"}</code> to trigger autocomplete with resolver</p>
                </div>
              </div>
            </div>
            <div className="demo-content">
              <CodeMirror
                value={codeMirrorValue}
                onChange={setCodeMirrorValue}
                extensions={codeMirrorExtensions}
                theme="dark"
                height="150px"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                }}
              />
              <div className="demo-output">
                <strong>Preview:</strong>
                <div className="output-box">{evaluatedCodeMirror}</div>
              </div>
            </div>
          </div>

          {/* HTML Input Example */}
          <div className="demo-card">
            <div className="demo-header">
              <div className="demo-title">
                <span className="demo-icon">✏️</span>
                <div>
                  <h3>HTML Input with Hook</h3>
                  <p>Type <code>@</code> to mention - suggestions appear below cursor</p>
                </div>
              </div>
            </div>
            <div className="demo-content">
              <div style={{ position: 'relative' }}>
                <input
                  ref={htmlInputRef as React.RefObject<HTMLInputElement>}
                  value={htmlValue}
                  onChange={htmlHandleChange}
                  onKeyDown={htmlHandleKeyDown}
                  placeholder="Type @ to mention users..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    outline: 'none',
                  }}
                />
                {htmlShowSuggestions && (
                  <SuggestionPopper
                    suggestions={htmlSuggestions}
                    position={htmlPopperPosition}
                    highlightedIndex={htmlHighlightedIndex}
                    onSelect={htmlInsertSuggestion}
                  />
                )}
              </div>
              <div className="demo-output" style={{ marginTop: '10px' }}>
                <strong>Value:</strong> <code>{htmlValue}</code>
                <br />
                <strong>Resolved:</strong> <code>{evaluatedHtml}</code>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
