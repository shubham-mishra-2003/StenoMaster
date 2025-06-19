import * as React from "react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/ThemeProvider";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const { colorScheme } = useTheme();
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-xl",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        `border-2 focus-visible:shadow-lg shadow-none transition-all duration-300 focus-visible:-translate-y-1 outline-none h-12 ${
          colorScheme == "dark"
            ? "border-slate-500 shadow-slate-950"
            : "border-slate-400 shadow-slate-400"
        }`,
        className
      )}
      {...props}
    />
  );
}

export { Input };
