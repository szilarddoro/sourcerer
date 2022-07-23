import { DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

export interface CalendarIconProps
  extends Omit<
    DetailedHTMLProps<HTMLProps<SVGSVGElement>, SVGSVGElement>,
    'crossOrigin'
  > {}

export default function CalendarIcon({
  className,
  ...props
}: CalendarIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Calendar"
      className={twMerge('text-slate-500 dark:text-white', className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.75 1.5C11.75 1.08579 11.4142 0.75 11 0.75C10.5858 0.75 10.25 1.08579 10.25 1.5V1.75H5.75V1.5C5.75 1.08579 5.41421 0.75 5 0.75C4.58579 0.75 4.25 1.08579 4.25 1.5V1.75H3C2.30964 1.75 1.75 2.30964 1.75 3V5.5V13C1.75 13.6904 2.30964 14.25 3 14.25H13C13.6904 14.25 14.25 13.6904 14.25 13V5.5V3C14.25 2.30964 13.6904 1.75 13 1.75H11.75V1.5ZM12.75 4.75V3.25H11.75V3.5C11.75 3.91421 11.4142 4.25 11 4.25C10.5858 4.25 10.25 3.91421 10.25 3.5V3.25H5.75V3.5C5.75 3.91421 5.41421 4.25 5 4.25C4.58579 4.25 4.25 3.91421 4.25 3.5V3.25H3.25V4.75H12.75ZM3.25 6.25H12.75V12.75H3.25V6.25Z"
        fill="currentColor"
      />
    </svg>
  )
}
