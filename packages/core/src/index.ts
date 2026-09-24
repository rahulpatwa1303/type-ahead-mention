// Main entry. Nothing here imports CodeMirror: MentionInput loads it on demand,
// and the CodeMirror extensions live in 'type-ahead-mention/codemirror'.

export { MentionInput, preloadEditor } from './MentionInput';
export type { MentionInputProps, MentionInputHandle } from './MentionInput';

export { TemplateTextarea } from './TemplateTextarea';
export type { TemplateTextareaProps } from './TemplateTextarea';

export { useMentionSuggestions } from './useMentionSuggestions';
export type { UseMentionSuggestionsOptions } from './useMentionSuggestions';
export { useMentionResolver } from './useMentionResolver';
export { SuggestionPopper } from './SuggestionPopper';
export type { SuggestionPopperProps, PopupOption } from './SuggestionPopper';

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
  formatMention,
  parseMentions,
  replaceMentions,
  getMentionMatch,
} from './template';
export type {
  SuggestionNode,
  Delimiters,
  TemplateVariable,
  TemplatePath,
  ResolveOptions,
  SuggestionItem,
  CompletionMatch,
  MentionItem,
  ParsedMention,
  MentionMatch,
} from './template';
export type { MentionSource } from './mentions';

export { injectStyles } from './styles';
