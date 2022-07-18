import { ForwardedRef, forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  helperText?: string
  error?: boolean
}

export default forwardRef(function Input(
  { className, label, error, helperText, ...props }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  return (
    <div className="inline-grid grid-flow-row gap-0.5">
      {label && (
        <label
          className={twMerge(
            'text-sm font-medium justify-self-start',
            error && 'text-red-500'
          )}
          htmlFor={props.id}
        >
          {label}{' '}
          {!props.required && (
            <span className="text-xs font-normal text-slate-400">
              (Optional)
            </span>
          )}
        </label>
      )}

      <input
        className={twMerge(
          'border-2 border-slate-200 dark:border-white dark:border-opacity-5 dark:bg-slate-800 dark:bg-opacity-50 focus:border-blue-500 focus:outline-none p-3 rounded-md text-sm',
          error && 'border-red-500 focus:border-red-600',
          className
        )}
        {...props}
        ref={ref}
      />

      <p
        className={twMerge(
          'text-xs text-slate-500 dark:text-white dark:text-opacity-50',
          error && 'text-red-500'
        )}
      >
        {helperText}
      </p>
    </div>
  )
})
