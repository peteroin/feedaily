import { useState, useEffect } from "react";

export default function useTheme(defaultTheme = "light") {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    document.body.style.backgroundColor = theme === "dark" ? "#1a202c" : "#ffffff";
  }, [theme]);

  const themeClasses = theme === "dark"
    ? {
        page: "bg-gray-900 text-gray-100",
        nav: "bg-gray-900/95 text-gray-100",
        border: "border-gray-700",
        card: "bg-gray-800 border-gray-700 text-gray-100",
        cardHover: "hover:bg-gray-700",
        activeBg: "bg-gray-900",
        inactiveBg: "bg-gray-800",
        activeText: "text-white",
        inactiveText: "text-gray-400",
        iconColor: "text-gray-300",
        activeIconColor: "text-yellow-400",
        statBg: "bg-gray-800 border-gray-700",
        statText: "text-gray-100",
        ctaBg: "bg-gray-800",
        ctaText: "text-gray-100",
        footer: "bg-gray-900 border-gray-700 text-gray-400",
      }
    : {
        page: "bg-white text-gray-900",
        nav: "bg-white/95 text-gray-900",
        border: "border-gray-300",
        card: "bg-white border-gray-200 text-gray-900",
        cardHover: "hover:bg-gray-100",
        activeBg: "bg-white",
        inactiveBg: "bg-gray-50",
        activeText: "text-gray-900",
        inactiveText: "text-gray-500",
        iconColor: "text-gray-700",
        activeIconColor: "text-gray-900",
        statBg: "bg-white border-gray-200",
        statText: "text-gray-900",
        ctaBg: "bg-gray-900",
        ctaText: "text-white",
        footer: "bg-white border-gray-200 text-gray-600",
      };

  return { theme, setTheme, themeClasses };
}