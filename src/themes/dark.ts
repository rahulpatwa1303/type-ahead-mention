import { Theme } from './types';

export const darkTheme: Theme = {
  name: 'dark',
  popper: {
    container: {
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '6px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      maxHeight: '200px',
      overflowY: 'auto',
      padding: '4px',
      zIndex: 1000,
    },
    item: {
      padding: '8px 12px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'background-color 0.15s',
      color: '#f9fafb',
      fontSize: '14px',
    },
    itemActive: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    itemHover: {
      backgroundColor: '#374151',
    },
  },
  editor: {
    background: '#1f2937',
    foreground: '#f9fafb',
    border: '#374151',
    focusBorder: '#3b82f6',
  },
};
