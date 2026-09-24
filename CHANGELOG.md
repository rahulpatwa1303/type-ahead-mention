# Changelog

## 3.0.0 (2026-09-24)

A rewrite focused on template variables. There are breaking changes; see "Upgrading from v2" in the README.

### Added
- `@mentions`: the `mentions` prop takes one or more `{ trigger, search, debounce, getItem }` sources. Search can be sync or async (debounced, cached, aborted through `signal`), and the list shows avatars plus "Searching…" and "No matches" rows. Picks are stored as `@[Label](id)` and shown as atomic chips. There are helpers too: `parseMentions`, `replaceMentions`, `formatMention`, `getMentionMatch`.
- Value previews in the suggestion list (`"Ada Lovelace"`, `{3 keys}`, `[2 items]`) plus a full-JSON info panel.
- Variables shown as chips in the text, and unknown paths underlined (`highlight`, `validate` props).
- Selecting a leaf closes the variable with `}}`; selecting an object or array adds `.` and opens the next level.
- Custom `delimiters`, including ones with no closing delimiter (`@user.name`).
- `colorScheme` (`light` / `dark` / `auto`) and `--tam-*` CSS variables for theming.
- `onSubmit`, `onFocus`, `onBlur`, `disabled`, `readOnly`, `autoFocus`, `id`, `aria-label`, `aria-describedby`, `extensions`.
- Ref handle: `focus()`, `blur()`, `insertVariable(path)`, `openSuggestions()`, `view`.
- Template helpers: `resolveTemplate`, `validateTemplate`, `parseTemplate`, `getValueAtPath`, `normalizePath`, and the `TemplatePath<T>` type.
- `templateVariables()` CodeMirror extension for existing editors.
- `useMentionSuggestions` gains an options object, controlled mode, combobox ARIA, and a portal list that follows the caret.
- Dual ESM + CJS builds with correct types for every module resolution mode; `sideEffects: false`.
- Test suite (Vitest).

### Fixed
- Multiline editing: completing a top-level key on line 2 or later replaced text at the wrong position.
- The `placeholder` prop didn't show anything.
- `useMentionSuggestions` dropped the parent path when selecting (`{{user.na` became `{{name`).
- Several `useMentionSuggestions` instances on one page shared a single popup position.
- Setting `style` produced a double border.
- Single-line mode allowed newlines through paste.
- The editor was rebuilt on every render when `suggestions` was an inline object.
- `useMentionResolver` didn't accept `{{ spaced }}` variables or hyphenated keys.

### Changed
- CodeMirror packages are regular dependencies; the only peers are `react` and `react-dom`. `@uiw/react-codemirror`, `react-popper`, `@popperjs/core` and `get-caret-position` are no longer used.
- `codeMirrorProps` is replaced by `extensions` and the ref handle.
- `useMentionResolver` JSON-stringifies object values instead of leaving the placeholder.
- `SuggestionPopper` props changed (`items`, `position`, `id`).

## 2.0.1

- Package renamed from `@type-ahead-mention/core` to `type-ahead-mention`.
