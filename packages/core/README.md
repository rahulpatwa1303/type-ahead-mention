# Type-Ahead Mention

[![npm version](https://img.shields.io/npm/v/type-ahead-mention.svg)](https://www.npmjs.com/package/type-ahead-mention)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/type-ahead-mention)](https://bundlephobia.com/package/type-ahead-mention)

A powerful, flexible React component for mention-based autocompletion powered by CodeMirror. Perfect for building chat apps, note-taking tools, template editors, and more with support for nested objects and arrays.

[**Live Demo**](https://rahulpatwa1303.github.io/type-ahead-mention/) | [**GitHub**](https://github.com/rahulpatwa1303/type-ahead-mention)

## ✨ Features

- 🚀 **Powered by CodeMirror** - Robust text editing with excellent performance
- 🎯 **Smart Nested Suggestions** - Navigate through objects and arrays with dot notation
- ⌨️ **Full Keyboard Navigation** - Arrow keys, Enter to select, Escape to dismiss
- 🎨 **Highly Customizable** - Style with CSS-in-JS or custom classes
- 📝 **Single-line & Multi-line** - Works as both input and textarea
- 🔧 **Template Resolution** - Built-in hook to resolve variables in your templates
- 📦 **TypeScript Ready** - Complete type definitions included
- 🎭 **Zero Config** - Works out of the box with sensible defaults
- 🪶 **Lightweight** - Only 12KB gzipped with peer dependencies

## 📦 Installation

```bash
npm install type-ahead-mention
```

**Peer Dependencies** (install these if not already in your project):

```bash
npm install react react-dom @codemirror/autocomplete @codemirror/state @codemirror/view @popperjs/core @uiw/react-codemirror react-popper
```

Or with yarn:

```bash
yarn add type-ahead-mention
yarn add react react-dom @codemirror/autocomplete @codemirror/state @codemirror/view @popperjs/core @uiw/react-codemirror react-popper
```

## 🚀 Quick Start

```tsx
import { MentionInput } from 'type-ahead-mention';
import { useState } from 'react';

function App() {
  const [message, setMessage] = useState("Hello {{user.name}}!");

  const suggestions = {
    user: {
      name: "John Doe",
      email: "john@example.com",
      roles: ["admin", "editor"]
    },
    product: {
      name: "Awesome Product",
      price: 99.99
    }
  };

  return (
    <MentionInput
      value={message}
      onChange={setMessage}
      suggestions={suggestions}
      placeholder="Type {{ to start..."
    />
  );
}
```

## 📖 API Reference

### `<MentionInput />`

The main component for mention-based autocompletion.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **required** | Current input value |
| `onChange` | `(value: string) => void` | **required** | Called when value changes |
| `suggestions` | `SuggestionNode` | **required** | Nested object of suggestion data |
| `placeholder` | `string` | `''` | Input placeholder text |
| `multiline` | `boolean` | `false` | Enable textarea mode |
| `style` | `React.CSSProperties` | - | Custom inline styles |
| `className` | `string` | - | Custom CSS class |

#### Example

```tsx
<MentionInput
  value={template}
  onChange={setTemplate}
  suggestions={data}
  placeholder="Type your message..."
  multiline={true}
  style={{ 
    fontSize: '16px',
    padding: '12px',
    borderRadius: '8px'
  }}
/>
```

### `useMentionResolver`

A React hook that resolves template variables in your strings.

```tsx
import { useMentionResolver } from '@type-ahead-mention/core';

function PreviewComponent() {
  const template = "Hello {{user.name}}! You have {{order.items.0.quantity}} items.";
  
  const data = {
    user: { name: "Alice" },
    order: {
      items: [{ quantity: 5 }]
    }
  };

  const resolved = useMentionResolver(template, data);
  // Result: "Hello Alice! You have 5 items."

  return <div>{resolved}</div>;
}
```

### `useMentionSuggestions`

Advanced hook for building custom mention input implementations.

```tsx
import { useMentionSuggestions } from '@type-ahead-mention/core';

const { getInputProps, SuggestionPopper } = useMentionSuggestions(
  initialValue,
  suggestionsData
);

return (
  <>
    <input {...getInputProps()} />
    {SuggestionPopper}
  </>
);
```

## 🎯 Usage Examples

### Nested Objects

```tsx
const suggestions = {
  user: {
    name: "John Doe",
    address: {
      street: "123 Main St",
      city: "New York",
      country: "USA"
    }
  }
};

// Use in template: {{user.address.city}} → "New York"
```

### Arrays

```tsx
const suggestions = {
  user: {
    roles: ["admin", "editor", "viewer"]
  },
  order: {
    items: [
      { name: "Product A", quantity: 2 },
      { name: "Product B", quantity: 1 }
    ]
  }
};

// Access arrays:
// {{user.roles.0}} → "admin"
// {{order.items.0.name}} → "Product A"
// {{order.items.1.quantity}} → 1
```

### Email Template Builder

```tsx
function EmailTemplateEditor() {
  const [template, setTemplate] = useState(
    "Hi {{user.name}},\n\nYour order {{order.id}} has been shipped to:\n{{user.address.street}}\n{{user.address.city}}, {{user.address.zip}}"
  );

  const variables = {
    user: {
      name: "Jane Smith",
      address: {
        street: "456 Oak Ave",
        city: "Boston",
        zip: "02101"
      }
    },
    order: {
      id: "ORD-12345"
    }
  };

  const preview = useMentionResolver(template, variables);

  return (
    <div>
      <MentionInput
        value={template}
        onChange={setTemplate}
        suggestions={variables}
        multiline
        placeholder="Design your email template..."
      />
      <div className="preview">
        <h3>Preview:</h3>
        <pre>{preview}</pre>
      </div>
    </div>
  );
}
```

### Notification System

```tsx
const notificationTemplates = {
  orderShipped: "Your order {{order.id}} has shipped! Track: {{order.trackingUrl}}",
  newMessage: "{{sender.name}} sent you a message: {{message.preview}}",
  reminder: "Hey {{user.name}}, don't forget about {{event.title}} on {{event.date}}!"
};

function NotificationBuilder() {
  const [template, setTemplate] = useState(notificationTemplates.orderShipped);

  return (
    <MentionInput
      value={template}
      onChange={setTemplate}
      suggestions={notificationData}
      placeholder="Create notification template..."
    />
  );
}
```

## 🎨 Customization

### Styling with CSS-in-JS

```tsx
<MentionInput
  style={{
    fontSize: '16px',
    fontFamily: 'monospace',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#000000'
  }}
  // ... other props
/>
```

### Dark Mode

```tsx
const darkTheme = {
  backgroundColor: '#1e1e1e',
  color: '#e0e0e0',
  border: '1px solid #404040',
  borderRadius: '4px',
  padding: '10px'
};

<MentionInput style={darkTheme} {...props} />
```

### Custom CSS Class

```tsx
// styles.css
.custom-mention-input {
  font-size: 18px;
  line-height: 1.6;
  border: 2px dashed #3b82f6;
}

// Component
<MentionInput className="custom-mention-input" {...props} />
```

## 🔧 TypeScript

The package is written in TypeScript and includes complete type definitions.

```tsx
import type { SuggestionNode } from '@type-ahead-mention/core';

const suggestions: SuggestionNode = {
  user: {
    name: "John",
    settings: {
      theme: "dark"
    }
  }
};
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 License

MIT © [Rahul Patwa](https://github.com/rahulpatwa1303)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Issues

Found a bug? Have a feature request? Please [open an issue](https://github.com/rahulpatwa1303/type-ahead-mention/issues).

## 📚 More Examples

Check out the [live demo](https://rahulpatwa1303.github.io/type-ahead-mention/) for interactive examples showcasing:
- Real-time style customization
- Theme switching (Light, Dark, Ocean, Sunset, Forest)
- Editable JSON data structures
- Interactive tree visualization
- Template resolution

## 🙏 Acknowledgments

- Built with [CodeMirror](https://codemirror.net/)
- Powered by [React](https://react.dev/)
- Positioning by [Popper.js](https://popper.js.org/)

---

Made with ❤️ by [Rahul Patwa](https://github.com/rahulpatwa1303)
