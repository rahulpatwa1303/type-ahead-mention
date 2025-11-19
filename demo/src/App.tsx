import { useState, CSSProperties } from "react";
import { MentionInput, useMentionResolver, SuggestionNode } from "@type-ahead-mention/core";
import "./DemoLandingPage.css";

const defaultSuggestionsData: SuggestionNode = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0123",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
    roles: ["admin", "editor", "viewer"],
  },
  product: {
    name: "Awesome Gadget",
    price: 99.99,
    sku: "AWG-001",
    category: "Electronics",
    inStock: true,
    tags: ["popular", "bestseller", "new"],
  },
  order: {
    id: "ORD-12345",
    date: "2025-01-15",
    total: 299.97,
    status: "shipped",
    items: [
      { name: "Gadget A", quantity: 2 },
      { name: "Gadget B", quantity: 1 },
    ],
  },
};

const themes = {
  light: { name: "Light", backgroundColor: "#ffffff", textColor: "#000000", borderColor: "#d1d5db" },
  dark: { name: "Dark", backgroundColor: "#1e1e1e", textColor: "#e0e0e0", borderColor: "#404040" },
  ocean: { name: "Ocean", backgroundColor: "#e0f2fe", textColor: "#0c4a6e", borderColor: "#0ea5e9" },
  sunset: { name: "Sunset", backgroundColor: "#fef3c7", textColor: "#78350f", borderColor: "#f59e0b" },
  forest: { name: "Forest", backgroundColor: "#dcfce7", textColor: "#14532d", borderColor: "#22c55e" },
};

