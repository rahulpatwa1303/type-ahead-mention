// styles.ts
// The component's stylesheet, themeable through CSS custom properties.
// Injected once on first mount so there's no CSS file to import.

export const STYLE_ID = 'type-ahead-mention-styles';
export const EDITOR_STYLE_ID = 'type-ahead-mention-editor-styles';

const light = `
  --tam-bg: #ffffff;
  --tam-text: #1c1d21;
  --tam-muted: #6b6f7b;
  --tam-border: #d5d7dd;
  --tam-accent: #5b4bdb;
  --tam-var-bg: #efedfc;
  --tam-var-text: #4636c4;
  --tam-invalid: #d03a2f;
  --tam-popup-bg: #ffffff;
  --tam-popup-border: #e2e3e8;
  --tam-selected-bg: #efedfc;
  --tam-selected-text: #2d2181;
`;

const dark = `
  --tam-bg: #15161a;
  --tam-text: #e9e9ec;
  --tam-muted: #9a9daa;
  --tam-border: #33353d;
  --tam-accent: #9d92ff;
  --tam-var-bg: #2a2650;
  --tam-var-text: #c4bdff;
  --tam-invalid: #ff7a70;
  --tam-popup-bg: #1d1e23;
  --tam-popup-border: #33353d;
  --tam-selected-bg: #2f2a5c;
  --tam-selected-text: #ffffff;
`;

export const css = `
.tam-root {${light}}
.tam-root[data-scheme="dark"] {${dark}}
@media (prefers-color-scheme: dark) {
  .tam-root[data-scheme="auto"] {${dark}}
}
.tam-root {
  display: block;
  box-sizing: border-box;
  border: 1px solid var(--tam-border);
  border-radius: var(--tam-radius, 8px);
  background: var(--tam-bg);
  color: var(--tam-text);
  font: inherit;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.tam-root:focus-within {
  border-color: var(--tam-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--tam-accent) 22%, transparent);
}
.tam-root[data-disabled="true"] { opacity: 0.6; cursor: not-allowed; }

.tam-var {
  background: var(--tam-var-bg);
  color: var(--tam-var-text);
  border-radius: 4px;
  padding: 1px 1px;
}
.tam-var-invalid {
  background: color-mix(in srgb, var(--tam-invalid) 12%, transparent);
  color: var(--tam-invalid);
  text-decoration: wavy underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.tam-mention {
  display: inline;
  padding: 1px 6px 1px 2px;
  margin: 0 1px;
  border-radius: var(--tam-mention-radius, 999px);
  background: var(--tam-mention-bg, var(--tam-var-bg));
  color: var(--tam-mention-text, var(--tam-var-text));
  font-weight: 600;
  white-space: nowrap;
}
.tam-mention:not(:has(img)) { padding-left: 6px; }
.tam-avatar {
  display: inline-block;
  vertical-align: -0.2em;
  margin-right: 4px;
  width: 1.1em;
  height: 1.1em;
  border-radius: var(--tam-avatar-radius, 50%);
  object-fit: cover;
  flex: none;
}
.tam-option-avatar {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: none;
  overflow: hidden;
  border-radius: var(--tam-avatar-radius, 50%);
  background: var(--tam-var-bg);
  color: var(--tam-var-text);
  font-size: 11px;
  font-weight: 700;
  align-self: center;
}
.tam-option-avatar img { width: 100%; height: 100%; object-fit: cover; }
.tam-popup { position: fixed; z-index: 1000; min-width: 200px; max-height: 16em; overflow-y: auto; margin: 0; list-style: none; }
.tam-popup-label { flex: 1; }

.tam-area { display: grid; position: relative; }
.tam-area > .tam-backdrop,
.tam-area > .tam-input {
  grid-area: 1 / 1;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  border: 0;
  padding: var(--tam-padding, 8px 12px);
  font: inherit;
  letter-spacing: inherit;
  line-height: 1.55;
  tab-size: 4;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: normal;
}
.tam-area > .tam-backdrop {
  color: var(--tam-text);
  overflow: hidden;
  pointer-events: none;
  min-height: calc(var(--tam-rows, 1) * 1.55em);
  min-height: calc(var(--tam-rows, 1) * 1.55em + 16px);
}
.tam-area > .tam-input {
  resize: none;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: transparent;
  color: transparent;
  caret-color: var(--tam-accent);
  outline: none;
  -webkit-text-fill-color: transparent;
}
.tam-area > .tam-input::placeholder { color: var(--tam-muted); -webkit-text-fill-color: var(--tam-muted); }
.tam-area > .tam-input::selection { background: color-mix(in srgb, var(--tam-accent) 24%, transparent); }
.tam-area[data-multiline="false"] > .tam-backdrop,
.tam-area[data-multiline="false"] > .tam-input { white-space: pre; overflow-wrap: normal; }
.tam-area[data-multiline="false"] > .tam-input { overflow-x: auto; scrollbar-width: none; }
.tam-area[data-multiline="false"] > .tam-input::-webkit-scrollbar { display: none; }
/* No padding in the backdrop: every glyph must keep its width */
.tam-area .tam-var { padding: 0; box-shadow: 0 0 0 1px var(--tam-var-bg); }
.tam-mention-raw {
  background: var(--tam-mention-bg, var(--tam-var-bg));
  color: var(--tam-mention-text, var(--tam-var-text));
  box-shadow: 0 0 0 1px var(--tam-mention-bg, var(--tam-var-bg));
  border-radius: 2px;
}
.tam-dim { opacity: 0.35; }


.tam-root .cm-tooltip.cm-tooltip-autocomplete,
.tam-popup {
  background: var(--tam-popup-bg);
  color: var(--tam-text);
  border: 1px solid var(--tam-popup-border);
  border-radius: 8px;
  box-shadow: 0 8px 24px -6px rgb(0 0 0 / 0.18), 0 2px 6px -2px rgb(0 0 0 / 0.08);
  padding: 4px;
  font-size: 13px;
  overflow: hidden;
}
.tam-root .cm-tooltip-autocomplete > ul > li,
.tam-popup-option {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 5px 8px !important;
  border-radius: 5px;
  line-height: 1.4;
  cursor: pointer;
}
.tam-root .cm-tooltip-autocomplete > ul > li[aria-selected],
.tam-popup-option[aria-selected="true"] {
  background: var(--tam-selected-bg);
  color: var(--tam-selected-text);
}
.tam-root .cm-completionDetail,
.tam-popup-detail {
  margin-left: auto;
  font-style: normal;
  color: var(--tam-muted);
  font-size: 12px;
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tam-root .tam-option.cm-completion-namespace .cm-completionLabel::after,
.tam-popup-option[data-branch="true"] .tam-popup-label::after {
  content: ".";
  color: var(--tam-muted);
}
`;

