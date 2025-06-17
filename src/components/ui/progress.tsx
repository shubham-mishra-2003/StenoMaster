import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/ThemeProvider";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const { colorScheme } = useTheme();
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        `relative h-4 w-full overflow-hidden rounded-full ${
          colorScheme == "dark" ? "bg-slate-600" : "bg-slate-300"
        }`,
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
