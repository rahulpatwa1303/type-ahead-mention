import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView, keymap } from '@codemirror/view';
import type { SmartInputConfig, SuggestionNode } from './types';
import { defaultSmartInputConfig } from './SmartInputConfig';
import { useCodeMirrorMentions } from '../../hooks/useCodeMirrorMentions';

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: SuggestionNode;
  config?: Partial<SmartInputConfig>;
  style?: React.CSSProperties;
  className?: string;
}

export const SmartInput: React.FC<SmartInputProps> = ({
  value,
  onChange,
  suggestions,
  config: userConfig,
  style = {},
  className = '',
}) => {
  const config = { ...defaultSmartInputConfig, ...userConfig } as SmartInputConfig;
  
  const {
    editorTheme = 'dark',
    showLineNumbers = false,
    singleLine = false,
    height = '200px',
    width = '100%',
  } = config;

  // Use the CodeMirror mentions hook
  const { autocompletionExtension } = useCodeMirrorMentions({
    suggestionsData: suggestions,
    config,
  });

  const handleChange = (val: string) => {
    onChange(val);
  };

  const extensions = useMemo(() => {
    const result = [javascript(), autocompletionExtension];

    if (singleLine) {
      result.push(
        keymap.of([
          {
            key: 'Enter',
            run: () => true,
          },
          {
            key: 'Shift-Enter',
            run: () => true,
          },
        ])
      );

      result.push(
        EditorView.theme({
          '&': {
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '3px 6px',
            backgroundColor: '#FFFFFF',
            outline: 'none',
          },
          '&.cm-editor.cm-focused': {
            outline: 'none',
            border: '2px solid #50A085',
            boxShadow: '0 0 0 2px rgba(80, 160, 133, 0.3)',
          },
          '.cm-activeLine': {
            background: 'none !important',
          },
          '.cm-activeLineGutter': {
            background: 'none !important',
          },
          '.cm-scroller': {
            overflowX: 'auto',
          },
        })
      );
    } else {
      result.push(EditorView.lineWrapping);
    }

    return result;
  }, [showLineNumbers, singleLine, autocompletionExtension]);

  return (
    <CodeMirror
      value={value}
      onChange={handleChange}
      extensions={extensions}
      theme={editorTheme}
      height={singleLine ? 'auto' : height !== 'auto' ? height : '200px'}
      width={width}
      style={{ ...style, outline: 'none' }}
      className={className}
      basicSetup={{
        lineNumbers: showLineNumbers,
        foldGutter: false,
        highlightActiveLine: !singleLine,
      }}
    />
  );
};

export default SmartInput;
