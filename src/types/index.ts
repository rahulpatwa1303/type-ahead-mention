import React from 'react';

export type SuggestionNode = {
  [key: string]: SuggestionNode | any;
};

export type TriggerConfig = {
  /** The string that triggers suggestions (e.g., '@', '{{', '$') */
  trigger: string;
  /** Optional closing string for the trigger (e.g., '}}' for '{{') */
  closingTrigger?: string;
  /** Custom regex pattern to match the trigger */
  pattern?: RegExp;
};

export type SuggestionPopperTheme = {
  container?: React.CSSProperties;
  item?: React.CSSProperties;
  itemActive?: React.CSSProperties;
  itemHover?: React.CSSProperties;
};

export type SuggestionPopperConfig = {
  /** Maximum height of suggestion container */
  maxHeight?: string;
  /** Width of suggestion container */
  width?: string;
  /** Position offset from cursor */
  offset?: { x: number; y: number };
  /** Placement relative to cursor */
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Custom theme */
  theme?: SuggestionPopperTheme;
  /** Custom class names */
  classNames?: {
    container?: string;
    item?: string;
    itemActive?: string;
  };
  /** Show icons in suggestions */
  showIcons?: boolean;
  /** Custom render function for suggestion items */
  renderItem?: (suggestion: string, isActive: boolean) => React.ReactNode;
};

export interface SmartInputConfig {
  /** Trigger configuration */
  trigger: TriggerConfig;
  /** CodeMirror theme */
  editorTheme?: 'light' | 'dark' | any;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Single line mode */
  singleLine?: boolean;
  /** Editor height */
  height?: string;
  /** Editor width */
  width?: string;
  /** Allow multiple mentions */
  allowMultiple?: boolean;
  /** Case sensitive matching */
  caseSensitive?: boolean;
  /** Custom extensions for CodeMirror */
  extensions?: any[];
}

// Keep TemplateEditorConfig as alias for backward compatibility
export type TemplateEditorConfig = SmartInputConfig;

export interface EvaluationOptions {
  throwOnError?: boolean;
  defaultValue?: string;
  customResolvers?: Record<string, (path: string, data: SuggestionNode) => any>;
  /** Format function for resolved values */
  formatValue?: (value: any) => string;
}

export interface ExpressionContext {
  globals?: Record<string, any>;
  components?: Record<string, any>;
  queries?: Record<string, any>;
  url?: Record<string, any>;
  [key: string]: any;
}

export interface Theme {
  name: string;
  popper: {
    container: React.CSSProperties;
    item: React.CSSProperties;
    itemActive: React.CSSProperties;
    itemHover: React.CSSProperties;
  };
  editor?: {
    background?: string;
    foreground?: string;
    border?: string;
    focusBorder?: string;
  };
}