import { usePost } from '@/hooks/usePost'
import { IProfile } from '@/types'
import { getRPCErrorMessage } from '@/lib/parser'
import { getDefaultToastOptions } from '@/lib/utils'
import {
  Button,
  ButtonGroup,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  useDisclosure,
  useToast,
  Text,
} from '@chakra-ui/react'
import { Dispatch, SetStateAction, useState } from 'react'
import { BsArrowLeftRight } from 'react-icons/bs'

const NoteMirror = ({
  profile,
  publicationId,
  isMirrorable,
  setStats,
}: {
  profile: IProfile
  publicationId: string
  isMirrorable: boolean
  setStats: Dispatch<
    SetStateAction<{
      totalAmountOfCollects: number
      totalAmountOfMirrors: number
      totalUpvotes: number
    }>
  >
}) => {
  const toast = useToast()
  const { createMirror } = usePost()
  const [followerOnly, setFollowerOnly] = useState(false)
  const { isOpen, onToggle, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)

  const mirrorNote = async () => {
    setIsLoading(true)
    const createMirrorRequest = {
      profileId: profile?.id,
      publicationId,
      referenceModule: {
        followerOnlyReferenceModule: followerOnly,
      },
    }
    try {
      await createMirror(createMirrorRequest)
      setStats((prev) => ({
        ...prev,
        totalAmountOfMirrors: prev.totalAmountOfMirrors + 1,
      }))
      toast({
        title: 'Note Mirrored.',
        description: 'Note has been mirrored successfully.',
        ...getDefaultToastOptions('success'),
      })
    } catch (error) {
      toast({
        title: 'Note mirror error.',
        description: getRPCErrorMessage(error),
        ...getDefaultToastOptions('error'),
      })
    }
    setIsLoading(false)
  }

  return (
    <>
      <Tooltip
        hasArrow
        label="Mirror"
        placement="top"
        shouldWrapChildren
        mt="3"
      >
        <IconButton
          onClick={onToggle}
          icon={<BsArrowLeftRight size="28" />}
          aria-label={''}
          isDisabled={!isMirrorable}
        />
      </Tooltip>
      <Popover
        returnFocusOnClose={false}
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        closeOnBlur={false}
      >
        <PopoverContent>
          <PopoverHeader fontWeight="semibold">Mirror Note ?</PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <Text>
              Allow your follower or all to mirror or comment to this mirror ?
            </Text>
            <RadioGroup
              onChange={(value) => setFollowerOnly(value === 'true')}
              value={String(followerOnly)}
            >
              <Stack direction="row">
                <Radio value="true">Follower Only</Radio>
                <Radio value="false">All</Radio>
              </Stack>
            </RadioGroup>
          </PopoverBody>
          <PopoverFooter display="flex" justifyContent="flex-end">
            <ButtonGroup size="sm">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={mirrorNote}
                isLoading={isLoading}
              >
                Mirror Note
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </>
  )
}
export default NoteMirror
