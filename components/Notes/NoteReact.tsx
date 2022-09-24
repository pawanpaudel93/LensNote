import { usePost } from '@/hooks/usePost'
import { INote, IProfile } from '@/types'
import { getRPCErrorMessage } from '@/lib/parser'
import { getDefaultToastOptions } from '@/lib/utils'
import { IconButton, Tooltip, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { BsHeart, BsHeartFill } from 'react-icons/bs'

const NoteReact = ({ note, profile }: { note: INote; profile: IProfile }) => {
  const { reactPost } = usePost()
  const toast = useToast()
  const [reaction, setReaction] = useState({
    isLiked: note?.reaction === 'UPVOTE',
    likeCount: note?.stats?.totalUpvotes,
  })

  return (
    <Tooltip
      hasArrow
      label={reaction.isLiked ? 'Unlike' : 'Like'}
      placement="top"
      shouldWrapChildren
      mt="3"
    >
      {reaction.isLiked ? (
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
              setReaction({
                isLiked: false,
                likeCount: reaction.likeCount - 1,
              })
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
              setReaction({
                isLiked: true,
                likeCount: reaction.likeCount + 1,
              })
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
