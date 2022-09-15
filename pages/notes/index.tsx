import type { NextPage } from 'next'
import { APP_NAME } from '@/constants'
import { GET_EXPLORE_PUBLICATIONS_QUERY } from '@/graphql/queries'
import { useClient } from 'urql'
import { Box, Center, Container, SkeletonText, VStack } from '@chakra-ui/react'
import { INote, PaginatedResultInfo } from '@/interfaces'
import NoteInfo from '@/components/Notes/NoteInfo'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useState } from 'react'

const Notes: NextPage = () => {
  const client = useClient()
  const [notes, setNotes] = useState<INote[]>([])
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [fetching, setFetching] = useState(true)

  const initialFetch = async () => {
    const result = await client
      .query(GET_EXPLORE_PUBLICATIONS_QUERY, {
        request: {
          sortCriteria: 'LATEST',
          noRandomize: true,
          publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
          limit: 10,
          sources: [APP_NAME],
        },
      })
      .toPromise()
    setNotes(result?.data?.explorePublications?.items)
    setPageInfo(result?.data?.explorePublications?.pageInfo)
    setFetching(false)
  }

  const fetchMore = async () => {
    const result = await client
      .query(GET_EXPLORE_PUBLICATIONS_QUERY, {
        request: {
          sortCriteria: 'LATEST',
          noRandomize: true,
          publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
          limit: 10,
          cursor: pageInfo?.next,
          sources: [APP_NAME],
        },
      })
      .toPromise()
    setNotes([...notes, ...result?.data?.explorePublications?.items])
    setPageInfo(result?.data?.explorePublications?.pageInfo)
  }

  useEffect(() => {
    if (notes.length === 0) {
      initialFetch()
    }
  }, [])

  return fetching && notes.length === 0 ? (
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
    <Container maxW="full" px={12}>
      <InfiniteScroll
        dataLength={notes.length}
        next={fetchMore}
        hasMore={notes.length !== pageInfo?.totalCount}
        loader={
          <Center mt="5px">
            <h4>Loading more notes...</h4>
          </Center>
        }
        endMessage={
          <Center mt="5px">
            <b>No more notes...</b>
          </Center>
        }
      >
        <VStack spacing={2}>
          {notes.map((note, index) => (
            <NoteInfo key={index} note={note} isDetailPage={false} />
          ))}
        </VStack>
      </InfiniteScroll>
    </Container>
  )
}

export default Notes
