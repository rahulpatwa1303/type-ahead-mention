export type SuggestionNode = {
  [key: string]: SuggestionNode | any;
};

export interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: SuggestionNode;
  theme?: 'light' | 'dark' | any;
  height?: string;
  width?: string;
  style?: React.CSSProperties;
  showLineNumbers?: boolean;
  singleLine?: boolean;
  className?: string;
}

export interface EvaluationOptions {
  throwOnError?: boolean;
  defaultValue?: string;
  customResolvers?: Record<string, (path: string, data: SuggestionNode) => any>;
}

export interface ExpressionContext {
  globals?: Record<string, any>;
  components?: Record<string, any>;
  queries?: Record<string, any>;
  url?: Record<string, any>;
  [key: string]: any;
}