/** Rules for the CodeMirror editor, injected when it first loads. */
export const editorCss = `.tam-root .cm-editor { background: transparent; color: inherit; }
.tam-root .cm-editor.cm-focused { outline: none; }
.tam-root .cm-scroller { font-family: inherit; line-height: 1.55; }
.tam-root .cm-content {
  padding: var(--tam-padding, 8px 12px);
  font-family: inherit;
  caret-color: var(--tam-accent);
}
.tam-root .cm-line { padding: 0; }
.tam-root[data-multiline="false"] .cm-scroller { overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
.tam-root[data-multiline="false"] .cm-content { white-space: pre; }
.tam-root .cm-placeholder { color: var(--tam-muted); }
.tam-root .cm-selectionBackground,
.tam-root .cm-focused .cm-selectionBackground {
  background: color-mix(in srgb, var(--tam-accent) 24%, transparent) !important;
}
.tam-root .cm-cursor { border-left-color: var(--tam-accent); }
.tam-root .cm-tooltip-autocomplete > ul {
  font-family: inherit;
  max-height: 16em;
  min-width: 200px;
}
.tam-root .cm-completionLabel { flex: 1; }
.tam-root .cm-completionMatchedText { text-decoration: none; font-weight: 600; }
.tam-root .cm-tooltip.cm-completionInfo {
  background: var(--tam-popup-bg);
  color: var(--tam-text);
  border: 1px solid var(--tam-popup-border);
  border-radius: 8px;
  padding: 8px 10px;
  max-width: 320px;
  box-shadow: 0 8px 24px -6px rgb(0 0 0 / 0.18);
}
.tam-info-path { font-size: 11px; color: var(--tam-muted); margin-bottom: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.tam-info-value { margin: 0; font-size: 12px; white-space: pre-wrap; word-break: break-word; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.tam-root .cm-tooltip-autocomplete > ul > li.tam-person { align-items: center; }
.tam-root .cm-tooltip-autocomplete > ul > li.tam-status {
  color: var(--tam-muted);
  font-style: italic;
  cursor: default;
}
.tam-root .cm-tooltip-autocomplete > ul > li.tam-status[aria-selected] {
  background: transparent;
  color: var(--tam-muted);
}`;

const inject = (doc: Document | undefined, id: string, text: string) => {
  if (!doc || doc.getElementById(id)) return;
  const style = doc.createElement('style');
  style.id = id;
  style.textContent = text;
  // Prepend so consumer stylesheets win on equal specificity
  doc.head.prepend(style);
};

/** Adds the stylesheet to the document once. Safe to call during SSR (does nothing). */
export const injectStyles = (doc: Document | undefined = globalThis.document) =>
  inject(doc, STYLE_ID, css);

/** Adds the editor's stylesheet. Called by the editor when it loads. */
export const injectEditorStyles = (doc: Document | undefined = globalThis.document) => {
  injectStyles(doc);
  // After the base sheet, so editor rules win where they overlap
  if (!doc || doc.getElementById(EDITOR_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = EDITOR_STYLE_ID;
  style.textContent = editorCss;
  doc.getElementById(STYLE_ID)!.after(style);
};
