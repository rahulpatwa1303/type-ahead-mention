// mention-helpers.ts (can be added to your existing helpers file)

import { SuggestionNode } from "./suggestion-helpers";

/**
 * Retrieves a nested value from an object using a dot-notation string path.
 * @param path The path to the value (e.g., "user.address.city").
 * @param data The object to search within.
 * @returns The found value, or the original path wrapped in {{}} if not found.
 */
export const getValueByPath = (path: string, data: SuggestionNode): any => {
  const keys = path.split(".");
  let current: any = data;

  for (const key of keys) {
    // Check if current is a valid object and has the key
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      // If the path is invalid at any point, return the original placeholder
      return `{{${path}}}`;
    }
  }

  return current;
};

const findNodeForPath = (
  path: string[],
  tree: SuggestionNode
): SuggestionNode | null => {
  let currentNode = tree;
  for (const part of path) {
    if (
      typeof currentNode === "object" &&
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
// This function now also returns the trigger text
export const createMentionsExtractor =
  (suggestionTree: SuggestionNode) =>
  (
    text: string,
    cursorPosition: number
  ): { suggestions: string[]; trigger: string | null } => {
    const textUpToCursor = text.substring(0, cursorPosition);
    const lastOpenBrace = textUpToCursor.lastIndexOf("{{");

    if (lastOpenBrace === -1) {
      return { suggestions: [], trigger: null };
    }

    const nextCloseBrace = text.indexOf("}}", lastOpenBrace);
    if (nextCloseBrace !== -1 && cursorPosition > nextCloseBrace + 1) {
      return { suggestions: [], trigger: null };
    }

    const braceContent = textUpToCursor.substring(lastOpenBrace + 2);
    const pathParts = braceContent.split(".").filter((p) => p);

    // The last part is what we're trying to complete
    const trigger = pathParts.pop() || "";

    const targetNode = findNodeForPath(pathParts, suggestionTree);

    if (
      targetNode &&
      typeof targetNode === "object" &&
      !Array.isArray(targetNode)
    ) {
      const suggestions = Object.keys(targetNode).filter((key) =>
        key.toLowerCase().startsWith(trigger.toLowerCase())
      );
      return { suggestions, trigger: braceContent };
    }

    return { suggestions: [], trigger: null };
  };
