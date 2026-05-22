import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
    ],

    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                'primary-dark': 'var(--primary-dark)',
                accent: 'var(--accent)',
                'accent-dark': 'var(--accent-dark)',
                surface: 'var(--surface)',
                'surface-2': 'var(--surface-2)',
                'text-main': 'var(--text-main)',
                'text-muted': 'var(--text-muted)',
                border: 'var(--border)',
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                display: ['Barlow Condensed', 'sans-serif'],
                arabic: ['Cairo', 'sans-serif'],
            },
            boxShadow: {
                'green-glow': '0 0 15px rgba(34, 40, 49, 0.4)',
                'card-hover': '0 8px 40px rgba(34, 40, 49, 0.12)',
            }
        },
    },

    plugins: [forms],
};
