import type { NextPage } from 'next'
import { useQuery } from 'urql'
import { GET_PUBLICATION_QUERY, GET_ALLOWANCE_QUERY } from '@/graphql/queries'
import { useRouter } from 'next/router'
import { ApprovedAllowanceAmount, INote, IProfile } from '@/interfaces'
import NoteInfo from '@/components/Notes/NoteInfo'
import MdEditor from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { Box, Container, SkeletonText } from '@chakra-ui/react'
import NoteStats from '@/components/Notes/NoteStats'
import { WMATIC_TOKEN_ADDRESS } from '@/constants'
import useAppStore from '@/lib/store'

const Note: NextPage = () => {
  const profile = useAppStore((state) => state.defaultProfile)

  const {
    query: { id },
  } = useRouter()

  const [data] = useQuery({
    query: GET_PUBLICATION_QUERY,
    variables: {
      request: { publicationId: id },
      reactionRequest: { profileId: profile?.id },
    },
  })

  const [currencyData] = useQuery({
    query: GET_ALLOWANCE_QUERY,
    variables: {
      request: {
        currencies: [WMATIC_TOKEN_ADDRESS],
        collectModules: [
          'LimitedFeeCollectModule',
          'FeeCollectModule',
          'LimitedTimedFeeCollectModule',
          'TimedFeeCollectModule',
          'FreeCollectModule',
          'RevertCollectModule',
        ],
        followModules: [
          'FeeFollowModule',
          'RevertFollowModule',
          'ProfileFollowModule',
        ],
        referenceModules: ['FollowerOnlyReferenceModule'],
      },
    },
  })

  const approvedModuleAllowanceAmount: ApprovedAllowanceAmount[] =
    currencyData?.data?.approvedModuleAllowanceAmount ?? []
  const note: INote = data?.data?.publication

  return (
    <Container maxW="full" px={12}>
      <SkeletonText noOfLines={4} spacing="4" isLoaded={!data.fetching}>
        <NoteInfo note={note} isDetailPage />
        <NoteStats
          note={note}
          approvedModuleAllowanceAmount={approvedModuleAllowanceAmount}
          profile={profile as IProfile}
        />

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
