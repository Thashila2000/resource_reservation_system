import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Remove hover effect on static cards */
  noHover?: boolean;
}

/**
 * GlassCard — the primary glass-morphism surface component.
 * Wraps content in a frosted, dark-glass panel.
 */
export function GlassCard({
  children,
  className,
  noHover = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        noHover && "[&:hover]:bg-[rgba(15,23,42,0.55)] [&:hover]:border-white/[0.08]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
