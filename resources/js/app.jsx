import './bootstrap';
import '../css/app.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState, useEffect, createContext, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createLightTheme, createDarkTheme } from './theme';
import 'dayjs/locale/fr';
import 'dayjs/locale/ar';

export const AppContext = createContext({
    locale: 'fr',
    setLocale: () => {},
    theme: 'light',
    setTheme: () => {},
    t: (key) => key,
    sidebarCollapsed: false,
    setSidebarCollapsed: () => {},
});

const appName = import.meta.env.VITE_APP_NAME || 'Quincaillerie';

function AppWrapper({ App, props }) {
    const initialLocale = props.initialPage.props.locale || localStorage.getItem('locale') || 'fr';
    const initialTheme = props.initialPage.props.theme || localStorage.getItem('theme') || 'light';
    const initialSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    const [locale, setLocaleState] = useState(initialLocale);
    const [themeMode, setThemeModeState] = useState(initialTheme);
    const [sidebarCollapsed, setSidebarCollapsedState] = useState(initialSidebarCollapsed);

    const setLocale = (newLocale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        document.documentElement.lang = newLocale;
        document.documentElement.dir = 'ltr';
    };

    const setTheme = (newTheme) => {
        setThemeModeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const setSidebarCollapsed = (collapsed) => {
        setSidebarCollapsedState(collapsed);
        localStorage.setItem('sidebarCollapsed', collapsed.toString());
    };

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = 'ltr';
        
        // Add theme class to body for CSS fallbacks
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${themeMode}`);
    }, [locale, themeMode]);

    const translations = props.initialPage.props.translations || {};

    const t = (key, replacements = {}) => {
        let text = translations[key] || key;
        Object.keys(replacements).forEach((k) => {
            text = text.replace(`:${k}`, replacements[k]);
        });
        return text;
    };

    // Create MUI theme based on current mode and locale
    const muiTheme = useMemo(
        () => themeMode === 'dark' 
            ? createDarkTheme(locale) 
            : createLightTheme(locale),
        [locale, themeMode]
    );

    return (
        <AppContext.Provider 
            value={{ 
                locale, 
                setLocale, 
                theme: themeMode, 
                setTheme, 
                t,
                sidebarCollapsed,
                setSidebarCollapsed,
            }}
        >
            <ThemeProvider theme={muiTheme}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
                    <CssBaseline />
                    <App {...props} />
                    <Toaster
                        position={locale === 'ar' ? 'top-left' : 'top-right'}
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: themeMode === 'dark' ? '#1E293B' : '#FFFFFF',
                                color: themeMode === 'dark' ? '#F1F5F9' : '#1F2937',
                                borderRadius: '12px',
                                boxShadow: themeMode === 'dark' 
                                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.4)' 
                                    : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                border: `1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                padding: '12px 16px',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10B981',
                                    secondary: themeMode === 'dark' ? '#1E293B' : '#FFFFFF',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#EF4444',
                                    secondary: themeMode === 'dark' ? '#1E293B' : '#FFFFFF',
                                },
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
        // Prevent duplicate createRoot calls during HMR
        if (el._reactRoot) {
            el._reactRoot.render(<AppWrapper App={App} props={props} />);
        } else {
            const root = createRoot(el);
            el._reactRoot = root;
            root.render(<AppWrapper App={App} props={props} />);
        }
    },
    progress: {
        color: '#2563EB',
        showSpinner: true,
    },
});
