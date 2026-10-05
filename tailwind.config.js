/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DBF73',
        'primary-dark': '#159A5B',
        secondary: '#09B1BA',
        'secondary-dark': '#078E93',
        ink: {
          900: '#111827',
          700: '#374151',
          500: '#6B7280',
          400: '#9CA3AF',
        },
      },
      borderRadius: {
        card: '1rem',      // 16px — cartes
        modal: '1.25rem',  // 20px — modales
        pill: '9999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.1)',
        pop: '0 10px 30px rgba(16,24,40,.12)',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
}
