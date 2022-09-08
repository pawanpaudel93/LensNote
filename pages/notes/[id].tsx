import type { NextPage } from 'next'
import { useQuery } from 'urql'
import { GET_PUBLICATION_QUERY } from '@/graphql/queries'
import { useRouter } from 'next/router'
import { IPublication } from '@/interfaces'
import NoteInfo from '@/components/Notes/NoteInfo'
import MdEditor from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { Container, SkeletonText } from '@chakra-ui/react'

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

  const publication: IPublication = data?.data?.publication
  return (
    <Container maxW="full" px={12}>
      <SkeletonText noOfLines={5} spacing="4" isLoaded={!data.fetching}>
        <NoteInfo publication={publication} isDetailPage />
        <MdEditor
          modelValue={publication?.metadata?.content as string}
          language="en-US"
          previewOnly
        />
      </SkeletonText>
    </Container>
  )
}
export default Note
