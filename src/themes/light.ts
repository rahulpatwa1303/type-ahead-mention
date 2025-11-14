import { Theme } from './types';

export const lightTheme: Theme = {
  name: 'light',
  popper: {
    container: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
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
      color: '#111827',
      fontSize: '14px',
    },
    itemActive: {
      backgroundColor: '#60a5fa',
      color: '#ffffff',
    },
    itemHover: {
      backgroundColor: '#e5e7eb',
    },
  },
  editor: {
    background: '#f9fafb',
    foreground: '#111827',
    border: '#e5e7eb',
    focusBorder: '#60a5fa',
  },
};
