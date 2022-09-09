import type { NextPage } from 'next'
import { useQuery } from 'urql'
import { GET_PUBLICATION_QUERY } from '@/graphql/queries'
import { useRouter } from 'next/router'
import { INote } from '@/interfaces'
import NoteInfo from '@/components/Notes/NoteInfo'
import MdEditor from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { Box, Button, Center, Container, SkeletonText } from '@chakra-ui/react'
import { usePost } from '@/hooks/usePost'
import { useState } from 'react'
import NoteStats from '@/components/Notes/NoteStats'

const Note: NextPage = () => {
  const [isCollecting, setIsCollecting] = useState(false)
  const { collectPost } = usePost()
  const {
    query: { id },
  } = useRouter()

  const [data] = useQuery({
    query: GET_PUBLICATION_QUERY,
    variables: {
      request: { publicationId: id },
    },
  })

  const note: INote = data?.data?.publication

  const collectNote = async () => {
    try {
      setIsCollecting(true)
      await collectPost({ publicationId: id })
    } catch (error) {
      console.log(error)
    } finally {
      setIsCollecting(false)
    }
  }

  return (
    <Container maxW="full" px={12}>
      <SkeletonText noOfLines={4} spacing="4" isLoaded={!data.fetching}>
        <NoteInfo note={note} isDetailPage />
        <NoteStats stats={note?.stats} />
        <Center>
          <Button
            colorScheme="green"
            onClick={collectNote}
            isLoading={isCollecting}
          >
            Collect
          </Button>
        </Center>
        <Box p="4" boxShadow="lg" m="4" borderRadius="sm">
          <MdEditor
            modelValue={note?.metadata?.content as string}
            language="en-US"
            previewOnly
          />
        </Box>
      </SkeletonText>

      <SkeletonText
        noOfLines={20}
        mt={12}
        spacing="4"
        isLoaded={!data.fetching}
      />
    </Container>
  )
}
export default Note
