import type { SuggestionNode } from '../types';

/**
 * Find a node in the suggestion tree by following a path
 */
export const findNodeForPath = (
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
 * Safely resolves a value from a nested object using a dot-notation path string.
 */
export function resolvePath(path: string, data: SuggestionNode): any {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, data as any);
}
