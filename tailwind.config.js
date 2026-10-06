/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: '1.25rem',
  			'2xl': '1.5rem'
  		},
  		colors: {
  			background: {
  				DEFAULT: '#FAFAFE',
  				secondary: '#F1F2F8',
  				card: '#FFFFFF'
  			},
  			foreground: '#0A0E1A',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#0A0E1A'
  			},
  			primary: {
  				DEFAULT: '#7C5CFF',
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: '#F1F2F8',
  				foreground: '#0A0E1A'
  			},
  			muted: {
  				DEFAULT: '#EEF0F6',
  				foreground: '#5B6478'
  			},
  			accent: {
  				DEFAULT: '#0BA5E9',
  				foreground: '#FFFFFF'
  			},
  			nebula: {
  				DEFAULT: '#B45CFF',
  				foreground: '#FFFFFF'
  			},
  			destructive: {
  				DEFAULT: '#EF4444',
  				foreground: '#FFFFFF'
  			},
  			border: 'rgba(10, 14, 26, 0.08)',
  			input: 'rgba(10, 14, 26, 0.1)',
  			ring: '#7C5CFF',
  			chart: {
  				'1': '#7C5CFF',
  				'2': '#0BA5E9',
  				'3': '#B45CFF',
  				'4': '#0A0E1A',
  				'5': '#5B6478'
  			}
  		},
  		fontFamily: {
  			heading: ['Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  			body: ['Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  			display: ['Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  			mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-12px)' }
  			},
  			'glow-pulse': {
  				'0%, 100%': { opacity: '0.4' },
  				'50%': { opacity: '0.8' }
  			},
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			'fade-in-up': {
  				from: { opacity: '0', transform: 'translateY(20px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(0.95)' },
  				to: { opacity: '1', transform: 'scale(1)' }
  			},
  			'twinkle': {
  				'0%, 100%': { opacity: '0.3' },
  				'50%': { opacity: '1' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'float': 'float 6s ease-in-out infinite',
  			'float-slow': 'float 8s ease-in-out infinite',
  			'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
  			'fade-in': 'fade-in 0.6s ease-out forwards',
  			'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
  			'scale-in': 'scale-in 0.3s ease-out forwards',
  			'twinkle': 'twinkle 3s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
