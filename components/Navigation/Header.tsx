import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Text,
} from '@chakra-ui/react'
import NextLink, { LinkProps } from 'next/link'
import { HamburgerIcon, CloseIcon, SunIcon, MoonIcon } from '@chakra-ui/icons'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useLogin } from '@/hooks/useLogin'
import { JWT_KEY } from '@/constants'
import Logo from '@/components/Logo'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

interface NavItem {
  key: number
  label: string
  href?: string
}

interface NavLinkProps extends LinkProps {
  children?: string | React.ReactNode
  href: string
}

const NavItems: Array<NavItem> = [
  {
    key: 0,
    label: 'Notes',
    href: '/notes',
  },
  {
    key: 1,
    label: 'Create Note',
    href: '/create',
  },
  {
    key: 2,
    label: 'My Profiles',
    href: '/my-profiles',
  },
]

const NavLink = ({ href, children }: NavLinkProps) => {
  const router = useRouter()
  const isActive = router.pathname === href
  const color = useColorModeValue('#0E76FD', 'selected')

  if (isActive) {
    return (
      <NextLink href={href} passHref>
        <Link
          fontWeight="bold"
          color={color}
          px={2}
          py={1}
          rounded={'md'}
          _hover={{
            textDecoration: 'none',
            bg: useColorModeValue('gray.200', 'gray.700'),
          }}
          border="1px solid"
        >
          {children}
        </Link>
      </NextLink>
    )
  }

  return (
    <NextLink href={href} passHref>
      <Link
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
          textDecoration: 'none',
          bg: useColorModeValue('gray.200', 'gray.700'),
        }}
      >
        {children}
      </Link>
    </NextLink>
  )
}

export default function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { address, isConnected } = useAccount()
  const { login } = useLogin()

  useEffect(() => {
    if (isConnected) {
      const jwt = JSON.parse(localStorage.getItem(JWT_KEY) ?? '{}')
      if (!jwt?.accessToken) {
        login()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address])

  return (
    <>
      <Flex as="header" position="fixed" w="100%" top={0} zIndex={1000}>
        <Box w="100%" bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
            <IconButton
              size={'md'}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label={'Open Menu'}
              display={{ md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
            />
            <HStack spacing={8} alignItems={'center'}>
              <NextLink href="/" passHref>
                <Box cursor="pointer">
                  <Logo />
                  <Text style={{ display: 'inline' }} color="green">
                    Note
                  </Text>
                </Box>
              </NextLink>

              <HStack
                as={'nav'}
                spacing={4}
                display={{ base: 'none', md: 'flex' }}
              >
                {NavItems.map((navItem) => (
                  <NavLink key={navItem.key} href={navItem.href as string}>
                    {navItem.label}
                  </NavLink>
                ))}
              </HStack>
            </HStack>
            <Flex alignItems={'center'}>
              <Stack direction={'row'} spacing={3}>
                <Button onClick={toggleColorMode} mr={3}>
                  {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                </Button>
                <ConnectButton label="Connect Wallet" accountStatus="avatar" />
              </Stack>
            </Flex>
          </Flex>

          {isOpen ? (
            <Box pb={4} display={{ md: 'none' }}>
              <Stack as={'nav'} spacing={4}>
                {NavItems.map((navItem) => (
                  <NavLink key={navItem.key} href={navItem.href as string}>
                    {navItem.label}
                  </NavLink>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Box>
      </Flex>
    </>
  )
}
