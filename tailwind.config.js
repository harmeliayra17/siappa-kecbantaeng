/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#75348E',   // Ungu Utama (accent)
        secondary: '#96469B', // Ungu Kedua (accent)
        accent: '#1B56FD',    // Biru Tombol/Aksen
        surface: '#F5F5F5',   // Putih Tulang
        neon: '#FF00FF',      // Magenta (tidak dipakai banyak)
        cyber: '#00D4FF',     // Cyan (tidak dipakai banyak)
        dark: '#0F0F23',      // Gelap Premium
        lightGray: '#FAFAFA', // Putih sangat terang
        mediumGray: '#E8E8E8', // Abu-abu terang
        darkGray: '#555555',  // Abu-abu gelap (text)
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'subtle-glow': {
          '0%, 100%': { boxShadow: '0 4px 15px rgba(27, 86, 253, 0.08)' },
          '50%': { boxShadow: '0 4px 25px rgba(27, 86, 253, 0.15)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'subtle-glow': 'subtle-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}