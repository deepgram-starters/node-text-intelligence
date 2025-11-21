/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./lib/**/*.css", "./src/**/*.{html,js,ts,jsx,tsx}"],
  safelist: [
    // Include all component classes starting with 'dg-' for library consumers
    {
      pattern: /^dg-/,
    },
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Deepgram Brand Colors (from marketing site)
        // These can be overridden by setting CSS variables
        "dg-primary": "var(--dg-primary, #13ef95)",
        "dg-secondary": "var(--dg-secondary, #149afb)",

        // Background Colors
        "dg-almost-black": "#050506", // Almost Black (darkest)
        "dg-background": "#0b0b0c", // Black
        "dg-charcoal": "#1a1a1f", // Charcoal (cards, modals)
        "dg-translucent": "rgba(0, 0, 0, 0.5)",

        // Border Colors
        "dg-border": "#2c2c33",
        "dg-pebble": "#4e4e52", // Pebble (default borders)
        "dg-slate": "#949498", // Slate (muted borders)

        // Text Colors
        "dg-text": "#fbfbff", // Ghost White (primary text)
        "dg-fog": "#edede2", // Fog Gray (secondary text)
        "dg-platinum": "#e1e1e5", // Platinum (tertiary text)
        "dg-muted": "#949498", // Slate (muted text)

        // Status Colors
        "dg-success": "#12b76a",
        "dg-warning": "#fec84b",
        "dg-danger": "#f04438",

        // Gradient colors for primary button
        "dg-gradient-start": "#008fc1",
        "dg-gradient-end": "#00f099",
      },
      fontFamily: {
        "dg-sans": [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        "dg-noto": [
          "Noto Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        "dg-mono": ["Fira Code", "Monaco", "Consolas", "Courier New", "monospace"],
      },
      spacing: {
        "dg-xs": "0.25rem",
        "dg-sm": "0.5rem",
        "dg-md": "1rem",
        "dg-lg": "1.5rem",
        "dg-xl": "2rem",
        "dg-2xl": "3rem",
        128: "32rem", // 512px - for extra large column widths
      },
      borderRadius: {
        "dg-sm": "0.25rem",
        "dg-md": "0.5rem",
        "dg-lg": "0.75rem",
        "dg-xl": "1rem",
      },
      boxShadow: {
        "dg-sm": "0 0.0625rem 0.125rem 0 rgba(0, 0, 0, 0.05)",
        "dg-md":
          "0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)",
        "dg-lg":
          "0 0.625rem 0.9375rem -0.1875rem rgba(0, 0, 0, 0.1), 0 0.25rem 0.375rem -0.125rem rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [
    function ({ addBase, addUtilities, theme }) {
      addBase({
        ":root": {
          "--dg-base-font-size": "16px",
          "--dg-border-width": "0.125rem",
          "--dg-primary": "#13ef95",
          "--dg-secondary": "#149afb",
        },
        html: {
          fontSize: "var(--dg-base-font-size, 16px)",
          scrollBehavior: "smooth",
        },
        body: {
          fontFamily: theme("fontFamily.dg-sans"),
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          backgroundColor: theme("colors.dg-background"),
          color: theme("colors.dg-text"),
          lineHeight: theme("lineHeight.normal"),
        },
        "h1, h2, h3, h4, h5, h6": {
          fontFamily: theme("fontFamily.dg-noto"),
          fontWeight: theme("fontWeight.bold"),
        },
        h1: {
          fontSize: theme("fontSize.4xl"),
          "@media (min-width: 768px)": {
            fontSize: theme("fontSize.5xl"),
          },
        },
        h2: {
          fontSize: theme("fontSize.3xl"),
          "@media (min-width: 768px)": {
            fontSize: theme("fontSize.4xl"),
          },
        },
        h3: {
          fontSize: theme("fontSize.2xl"),
          "@media (min-width: 768px)": {
            fontSize: theme("fontSize.3xl"),
          },
        },
        h4: {
          fontSize: theme("fontSize.xl"),
          "@media (min-width: 768px)": {
            fontSize: theme("fontSize.2xl"),
          },
        },
        "code, pre": {
          fontFamily: theme("fontFamily.dg-mono"),
        },
        a: {
          color: theme("colors.dg-primary"),
          transitionProperty: "color",
          transitionDuration: "200ms",
          "&:hover": {
            opacity: "0.8",
          },
        },
      });

      // Add custom utilities for gradient border and glow effects
      addUtilities({
        ".dg-gradient-border": {
          backgroundImage:
            "linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0)), linear-gradient(90deg, color-mix(in srgb, var(--dg-secondary, #149afb) 70%, #000), color-mix(in srgb, var(--dg-primary, #13ef95) 70%, #000), color-mix(in srgb, var(--dg-secondary, #149afb) 70%, #000), color-mix(in srgb, var(--dg-primary, #13ef95) 70%, #000))",
          backgroundOrigin: "padding-box, border-box",
          backgroundClip: "padding-box, border-box",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "100% 100%",
          backgroundColor: "rgb(0, 0, 0)",
        },
        ".dg-bg-reset": {
          backgroundImage: "none",
          backgroundOrigin: "padding-box",
          backgroundClip: "border-box",
          backgroundRepeat: "repeat",
          backgroundPosition: "0% 0%",
          backgroundSize: "auto",
        },
        ".dg-glow-cyan-green": {
          boxShadow:
            "color-mix(in srgb, var(--dg-primary, #13ef95) 20%, transparent) 0.375rem 0 0.9375rem 0, color-mix(in srgb, var(--dg-secondary, #149afb) 20%, transparent) -0.375rem 0 0.9375rem 0",
        },
        ".dg-shadow-subtle": {
          boxShadow: "rgba(38, 44, 52, 0.05) 0 0.0625rem 0.125rem",
        },
      });
    },
  ],
};
