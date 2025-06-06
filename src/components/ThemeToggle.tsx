import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../hooks/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme, colorScheme } = useTheme();

  const toggleTheme = () => {
    let newTheme: "light" | "dark" | "system";
    if (theme === "light") {
      newTheme = "dark";
    } else if (theme === "dark") {
      newTheme = "system";
    } else {
      newTheme = "light";
    }
    setTheme(newTheme);
    console.log("Theme changed to:", newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`h-9 w-9 p-0 relative z-50 ${
        colorScheme == "dark" ? "bg-black/70" : "bg-slate-200"
      }`}
      aria-label="Toggle theme"
    >
      <Sun
        className={`h-4 w-4 absolute transition-all ${
          theme === "light"
            ? "rotate-0 scale-100 text-black"
            : "rotate-90 scale-0"
        }`}
      />
      <Moon
        className={`h-4 w-4 absolute transition-all ${
          theme === "dark"
            ? "rotate-0 scale-100 text-white"
            : "rotate-90 scale-0"
        }`}
      />
      <Monitor
        className={`h-4 w-4 absolute transition-all ${
          theme === "system" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        } ${colorScheme == "dark" ? "text-white" : "text-black"}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
