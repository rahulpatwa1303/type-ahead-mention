# Real-time Input Evaluation Examples

This document demonstrates the new real-time input evaluation features added to the type-ahead-mention package.

## Features

### 1. onInputChange Callback
Receive real-time input changes for custom processing:

```tsx
import { Mentions, useMentions } from "type-ahead-mention";

// Using the Mentions component
<Mentions
  triggerString="@"
  suggestionsData={suggestionsData}
  onInputChange={(value) => {
    console.log("Real-time input:", value);
    // Your custom logic here
  }}
/>

// Using the useMentions hook
const { query, validationResult } = useMentions({
  triggerString: "@",
  suggestionsData,
  onInputChange: (value) => {
    console.log("Real-time input:", value);
  }
});
```

### 2. Input Validation
Add custom validation rules with immediate feedback:

```tsx
import { ValidationResult } from "type-ahead-mention";

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

// Using with Mentions component
<Mentions
  triggerString="@"
  suggestionsData={suggestionsData}
  validator={validateInput}
  showValidationFeedback={true} // Show validation messages (default: true)
/>

// Using with useMentions hook
const { query, validationResult } = useMentions({
  triggerString: "@",
  suggestionsData,
  validator: validateInput
});

// Custom validation feedback
{!validationResult.isValid && validationResult.message && (
  <div style={{ color: "red" }}>
    {validationResult.message}
  </div>
)}
```

### 3. Complete Example with All Features

```tsx
import React, { useState } from "react";
import { Mentions, useMentions, ValidationResult } from "type-ahead-mention";

function MyComponent() {
  const [feedback, setFeedback] = useState("");

  // Custom validation function
  const validateInput = (value: string): ValidationResult => {
    if (value.length > 100) {
      return { isValid: false, message: "Too long (max 100 chars)" };
    }
    if (value.includes("spam")) {
      return { isValid: false, message: "Spam content detected" };
    }
    return { isValid: true };
  };

  // Real-time input handler
  const handleInputChange = (value: string) => {
    // Live character count
    setFeedback(`${value.length}/100 characters`);
    
    // Custom logic based on input
    if (value.includes("urgent")) {
      console.log("Urgent message detected!");
    }
  };

  return (
    <div>
      <h3>Enhanced Mentions with Validation</h3>
      
      <Mentions
        triggerString="@"
        placeholder="Type @ for mentions..."
        suggestionsData={{
          users: { name: "Alice", email: "alice@example.com" },
          teams: { name: "Engineering", members: 10 }
        }}
        onInputChange={handleInputChange}
        validator={validateInput}
        showValidationFeedback={true}
      />
      
      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
        {feedback}
      </div>
    </div>
  );
}
```

### 4. Custom Hook Advanced Usage

```tsx
function AdvancedMentions() {
  const {
    query,
    suggestions,
    validationResult,
    handleChange,
    handleKeyDown,
    insertSuggestion,
    inputRef
  } = useMentions({
    triggerString: "#",
    suggestionsData: {
      tags: { type: "urgent", color: "red" },
      categories: { name: "bug-report", priority: "high" }
    },
    onInputChange: (value) => {
      // Real-time processing
      if (value.includes("#urgent")) {
        // Trigger urgent notification
        console.log("Urgent tag detected!");
      }
    },
    validator: (value) => {
      // Custom validation logic
      const tagCount = (value.match(/#/g) || []).length;
      if (tagCount > 5) {
        return { isValid: false, message: "Too many tags (max 5)" };
      }
      return { isValid: true };
    }
  });

  return (
    <div>
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{
          border: !validationResult.isValid ? "2px solid red" : "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px"
        }}
      />
      
      {/* Custom validation feedback */}
      {!validationResult.isValid && (
        <div style={{ color: "red", fontSize: "12px" }}>
          ❌ {validationResult.message}
        </div>
      )}
      
      {/* Custom suggestions rendering */}
      {suggestions.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              onClick={() => insertSuggestion(suggestion)}
              style={{
                padding: "8px",
                cursor: "pointer",
                backgroundColor: "#f5f5f5"
              }}
            >
              #{suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## API Reference

### New Props for Mentions Component

| Prop | Type | Description |
|------|------|-------------|
| `onInputChange` | `(value: string) => void` | Callback fired on every input change |
| `validator` | `(value: string) => ValidationResult` | Custom validation function |
| `showValidationFeedback` | `boolean` | Whether to show validation messages (default: true) |

### New Props for useMentions Hook

| Prop | Type | Description |
|------|------|-------------|
| `onInputChange` | `(value: string) => void` | Callback fired on every input change |
| `validator` | `(value: string) => ValidationResult` | Custom validation function |

### ValidationResult Interface

```tsx
interface ValidationResult {
  isValid: boolean;
  message?: string;
}
```

### Additional Return Values from useMentions

| Property | Type | Description |
|----------|------|-------------|
| `validationResult` | `ValidationResult` | Current validation state |

## Use Cases

1. **Character Counting**: Track input length in real-time
2. **Content Filtering**: Detect and prevent inappropriate content
3. **Format Validation**: Ensure input follows specific patterns
4. **Conditional Logic**: Trigger different behaviors based on input content
5. **Live Search**: Update search results as user types
6. **Auto-saving**: Save drafts automatically on input changes