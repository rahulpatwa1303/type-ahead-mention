// useMentionResolver.ts

import { useMemo } from 'react';
import {  getValueByPath } from './mention-helpers';
import { SuggestionNode } from './suggestion-helpers';

/**
 * A React hook that resolves a template string with placeholders against a data object.
 * e.g., "Hello {{user.name}}" + { user: { name: "Jane" } } => "Hello Jane"
 *
 * @param templateString The string containing placeholders like {{user.name}}.
 * @param data The data object to resolve values from.
 * @returns The resolved string.
 */
export const useMentionResolver = (
  templateString: string,
  data: SuggestionNode
): string => {
  const resolvedString = useMemo(() => {
    if (!templateString) {
      return '';
    }

    // This regex finds all instances of {{...}}
    const regex = /{{([\w.]+)}}/g;

    return templateString.replace(regex, (match, path) => {
      // `match` is the full string (e.g., "{{user.name}}")
      // `path` is the captured group (e.g., "user.name")
      const value = getValueByPath(path, data);

      // Handle different types of resolved values
      if (value === null || value === undefined) {
        return ''; // Return an empty string for null/undefined values
      }
      if (typeof value === 'object') {
        return match; // If the path leads to an object, return the original placeholder
      }

      // Convert numbers, booleans, etc., to a string
      return String(value);
    });
  }, [templateString, data]);

  return resolvedString;
};