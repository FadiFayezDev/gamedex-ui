import * as React from "react"

import { cn } from "@/lib/utils"

type SliderProps = {
  min?: number
  max?: number
  step?: number
  value?: number[]
  defaultValue?: number[]
  className?: string
  onValueChange?: (value: number[]) => void
  onValueCommit?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue = [min, max],
      className,
      onValueChange,
      onValueCommit,
    },
    ref
  ) => {
    const [internal, setInternal] = React.useState<number[]>(
      value ?? defaultValue
    )

    React.useEffect(() => {
      if (value) {
        setInternal(value)
      }
    }, [value])

    const updateValue = (index: number, nextValue: number) => {
      const next = [...internal]
      next[index] = nextValue
      if (next[0] > next[1]) {
        next.sort((a, b) => a - b)
      }
      setInternal(next)
      onValueChange?.(next)
    }

    const commitValue = () => {
      onValueCommit?.(internal)
    }

    return (
      <div ref={ref} className={cn("flex flex-1 flex-col gap-2", className)}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={internal[0]}
          onChange={(event) => updateValue(0, Number(event.target.value))}
          onMouseUp={commitValue}
          onTouchEnd={commitValue}
          className="w-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={internal[1]}
          onChange={(event) => updateValue(1, Number(event.target.value))}
          onMouseUp={commitValue}
          onTouchEnd={commitValue}
          className="w-full"
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
