import NextLink from 'next/link'
import { DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'
import { UrlObject } from 'url'

export interface LinkProps
  extends Omit<
    DetailedHTMLProps<HTMLProps<HTMLAnchorElement>, HTMLAnchorElement>,
    'href'
  > {
  href: string | UrlObject
}

export default function Link({ href, children, className }: LinkProps) {
  return (
    <NextLink href={href} passHref>
      <a
        className={twMerge(
          'dark:hover:text-blue-400 hover:text-blue-600 motion-safe:transition-colors',
          className
        )}
      >
        {children}
      </a>
    </NextLink>
  )
}
