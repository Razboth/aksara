/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AKSARA Color Palette
        primary: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a9ba',
          400: '#ed7896',
          500: '#B6244F',
          600: '#a01f45',
          700: '#86193a',
          800: '#711834',
          900: '#611830',
        },
        aksara: {
          charcoal: '#504746',
          taupe: '#B89685',
          sand: '#BFADA3',
          blush: '#FBB7C0',
          rose: '#B6244F',
        },
        neutral: {
          50: '#faf9f8',
          100: '#f5f3f1',
          200: '#e8e4e1',
          300: '#BFADA3',
          400: '#B89685',
          500: '#9a8578',
          600: '#7d6b60',
          700: '#504746',
          800: '#3d3635',
          900: '#2d2726',
        },
      },
      backgroundImage: {
        'gradient-aksara': 'linear-gradient(135deg, #504746 0%, #B6244F 100%)',
        'gradient-rose': 'linear-gradient(135deg, #B6244F 0%, #FBB7C0 100%)',
        'gradient-warm': 'linear-gradient(135deg, #B89685 0%, #BFADA3 100%)',
      },
    },
  },
  plugins: [],
}
