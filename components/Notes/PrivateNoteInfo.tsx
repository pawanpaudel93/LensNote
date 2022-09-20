import { IPrivateMetadata, IProfile } from '@/interfaces'
import {
  Avatar,
  HStack,
  Link,
  Stack,
  Text,
  useColorMode,
  VStack,
} from '@chakra-ui/react'
import humanizeDuration from 'humanize-duration'
import NextLink from 'next/link'

export default function PrivateNoteInfo({
  note,
  profile,
}: {
  profile: IProfile | null
  note: IPrivateMetadata
}) {
  const duration =
    humanizeDuration(
      new Date().getTime() - new Date(note?.createdAt ?? 0).getTime(),
      { largest: 1 }
    ) + ' ago'
  const { colorMode } = useColorMode()
  return (
    <NextLink passHref href={'/notes/private/' + note.id}>
      <VStack
        p="4"
        mt={3}
        boxShadow="lg"
        borderRadius="sm"
        borderWidth="1px"
        borderColor="gray.300"
        w="100%"
        position="relative"
        rounded="md"
        _hover={{
          bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
          cursor: 'pointer',
        }}
        _focus={{
          bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
        }}
      >
        <HStack w="100%">
          <NextLink passHref href={`/${profile?.handle}`}>
            <Avatar
              as={Link}
              alignSelf="start"
              name={profile?.name ?? ''}
              src={
                profile?.picture?.original?.url ??
                `https://avatars.dicebear.com/api/pixel-art/${profile?.id}.svg`
              }
            />
          </NextLink>

          <Stack w="100%" position="relative" rounded="md">
            <Stack
              direction={{ base: 'row', md: 'column' }}
              justifyContent="space-between"
            >
              <HStack>
                <Text fontWeight="semibold">{note?.title}</Text>
                <Text position="absolute" right="5" fontSize="sm">
                  {duration}
                </Text>
              </HStack>
              <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'}>
                {note?.description}
              </Text>
            </Stack>
          </Stack>
        </HStack>
      </VStack>
    </NextLink>
  )
}
