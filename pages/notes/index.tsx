import type { NextPage } from 'next'
import { APP_NAME } from '@/constants'
import { GET_EXPLORE_PUBLICATIONS_QUERY } from '@/graphql/queries'
import { useQuery } from 'urql'
import { Box, Container, SkeletonText, VStack } from '@chakra-ui/react'
import { IPublication } from '@/interfaces'
import NoteInfo from '@/components/Notes/NoteInfo'

const Notes: NextPage = () => {
  const [result] = useQuery({
    query: GET_EXPLORE_PUBLICATIONS_QUERY,
    variables: {
      request: {
        // profileId: '0x455f',
        sortCriteria: 'LATEST',
        publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
        limit: 10,
        sources: [APP_NAME],
      },
    },
  })

  const publications: IPublication[] =
    result.data?.explorePublications?.items ?? []

  return result.fetching ? (
    <Container maxW="full" px={12}>
      {Array(4)
        .fill(0)
        .map((_, index) => (
          <Box padding="6" my={6} boxShadow="lg" bg="white" key={index}>
            <SkeletonText mt="4" noOfLines={3} spacing="4" />
          </Box>
        ))}
    </Container>
  ) : (
    <VStack spacing={2}>
      {publications.map((publication, index) => (
        <NoteInfo key={index} publication={publication} isDetailPage={false} />
      ))}
    </VStack>
  )
}

export default Notes
