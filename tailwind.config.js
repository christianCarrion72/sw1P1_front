/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" // add this line
  ],
  theme: {
    extend: {
      colors: {
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
        graygreen: {
          100: '#D0D9CD', // (208, 217, 205)
          200: '#cde7ca', // (205, 231, 202)
          300: '#A9BA9D', // (169, 186, 157)
          400: '#b2d4b6', // (178, 212, 182)
          500: '#B2BEB5', // (178, 190, 181)
          600: '#90b493', // (144, 180, 147)
          700: '#78866B', // (120, 134, 107)
          800: '#728370', // (114, 131, 112)
          900: '#828E84', // (130, 142, 132)
          1000: '#687169', // (104, 113, 105)
          1100: '#4b514a'  // (75, 81, 74)
        },
        'brown-gray': {
          50: '#f8f5f2',
          100: '#f1ebe5',
          200: '#e2d7cc',
          300: '#d4c3b2',
          400: '#a69b8c',
          500: '#796366',
          600: '#5f514d',
          700: '#453d3b',
          800: '#2c2928',
          900: '#1a1716',
        },
        'brown': {
          50: '#fbf6f4',
          100: '#f3e6e0',
          200: '#e1cac0',
          300: '#cfae9f',
          400: '#a8716e',
          500: '#81453e',
          600: '#743c37',
          700: '#62322f',
          800: '#502726',
          900: '#41201e',
        },
        'coffee-gray': {
          50: '#fafaf9',
          100: '#f3f2f0',
          200: '#e1dfdb',
          300: '#cfcdc7',
          400: '#aba8a2',
          500: '#88847c',
          600: '#77736c',
          700: '#64615b',
          800: '#525048',
          900: '#43413b',
        },
        'coffee': {
          50: '#fdf9f7',
          100: '#fbeee6',
          200: '#f5d0ba',
          300: '#eeb18e',
          400: '#e17b45',
          500: '#d1440c',
          600: '#b13b0b',
          700: '#8f3109',
          800: '#712806',
          900: '#5a2005',
        },
        'custom-brown': '#b98d70',
        'custom-brown-dark': '#795943',
      }
    },
    fontFamily: {
      'body': [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'system-ui',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji'
  ],
      'sans': [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'system-ui',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji'
  ]

    },
  },
  plugins: [
    require('flowbite/plugin')
   ],
}

