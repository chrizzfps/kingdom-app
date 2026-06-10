import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';

export function ThemeIsolator() {
    const location = useLocation();
    const { theme } = useTheme();

    useEffect(() => {
        const root = window.document.documentElement;
        const path = location.pathname;

        // Clean previous enforcement first (optional, but good for switching between public views)
        // Actually, we just want to re-evaluate.

        if (path.startsWith('/p/') || path.startsWith('/preview/') || path.startsWith('/invoice/')) {
            // PUBLIC VIEW: Force LIGHT mode (or specific logic)
            // Remove 'dark' to ensure it's light.
            // If you want strictly 'light', ensure 'light' class is present and 'dark' is absent.

            // NOTE: If we want to support 'dark' public views for specific cases (like Portfolios),
            // we might need more logic here. But user asked to ISOLATE from system theme.
            // Usually proposals look best in bright/paper mode.

            root.classList.remove('dark');
            root.classList.add('light');
        } else {
            // SYSTEM/ADMIN VIEW: Restore system/user preference
            // We need to re-apply the user's theme.
            root.classList.remove('light', 'dark');

            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(theme);
            }
        }
    }, [location.pathname, theme]);

    return null;
}
