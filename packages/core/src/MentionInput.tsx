// MentionInput.tsx

import React, { useMemo } from 'react';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { autocompletion } from '@codemirror/autocomplete';
import { keymap } from '@codemirror/view';
import { EditorView } from '@codemirror/view';
import {
  SuggestionNode,
  createCustomCompleter,
} from './suggestion-helpers';

// Theming for the input/textarea look and feel
const editorTheme = EditorView.theme({
  // The editor wrapper
  '&': {
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  // The focused state
  '&.cm-editor.cm-focused': {
    outline: 'none',
    border: '1px solid #1a73e8',
    boxShadow: '0 0 0 3px rgba(26, 115, 232, 0.2)',
  },
  // The content area
  '.cm-content': {
    padding: '3px 8px',
    fontFamily: 'inherit',
  },
  // Hide elements we don't need for an input
  '.cm-gutters, .cm-lineNumbers, .cm-foldGutter': {
    display: 'none',
  },
  // Remove the active line highlight
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-scroller': {
    overflowX: 'auto',
  },
});

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: SuggestionNode;
  placeholder?: string;
  /**
   * If true, the editor will behave like a textarea (allowing new lines).
   * @default false
   */
  multiline?: boolean;
  /** Custom styles for the outer component wrapper */
  style?: React.CSSProperties;
  /** Custom class name for the outer component wrapper */
  className?: string;
  /** Pass any other props to the underlying CodeMirror component */
  codeMirrorProps?: ReactCodeMirrorProps;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  suggestions,
  placeholder,
  multiline = false,
  style,
  className,
  codeMirrorProps,
}) => {
  const extensions = useMemo(() => {
    const baseExtensions = [
      autocompletion({ override: [createCustomCompleter(suggestions)] }),
      editorTheme,
      EditorView.contentAttributes.of({
        'aria-placeholder': placeholder || ''
      })
    ];

    if (multiline) {
      // For textarea behavior, we allow line wrapping
      baseExtensions.push(EditorView.lineWrapping);
    } else {
      // For single-line input behavior, we prevent "Enter" from creating a new line
      baseExtensions.push(
        keymap.of([
          {
            key: 'Enter',
            run: () => true, // Returning true handles the event, preventing a newline
          },
        ])
      );
    }

    return baseExtensions;
  }, [suggestions, placeholder, multiline]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      style={style}
      className={className}
      // For multiline, height is controlled by content; for single-line, it's a fixed height.
      height={multiline ? '100%' : 'auto'}
      minHeight={multiline ? '80px' : undefined}
      // Disable default features we don't want
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        autocompletion: false, // We provide our own override
        searchKeymap: false,
        lintKeymap: false,
        history: true,
      }}
      {...codeMirrorProps}
    />
  );
};