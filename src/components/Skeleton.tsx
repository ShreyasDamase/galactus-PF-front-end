// components/ui/Skeleton.tsx
import React from "react";
import clsx from "classnames";

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={clsx(
      "relative overflow-hidden bg-neutral-800/60 rounded-md",
      className
    )}
  >
    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);
