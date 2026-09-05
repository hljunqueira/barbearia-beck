import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * Design System — Beck Barbearia
 * Paleta: preto profundo, dourado clássico e branco/creme.
 * Tipografia: Cinzel (display) + Inter (texto).
 */
const config: Config = {
  // `overline` é utilitário do Tailwind; bloqueado para não conflitar com labels próprios.
  blocklist: ['overline'],
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        brand: {
          black: '#0A0A0A',
          charcoal: '#111111',
          graphite: '#181818',
          smoke: '#262626',
          steel: '#3A3A3A',
          gold: {
            DEFAULT: '#C9A227',
            light: '#E6C766',
            dark: '#9A7A1A',
            muted: '#7A6320',
          },
          cream: '#F5F1E8',
          white: '#FFFFFF',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient':
          'linear-gradient(135deg, #F3D88A 0%, #C9A227 35%, #9A7A1A 60%, #E6C766 100%)',
        'gold-line':
          'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.6) 50%, transparent 100%)',
        'hero-vignette':
          'radial-gradient(ellipse at center, rgba(201,162,39,0.18) 0%, rgba(10,10,10,0) 55%)',
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(201,162,39,0.35), 0 20px 60px -20px rgba(201,162,39,0.35)',
        'gold-lg': '0 0 0 1px rgba(201,162,39,0.55), 0 30px 90px -20px rgba(201,162,39,0.45)',
        card: '0 25px 60px -30px rgba(0,0,0,0.9)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        shine: {
          from: { transform: 'translateX(-150%) skewX(-20deg)' },
          to: { transform: 'translateX(250%) skewX(-20deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        marquee: 'marquee 40s linear infinite',
        shine: 'shine 1.2s ease-in-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
