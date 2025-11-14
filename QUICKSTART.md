# Type-Ahead Mention Library - Quick Start Guide

## 🎯 What You've Built

A highly customizable React library with:

1. **Mentions Component** - For @-style mentions in text inputs
2. **Template Editor** - CodeMirror-based editor with {{variable}} support
3. **Custom Hooks** - Build your own UI with `useMentions`
4. **Flexible Configuration** - Customize everything (triggers, themes, styling)

## 🚀 Running the Demo

```bash
npm run dev
```

Then open: **http://localhost:5173/**

## 📦 Project Structure

```
src/
├── components/
│   ├── Mentions/              # Mentions component
│   │   ├── Mentions.tsx
│   │   ├── MentionsConfig.ts
│   │   └── types.ts
│   ├── TemplateEditor/        # CodeMirror template editor
│   │   ├── TemplateEditor.tsx
│   │   ├── TemplateEditorConfig.ts
│   │   └── types.ts
│   └── SuggestionPopper/      # Reusable suggestion dropdown
│       ├── SuggestionPopper.tsx
│       ├── defaultTheme.ts
│       └── types.ts
├── hooks/
│   ├── useMentions.ts         # Main hook for mentions
│   ├── useCaretPosition.ts    # Calculate cursor position
│   └── useSuggestions.ts      # Handle suggestion logic
├── utils/
│   ├── path-resolver.ts       # Resolve nested paths
│   └── template-evaluator.ts  # Evaluate {{templates}}
├── themes/
│   ├── default.ts             # Default & dark themes
│   ├── light.ts               # Light theme
│   └── types.ts
├── types/
│   └── index.ts               # All TypeScript types
└── index.ts                   # Main exports
```

## 🎨 Key Features Demonstrated

### 1. Custom Triggers

- **{{  }}** - Template variables (default)
- **[[  ]]** - Custom brackets
- **@** - Mentions
- **$** - Alternative syntax

### 2. Multiple Themes

- Dark theme with dark background
- Light theme with light background
- Custom themes via configuration

### 3. Nested Data Resolution

```typescript
const data = {
  user: { 
    name: "Alice",
    email: "alice@example.com" 
  }
};

// Type {{user.name}} → suggests "name", "email"
// Resolves to: "Alice"
```

### 4. Three Usage Patterns

**Pattern A: Mentions Component (Easiest)**
```tsx
<Mentions
  suggestionsData={data}
  config={{ trigger: { trigger: '@' } }}
/>
```

**Pattern B: Template Editor (CodeMirror)**
```tsx
<TemplateEditor
  value={template}
  onChange={setTemplate}
  suggestions={data}
  config={{ showLineNumbers: true }}
/>
```

**Pattern C: Custom Hook (Most Flexible)**
```tsx
const { value, suggestions, handleChange, ... } = useMentions({
  suggestionsData: data
});
```

## 🔧 Customization Examples

### Change Trigger String

```tsx
config={{
  trigger: {
    trigger: '[[',
    closingTrigger: ']]'
  }
}}
```

### Custom Theme

```tsx
config={{
  popper: {
    theme: {
      container: { backgroundColor: '#1a1a1a' },
      itemActive: { backgroundColor: '#4CAF50' }
    }
  }
}}
```

### Custom Filtering

```tsx
config={{
  filterFn: (suggestions, query) => {
    return suggestions.filter(s => s.includes(query));
  }
}}
```

### Custom Rendering

```tsx
config={{
  popper: {
    renderItem: (suggestion, isActive) => (
      <div>🔹 {suggestion}</div>
    )
  }
}}
```

## 📚 API Overview

### Main Components

- `Mentions` - Text input with @mentions
- `TemplateEditor` - CodeMirror editor with {{variables}}
- `SuggestionPopper` - Reusable dropdown component

### Hooks

- `useMentions()` - Complete mention functionality
- `useCaretPosition()` - Get cursor coordinates
- `useSuggestions()` - Handle suggestion logic

### Utilities

- `evaluateTemplateString()` - Resolve {{template}} strings
- `ExpressionEvaluator` - Advanced expression evaluation
- `resolvePath()` - Resolve nested object paths

### Themes

- `defaultTheme` - Clean white theme
- `darkTheme` - Dark mode theme
- `lightTheme` - Light mode theme

## 🛠️ Building for Production

```bash
# Build the library
npm run build

# Preview the build
npm run preview

# Publish to npm
npm publish
```

## 📝 Next Steps

1. **Customize the demo** in `src/App.tsx`
2. **Add your own themes** in `src/themes/`
3. **Extend functionality** by modifying hooks
4. **Build your own components** using the hooks and utilities

## 🐛 Troubleshooting

### TypeScript Errors
- Restart VS Code TypeScript server
- Run: `npm install` to ensure dependencies are installed

### Vite Not Starting
- Check port 5173 is available
- Try: `rm -rf node_modules/.vite && npm run dev`

### Build Errors
- Ensure all dependencies are installed
- Check `tsconfig.json` is properly configured

## 📖 Documentation

See `README.md` for full API documentation and examples.

## 🎉 You're All Set!

Your library is now fully functional and customizable. Test it at:
**http://localhost:5173/**

Enjoy building! 🚀
