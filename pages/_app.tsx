import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import NextNProgress from 'nextjs-progressbar'
import Header from '@/components/Navigation/Header'
import {
  dedupExchange,
  cacheExchange,
  fetchExchange,
  makeOperation,
} from '@urql/core'
import { authExchange } from '@urql/exchange-auth'
import { withUrqlClient } from 'next-urql'
import { refreshMutation } from '@/graphql/mutations'
import { JWT_KEY } from '@/constants'
import { Footer } from '@/components/Navigation/Footer'

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [
    jsonRpcProvider({
      rpc: () => {
        return {
          http: process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL as string,
          webSocket: process.env.NEXT_PUBLIC_QUICKNODE_RPC_WSS_URL as string,
        }
      },
      priority: 0,
    }),
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID as string,
      priority: 1,
    }),
    publicProvider({ priority: 2 }),
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'LensNote',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ChakraProvider>
          <Header />
          <NextNProgress />
          <div style={{ marginTop: '70px', minHeight: 'calc(100vh - 70px)' }}>
            <Component {...pageProps} />
          </div>
          <Footer />
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export interface AuthState {
  accessToken?: string
  refreshToken?: string
  expiry?: number
}

export default withUrqlClient((ssrExchange) => ({
  url: 'https://api-mumbai.lens.dev',
  exchanges: [
    dedupExchange,
    cacheExchange,
    ssrExchange,
    authExchange<AuthState>({
      addAuthToOperation: ({ authState, operation }) => {
        // the accessToken isn't in the auth state, return the operation without changes
        if (!authState || !authState?.accessToken) {
          return operation
        }

        // fetchOptions can be a function (See Client API) but you can simplify this based on usage
        const fetchOptions =
          typeof operation.context.fetchOptions === 'function'
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {}

        return makeOperation(operation.kind, operation, {
          ...operation.context,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              'x-access-token': `Bearer ${authState?.accessToken}`,
            },
          },
        })
      },
      willAuthError: ({ authState }) => {
        if (
          !authState ||
          (authState?.expiry &&
            new Date().getTime() >= authState?.expiry * 1000)
        ) {
          return true
        }
        return false
      },
      didAuthError: ({ error }) => {
        // check if the error was an auth error (this can be implemented in various ways, e.g. 401 or a special error code)
        return error.graphQLErrors.some(
          (e) => e.extensions?.code === 'FORBIDDEN'
        )
      },
      getAuth: async ({ authState, mutate }) => {
        // for initial launch, fetch the auth state from storage (local storage, async storage etc)
        if (typeof window === 'undefined') return null
        if (!authState) {
          const { accessToken, refreshToken, expiry } = JSON.parse(
            localStorage.getItem(JWT_KEY) ??
              '{"accessToken":"","refreshToken":"","expiry":0}'
          )
          if (accessToken && refreshToken) {
            return { accessToken, refreshToken, expiry }
          }
          return null
        }

        /**
         * the following code gets executed when an auth error has occurred
         * we should refresh the accessToken if possible and return a new auth state
         * If refresh fails, we should log out
         **/

        // if your refresh logic is in graphQL, you must use this mutate function to call it
        // if your refresh logic is a separate RESTful endpoint, use fetch or similar
        const result = await mutate(refreshMutation, {
          refreshToken: authState?.refreshToken,
        })

        if (result.data?.refresh) {
          // save the new tokens in storage for next restart
          const expiry = jwtDecode<JwtPayload>(
            result.data.refresh.accessToken
          ).exp
          localStorage.setItem(
            JWT_KEY,
            JSON.stringify({
              accessToken: result.data.refresh.accessToken,
              refreshToken: result.data.refresh.refreshToken,
              expiry,
            })
          )

          // return the new tokens
          return {
            accessToken: result.data.refresh.accessToken,
            refreshToken: result.data.refresh.refreshToken,
            expiry,
          }
        }

        // otherwise, if refresh fails, log clear storage and log out
        localStorage.clear()

        // your app logout logic should trigger here
        // logout()

        return null
      },
    }),
    fetchExchange,
  ],
}))(MyApp)