const DataTree = ({ data, level = 0 }: { data: any; level?: number }) => {
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});
  
  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  
  const renderValue = (key: string, value: any, currentLevel: number) => {
    const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const isCollapsed = collapsed[key];
    
    return (
      <div key={key} style={{ marginLeft: `${currentLevel * 20}px` }}>
        <div className="tree-node">
          {(isObject || isArray) && (
            <button className="tree-toggle" onClick={() => toggleCollapse(key)}>
              {isCollapsed ? "▶" : "▼"}
            </button>
          )}
          <span className="tree-key">{key}:</span>
          {isArray && <span className="tree-type"> [Array({value.length})]</span>}
          {!isObject && !isArray && (
            <span className="tree-value">
              {typeof value === "string" ? `"${value}"` : String(value)}
            </span>
          )}
        </div>
        {isObject && !isCollapsed && (
          <div className="tree-children">
            {Object.entries(value).map(([k, v]) => renderValue(k, v, currentLevel + 1))}
          </div>
        )}
        {isArray && !isCollapsed && (
          <div className="tree-children">
            {value.map((item, idx) => {
              if (typeof item === "object") {
                return renderValue(`[${idx}]`, item, currentLevel + 1);
              }
              return (
                <div key={idx} style={{ marginLeft: `${(currentLevel + 1) * 20}px` }}>
                  <div className="tree-node">
                    <span className="tree-key">[{idx}]:</span>
                    <span className="tree-value">
                      {typeof item === "string" ? `"${item}"` : String(item)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="data-tree">
      {Object.entries(data).map(([key, value]) => renderValue(key, value, level))}
    </div>
  );
};

export default function App() {
  const [singleLineMessage, setSingleLineMessage] = useState("Hello {{user.name}}! Role: {{user.roles.0}}");
  const [multiLineMessage, setMultiLineMessage] = useState(
    "Order: {{order.id}} - {{order.status}}\n\nItems:\n- {{order.items.0.name}} (x{{order.items.0.quantity}})\n- {{order.items.1.name}} (x{{order.items.1.quantity}})\n\nShip to: {{user.name}}, {{user.address.city}}"
  );
  
  const [suggestionsJson, setSuggestionsJson] = useState(JSON.stringify(defaultSuggestionsData, null, 2));
  const [suggestionsData, setSuggestionsData] = useState<SuggestionNode>(defaultSuggestionsData);
  const [jsonError, setJsonError] = useState<string>("");
  
  const handleJsonChange = (newJson: string) => {
    setSuggestionsJson(newJson);
    try {
      const parsed = JSON.parse(newJson);
      setSuggestionsData(parsed);
      setJsonError("");
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };
  
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>("light");
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("monospace");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderWidth, setBorderWidth] = useState("1");
  const [borderRadius, setBorderRadius] = useState("8");
  const [padding, setPadding] = useState("12");
  
  const currentTheme = themes[selectedTheme];
  const customStyle: CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily,
    border: `${borderWidth}px ${borderStyle} ${currentTheme.borderColor}`,
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    backgroundColor: currentTheme.backgroundColor,
    color: currentTheme.textColor,
  };
  
  const resolvedSingleLine = useMentionResolver(singleLineMessage, suggestionsData);
  const resolvedMultiLine = useMentionResolver(multiLineMessage, suggestionsData);
  
  return (
    <div className="landing-page">
      <header className="hero">
        <div className="container">
          <h1 className="hero-title">
            <span className="gradient-text">Type-Ahead Mention</span>
          </h1>
          <p className="hero-subtitle">
            Powerful React component for mention-based autocompletion. Supports nested objects and arrays!
          </p>
          <div className="hero-buttons">
            <a href="#demo" className="btn btn-primary">Try Demo</a>
            <a href="https://github.com/rahulpatwa1303/type-ahead-mention" className="btn btn-secondary">GitHub</a>
          </div>
        </div>
      </header>
      
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Highly Customizable</h3>
              <p>Style it with CSS-in-JS or custom classes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Suggestions</h3>
              <p>Nested objects and arrays with dot notation</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⌨️</div>
              <h3>Keyboard Friendly</h3>
              <p>Full keyboard navigation</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>TypeScript Ready</h3>
              <p>Complete type definitions</p>
            </div>
          </div>
        </div>
      </section>
      
      <section id="demo" className="demo-section">
        <div className="container">
          <h2 className="section-title">Interactive Demo</h2>
          <p className="section-subtitle">Customize styles and data in real-time!</p>
          
          <div className="demo-layout">
            <div className="controls-panel">
              <h3>🎨 Style Customization</h3>
              
              <div className="control-group">
                <label>Theme</label>
                <div className="theme-buttons">
                  {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => (
                    <button
                      key={key}
                      className={`theme-btn ${selectedTheme === key ? "active" : ""}`}
                      onClick={() => setSelectedTheme(key)}
                      style={{
                        backgroundColor: themes[key].backgroundColor,
                        color: themes[key].textColor,
                        borderColor: themes[key].borderColor,
                      }}
                    >
                      {themes[key].name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="control-group">
                <label>Font Size: {fontSize}px</label>
                <input type="range" min="12" max="24" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="slider" />
              </div>
              
              <div className="control-group">
                <label>Font Family</label>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="select">
                  <option value="monospace">Monospace</option>
                  <option value="sans-serif">Sans-serif</option>
                  <option value="serif">Serif</option>
                </select>
              </div>
              
              <div className="control-group">
                <label>Border Style</label>
                <select value={borderStyle} onChange={(e) => setBorderStyle(e.target.value)} className="select">
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
              
              <div className="control-group">
                <label>Border Width: {borderWidth}px</label>
                <input type="range" min="0" max="8" value={borderWidth} onChange={(e) => setBorderWidth(e.target.value)} className="slider" />
              </div>
              
              <div className="control-group">
                <label>Border Radius: {borderRadius}px</label>
                <input type="range" min="0" max="30" value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} className="slider" />
              </div>
              
              <div className="control-group">
                <label>Padding: {padding}px</label>
                <input type="range" min="4" max="24" value={padding} onChange={(e) => setPadding(e.target.value)} className="slider" />
              </div>
              
              <div className="code-preview">
                <h4>Generated Style:</h4>
                <pre>{JSON.stringify(customStyle, null, 2)}</pre>
              </div>
            </div>
            
            <div className="demo-panel">
              <div className="demo-card">
                <h3>Single-Line Input</h3>
                <MentionInput value={singleLineMessage} onChange={setSingleLineMessage} suggestions={suggestionsData} placeholder="Type {{ to start..." style={customStyle} />
                <div className="output-preview">
                  <strong>Resolved:</strong>
                  <div className="resolved-text">{resolvedSingleLine}</div>
                </div>
              </div>
              
              <div className="demo-card">
                <h3>Multi-Line Textarea</h3>
                <MentionInput value={multiLineMessage} onChange={setMultiLineMessage} suggestions={suggestionsData} multiline style={customStyle} />
                <div className="output-preview">
                  <strong>Resolved:</strong>
                  <pre className="resolved-text">{resolvedMultiLine}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="data-section">
        <div className="container">
          <h2 className="section-title">Live Suggestions Data</h2>
          <p className="section-subtitle">Edit JSON to change autocomplete suggestions in real-time!</p>
          
          <div className="data-editor-layout">
            <div className="json-editor-card">
              <h3>✏️ Edit JSON Data</h3>
              <textarea className="json-editor" value={suggestionsJson} onChange={(e) => handleJsonChange(e.target.value)} spellCheck={false} />
              {jsonError && <div className="json-error"><strong>⚠️ Error:</strong> {jsonError}</div>}
              <button className="reset-btn" onClick={() => handleJsonChange(JSON.stringify(defaultSuggestionsData, null, 2))}>
                Reset to Default
              </button>
            </div>
            
            <div className="tree-visualization-card">
              <h3>🌲 Data Structure</h3>
              <div className="tree-scroll">
                <DataTree data={suggestionsData} />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <div className="container">
          <p>Built with ❤️ using React and CodeMirror</p>
        </div>
      </footer>
    </div>
  );
}
