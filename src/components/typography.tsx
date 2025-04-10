import type { FC, ReactNode } from "react";

import { cn } from "~/lib/utils";

const Typography: FC<{
  variant: "h1" | "h2" | "p" | "muted";
  textAlign?: "left" | "center" | "right" | "justify";
  className?: string;
  children: ReactNode;
}> = (props) => {
  const alignClass = props.textAlign ? `text-${props.textAlign}` : "";

  switch (props.variant) {
    case "h1":
      return (
        <h1
          className={cn(
            `text-primary text-4xl font-bold backdrop-blur-xs ${alignClass}`,
            props.className,
          )}
        >
          {props.children}
        </h1>
      );
    case "h2":
      return (
        <h2
          className={cn(
            `text-3xl font-semibold backdrop-blur-xs ${alignClass}`,
            props.className,
          )}
        >
          {props.children}
        </h2>
      );
    case "p":
      return (
        <p
          className={cn(
            `text-base font-medium backdrop-blur-xs ${alignClass}`,
            props.className,
          )}
        >
          {props.children}
        </p>
      );
    case "muted":
      return (
        <span
          className={cn(
            `text-muted-foreground text-base font-medium backdrop-blur-xs ${alignClass}`,
            props.className,
          )}
        >
          {props.children}
        </span>
      );
    default:
      return (
        <span className={cn(`backdrop-blur-xs ${alignClass}`, props.className)}>
          {props.children}
        </span>
      );
  }
};

export default Typography;
