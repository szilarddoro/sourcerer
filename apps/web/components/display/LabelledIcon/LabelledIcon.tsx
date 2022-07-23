import {
  Children,
  cloneElement,
  DetailedHTMLProps,
  HTMLProps,
  isValidElement,
  ReactNode
} from 'react'
import { twMerge } from 'tailwind-merge'

export interface LabelledIconProps
  extends DetailedHTMLProps<HTMLProps<HTMLDivElement>, HTMLDivElement> {
  icon?: ReactNode
}

export default function LabelledIcon({
  icon,
  children,
  className,
  ...props
}: LabelledIconProps) {
  return (
    <div
      className={twMerge(
        'grid items-center justify-start grid-flow-col gap-1 text-xs text-slate-900 dark:text-white',
        className
      )}
      {...props}
    >
      {Children.map(icon, (child) => {
        if (!isValidElement(child)) {
          return null
        }

        return cloneElement(child, {
          'aria-label': children,
          ...child.props
        })
      }) ?? null}

      <span>{children}</span>
    </div>
  )
}
