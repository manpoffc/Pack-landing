import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#FBF7F1',
        cream: '#F2EAD9',
        sand: '#E6D7BC',
        espresso: '#3D2A1F',
        cocoa: '#7A5A45',
        tangerine: '#E08856',
        sage: '#7FA88A',
        brick: '#B7553C',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
