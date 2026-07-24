import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground": variant === "default",
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80":
            variant === "secondary",
          "text-foreground": variant === "outline",
          "border-transparent bg-red-500/15 text-red-600 dark:text-red-400":
            variant === "destructive",
          "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400":
            variant === "success",
          "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400":
            variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
