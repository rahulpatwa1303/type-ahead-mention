// suggestion-helpers.ts

export type SuggestionNode = {
  [key: string]: SuggestionNode | any;
};

/**
 * Finds a nested node within the suggestion tree based on a path.
 */
const findNodeForPath = (
  path: string[],
  tree: SuggestionNode
): SuggestionNode | null => {
  let currentNode = tree;
  for (const part of path) {
    if (
      typeof currentNode === 'object' &&
      currentNode !== null &&
      part in currentNode
    ) {
      currentNode = currentNode[part];
    } else {
      return null;
    }
  }
  return currentNode;
};

/**
 * Creates a CodeMirror autocompletion source.
 */
export const createCustomCompleter = (suggestionTree: SuggestionNode) => {
  return (context: import('@codemirror/autocomplete').CompletionContext) => {
    const line = context.state.doc.lineAt(context.pos);
    const lineText = line.text;
    // Find the last {{ before the cursor
    const lastOpenBrace = lineText.lastIndexOf('{{', context.pos - line.from);

    if (lastOpenBrace === -1) return null;

    // Check if the cursor is inside a closed {{...}} block, and if so, don't show suggestions
    const nextCloseBrace = lineText.indexOf('}}', lastOpenBrace);
    const cursorIndexInLine = context.pos - line.from;
    if (nextCloseBrace !== -1 && cursorIndexInLine > nextCloseBrace + 1) {
      return null;
    }

    // The content inside the braces up to the cursor
    const braceContent = lineText.substring(
      lastOpenBrace + 2,
      cursorIndexInLine
    );

    // This regex matches the word right before the cursor
    const word = context.matchBefore(/\w*$/);

    const lastDotIndex = braceContent.lastIndexOf('.');
    let path: string[] = [];

    if (lastDotIndex !== -1) {
      const pathString = braceContent.substring(0, lastDotIndex);
      path = pathString.split('.').filter((p) => p);
    }

    const targetNode = findNodeForPath(path, suggestionTree);

    if (targetNode && typeof targetNode === 'object') {
      // Handle arrays by suggesting indices
      if (Array.isArray(targetNode)) {
        const from = word ? word.from : context.pos;
        const replaceFrom = lastDotIndex !== -1 ? from : lastOpenBrace + 2;

        return {
          from: replaceFrom,
          options: targetNode.map((_, index) => ({
            label: `${index}`,
            type: 'property',
            apply: `${index}`,
          })),
          validFor: /^[\w$]*$/,
        };
      }

      // Handle objects
      const from = word ? word.from : context.pos;
      const replaceFrom = lastDotIndex !== -1 ? from : lastOpenBrace + 2;

      return {
        from: replaceFrom,
        options: Object.keys(targetNode).map((key) => ({
          label: key,
          type: 'property',
          apply: `${key}`,
        })),
        validFor: /^[\w$]*$/,
      };
    }
    return null;
  };
};