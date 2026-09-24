// MentionInput.tsx
// The public editor component. It renders the light TemplateTextarea at once,
// loads CodeMirror in the background, then swaps to the full editor. Apps that
// never render it never download CodeMirror.

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { MentionSource } from './mentions';
import { TemplateTextarea } from './TemplateTextarea';
import type { Delimiters, SuggestionNode } from './template';
import type { EditorInputProps } from './editor/EditorInput';

export interface MentionInputProps {
  /** The template text */
  value: string;
  /** Called with the new text on every edit */
  onChange: (value: string) => void;
  /** Data whose keys are suggested. Nested objects and arrays are supported. */
  suggestions: SuggestionNode;
  placeholder?: string;
  /**
   * Behave like a textarea (Enter adds a line) instead of a single-line input.
   * @default false
   */
  multiline?: boolean;
  /**
   * The strings that open and close a variable.
   * @default { open: '{{', close: '}}' }
   */
  delimiters?: Delimiters;
  /**
   * Show a preview of each value next to its suggestion.
   * @default true
   */
  showValues?: boolean;
  /**
   * Show variables as chips in the text.
   * @default true
   */
  highlight?: boolean;
  /**
   * Underline variables that don't exist in `suggestions`.
   * @default true
   */
  validate?: boolean;
  /**
   * Suggest people (or anything else) after `@`. Picked items are stored as
   * `@[Label](id)` and shown as chips.
   * @example mentions={{ trigger: '@', search: (q) => api.users(q) }}
   */
  mentions?: MentionSource | MentionSource[];
  /**
   * `'auto'` follows the OS setting.
   * @default 'light'
   */
  colorScheme?: 'light' | 'dark' | 'auto';
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  /** Enter in single-line mode, or Mod-Enter in multiline mode */
  onSubmit?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** `id` for the editable element, so a `<label htmlFor>` can point at it */
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  /** Styles for the outer box. Also accepts CSS variables like `--tam-accent`. */
  style?: React.CSSProperties;
  className?: string;
  /** Extra CodeMirror extensions */
  extensions?: Extension[];
  /**
   * Minimum visible lines while the editor loads, in multiline mode.
   * @default 1
   */
  rows?: number;
}

export interface MentionInputHandle {
  focus: () => void;
  blur: () => void;
  /** Inserts `{{path}}` at the cursor, replacing any selection */
  insertVariable: (path: string) => void;
  /** Opens the suggestion list at the cursor */
  openSuggestions: () => void;
  /** Accepts the highlighted suggestion. Returns false when the list isn't open. */
  acceptSuggestion: () => boolean;
  /** Moves the highlight in the open list by `by` rows (negative moves up) */
  moveSuggestion: (by: number) => void;
  /** True while the suggestion list is open with results */
  isSuggesting: () => boolean;
  /** The underlying CodeMirror view, or null until the editor has loaded */
  view: EditorView | null;
}


type EditorComponent = React.ForwardRefExoticComponent<
  EditorInputProps & React.RefAttributes<MentionInputHandle>
>;

let loaded: EditorComponent | null = null;
let loading: Promise<EditorComponent> | null = null;

/**
 * Starts downloading the editor (CodeMirror) now, e.g. on hover or route change.
 * MentionInput calls this itself on mount.
 */
export const preloadEditor = (): Promise<EditorComponent> =>
  (loading ??= import('./editor/EditorInput').then((m) => (loaded = m.EditorInput)));

export const MentionInput = /* @__PURE__ */ forwardRef<MentionInputHandle, MentionInputProps>(function MentionInput(
  props,
  ref
) {
  const [Editor, setEditor] = useState<EditorComponent | null>(() => loaded);
  const area = useRef<HTMLTextAreaElement>(null);
  const editor = useRef<MentionInputHandle>(null);
  const handoff = useRef<{ focused: boolean; selection: number } | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    if (Editor) return;
    let live = true;
    preloadEditor().then((component) => {
      if (!live) return;
      const el = area.current;
      handoff.current = el
        ? { focused: el.ownerDocument.activeElement === el, selection: el.selectionStart ?? 0 }
        : null;
      setEditor(() => component);
    });
    return () => {
      live = false;
    };
  }, [Editor]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => (editor.current ? editor.current.focus() : area.current?.focus()),
      blur: () => (editor.current ? editor.current.blur() : area.current?.blur()),
      insertVariable: (path) => {
        if (editor.current) return editor.current.insertVariable(path);
        const el = area.current;
        const { value, onChange, delimiters = { open: '{{', close: '}}' } } = propsRef.current;
        const insert = `${delimiters.open}${path}${delimiters.close}`;
        const from = el?.selectionStart ?? value.length;
        const to = el?.selectionEnd ?? value.length;
        onChange(value.slice(0, from) + insert + value.slice(to));
      },
      openSuggestions: () => (editor.current ? editor.current.openSuggestions() : area.current?.focus()),
      acceptSuggestion: () => editor.current?.acceptSuggestion() ?? false,
      moveSuggestion: (by) => editor.current?.moveSuggestion(by),
      isSuggesting: () => editor.current?.isSuggesting() ?? false,
      get view() {
        return editor.current?.view ?? null;
      },
    }),
    []
  );

  if (!Editor) {
    const { extensions: _extensions, ...rest } = props;
    return (
      <TemplateTextarea
        ref={area}
        {...rest}
        // The editor sizes to its content, so the stand-in does too
        rows={props.rows ?? 1}
        className={props.className ? `tam-loading ${props.className}` : 'tam-loading'}
      />
    );
  }
  const start = handoff.current;
  return (
    <Editor
      ref={editor}
      {...props}
      autoFocus={props.autoFocus || start?.focused}
      initialSelection={start?.focused ? start.selection : undefined}
    />
  );
});
