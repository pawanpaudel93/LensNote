import { IPrivateMetadata } from '@/interfaces'
import { Stack, Button, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

export default function PrivateNoteInfo({
  note,
  isDetailPage,
}: {
  isDetailPage: boolean
  note: IPrivateMetadata
}) {
  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm" minW="full">
      <Stack direction="row" alignItems="center">
        <Text fontWeight="semibold">{note?.title}</Text>
      </Stack>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
      >
        <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'}>
          {note?.description}
        </Text>
        {!isDetailPage && (
          <Stack direction={{ base: 'column', md: 'row' }}>
            <NextLink passHref href={'/notes/private/' + note.id}>
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
