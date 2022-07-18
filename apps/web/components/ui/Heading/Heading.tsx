import { createElement, DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

export interface HeadingProps
  extends DetailedHTMLProps<HTMLProps<HTMLHeadingElement>, HTMLHeadingElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export default function Heading({
  variant = 'h1',
  children,
  className,
  ...props
}: HeadingProps) {
  return createElement(
    variant,
    {
      className: twMerge(
        'font-bold',
        variant === 'h1' && 'text-2xl',
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
