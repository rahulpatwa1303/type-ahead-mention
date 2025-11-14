# SmartInput

A powerful CodeMirror-based template editor with intelligent autocomplete for React applications.

## Features

- 🎯 **Smart Autocomplete** - CodeMirror-powered autocomplete with nested object navigation
- 🎨 **Customizable** - Themes, triggers, single/multi-line modes
- ⚡ **High Performance** - Built on CodeMirror 6
- 🪝 **Hook-based API** - Use `useMentions` hook for custom implementations
- 📦 **TypeScript Ready** - Full TypeScript support
- 🔌 **Easy Integration** - Drop-in component or composable hook

## Installation

```bash
npm install type-ahead-mention
```

## Quick Start

### Component Usage

```tsx
import { SmartInput } from 'type-ahead-mention';
import { useState } from 'react';

function MyComponent() {
  const [value, setValue] = useState('Hello {{user.name}}!');
  
  const data = {
    user: { name: "Alice", email: "alice@example.com" },
    order: { id: 123, total: 299.99 }
  };
  
  return (
    <SmartInput
      value={value}
      onChange={setValue}
      suggestions={data}
      config={{
        trigger: { trigger: '{{', closingTrigger: '}}' },
        singleLine: true,
        editorTheme: 'dark'
      }}
    />
  );
}
```

### Hook Usage

```tsx
import { useMentions } from 'type-ahead-mention';

function CustomInput() {
  const {
    value,
    setValue,
    handleChange,
    handleKeyDown,
    suggestions,
    highlightedIndex,
    inputRef,
  } = useMentions({
    suggestionsData: {
      user: { name: "Alice", email: "alice@example.com" },
      product: { id: 123, price: 99.99 }
    },
    config: {
      trigger: { trigger: '@' }
    }
  });
  
  return (
    <div>
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {/* Build your custom suggestion UI */}
    </div>
  );
}
```

## Configuration

### SmartInput Config

```typescript
interface SmartInputConfig {
  trigger: {
    trigger: string;              // e.g., '{{', '@', '$'
    closingTrigger?: string;      // e.g., '}}'
  };
  editorTheme?: 'light' | 'dark'; // CodeMirror theme
  showLineNumbers?: boolean;       // Show line numbers
  singleLine?: boolean;            // Single-line mode
  height?: string;                 // Editor height
  width?: string;                  // Editor width
  allowMultiple?: boolean;         // Allow multiple mentions
  caseSensitive?: boolean;         // Case-sensitive matching
}
```

## API

### SmartInput Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | ✅ | Current editor value |
| `onChange` | `(value: string) => void` | ✅ | Change handler |
| `suggestions` | `SuggestionNode` | ✅ | Nested suggestion data |
| `config` | `Partial<SmartInputConfig>` | ❌ | Configuration options |
| `style` | `React.CSSProperties` | ❌ | Custom styles |
| `className` | `string` | ❌ | Custom class name |

### useMentions Hook

**Parameters:**
- `suggestionsData: SuggestionNode` - Nested object with suggestion data
- `config?: Partial<SmartInputConfig>` - Configuration options

**Returns:**
```typescript
{
  value: string;
  setValue: (value: string) => void;
  suggestions: string[];
  highlightedIndex: number;
  handleChange: (e: ChangeEvent) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  insertSuggestion: (suggestion: string) => void;
  inputRef: RefObject;
  reset: () => void;
}
```

## Utilities

### evaluateTemplateString

Evaluate template strings with nested data:

```typescript
import { evaluateTemplateString } from 'type-ahead-mention';

const template = 'Hello {{user.name}}, your order {{order.id}} is ready!';
const data = {
  user: { name: 'Alice' },
  order: { id: 123 }
};

const result = evaluateTemplateString(template, data);
// "Hello Alice, your order 123 is ready!"
```

## Examples

### Multi-line Editor

```tsx
<SmartInput
  value={template}
  onChange={setTemplate}
  suggestions={data}
  config={{
    trigger: { trigger: '{{', closingTrigger: '}}' },
    editorTheme: 'dark',
    showLineNumbers: true,
    singleLine: false,
    height: '200px',
  }}
/>
```

### Single-line Input

```tsx
<SmartInput
  value={input}
  onChange={setInput}
  suggestions={data}
  config={{
    trigger: { trigger: '{{', closingTrigger: '}}' },
    singleLine: true,
    editorTheme: 'light',
  }}
/>
```

### Custom Triggers

```tsx
<SmartInput
  value={value}
  onChange={setValue}
  suggestions={data}
  config={{
    trigger: { trigger: '[[', closingTrigger: ']]' }
  }}
/>
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
