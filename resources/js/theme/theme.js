/**
 * MUI Theme Configuration
 * =======================
 * Custom Material UI theme with design tokens for light and dark modes.
 */

import { createTheme, alpha } from '@mui/material';
import {
  palette,
  typography as tokens,
  borderRadius,
  shadows,
  darkShadows,
  lightBackground,
  darkBackground,
  layout,
  transitions,
} from './tokens';

// Base theme configuration (shared between modes)
const baseTheme = {
  direction: 'ltr',
  
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  shape: {
    borderRadius: 12,
  },

  // Custom shadows array for MUI
  shadows: [
    'none',
    shadows.xs,
    shadows.sm,
    shadows.sm,
    shadows.default,
    shadows.default,
    shadows.md,
    shadows.md,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
  ],
};

// Typography configuration
const createTypography = (locale = 'fr') => ({
  fontFamily: locale === 'ar'
    ? tokens.fontFamily.arabic
    : tokens.fontFamily.primary,
  
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: '0',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0',
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.02em',
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
});

// Light theme palette
const lightPalette = {
  mode: 'light',
  primary: palette.primary,
  secondary: palette.secondary,
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,
  grey: palette.grey,
  
  background: lightBackground,
  
  text: {
    primary: palette.grey[900],
    secondary: palette.grey[600],
    disabled: palette.grey[400],
  },
  
  divider: alpha(palette.grey[900], 0.08),
  
  action: {
    active: palette.grey[600],
    hover: alpha(palette.grey[900], 0.04),
    selected: alpha(palette.primary.main, 0.08),
    disabled: palette.grey[400],
    disabledBackground: palette.grey[200],
    focus: alpha(palette.primary.main, 0.12),
  },
};

// Dark theme palette
const darkPalette = {
  mode: 'dark',
  primary: {
    ...palette.primary,
    main: '#60A5FA',
    light: '#93C5FD',
    dark: '#3B82F6',
  },
  secondary: {
    ...palette.secondary,
    main: '#A78BFA',
    light: '#C4B5FD',
    dark: '#8B5CF6',
  },
  success: {
    ...palette.success,
    main: '#34D399',
    light: '#6EE7B7',
    dark: '#10B981',
  },
  warning: {
    ...palette.warning,
    main: '#FBBF24',
    light: '#FCD34D',
    dark: '#F59E0B',
  },
  error: {
    ...palette.error,
    main: '#F87171',
    light: '#FCA5A5',
    dark: '#EF4444',
  },
  info: {
    ...palette.info,
    main: '#60A5FA',
    light: '#93C5FD',
    dark: '#3B82F6',
  },
  grey: palette.grey,
  
  background: darkBackground,
  
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    disabled: '#475569',
  },
  
  divider: alpha('#F1F5F9', 0.08),
  
  action: {
    active: '#94A3B8',
    hover: alpha('#F1F5F9', 0.05),
    selected: alpha('#60A5FA', 0.16),
    disabled: '#475569',
    disabledBackground: '#334155',
    focus: alpha('#60A5FA', 0.2),
  },
};

