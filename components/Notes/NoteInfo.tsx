import { INote } from '@/interfaces'
import { Stack, Button, Text, Tag, HStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { GoMirror } from 'react-icons/go'
import NoteStatsOnly from './NoteStatsOnly'

export default function NoteInfo({
  note,
  isDetailPage,
}: {
  isDetailPage: boolean
  note: INote
}) {
  const isMirrored = note?.mirrorOf ? true : false
  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm" minW="full">
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
          {isMirrored ? note?.mirrorOf?.profile?.handle : note?.profile?.handle}
        </Tag>
      </Text>
    </Stack>
  )
}
