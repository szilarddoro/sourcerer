import { createElement, DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

export type HeadingType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface HeadingProps
  extends DetailedHTMLProps<HTMLProps<HTMLHeadingElement>, HTMLHeadingElement> {
  variant?: HeadingType
  component?: HeadingType
}

export default function Heading({
  variant = 'h1',
  component,
  children,
  className,
  ...props
}: HeadingProps) {
  return createElement(
    component || variant,
    {
      className: twMerge(
        'font-bold',
        variant === 'h1' && 'text-3xl',
        variant === 'h2' && 'text-xl',
        variant === 'h3' && 'text-lg',
        variant === 'h4' && 'text-base',
        variant === 'h5' && 'text-sm',
        variant === 'h6' && 'text-xs',
        className
      ),
      ...props
    },
    children
  )
}
