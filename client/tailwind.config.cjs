module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#071826",
          secondary: "#0a1f2e",
        },
        surface: {
          DEFAULT: "#0f2430",
          hover: "rgba(255, 255, 255, 0.05)",
        },
        muted: {
          DEFAULT: "#97a6b2",
          light: "#cbd5e1",
        },
        accent: {
          DEFAULT: "#ff6b61",
          light: "#ff8c6a",
          dark: "#e55a50",
        },
        text: {
          primary: "#e6eef7",
          secondary: "#cbd5e1",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          hover: "rgba(255, 255, 255, 0.15)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        heading: [
          "Poppins",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 8px 32px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 12px 40px rgba(0, 0, 0, 0.4)",
        accent: "0 4px 14px rgba(255, 107, 97, 0.2)",
        "accent-hover": "0 6px 20px rgba(255, 107, 97, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
