import { NextSeo, NextSeoProps } from 'next-seo'
import Link from 'next/link'
import { DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

export interface LayoutProps
  extends DetailedHTMLProps<HTMLProps<HTMLDivElement>, HTMLDivElement> {
  seoProps?: NextSeoProps
}

export default function Layout({
  title,
  seoProps,
  children,
  className,
  ...props
}: LayoutProps) {
  return (
    <div className={twMerge(className)} {...props}>
      <NextSeo
        title={title}
        titleTemplate="%s - Sourcerer"
        defaultTitle="Sourcerer"
        {...seoProps}
      />

      <header className="fixed w-full px-4 py-4 bg-white border-b lg:px-6 dark:border-white dark:border-opacity-5 border-slate-200 dark:bg-opacity-50 dark:bg-slate-800 transform-gpu">
        <Link href="/" passHref>
          <a className="font-medium dark:hover:text-blue-500 hover:text-blue-600 motion-safe:transition-colors">
            🧙 Sourcerer
          </a>
        </Link>
      </header>

      <div className="pt-14">{children}</div>
    </div>
  )
}
