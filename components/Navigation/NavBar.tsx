import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  useColorMode,
} from '@chakra-ui/react'
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from '@chakra-ui/icons'
import Logo from '@/components/Logo'
import { useLogin } from '@/hooks/useLogin'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import NextLink, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { JWT_KEY } from '@/constants'
import jwtDecode from 'jwt-decode'
import { useEffect } from 'react'
import SearchBar from './SearchBar'

interface NavLinkProps extends LinkProps {
  children?: string | React.ReactNode
  href: string
}

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'My Notes',
    children: [
      {
        label: 'Public Notes',
        subLabel: 'My public lens notes.',
        href: '/notes',
      },
      {
        label: 'Private Notes',
        subLabel: 'My private notes',
        href: '/notes/private',
      },
    ],
  },
  {
    label: 'Create Note',
    children: [
      {
        label: 'Public Note',
        subLabel: 'Create public lens note',
        href: '/create',
      },
      {
        label: 'Private Note',
        subLabel: 'Create private note',
        href: '/create/private',
      },
    ],
  },
  {
    label: 'My Profiles',
    href: '/my-profiles',
  },
]

export default function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onToggle } = useDisclosure()
  const { login, setMyProfiles, address, isConnected } = useLogin()

  useEffect(() => {
    if (isConnected) {
      const jwt = JSON.parse(localStorage.getItem(JWT_KEY) ?? '{}')
      if (!jwt?.accessToken) {
        login()
      } else {
        const jwtDecoded: { id: string } = jwtDecode(jwt?.accessToken)
        if (jwtDecoded?.id !== address) {
          login()
        }
        setMyProfiles()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address])

  return (
    <Box>
      <Flex
        as="header"
        position="fixed"
        w="100%"
        top={0}
        zIndex={1000}
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 1 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex
          flex={{ base: 1 }}
          justify={{ base: 'center', md: 'start' }}
          align="center"
        >
          <NextLink href="/" passHref>
            <Box cursor="pointer" mr={4}>
              <Logo />
              <Text style={{ display: 'inline' }} color="green">
                Note
              </Text>
            </Box>
          </NextLink>

          <SearchBar />

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          align="center"
          direction={'row'}
          spacing={6}
        >
          <Button onClick={toggleColorMode} mr={3}>
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
          <ConnectButton label="Connect Wallet" accountStatus="avatar" />
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  )
}

const NavLink = ({ href, children }: NavLinkProps) => {
  const router = useRouter()
  const isActive = router.pathname === href
  const color = useColorModeValue('#0E76FD', 'selected')
  const bg = useColorModeValue('gray.200', 'gray.700')
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
            bg,
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
          bg,
        }}
      >
        {children}
      </Link>
    </NextLink>
  )
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200')
  const linkHoverColor = useColorModeValue('gray.800', 'white')
  const popoverContentBgColor = useColorModeValue('white', 'gray.800')

  return (
    <Stack direction={'row'} spacing={4} align="center">
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            {navItem?.href ? (
              <NavLink href={navItem.href}> {navItem.label}</NavLink>
            ) : (
              <PopoverTrigger>
                <Link
                  p={2}
                  href={'#'}
                  fontSize={'md'}
                  fontWeight={500}
                  color={linkColor}
                  _hover={{
                    textDecoration: 'none',
                    color: linkHoverColor,
                  }}
                >
                  {navItem.label}
                </Link>
              </PopoverTrigger>
            )}

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <NextLink href={href} passHref>
      <Link
        href={href}
        role={'group'}
        display={'block'}
        p={2}
        rounded={'md'}
        _hover={{ bg: useColorModeValue('green.50', 'gray.900') }}
      >
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'green.400' }}
              fontWeight={500}
            >
              {label}
            </Text>
            <Text fontSize={'sm'}>{subLabel}</Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify={'flex-end'}
            align={'center'}
            flex={1}
          >
            <Icon color={'green.400'} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </Link>
    </NextLink>
  )
}

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
      mt={16}
      as="header"
      position="fixed"
      w="100%"
      top={-1}
      zIndex={1000}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <NextLink href={href ?? '#'} passHref>
        <Flex
          py={2}
          as={Link}
          justify={'space-between'}
          align={'center'}
          _hover={{
            textDecoration: 'none',
          }}
        >
          <Text
            fontWeight={600}
            color={useColorModeValue('gray.600', 'gray.200')}
          >
            {label}
          </Text>
          {children && (
            <Icon
              as={ChevronDownIcon}
              transition={'all .25s ease-in-out'}
              transform={isOpen ? 'rotate(180deg)' : ''}
              w={6}
              h={6}
            />
          )}
        </Flex>
      </NextLink>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child, index) => (
              <NextLink key={index} href={child.href} passHref>
                <Link py={2}>{child.label}</Link>
              </NextLink>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}
