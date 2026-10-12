"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils";

interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  zoomScale?: number;
}

/**
 * MotionCard — wraps card elements with smooth Framer Motion zoom-in on hover.
 * Does not modify background or glass styling on hover.
 */
export function MotionCard({
  children,
  className,
  zoomScale = 1.018,
  ...props
}: MotionCardProps) {
  return (
    <motion.div
      whileHover={{
        scale: zoomScale,
        transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] },
      }}
      whileTap={{ scale: 0.99 }}
      className={cn("will-change-transform", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface MotionCardLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  zoomScale?: number;
}

/**
 * MotionCardLink — clickable card with Framer Motion zoom-in on hover.
 */
export function MotionCardLink({
  children,
  className,
  zoomScale = 1.018,
  ...props
}: MotionCardLinkProps) {
  return (
    <motion.div
      whileHover={{
        scale: zoomScale,
        transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] },
      }}
      whileTap={{ scale: 0.99 }}
      className="will-change-transform h-full"
    >
      <Link className={cn("block h-full", className)} {...props}>
        {children}
      </Link>
    </motion.div>
  );
}
