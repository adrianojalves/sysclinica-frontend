/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'azul-prisma': '#005293',
        'verde-teal': '#009B8E',
        'fundo-offwhite': '#F4F7F8',
        'branco-puro': '#FFFFFF',
        'cinza-chumbo': '#2D3748',
        'cinza-medio': '#718096',
        'cinza-contorno': '#CBD5E0',
        'verde-confirmacao': '#2F855A',
        'vermelho-alerta': '#C53030',
      }
    },
  },
  plugins: [],
}