import {
  ChakraProvider,
  cookieStorageManagerSSR,
  localStorageManager,
} from '@chakra-ui/react'
import { ReactNode } from 'react'

export function Chakra({
  cookies,
  children,
}: {
  cookies: unknown
  children: ReactNode
}) {
  const colorModeManager =
    typeof cookies === 'string'
      ? cookieStorageManagerSSR(cookies)
      : localStorageManager

  return (
    <ChakraProvider colorModeManager={colorModeManager}>
      {children}
    </ChakraProvider>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getServerSideProps({ req }: { req: any }) {
  return {
    props: {
      cookies: req.headers.cookie ?? '',
    },
  }
}
