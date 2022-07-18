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
        level === 'warning' &&
          'bg-amber-100 text-amber-600 dark:text-amber-700',
        level === 'success' &&
          'bg-green-100 text-green-500 dark:text-green-600',
        level === 'error' && 'bg-red-100 text-red-500 dark:text-red-600',
        level === 'default' && 'bg-slate-100 text-slate-500',
        'text-xs px-2 py-1 rounded-md font-medium',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
