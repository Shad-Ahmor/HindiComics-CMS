// tailwind.config.js (प्रोजेक्ट रूट में)

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/Components/**/*.{js,ts,jsx,tsx}",
    "./src/constants/theme.js", 
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      // ----------------------------------------------------
      // A. CUSTOM 3D / TRANSFORMS
      // Tailwind CSS 3D Plugin अब यह सब खुद मैनेज करता है, 
      // इसलिए हम यहां सिर्फ एक्स्ट्रा कॉन्फ़िग रखेंगे।
      // ----------------------------------------------------
      
      // B. ANIMATIONS
      keyframes: {
        'pulse-slow-custom': { // नाम बदला ताकि डिफॉल्ट Tailwind 'pulse' से Clash न हो
          '0%, 100%': { 
            transform: 'scale(1) translate(0, 0)',
            opacity: '0.5',
          },
          '50%': { 
            transform: 'scale(1.05) translate(10px, -10px)',
            opacity: '0.7',
          },
        }
      },
      // Apply the custom animation
      animation: {
        'pulse-slow-custom': 'pulse-slow-custom 15s infinite alternate ease-in-out',
      },

      // C. BOX SHADOWS (जो पहले भी ठीक थे, पर यहाँ फिर से कन्फर्म कर रहे हैं)
      boxShadow: {
        '3xl-dark': '0 35px 60px -15px rgba(109, 40, 217, 0.6)', 
      },
    },
  },
  plugins: [
    // 3D प्लगइन (यह 'perspective-1000' और 'rotate-x-3' जैसी यूटिलिटीज प्रदान करता है)
    require('tailwindcss-3d')({ 
        perspective: {
            '1000': '1000px',
        },
        transforms: {
            'rotate-x-3': 'rotateX(3deg)',
            'rotate-x-0': 'rotateX(0deg)', // Hover state के लिए
        },
    }),
    
    // एनिमेशन डिले प्लगइन
    require('tailwindcss-animation-delay'), 
  ],
}