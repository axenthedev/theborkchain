
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-bork-green text-black hover:bg-bork-green/90 hover:shadow-[0_0_15px_rgba(57,255,20,0.7)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-bork-green text-bork-green bg-transparent hover:bg-bork-green/10 hover:text-white hover:border-bork-green/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-white underline-offset-4 hover:underline hover:text-bork-green",
        supporter: "bg-emerald-800/50 text-emerald-100 hover:bg-emerald-700/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]",
        leader: "bg-blue-800/50 text-blue-100 hover:bg-blue-700/60 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
        alpha: "bg-yellow-800/50 text-yellow-100 hover:bg-yellow-700/60 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]",
        og: "bg-purple-800/50 text-purple-100 hover:bg-purple-700/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]",
        mega: "bg-red-800/50 text-red-100 hover:bg-red-700/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        team: "bg-white/20 text-white hover:bg-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 rounded-xl px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
