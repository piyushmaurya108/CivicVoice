/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        soft: '#667085',
        mist: '#98A2B3',
        line: '#E8EDF5',
        canvas: '#F7F9FC',
        surface: '#FFFFFF',
        surfaceAlt: '#F3F6FB',
        brand: {
          50: '#EEF3FF',
          100: '#DDE7FF',
          500: '#3366FF',
          600: '#2954E8',
          700: '#2347C5',
          800: '#1E3D9F',
          900: '#1A327E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 50px rgba(17, 24, 39, 0.08)',
        float: '0 30px 80px rgba(51, 102, 255, 0.12)',
        glow: '0 18px 40px rgba(51, 102, 255, 0.22)'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
};
