import { DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

export interface GitBranchIconProps
  extends Omit<
    DetailedHTMLProps<HTMLProps<SVGSVGElement>, SVGSVGElement>,
    'crossOrigin'
  > {}

export default function GitBranchIcon({
  className,
  ...props
}: GitBranchIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge('text-slate-500 dark:text-white', className)}
      aria-label="Git Branch"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.75 3.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-2.5 1a2.5 2.5 0 1 1 3.246 2.387A2.25 2.25 0 0 1 10.25 8.75h-4.5a.75.75 0 0 0-.738.618A2.501 2.501 0 1 1 3.5 9.364V6.635a2.501 2.501 0 1 1 1.5 0v.744a2.25 2.25 0 0 1 .75-.129h4.5a.75.75 0 0 0 .738-.618A2.501 2.501 0 0 1 9.25 4.25Zm-5 6.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-1-6.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
        fill="currentColor"
      />
    </svg>
  )
}
