// Components
export { SmartInput } from './components/SmartInput/SmartInput';
export { SuggestionPopper } from './components/SuggestionPopper/SuggestionPopper';

// Hooks
export { useMentions } from './hooks/useMentions';
export { useSuggestions } from './hooks/useSuggestions';
export { useCodeMirrorMentions } from './hooks/useCodeMirrorMentions';
export { useSmartMentions } from './hooks/useSmartMentions';

// Utilities
export {
  evaluateTemplateString,
  ExpressionEvaluator,
} from './utils/template-evaluator';
export { findNodeForPath, resolvePath } from './utils/path-resolver';

// Themes
export { defaultTheme, darkTheme } from './themes/default';
export { lightTheme } from './themes/light';

// Types
export type {
  SuggestionNode,
  SmartInputConfig,
  TemplateEditorConfig,
  EvaluationOptions,
  ExpressionContext,
  Theme,
} from './types';

// Configurations
export { defaultSmartInputConfig } from './components/SmartInput/SmartInputConfig';

// Legacy exports for backward compatibility
export { useCaretPosition as useCaretPosition_legacy, useMentions as useMentions_legacy } from './useMention';
export { replaceMentions } from './useMention';