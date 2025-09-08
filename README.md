# 📦 type-ahead-mention

A lightweight and extensible React package that enables smart mention-based suggestions (`@`, `$`, or custom triggers) in text inputs or textareas — complete with custom styles, hooks, keyboard navigation support, and **value evaluation**.

---

## ✨ Features

- 🔥 Simple `<Mentions />` component with rich interaction
- 🧐 Custom `useMentions()` hook for advanced use cases
- 🔭 Keyboard navigation (arrow keys, enter to select)
- 💅 Style with your own theme via CSS modules
- ⚙️ Supports nested suggestion paths (`object.key.subkey`)
- ⚙️ Works with `textarea` or `input` elements
- **🎯 NEW: Value evaluation - Press `Tab` to replace mentions with actual values!**

---

## 🚀 Live Demo

**[View Interactive Demo →](https://rahulpatwa1303.github.io/type-ahead-mention/)**

Try the evaluation feature:
1. Type `@users.name` 
2. Press `Tab`
3. Watch it transform to "Alice"!

---

## 🎯 Value Evaluation Feature

The new evaluation feature allows you to replace mention paths with their actual values from your data structure.

### How it works:

1. **Type a mention path**: `@users.name`
2. **Press Tab**: The mention gets replaced with the actual value
3. **Result**: `@users.name` becomes `"Alice"`

### Example:

```tsx
const data = {
  users: { name: "Alice", email: "alice@example.com" },
  orders: { id: 123, status: "shipped" }
};

// In your text field:
// Type: @users.name
// Press: Tab
// Result: "Alice"

// Type: @orders.id  
// Press: Tab
// Result: "123"
```

### Supported Data Types:
- ✅ Strings
- ✅ Numbers  
- ✅ Nested objects
- ❌ Arrays and complex objects (returns original path)

---

## 📦 Installation

```bash
npm install type-ahead-mention
# or
yarn add type-ahead-mention
```

---

## 🥪 Quick Start

### 1. Import the Component

```tsx
import { Mentions } from "type-ahead-mention";
```

### 2. Use in Your App

```tsx
<Mentions
  triggerString="@"
  suggestionsData={{
    user: {
      name: "John",
      email: "john@example.com",
    },
    admin: {
      role: "Moderator",
    },
  }}
/>
```

---

## 🧪 Custom Hook Usage: `useMentions`

If you need full control over the logic (e.g., using a custom UI), use the `useMentions` hook:

### 1. Import the Hook

```tsx
import { useMentions, useCaretPosition } from "type-ahead-mention";
import styles from "type-ahead-mention/style"; // <-- Import default styles
```

### 2. Example Usage

```tsx
const {
  query,
  setQuery,
  suggestions,
  highlightedIndex,
  handleChange,
  handleKeyDown,
  insertSuggestion,
  inputRef,
  scrollToHighlightedIndex
} = useMentions({
  triggerString: "@",
  suggestionsData: {
    user: {
      name: "Alice",
      email: "alice@example.com",
    },
    team: {
      leader: "Bob",
    }
  }
});
```

### 3. Full JSX Example

```tsx
<textarea
  ref={inputRef}
  value={query}
  onChange={handleChange}
  onKeyDown={handleKeyDown}
/>

{suggestions.length > 0 && (
  <ul className="suggestions-container">
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
```

---

## 🎯 API Reference

### `useMentions({ triggerString, suggestionsData })`

| Param             | Type                      | Description                                   |
|------------------|---------------------------|-----------------------------------------------|
| `triggerString`  | `string`                  | Character to trigger suggestions (e.g. `@`)  |
| `suggestionsData`| `Record<string, any>`     | Data object used for suggestions              |

**Returns:**

- `query`: Current input value
- `setQuery()`: Setter for input value
- `suggestions`: Array of matched suggestion keys
- `highlightedIndex`: Currently highlighted index
- `handleChange(e)`: Input change handler
- `handleKeyDown(e)`: Keyboard handler (includes Tab for evaluation)
- `insertSuggestion(suggestion)`: Inserts selected suggestion into input
- `evaluateQuery()`: Evaluates all mentions in current query and replaces with values
- `inputRef`: Ref to the input/textarea
- `scrollToHighlightedIndex(index)`: Scrolls to active suggestion

**Keyboard Shortcuts:**
- `Arrow Keys`: Navigate suggestions
- `Enter`: Select highlighted suggestion  
- `Tab`: **Evaluate mentions to actual values**
- `Escape`: Close suggestions

---

## 🤠 Advanced: `useCaretPosition`

A utility hook to get the caret (cursor) position in the input field — great for rendering floating suggestion boxes near the cursor.

```tsx
const caret = useCaretPosition(inputRef, cursorPosition);
console.log(caret.x, caret.y);
```

---

## 🎨 Styling

### Using CSS Modules

This package includes default styles via CSS Modules. Import them into your component like so:

```tsx
import styles from 'type-ahead-mention/style';
```

You’ll get the following classes:

- `suggestionItem`
- `suggestionItemActive`

You can override or extend them in your own styles.

---

## 💠 Build / Contribute

```bash
git clone https://github.com/your-username/type-ahead-mention
cd type-ahead-mention
npm install
npm run dev
```

---

## 📄 License

MIT © 2025 – Crafted with ❤️ for React developers.

