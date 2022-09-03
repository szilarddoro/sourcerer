import { DetailedHTMLProps, HTMLProps } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps
  extends Omit<
    DetailedHTMLProps<HTMLProps<HTMLDivElement>, HTMLDivElement>,
    'action'
  > {
  action?: boolean;
}

export default function Card({
  action,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        'p-4 bg-white dark:bg-slate-900 border-2 rounded-md dark:border-white dark:border-opacity-5 border-slate-200',
        action &&
          'motion-safe:transition-colors dark:hover:bg-slate-800 dark:hover:bg-opacity-50 hover:bg-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
