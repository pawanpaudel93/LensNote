import { INote } from '@/interfaces'
import {
  Stack,
  Text,
  HStack,
  Link,
  Avatar,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import NoteStatsOnly from './NoteStatsOnly'
import humanizeDuration from 'humanize-duration'
import { BsArrowLeftRight } from 'react-icons/bs'

export default function NoteInfo({
  note,
  isDetailPage,
}: {
  isDetailPage: boolean
  note: INote
}) {
  const { colorMode } = useColorMode()
  const isMirrored = note?.mirrorOf ? true : false
  const duration =
    humanizeDuration(
      new Date().getTime() - new Date(note?.createdAt ?? 0).getTime(),
      { largest: 1 }
    ) + ' ago'
  return (
    <NextLink passHref href={'/notes/' + note?.id}>
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
        align="start"
      >
        {isMirrored && (
          <HStack align="start">
            <BsArrowLeftRight color="gray" />
            <Text color="gray">
              <NextLink href={`/${note?.profile?.handle}`} passHref>
                <Link>{note?.profile?.handle}</Link>
              </NextLink>{' '}
              mirrored the note.
            </Text>
          </HStack>
        )}

        <HStack w="100%">
          <NextLink
            passHref
            href={`/${
              isMirrored
                ? note?.mirrorOf?.profile?.handle
                : note?.profile?.handle
            }`}
          >
            <Avatar
              as={Link}
              alignSelf="start"
              name={note?.profile?.name ?? ''}
              src={
                note?.profile?.picture?.original?.url ??
                `https://avatars.dicebear.com/api/pixel-art/${note?.profile?.id}.svg`
              }
            />
          </NextLink>

          <Stack w="100%" position="relative" rounded="md">
            <VStack align="start">
              <HStack>
                <Text fontWeight="semibold">{note?.metadata?.name}</Text>
                <Text position="absolute" right="5" fontSize="sm">
                  {duration}
                </Text>
              </HStack>

              <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'}>
                {note?.metadata?.description}
              </Text>
            </VStack>

            {!isDetailPage && <NoteStatsOnly stats={note?.stats} />}
          </Stack>
        </HStack>
      </VStack>
    </NextLink>
  )
}
