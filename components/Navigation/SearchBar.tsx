import { SEARCH_PROFILE_QUERY } from '@/graphql/queries'
import { IProfile } from '@/types'
import { SearchIcon } from '@chakra-ui/icons'
import {
  InputGroup,
  InputLeftElement,
  Input,
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  HStack,
  Avatar,
  VStack,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useQuery } from 'urql'
import NextLink from 'next/link'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [result] = useQuery({
    query: SEARCH_PROFILE_QUERY,
    variables: {
      request: {
        query,
        type: 'PROFILE',
        limit: 10,
      },
    },
    pause: query === '',
  })
  const profiles: (IProfile & { profileId: string })[] =
    result?.data?.search?.items ?? []

  return (
    <Box>
      <Popover defaultIsOpen={true} openDelay={0} trigger="hover">
        <PopoverTrigger>
          <InputGroup rounded="xl" borderColor="gray.500">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
        </PopoverTrigger>
        {query !== '' && (
          <Portal>
            <PopoverContent>
              <PopoverArrow />
              <PopoverBody>
                {profiles.map((profile) => (
                  <NextLink
                    href={'/' + profile?.handle}
                    key={profile?.profileId}
                    passHref
                  >
                    <HStack
                      spacing={5}
                      p={1}
                      borderBottom="1px"
                      _hover={{
                        bg: 'gray.100',
                        cursor: 'pointer',
                      }}
                      _focus={{
                        bg: 'gray.100',
                      }}
                    >
                      <Avatar
                        name={profile?.name ?? ''}
                        src={
                          profile?.picture?.original?.url ??
                          `https://avatars.dicebear.com/api/pixel-art/${profile?.profileId}.svg`
                        }
                      />
                      <VStack spacing={0}>
                        <Text>{profile?.name ?? ''}</Text>
                        <Text color="blue">@{profile.handle}</Text>
                      </VStack>
                    </HStack>
                  </NextLink>
                ))}
                {profiles.length === 0 && <Text>No profiles...</Text>}
              </PopoverBody>
            </PopoverContent>
          </Portal>
        )}
      </Popover>
    </Box>
  )
}
export default SearchBar
