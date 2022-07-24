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
          'bg-amber-100 dark:bg-amber-200 text-amber-500 dark:text-amber-800',
        level === 'success' &&
          'bg-green-100 dark:bg-green-200 text-green-500 dark:text-green-800',
        level === 'error' &&
          'bg-red-100 dark:bg-red-200 text-red-500 dark:text-red-800',
        level === 'default' &&
          'bg-slate-200 dark:bg-white dark:bg-opacity-20 text-slate-600 dark:text-white dark:text-opacity-90',
        'text-xs px-2 py-1 rounded-md font-medium',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
