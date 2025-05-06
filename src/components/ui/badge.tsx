
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        supporter: "border-transparent bg-emerald-900/30 text-emerald-300 border-emerald-500/50",
        leader: "border-transparent bg-blue-900/30 text-blue-300 border-blue-500/50",
        alpha: "border-transparent bg-yellow-900/30 text-yellow-300 border-yellow-500/50",
        og: "border-transparent bg-purple-900/30 text-purple-300 border-purple-500/50",
        mega: "border-transparent bg-red-900/30 text-red-300 border-red-500/50",
        team: "border-transparent bg-white/30 text-white border-white/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
