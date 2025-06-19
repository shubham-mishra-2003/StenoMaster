import * as React from "react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/ThemeProvider";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const { colorScheme } = useTheme();
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-xl",
        `border-2 focus-visible:shadow-lg shadow-none transition-all duration-300 focus-visible:-translate-y-1 outline-none h-10 ${
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

export { Textarea };
