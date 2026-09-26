/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#701F43",
        "primary-light": "#8E3159",
        "primary-hover": "#5A1835",
        "on-surface": "#351A26",
        "on-surface-variant": "#684653",
        outline: "#967783",
        muted: "#967783",
        blue: {
          DEFAULT: "#D8C8DD",
          soft: "#D8C8DD",
          sky: "#F8E3E8",
        },
        lavender: {
          DEFAULT: "#D8C8DD",
          soft: "#D8C8DD",
        },
        purple: {
          DEFAULT: "#8E3159",
          soft: "#8E3159",
        },
        violet: {
          DEFAULT: "#701F43",
        },
        pink: {
          DEFAULT: "#D9829B",
          blush: "#D9829B",
          soft: "#F3C7D2",
        },
        rose: {
          DEFAULT: "#B85C7A",
          50: "#FFF9F7",
          100: "#F8E3E8",
          200: "#F3C7D2",
          300: "#E9A6B8",
          400: "#D9829B",
          500: "#B85C7A",
          600: "#8E3159",
          700: "#701F43",
          800: "#5A1835",
          900: "#351A26",
          950: "#351A26",
        },
        peach: {
          DEFAULT: "#E9A6B8",
        },
        coral: {
          DEFAULT: "#D9829B",
        },
        bloom: {
          bg: "#FFF9F7",
          blue: "#D8C8DD",
          skyBlue: "#F8E3E8",
          lavender: "#D8C8DD",
          purple: "#8E3159",
          violet: "#701F43",
          blush: "#D9829B",
          softPink: "#F3C7D2",
          rose: "#B85C7A",
          peach: "#E9A6B8",
          coral: "#D9829B",
          white: "#FFFFFF",
          dark: "#351A26",
          secondary: "#684653",
          muted: "#967783",
          surface: "#FFF9F7",
          pink: "#D9829B",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass-card': '0 16px 40px -12px rgba(90, 24, 53, 0.10), 0 4px 12px -2px rgba(53, 26, 38, 0.035)',
        'glass-glow': '0 0 30px -4px rgba(217, 130, 155, 0.23), 0 12px 32px -8px rgba(90, 24, 53, 0.13)',
        'button-primary': '0 8px 22px -4px rgba(90, 24, 53, 0.28), 0 4px 12px -2px rgba(184, 92, 122, 0.18)',
      },
      borderRadius: {
        'card': '28px',
        'card-sm': '20px',
      },
    },
  },
  plugins: [],
};
