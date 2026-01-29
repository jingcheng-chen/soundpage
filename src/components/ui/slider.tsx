import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  valueDisplay?: string
}

export const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, valueDisplay, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {(label || valueDisplay) && (
        <div className="flex items-center justify-between px-1">
          {label && (
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider whitespace-nowrap">{label}</span>
          )}
          {valueDisplay && (
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider whitespace-nowrap ml-2">
              {valueDisplay}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center py-4',
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-surface-high">
          <SliderPrimitive.Range className="absolute h-full bg-accent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-4 w-4 rounded-full',
            'bg-white shadow-md shadow-black/10',
            'border-[0.5px] border-black/10',
            'transition-transform duration-[--duration-fast]',
            'hover:scale-110',
            'focus-visible:outline-none ring-accent/20 focus-visible:ring-2 focus-visible:ring-accent',
            'disabled:pointer-events-none disabled:opacity-50',
            'cursor-grab active:cursor-grabbing'
          )}
        />
      </SliderPrimitive.Root>
    </div>
  )
})

Slider.displayName = 'Slider'
