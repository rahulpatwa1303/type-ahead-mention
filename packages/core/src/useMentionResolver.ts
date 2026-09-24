// useMentionResolver.ts

import { useMemo } from 'react';
import { resolveTemplate, type ResolveOptions, type SuggestionNode } from './template';

/**
 * Resolves a template against data, memoized.
 * @example useMentionResolver('Hello {{user.name}}', { user: { name: 'Jane' } }) // 'Hello Jane'
 */
export const useMentionResolver = (
  template: string,
  data: SuggestionNode,
  options?: ResolveOptions
): string =>
  useMemo(
    () => resolveTemplate(template, data, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [template, data, options?.delimiters?.open, options?.delimiters?.close, options?.missing, options?.format]
  );
