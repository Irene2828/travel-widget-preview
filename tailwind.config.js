/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Defined palette
        surface: '#FFFFFF',
        typography: {
          primary: '#1A1A1A', // Deep Navy/Charcoal
          secondary: '#757575', // Muted Gray
        },
        brand: {
          yellow: '#FFD700', // Vibrant Yellow
        },
        ui: {
          pin: {
            selected: '#1A1A1A',
            unselected: '#FFFFFF',
          }
        }
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        'pill': '50px',
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'floating': '0 16px 32px rgba(0, 0, 0, 0.12)',
        'pin': '0 2px 8px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
