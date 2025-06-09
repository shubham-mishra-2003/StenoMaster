"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextProps {
  colorScheme: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
  theme: "light" | "dark" | "system";
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("system");

  const getSystemColorScheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      return mediaQuery.matches ? "dark" : "light";
    }
    return "dark"; // Default for SSR
  };

  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    getSystemColorScheme()
  );

  const setTheme = (newTheme: "light" | "dark" | "system") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      if (newTheme === "system") {
        localStorage.removeItem("theme");
      } else {
        localStorage.setItem("theme", newTheme);
      }
    }
  };

  useEffect(() => {
    const loadTheme = () => {
      if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          setThemeState(savedTheme as "light" | "dark");
        } else {
          setThemeState("system");
        }
      }
    };
    loadTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      if (theme === "system") {
        setColorScheme(getSystemColorScheme());
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [theme]);

  const finalColorScheme: "light" | "dark" =
    theme === "system" ? colorScheme : theme;

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.backgroundColor =
        finalColorScheme === "dark" ? "#121212" : "#f7fbff";
      document.body.style.color =
        finalColorScheme === "dark" ? "#e2e8f0" : "#314158";
    }
  }, [finalColorScheme]);

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: finalColorScheme,
        setTheme,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};