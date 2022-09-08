import { INote } from '@/interfaces'
import { Stack, Button, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

export default function NoteInfo({
  note,
  isDetailPage,
}: {
  isDetailPage: boolean
  note: INote
}) {
  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
      <Stack direction="row" alignItems="center">
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
    </Stack>
  )
}
