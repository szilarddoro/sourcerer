import { DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

export interface ChipProps
  extends DetailedHTMLProps<HTMLProps<HTMLDivElement>, HTMLDivElement> {
  level?: 'success' | 'warning' | 'error' | 'default'
}

export default function Chip({
  className,
  level = 'default',
  children,
  ...props
}: ChipProps) {
  return (
    <div
      className={twMerge(
        level === 'warning' && 'bg-amber-100 text-amber-600',
        level === 'success' && 'bg-green-100 text-green-500',
        level === 'error' && 'bg-red-100 text-red-500',
        level === 'default' && 'bg-slate-100 text-slate-500',
        'text-sm px-2 py-1 rounded-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