// Component overrides
const createComponents = (mode) => {
  const isDark = mode === 'dark';
  const bg = isDark ? darkBackground : lightBackground;
  const textPrimary = isDark ? '#F1F5F9' : palette.grey[900];
  const textSecondary = isDark ? '#94A3B8' : palette.grey[600];
  const border = isDark ? alpha('#F1F5F9', 0.1) : alpha(palette.grey[900], 0.1);

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? '#475569 #1E293B' : '#CBD5E1 #F1F5F9',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: isDark ? '#1E293B' : '#F1F5F9',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? '#475569' : '#CBD5E1',
            borderRadius: '4px',
            '&:hover': {
              background: isDark ? '#64748B' : '#94A3B8',
            },
          },
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          padding: '10px 20px',
          fontWeight: 600,
          transition: `all ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: shadows.sm,
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        sizeSmall: {
          padding: '6px 14px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          transition: `all ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
          '&:hover': {
            backgroundColor: isDark ? alpha('#F1F5F9', 0.08) : alpha(palette.grey[900], 0.04),
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          boxShadow: isDark ? darkShadows.sm : shadows.sm,
          border: `1px solid ${border}`,
          backgroundImage: 'none',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: borderRadius.md,
        },
        outlined: {
          borderColor: border,
        },
        elevation1: {
          boxShadow: isDark ? darkShadows.sm : shadows.sm,
        },
        elevation2: {
          boxShadow: isDark ? darkShadows.default : shadows.default,
        },
        elevation3: {
          boxShadow: isDark ? darkShadows.md : shadows.md,
        },
        elevation4: {
          boxShadow: isDark ? darkShadows.lg : shadows.lg,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.default,
            transition: `all ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.primary.main,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(palette.primary.main, 0.1)}`,
            },
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
          },
        },
        notchedOutline: {
          borderColor: border,
          transition: `border-color ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          fontWeight: 500,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: alpha(palette.primary.main, 0.12),
            color: isDark ? palette.primary.light : palette.primary.dark,
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: alpha(palette.success.main, 0.12),
            color: isDark ? palette.success.light : palette.success.dark,
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: alpha(palette.warning.main, 0.12),
            color: isDark ? palette.warning.dark : palette.warning.dark,
          },
          '&.MuiChip-colorError': {
            backgroundColor: alpha(palette.error.main, 0.12),
            color: isDark ? palette.error.light : palette.error.dark,
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: alpha(palette.info.main, 0.12),
            color: isDark ? palette.info.light : palette.info.dark,
          },
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? palette.grey[700] : palette.grey[800],
          borderRadius: borderRadius.sm,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '6px 12px',
        },
        arrow: {
          color: isDark ? palette.grey[700] : palette.grey[800],
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.lg,
          boxShadow: isDark ? darkShadows['2xl'] : shadows['2xl'],
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          padding: '20px 24px 16px',
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 20px',
          gap: '12px',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          backgroundColor: bg.sidebar,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${border}`,
          backgroundColor: isDark ? bg.paper : '#FFFFFF',
          color: textPrimary,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          margin: '2px 8px',
          padding: '10px 16px',
          transition: `all ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
          '&.Mui-selected': {
            backgroundColor: isDark ? bg.sidebarActive : alpha(palette.primary.main, 0.08),
            color: palette.primary.main,
            '&:hover': {
              backgroundColor: isDark ? bg.sidebarActive : alpha(palette.primary.main, 0.12),
            },
            '& .MuiListItemIcon-root': {
              color: palette.primary.main,
            },
          },
          '&:hover': {
            backgroundColor: isDark ? alpha('#F1F5F9', 0.04) : alpha(palette.grey[900], 0.04),
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 44,
          color: textSecondary,
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        colorDefault: {
          backgroundColor: isDark ? palette.grey[700] : palette.grey[200],
          color: isDark ? palette.grey[300] : palette.grey[600],
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: border,
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: isDark ? bg.surfaceVariant : palette.grey[50],
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: textSecondary,
            borderBottom: `1px solid ${border}`,
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${border}`,
          padding: '16px',
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: `background-color ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
          '&:hover': {
            backgroundColor: isDark ? alpha('#F1F5F9', 0.02) : alpha(palette.grey[900], 0.02),
          },
        },
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${border}`,
          borderRadius: borderRadius.md,
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: isDark ? bg.surfaceVariant : palette.grey[50],
            '&:focus, &:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${border}`,
            '&:focus, &:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: isDark ? alpha('#F1F5F9', 0.02) : alpha(palette.grey[900], 0.02),
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? alpha('#60A5FA', 0.08) : alpha(palette.primary.main, 0.04),
              '&:hover': {
                backgroundColor: isDark ? alpha('#60A5FA', 0.12) : alpha(palette.primary.main, 0.08),
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${border}`,
          },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.default,
          boxShadow: isDark ? darkShadows.lg : shadows.lg,
          border: `1px solid ${border}`,
          marginTop: '4px',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          margin: '4px 8px',
          padding: '8px 12px',
          transition: `background-color ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
        },
      },
    },

    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          marginLeft: 8,
          marginRight: 8,
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          alignItems: 'center',
        },
        standardSuccess: {
          backgroundColor: alpha(palette.success.main, 0.1),
          color: isDark ? palette.success.light : palette.success.dark,
          '& .MuiAlert-icon': {
            color: palette.success.main,
          },
        },
        standardWarning: {
          backgroundColor: alpha(palette.warning.main, 0.1),
          color: isDark ? palette.warning.light : palette.warning.dark,
          '& .MuiAlert-icon': {
            color: palette.warning.main,
          },
        },
        standardError: {
          backgroundColor: alpha(palette.error.main, 0.1),
          color: isDark ? palette.error.light : palette.error.dark,
          '& .MuiAlert-icon': {
            color: palette.error.main,
          },
        },
        standardInfo: {
          backgroundColor: alpha(palette.info.main, 0.1),
          color: isDark ? palette.info.light : palette.info.dark,
          '& .MuiAlert-icon': {
            color: palette.info.main,
          },
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
        },
        rectangular: {
          borderRadius: borderRadius.default,
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.full,
          height: 6,
        },
        bar: {
          borderRadius: borderRadius.full,
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },

    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: shadows.lg,
          '&:hover': {
            boxShadow: shadows.xl,
          },
        },
      },
    },
  };
};

// Create light theme
export const createLightTheme = (locale = 'fr') =>
  createTheme({
    ...baseTheme,
    palette: lightPalette,
    typography: createTypography(locale),
    components: createComponents('light'),
  });

// Create dark theme
export const createDarkTheme = (locale = 'fr') =>
  createTheme({
    ...baseTheme,
    shadows: [
      'none',
      darkShadows.xs,
      darkShadows.sm,
      darkShadows.sm,
      darkShadows.default,
      darkShadows.default,
      darkShadows.md,
      darkShadows.md,
      darkShadows.lg,
      darkShadows.lg,
      darkShadows.lg,
      darkShadows.lg,
      darkShadows.xl,
      darkShadows.xl,
      darkShadows.xl,
      darkShadows.xl,
      darkShadows.xl,
      darkShadows['2xl'],
      darkShadows['2xl'],
      darkShadows['2xl'],
      darkShadows['2xl'],
      darkShadows['2xl'],
      darkShadows['2xl'],
      darkShadows['2xl'],
      darkShadows['2xl'],
    ],
    palette: darkPalette,
    typography: createTypography(locale),
    components: createComponents('dark'),
  });

// Export layout constants for components
export { layout };

// Default export for convenience
export default createLightTheme;
