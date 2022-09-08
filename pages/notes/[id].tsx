import type { NextPage } from 'next'
import { useQuery } from 'urql'
import { GET_PUBLICATION_QUERY } from '@/graphql/queries'
import { useRouter } from 'next/router'
import { INote } from '@/interfaces'
import NoteInfo from '@/components/Notes/NoteInfo'
import MdEditor from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { Box, Container, SkeletonText } from '@chakra-ui/react'

const Note: NextPage = () => {
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
  return (
    <Container maxW="full" px={12}>
      <SkeletonText noOfLines={4} spacing="4" isLoaded={!data.fetching}>
        <NoteInfo note={note} isDetailPage />
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
