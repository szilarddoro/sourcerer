import { DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

export interface ContainerProps
  extends DetailedHTMLProps<HTMLProps<HTMLDivElement>, HTMLDivElement> {}

export default function Container({
  children,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={twMerge(
        'grid max-w-5xl grid-flow-row gap-6 px-4 lg:px-6 py-6 mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
