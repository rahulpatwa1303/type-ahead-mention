import { SmartInputConfig } from '../..';

export const defaultSmartInputConfig: SmartInputConfig = {
  trigger: {
    trigger: '{{',
    closingTrigger: '}}',
  },
  editorTheme: 'dark',
  showLineNumbers: false,
  singleLine: false,
  height: '200px',
  width: '100%',
  allowMultiple: true,
  caseSensitive: false,
};