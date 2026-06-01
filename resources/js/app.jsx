import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => {
        const isPilates = title.includes('بيلاتس') || title.includes('Pilates') || title.includes('Reformer') || (typeof window !== 'undefined' && window.location.pathname.includes('pilates'));
        
        if (typeof document !== 'undefined') {
            const favicon = document.querySelector("link[rel~='icon']");
            if (favicon) {
                if (isPilates) {
                    favicon.href = '/pilates-logo.png';
                } else {
                    favicon.href = '/icon.png';
                }
            }
        }

        if (isPilates) {
            if (title.includes('The Reformer Room') || title.includes('ذا ريفورمر روم')) {
                return title;
            }
            return `${title} - The Reformer Room`;
        }
        return `${title} - ${appName}`;
    },
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
