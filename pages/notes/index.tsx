import type { NextPage } from 'next'
import { APP_NAME } from '@/constants'
import { GET_PUBLICATIONS_QUERY } from '@/graphql/queries'
import { useClient } from 'urql'
import { Box, Center, Container, SkeletonText, VStack } from '@chakra-ui/react'
import { INote, PaginatedResultInfo } from '@/types'
import NoteInfo from '@/components/Notes/NoteInfo'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useState } from 'react'
import useAppStore from '@/lib/store'

const Notes: NextPage = () => {
  const client = useClient()
  const [notes, setNotes] = useState<INote[]>([])
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [fetching, setFetching] = useState(true)
  const profile = useAppStore((state) => state.defaultProfile)

  const initialFetch = async () => {
    const result = await client
      .query(GET_PUBLICATIONS_QUERY, {
        request: {
          profileId: profile?.id,
          publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
          limit: 10,
          sources: [APP_NAME],
        },
      })
      .toPromise()
    if (result.data) {
      setNotes([...notes, ...result?.data?.publications?.items])
      setPageInfo(result?.data?.publications?.pageInfo)
    }
    setFetching(false)
  }

  const fetchMore = async () => {
    const result = await client
      .query(GET_PUBLICATIONS_QUERY, {
        request: {
          profileId: profile?.id,
          publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
          limit: 10,
          cursor: pageInfo?.next,
          sources: [APP_NAME],
        },
      })
      .toPromise()
    if (result.data) {
      setNotes([...notes, ...result?.data?.publications?.items])
      setPageInfo(result?.data?.publications?.pageInfo)
    }
  }

  useEffect(() => {
    if (profile?.id && notes.length === 0) {
      initialFetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

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
        <VStack spacing={4}>
          {notes.map((note, index) => (
            <NoteInfo key={index} note={note} isDetailPage={false} />
          ))}
        </VStack>
      </InfiniteScroll>
    </Container>
  )
}
Notes.displayName = 'Notes'
export default Notes
