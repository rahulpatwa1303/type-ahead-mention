import { useMemo, useCallback } from 'react';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import type { SuggestionNode, SmartInputConfig } from '..';
import { findNodeForPath } from '../utils/path-resolver';

interface UseCodeMirrorMentionsProps {
  suggestionsData: SuggestionNode;
  config?: Partial<SmartInputConfig>;
}

interface UseCodeMirrorMentionsReturn {
  /** CodeMirror extension for autocomplete */
  autocompletionExtension: any;
  /** The trigger string being used */
  trigger: string;
  /** Optional closing trigger */
  closingTrigger?: string;
}

/**
 * Hook for CodeMirror-based mentions/autocomplete
 * Returns a CodeMirror extension that provides autocomplete functionality
 */
export const useCodeMirrorMentions = ({
  suggestionsData,
  config = {},
}: UseCodeMirrorMentionsProps): UseCodeMirrorMentionsReturn => {
  const trigger = config.trigger?.trigger || '{{';
  const closingTrigger = config.trigger?.closingTrigger;
  const caseSensitive = config.caseSensitive ?? false;

  /**
   * Create the completion function for CodeMirror
   */
  const createCompleter = useCallback(
    (context: CompletionContext): CompletionResult | null => {
      const line = context.state.doc.lineAt(context.pos);
      const lineText = line.text;
      const lastOpenBrace = lineText.lastIndexOf(trigger, context.pos - line.from);

      if (lastOpenBrace === -1) return null;

      const cursorIndexInLine = context.pos - line.from;
      const braceContent = lineText.substring(
        lastOpenBrace + trigger.length,
        cursorIndexInLine
      );

      // If there's a closing trigger and we've already typed it, don't show suggestions
      if (closingTrigger && braceContent.includes(closingTrigger)) {
        return null;
      }

      const word = context.matchBefore(/\w*/);
      const lastDotIndex = braceContent.lastIndexOf('.');
      let path: string[] = [];

      if (lastDotIndex !== -1) {
        const pathString = braceContent.substring(0, lastDotIndex);
        path = pathString.split('.').filter((p) => p);
      }

      const targetNode = findNodeForPath(path, suggestionsData);
      
      if (
        targetNode &&
        typeof targetNode === 'object' &&
        !Array.isArray(targetNode)
      ) {
        const keys = Object.keys(targetNode);
        const incompletePart = braceContent.split('.').pop() || '';

        // Filter based on the incomplete part
        const filteredKeys = incompletePart
          ? keys.filter((key) =>
              caseSensitive
                ? key.startsWith(incompletePart)
                : key.toLowerCase().startsWith(incompletePart.toLowerCase())
            )
          : keys;

        return {
          from: word?.from ?? context.pos,
          options: filteredKeys.map((key) => ({
            label: key,
            type: 'property',
            apply: key,
            detail: typeof targetNode[key] === 'object' ? '{}' : String(targetNode[key]),
          })),
          validFor: /^[\w$]*$/,
        };
      }
      
      return null;
    },
    [suggestionsData, trigger, closingTrigger, caseSensitive]
  );

  /**
   * Create the autocomplete extension
   */
  const autocompletionExtension = useMemo(() => {
    return autocompletion({
      override: [createCompleter],
      activateOnTyping: true,
      closeOnBlur: true,
    });
  }, [createCompleter]);

  return {
    autocompletionExtension,
    trigger,
    closingTrigger,
  };
};
