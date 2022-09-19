import { INote } from '@/interfaces'
import { Stack, Button, Text, Tag, HStack, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { GoMirror } from 'react-icons/go'
import NoteStatsOnly from './NoteStatsOnly'
import humanizeDuration from 'humanize-duration'

export default function NoteInfo({
  note,
  isDetailPage,
}: {
  isDetailPage: boolean
  note: INote
}) {
  const isMirrored = note?.mirrorOf ? true : false
  const duration =
    humanizeDuration(
      new Date().getTime() - new Date(note?.createdAt ?? 0).getTime(),
      { largest: 1 }
    ) + ' ago'
  return (
    <Stack
      p="4"
      boxShadow="lg"
      borderRadius="sm"
      borderWidth="1px"
      borderColor="gray.300"
      minW="full"
      position="relative"
      rounded="md"
    >
      <Text position="absolute" right="5" fontSize="sm">
        {duration}
      </Text>
      <Stack direction="column" alignItems="start">
        {isMirrored && (
          <HStack>
            <GoMirror color="gray" />
            <Text color="gray">{note?.profile?.handle} mirrored the note.</Text>
          </HStack>
        )}
        <Text fontWeight="semibold">{note?.metadata?.name}</Text>
      </Stack>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
      >
        <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'}>
          {note?.metadata?.description}
        </Text>
        {!isDetailPage && (
          <Stack direction={{ base: 'column', md: 'row' }}>
            <NextLink passHref href={'/notes/' + note.id}>
              <Button variant="outline" colorScheme="blue">
                View Note
              </Button>
            </NextLink>
          </Stack>
        )}
      </Stack>
      {!isDetailPage && <NoteStatsOnly stats={note?.stats} />}
      <Text>
        <b>Note By</b>:{' '}
        <Tag>
          <NextLink passHref href={`/${note?.profile?.handle}`}>
            <Link>
              {isMirrored
                ? note?.mirrorOf?.profile?.handle
                : note?.profile?.handle}
            </Link>
          </NextLink>
        </Tag>
      </Text>
    </Stack>
  )
}
