import { DetailedHTMLProps, HTMLProps } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CircularProgressProps
  extends Omit<
    DetailedHTMLProps<HTMLProps<SVGSVGElement>, SVGSVGElement>,
    'crossOrigin'
  > {}

export default function CircularProgress({
  className,
  ...props
}: CircularProgressProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="progressbar"
      className={twMerge('text-slate-500 w-6 h-6 animate-spin', className)}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        fill="none"
        strokeWidth="4"
        className="opacity-25"
      />

      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        className="opacity-75"
      />
    </svg>
  );
}
