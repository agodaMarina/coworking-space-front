/**
 * PrimeNG Theme Configuration
 * Maps Figma design colors and typography to PrimeNG tokens
 */

export const PRIMENG_THEME_CONFIG = {
  colors: {
    primary: '#2563eb', // Figma blue - main CTA buttons
    secondary: '#64748b', // Figma slate - secondary text
    accent: '#10b981', // Figma green - hover states, success
    warning: '#f59e0b', // Figma amber - alerts
    error: '#ef4444', // Figma red - errors
    success: '#10b981', // Figma green - success messages
    info: '#3b82f6', // Blue - info messages
    light: '#f8fafc', // Figma light background
    dark: '#0f172a', // Figma dark text
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    headings: {
      h1: { fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2' },
      h2: { fontSize: '2rem', fontWeight: '700', lineHeight: '1.3' },
      h3: { fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.4' },
      h4: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.5' },
      h5: { fontSize: '1.125rem', fontWeight: '600', lineHeight: '1.5' },
      h6: { fontSize: '1rem', fontWeight: '600', lineHeight: '1.5' },
    },
    body: { fontSize: '1rem', lineHeight: '1.5', color: '#475569' },
    small: { fontSize: '0.875rem', lineHeight: '1.5', color: '#64748b' },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
  },

  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1.25rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
  },
};

/**
 * PrimeNG CSS Variables Override
 * Used to customize the Lara theme to match Figma design
 */
export const getPrimeNGCSSVariables = () => ({
  '--p-primary-color': '#2563eb',
  '--p-primary-600': '#1d4ed8',
  '--p-primary-700': '#1e40af',
  '--p-surface-50': '#f8fafc',
  '--p-surface-100': '#f1f5f9',
  '--p-surface-200': '#e2e8f0',
  '--p-surface-500': '#64748b',
  '--p-surface-800': '#1e293b',
  '--p-surface-900': '#0f172a',
  '--p-green-500': '#10b981',
  '--p-red-500': '#ef4444',
  '--p-amber-500': '#f59e0b',
});
