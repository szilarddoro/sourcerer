import '@fontsource/inter'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { NhostClient, NhostNextProvider } from '@nhost/nextjs'
import { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../styles.css'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } }
})

export const nhostClient = new NhostClient({
  subdomain: `ybmwhglwjenvssujfirr`,
  region: `eu-central-1`
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NhostNextProvider nhost={nhostClient}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </NhostNextProvider>
  )
}
