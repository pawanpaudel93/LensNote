import { usePost } from '@/hooks/usePost'
import { INote, IProfile } from '@/types'
import { getRPCErrorMessage } from '@/lib/parser'
import { getDefaultToastOptions } from '@/lib/utils'
import { IconButton, Tooltip, useToast } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useState } from 'react'
import { BsHeart, BsHeartFill } from 'react-icons/bs'

const NoteReact = ({
  note,
  profile,
  setStats,
}: {
  note: INote
  profile: IProfile
  setStats: Dispatch<
    SetStateAction<{
      totalAmountOfCollects: number
      totalAmountOfMirrors: number
      totalUpvotes: number
    }>
  >
}) => {
  const { reactPost } = usePost()
  const toast = useToast()
  const [isLiked, setIsLiked] = useState(note?.reaction === 'UPVOTE')

  return (
    <Tooltip
      hasArrow
      label={isLiked ? 'Unlike' : 'Like'}
      placement="top"
      shouldWrapChildren
      mt="3"
    >
      {isLiked ? (
        <IconButton
          icon={<BsHeartFill color="red" size="28" />}
          aria-label="upvote"
          onClick={async () => {
            try {
              reactPost(
                {
                  profileId: profile?.id,
                  reaction: 'UPVOTE',
                  publicationId: note?.id,
                },
                'REMOVE'
              )
              setIsLiked(false)
              setStats((prev) => ({
                ...prev,
                totalUpvotes: prev.totalUpvotes - 1,
              }))
              toast({
                title: 'Unliked Note.',
                description: 'Note has been unliked sucessfully.',
                ...getDefaultToastOptions('success'),
              })
            } catch (error) {
              toast({
                title: 'Unlike error.',
                description: getRPCErrorMessage(error),
                ...getDefaultToastOptions('error'),
              })
            }
          }}
        />
      ) : (
        <IconButton
          icon={<BsHeart color="red" size="28" />}
          aria-label="upvote"
          onClick={async () => {
            try {
              reactPost(
                {
                  profileId: profile?.id,
                  reaction: 'UPVOTE',
                  publicationId: note?.id,
                },
                'ADD'
              )
              setIsLiked(true)
              setStats((prev) => ({
                ...prev,
                totalUpvotes: prev.totalUpvotes + 1,
              }))
              toast({
                title: 'Liked Note.',
                description: 'Note has been liked sucessfully.',
                ...getDefaultToastOptions('success'),
              })
            } catch (error) {
              toast({
                title: 'Like error.',
                description: getRPCErrorMessage(error),
                ...getDefaultToastOptions('error'),
              })
            }
          }}
        />
      )}
    </Tooltip>
  )
}
export default NoteReact
