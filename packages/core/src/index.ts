export { MentionInput } from './MentionInput';
export type { MentionInputProps, MentionInputHandle } from './MentionInput';

export { useMentionSuggestions } from './useMentionSuggestions';
export type { UseMentionSuggestionsOptions } from './useMentionSuggestions';
export { useMentionResolver } from './useMentionResolver';
export { SuggestionPopper } from './SuggestionPopper';
export type { SuggestionPopperProps } from './SuggestionPopper';

export {
  DEFAULT_DELIMITERS,
  resolveTemplate,
  validateTemplate,
  parseTemplate,
  getValueAtPath,
  getCompletionMatch,
  filterSuggestions,
  previewValue,
  normalizePath,
} from './template';
export type {
  SuggestionNode,
  Delimiters,
  TemplateVariable,
  TemplatePath,
  ResolveOptions,
  SuggestionItem,
  CompletionMatch,
} from './template';

export {
  templateVariables,
  templateCompletionSource,
  templateHighlighter,
  templateConfig,
  singleLine,
} from './codemirror';
export type { TemplateConfig } from './codemirror';

export { injectStyles } from './styles';
