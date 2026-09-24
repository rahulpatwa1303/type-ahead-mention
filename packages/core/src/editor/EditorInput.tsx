// editor/EditorInput.tsx
// The CodeMirror editor. Loaded on demand by MentionInput; don't import it from the main entry.

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { Annotation, Compartment, EditorState, Prec, type Extension } from '@codemirror/state';
import { EditorView, keymap, placeholder as placeholderExt } from '@codemirror/view';
import { history, historyKeymap, defaultKeymap } from '@codemirror/commands';
import {
  acceptCompletion,
  completionStatus,
  moveCompletionSelection,
  startCompletion,
} from '@codemirror/autocomplete';
import { singleLine, templateVariables } from '../codemirror';
import { toSources } from '../mentions';
import { injectEditorStyles } from '../styles';
import { DEFAULT_DELIMITERS } from '../template';
import type { MentionInputHandle, MentionInputProps } from '../MentionInput';

const External = Annotation.define<boolean>();

export interface EditorInputProps extends MentionInputProps {
  /** Cursor position to start with (used when taking over from the textarea) */
  initialSelection?: number;
}

export const EditorInput = /* @__PURE__ */ forwardRef<MentionInputHandle, EditorInputProps>(
  function EditorInput(
    {
      value,
      onChange,
      suggestions,
      placeholder,
      multiline = false,
      delimiters = DEFAULT_DELIMITERS,
      showValues = true,
      highlight = true,
      validate = true,
      mentions,
      colorScheme = 'light',
      disabled = false,
      readOnly = false,
      autoFocus = false,
      onSubmit,
      onFocus,
      onBlur,
      id,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      style,
      className,
      extensions,
      initialSelection,
    },
    ref
  ) {
    const hostRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const compartments = useRef({
      config: new Compartment(),
      mode: new Compartment(),
      placeholder: new Compartment(),
      editable: new Compartment(),
      attrs: new Compartment(),
      user: new Compartment(),
    }).current;

    // Latest callbacks, read from inside CodeMirror without reconfiguring it
    const callbacks = useRef({ onChange, onSubmit, onFocus, onBlur });
    callbacks.current = { onChange, onSubmit, onFocus, onBlur };

    const mentionSources = toSources(mentions);
    const configExt = () =>
      templateVariables({
        data: suggestions,
        delimiters,
        showValues,
        highlight,
        validate,
        mentions: mentionSources,
      });

    const submit = (view: EditorView) => {
      if (!callbacks.current.onSubmit) return false;
      callbacks.current.onSubmit(view.state.doc.toString());
      return true;
    };

    // Prec.high so these win over the default Enter binding.
    // Suggestions still win over these, since autocompletion uses Prec.highest.
    const modeExt = (): Extension =>
      multiline
        ? [EditorView.lineWrapping, Prec.high(keymap.of([{ key: 'Mod-Enter', run: submit }]))]
        : [
            singleLine(),
            Prec.high(
              keymap.of([
                { key: 'Enter', run: (view) => submit(view) || true },
                { key: 'Shift-Enter', run: () => true },
              ])
            ),
          ];

    const editableExt = () => [
      EditorView.editable.of(!disabled),
      EditorState.readOnly.of(readOnly || disabled),
    ];

    const attrsExt = () =>
      EditorView.contentAttributes.of({
        ...(id ? { id } : {}),
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
        ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
        'aria-multiline': String(multiline),
      });

    useLayoutEffect(() => {
      injectEditorStyles(hostRef.current!.ownerDocument);
      const view = new EditorView({
        parent: hostRef.current!,
        state: EditorState.create({
          doc: value,
          selection:
            initialSelection !== undefined
              ? { anchor: Math.min(initialSelection, value.length) }
              : undefined,
          extensions: [
            history(),
            Prec.high(keymap.of([{ key: 'Tab', run: acceptCompletion }])),
            keymap.of([...defaultKeymap, ...historyKeymap]),
            compartments.config.of(configExt()),
            compartments.mode.of(modeExt()),
            compartments.placeholder.of(placeholder ? placeholderExt(placeholder) : []),
            compartments.editable.of(editableExt()),
            compartments.attrs.of(attrsExt()),
            compartments.user.of(extensions ?? []),
            EditorView.updateListener.of((update) => {
              if (
                update.docChanged &&
                !update.transactions.some((tr) => tr.annotation(External))
              ) {
                callbacks.current.onChange(update.state.doc.toString());
              }
              if (update.focusChanged) {
                if (update.view.hasFocus) callbacks.current.onFocus?.();
                else callbacks.current.onBlur?.();
              }
            }),
          ],
        }),
      });
      viewRef.current = view;
      if (autoFocus) view.focus();
      return () => {
        view.destroy();
        viewRef.current = null;
      };
      // Created once; props below are applied through compartments
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reconfigure = (compartment: Compartment, ext: Extension) =>
      viewRef.current?.dispatch({ effects: compartment.reconfigure(ext) });

    const first = useRef(true);
    useEffect(() => {
      if (first.current) return;
      reconfigure(compartments.config, configExt());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suggestions, delimiters.open, delimiters.close, showValues, highlight, validate, mentions]);

    useEffect(() => {
      if (first.current) return;
      reconfigure(compartments.mode, modeExt());
      reconfigure(compartments.attrs, attrsExt());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [multiline, id, ariaLabel, ariaDescribedBy]);

    useEffect(() => {
      if (first.current) return;
      reconfigure(compartments.placeholder, placeholder ? placeholderExt(placeholder) : []);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placeholder]);

    useEffect(() => {
      if (first.current) return;
      reconfigure(compartments.editable, editableExt());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled, readOnly]);

    useEffect(() => {
      if (first.current) return;
      reconfigure(compartments.user, extensions ?? []);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [extensions]);

    // Controlled value: apply outside changes without echoing onChange
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      const current = view.state.doc.toString();
      if (value === current) return;
      const head = Math.min(view.state.selection.main.head, value.length);
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
        selection: { anchor: head },
        annotations: [External.of(true)],
      });
    }, [value]);

    useEffect(() => {
      first.current = false;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => viewRef.current?.focus(),
        blur: () => viewRef.current?.contentDOM.blur(),
        insertVariable: (path: string) => {
          const view = viewRef.current;
          if (!view) return;
          const insert = `${delimiters.open}${path}${delimiters.close}`;
          const { from, to } = view.state.selection.main;
          view.dispatch({
            changes: { from, to, insert },
            selection: { anchor: from + insert.length },
            userEvent: 'input',
          });
          view.focus();
        },
        openSuggestions: () => {
          const view = viewRef.current;
          if (!view) return;
          view.focus();
          if (completionStatus(view.state) === null) startCompletion(view);
        },
        acceptSuggestion: () => {
          const view = viewRef.current;
          return !!view && completionStatus(view.state) === 'active' && acceptCompletion(view);
        },
        moveSuggestion: (by: number) => {
          const view = viewRef.current;
          if (!view || completionStatus(view.state) !== 'active') return;
          for (let i = 0; i < Math.abs(by); i++) moveCompletionSelection(by > 0)(view);
        },
        isSuggesting: () => {
          const view = viewRef.current;
          return !!view && completionStatus(view.state) === 'active';
        },
        get view() {
          return viewRef.current;
        },
      }),
      [delimiters.open, delimiters.close]
    );

    return (
      <div
        ref={hostRef}
        className={className ? `tam-root ${className}` : 'tam-root'}
        style={style}
        data-scheme={colorScheme}
        data-multiline={String(multiline)}
        data-disabled={String(disabled)}
      />
    );
  }
);
