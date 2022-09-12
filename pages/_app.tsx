import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '@rainbow-me/rainbowkit/styles.css'
import Layout from '@/components/Common/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout pageProps={undefined}>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
