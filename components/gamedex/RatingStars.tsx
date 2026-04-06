"use client"

import * as React from "react"
import { IconStar, IconStarFilled } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

type RatingStarsProps = {
  value: number
  onChange: (value: number) => void
  className?: string
  size?: number
  activeClassName?: string
  inactiveClassName?: string
}

export function RatingStars({
  value,
  onChange,
  className,
  size = 18,
  activeClassName = "text-[#3b82f6]",
  inactiveClassName = "text-zinc-700",
}: RatingStarsProps) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1
        const isActive = starValue <= value

        return (
          <button
            key={starValue}
            type="button"
            className={cn(
              "transition-transform hover:scale-110",
              isActive ? activeClassName : inactiveClassName
            )}
            onClick={() => onChange(starValue)}
            aria-pressed={isActive}
          >
            {isActive ? (
              <IconStarFilled size={size} />
            ) : (
              <IconStar size={size} />
            )}
          </button>
        )
      })}
    </div>
  )
}
