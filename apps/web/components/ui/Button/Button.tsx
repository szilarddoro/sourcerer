import { DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'
import CircularProgress from '../CircularProgress'

export interface ButtonProps
  extends DetailedHTMLProps<HTMLProps<HTMLButtonElement>, HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
}

export default function Button({
  type = 'button',
  children,
  className,
  loading,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        'inline-grid grid-flow-col gap-2 items-center bg-blue-500 hover:bg-blue-600 motion-safe:transition-all focus:bg-blue-600 focus:outline-none active:ring-4 active:ring-blue-200 text-white font-medium border-none rounded-md text-sm p-3 justify-center disabled:bg-slate-300 disabled:text-slate-500',
        className
      )}
      {...props}
      disabled={props.disabled || loading}
    >
      {loading && (
        <CircularProgress
          className="w-3 h-3"
          aria-label={!props.id ? 'Loading...' : undefined}
          aria-labelledby={props.id}
        />
      )}

      {children}
    </button>
  )
}
