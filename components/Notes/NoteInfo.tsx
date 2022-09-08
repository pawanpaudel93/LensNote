import { IPublication } from '@/interfaces'
import { Stack, Button, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

export default function NoteInfo({
  publication,
  isDetailPage,
}: {
  isDetailPage: boolean
  publication: IPublication
}) {
  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
      <Stack direction="row" alignItems="center">
        <Text fontWeight="semibold">{publication?.metadata?.name}</Text>
      </Stack>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
      >
        <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'}>
          {publication?.metadata?.description}
        </Text>
        {!isDetailPage && (
          <Stack direction={{ base: 'column', md: 'row' }}>
            <NextLink passHref href={'/notes/' + publication.id}>
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
