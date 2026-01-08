import './bootstrap';
import '../css/app.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState, useEffect, createContext, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import 'dayjs/locale/fr';
import 'dayjs/locale/ar';

export const AppContext = createContext({
    locale: 'fr',
    setLocale: () => {},
    theme: 'light',
    setTheme: () => {},
    t: (key) => key,
});

const appName = import.meta.env.VITE_APP_NAME || 'Quincaillerie';

function AppWrapper({ App, props }) {
    const initialLocale = props.initialPage.props.locale || localStorage.getItem('locale') || 'fr';
    const initialTheme = props.initialPage.props.theme || localStorage.getItem('theme') || 'light';
    
    const [locale, setLocaleState] = useState(initialLocale);
    const [themeMode, setThemeModeState] = useState(initialTheme);

    const setLocale = (newLocale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        document.documentElement.lang = newLocale;
        // Keep LTR layout always - only translate text
        document.documentElement.dir = 'ltr';
    };

    const setTheme = (newTheme) => {
        setThemeModeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        document.documentElement.lang = locale;
        // Keep LTR layout always
        document.documentElement.dir = 'ltr';
    }, [locale]);

    const translations = props.initialPage.props.translations || {};

    const t = (key, replacements = {}) => {
        let text = translations[key] || key;
        Object.keys(replacements).forEach((k) => {
            text = text.replace(`:${k}`, replacements[k]);
        });
        return text;
    };

    const muiTheme = useMemo(
        () =>
            createTheme({
                direction: 'ltr', // Always LTR layout
                palette: {
                    mode: themeMode,
                    primary: {
                        main: '#1976d2',
                    },
                    secondary: {
                        main: '#f50057',
                    },
                    background: {
                        default: themeMode === 'light' ? '#f5f5f5' : '#121212',
                        paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
                    },
                },
                typography: {
                    fontFamily: locale === 'ar' 
                        ? '"Noto Sans Arabic", "Roboto", "Helvetica", "Arial", sans-serif'
                        : '"Roboto", "Helvetica", "Arial", sans-serif',
                },
                components: {
                    MuiTextField: {
                        defaultProps: {
                            size: 'small',
                        },
                    },
                    MuiButton: {
                        defaultProps: {
                            size: 'medium',
                        },
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                            },
                        },
                    },
                    MuiDataGrid: {
                        defaultProps: {
                            density: 'comfortable',
                        },
                    },
                },
            }),
        [locale, themeMode]
    );

    return (
        <AppContext.Provider value={{ locale, setLocale, theme: themeMode, setTheme, t }}>
            <ThemeProvider theme={muiTheme}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
                    <CssBaseline />
                    <App {...props} />
                    <Toaster
                        position={locale === 'ar' ? 'top-left' : 'top-right'}
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: themeMode === 'dark' ? '#333' : '#fff',
                                color: themeMode === 'dark' ? '#fff' : '#333',
                            },
                        }}
                    />
                </LocalizationProvider>
            </ThemeProvider>
        </AppContext.Provider>
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<AppWrapper App={App} props={props} />);
    },
    progress: {
        color: '#1976d2',
    },
});
