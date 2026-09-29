// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5f3fa',
      100: '#ece7f5',
      200: '#d7ceea',
      300: '#b8a8d9',
      400: '#8972b9',
      500: '#483c72', // exact Figma purple
      600: '#3e3363',
      700: '#342a53',
      800: '#2a2243',
      900: '#1d1730',
      header: '#3d3464',
      accent: '#6c5ce7',
      surface: '#ffffff',
      background: '#f4f5f9',
    },
    risk: {
      critical: '#ef4444',
      criticalBg: '#fee2e2',
      high: '#f59e0b',
      highBg: '#fef3c7',
      medium: '#3b82f6',
      mediumBg: '#e0f2fe',
      low: '#10b981',
      lowBg: '#dcfce7',
    }
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  },
  styles: {
    global: {
      'html, body': {
        bg: '#f4f5f9',
        color: '#1e293b',
        fontSize: '14px',
        lineHeight: '1.5',
      },
      '*': {
        boxSizing: 'border-box',
      }
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
      },
      variants: {
        solid: {
          bg: '#483c72',
          color: 'white',
          _hover: {
            bg: '#3e3363',
            _disabled: {
              bg: '#483c72',
            }
          },
          _active: {
            bg: '#342a53',
          }
        },
        outline: {
          borderColor: '#e2e8f0',
          color: '#334155',
          bg: 'white',
          _hover: {
            bg: '#f8fafc',
            borderColor: '#cbd5e1',
          }
        },
        ghost: {
          color: '#64748b',
          _hover: {
            bg: '#ede9f6',
            color: '#483c72',
          }
        },
      },
    },
    Card: {
      baseStyle: {
        bg: 'white',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: '#eef0f5',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }
    }
  },
});

export default theme;