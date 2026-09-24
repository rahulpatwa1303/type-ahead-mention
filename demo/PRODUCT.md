# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
React developers building an editor where *their* users write text containing `{{variables}}`. Primary: engineers on AI/LLM products building prompt-template editors (system prompts, reusable prompts with `{{user.name}}`, `{{context.docs}}`). Secondary: email/notification merge-tag editors and workflow/automation builders (Zapier/n8n-style field mapping). They arrive from npm, GitHub, Reddit or a blog post, and decide in under a minute whether to `npm install`.

## Product Purpose
`type-ahead-mention` is a React component (and a plain-input hook) that autocompletes `{{template.variables}}` from a JSON object, including nested objects and arrays, and resolves templates against data. Success: a developer understands what it does from the first screen, tries it live, copies the install line, and has it working in minutes.

## Positioning
Mention libraries (react-mentions, Tiptap/Lexical mentions) complete a flat list of `@people`. This completes *paths into structured data*: type `{{user.` and see that object's keys with their real values previewed, drill into arrays by index, and see unknown variables flagged in the text as you type. It includes a resolver and validator for the same syntax, so the editor and the runtime agree.

## Operating Context
Evaluated inside a browser tab next to the developer's own code. They'll try typing in the demo, read the snippet, check bundle size and license, and glance at the API. Installed via `npm install type-ahead-mention`.

## Capabilities and Constraints
- `<MentionInput>` (CodeMirror 6): single-line or multiline, value previews in suggestions, variable chips, wavy-underline for unknown paths, auto-closing `}}`, custom delimiters (`{{ }}`, `${ }`, `[[ ]]`…), light/dark/auto color scheme, CSS-variable theming, `onSubmit`, ref handle (`insertVariable`, `focus`, `openSuggestions`), disabled/readOnly, aria-label/id.
- `useMentionSuggestions`: same completion for a plain `<input>`/`<textarea>` (combobox ARIA, portal list).
- Pure helpers: `resolveTemplate`, `validateTemplate`, `parseTemplate`, `getValueAtPath`, `TemplatePath<T>` type.
- CodeMirror extension `templateVariables()` for existing CodeMirror editors.
- One install: CodeMirror packages are regular dependencies; only React/ReactDOM are peers. MIT licensed. Tested with Vitest (46 tests).
- Package name stays `type-ahead-mention` (confirmed by the user, 2026-09-24).
- Landing page lives in `demo/` (Vite + React), deployed to GitHub Pages at `https://rahulpatwa1303.github.io/type-ahead-mention/`, and imports the library from source.

## Brand Commitments
None. The previous purple-gradient landing page is explicitly not binding; start fresh. Author: Rahul Patwa (github.com/rahulpatwa1303).

## Evidence on Hand
Code, tests and the live demo only. No users, testimonials, company logos, download milestones or benchmarks exist; never fabricate them. Factual numbers may be measured from the build (bundle size) and the test suite.

## Product Principles
1. Show, don't claim: the working editor is the pitch; every claim on the page should be demonstrable in the page.
2. Structured data is the differentiator: lead with nested paths and value previews, not generic "autocomplete".
3. Minutes to working: install line and a copy-pasteable snippet are always one glance away.
4. Honest about scope: say what it is (a `{{variable}}` editor), and point `@mention` seekers elsewhere.

## Accessibility & Inclusion
Keyboard-complete (arrows, Enter/Tab, Escape); combobox/listbox ARIA on the plain-input hook; respect `prefers-reduced-motion` and `prefers-color-scheme`.
