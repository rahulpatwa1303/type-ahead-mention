# Type-Ahead Mention

## Purpose

Efficiently integrating **mention-based suggestions** into applications can be challenging, especially in **low-code** and **custom tool-building** environments like **Tooljet** and **Appsmith**. Developers often spend time creating **repetitive logic** for recognizing keywords, fetching relevant suggestions, and handling user selections.

**Type-Ahead Mention** provides a **flexible, high-performance solution** that dynamically suggests relevant items based on user input, significantly reducing development time and enhancing the user experience.

---

## Benefits

✅ **Flexible & Customizable** – Supports multiple data sources and dynamic suggestions based on user input.
✅ **Improves Efficiency** – Saves development time by eliminating the need to build mention logic from scratch.
✅ **Enhanced User Experience** – Helps users navigate and insert mentions seamlessly with real-time suggestions.
✅ **Optimized Performance** – Uses efficient state management and lookups for smooth interaction.
✅ **Keyboard Navigation Support** – Users can navigate suggestions using arrow keys and quickly insert selections.

---

## Installation

To install Type-Ahead Mention, use npm:

```sh
npm install @your-package/type-ahead-mention
```

Or using yarn:

```sh
yarn add @your-package/type-ahead-mention
```

---

## Usage

### Basic Example

Here's how you can integrate **Type-Ahead Mention** into your React application:

```tsx
import { useMentions } from "@your-package/type-ahead-mention";

const MyComponent = () => {
  const {
    query,
    setQuery,
    suggestions,
    highlightedIndex,
    handleChange,
    handleKeyDown,
    insertSuggestion,
    inputRef,
  } = useMentions({
    triggerString: "@",
    suggestionsData: {
      users: { name: "John Doe", email: "john@example.com" },
      projects: { title: "New App", id: "12345" },
    },
  });

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => insertSuggestion(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## Advanced Use Case

For integration with a **rich text editor** or **custom input fields**, simply use the `useMentions` hook within your component and manage interactions accordingly.

```tsx
const RichTextEditor = () => {
  const { query, handleChange, handleKeyDown, inputRef } = useMentions({
    triggerString: "$",
    suggestionsData: {
      variables: { user: "John Doe", order: "#1234" },
    },
  });

  return (
    <textarea
      ref={inputRef}
      value={query}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
};
```

---

## Contributing

If you encounter issues or have ideas for improvement, feel free to **open an issue** or contribute via **pull requests**. Let's build better developer tools together! 🚀

---

## License

This project is open-source under the **MIT License**.

---

## Contact

For inquiries, feedback, or collaboration opportunities, reach out via [your contact info].

