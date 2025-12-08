/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF9',
        foreground: '#44403C',
        card: '#FFFFFF',
        'card-foreground': '#44403C',
        popover: '#FFFFFF',
        'popover-foreground': '#44403C',
        primary: '#78866B',
        'primary-foreground': '#FFFFFF',
        secondary: '#E7E5E4',
        'secondary-foreground': '#44403C',
        muted: '#F5F5F4',
        'muted-foreground': '#78716C',
        accent: '#D6D3D1',
        'accent-foreground': '#44403C',
        destructive: '#EF4444',
        'destructive-foreground': '#FFFFFF',
        border: '#E7E5E4',
        input: '#E7E5E4',
        ring: '#78866B',
        success: '#A3B18A',
        warning: '#D4A373',
        info: '#A5A58D',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
      },
      borderRadius: {
        lg: '2rem',
        md: '1.5rem',
        sm: '1rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};