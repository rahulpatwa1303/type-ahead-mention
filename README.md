# Type-Ahead Mention

[![npm version](https://img.shields.io/npm/v/@type-ahead-mention/core.svg)](https://www.npmjs.com/package/@type-ahead-mention/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A powerful, flexible React component for mention-based autocompletion powered by CodeMirror. Perfect for building chat apps, note-taking tools, template editors, and more with support for nested objects and arrays.

## 🔗 Links

- **[Live Demo](https://rahulpatwa1303.github.io/type-ahead-mention/)** - Try it out with interactive examples
- **[NPM Package](https://www.npmjs.com/package/@type-ahead-mention/core)** - Install and use in your project
- **[Documentation](./packages/core/README.md)** - Full API documentation

## 🚀 Quick Start

```bash
npm install @type-ahead-mention/core
```

```tsx
import { MentionInput } from '@type-ahead-mention/core';
import { useState } from 'react';

function App() {
  const [message, setMessage] = useState("Hello {{user.name}}!");

  const suggestions = {
    user: {
      name: "John Doe",
      email: "john@example.com"
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

## ✨ Features

- 🚀 Powered by CodeMirror for robust text editing
- 🎯 Smart nested object and array suggestions with dot notation
- ⌨️ Full keyboard navigation support
- 🎨 Highly customizable styling
- 📝 Single-line input and multi-line textarea modes
- 🔧 Template variable resolution hook
- 📦 TypeScript ready with complete type definitions
- 🎭 Zero configuration required

## 📦 Project Structure

```
type-ahead-mention/
├── packages/
│   └── core/              # NPM package
│       ├── src/
│       ├── dist/          # Built files
│       ├── package.json
│       └── README.md
├── demo/                  # Interactive demo site
│   ├── src/
│   └── dist/              # Demo build
└── README.md             # This file
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run demo locally
npm run dev:demo

# Build library
npm run build:lib

# Build demo
npm run build:demo
```

## 📝 Documentation

See the [full documentation](./packages/core/README.md) for:
- Complete API reference
- Advanced usage examples
- Customization guide
- TypeScript support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Rahul Patwa](https://github.com/rahulpatwa1303)

---

Made with ❤️ by [Rahul Patwa](https://github.com/rahulpatwa1303)
