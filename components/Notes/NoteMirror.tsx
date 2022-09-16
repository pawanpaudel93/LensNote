import { usePost } from '@/hooks/usePost'
import { IProfile } from '@/interfaces'
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
import { useState } from 'react'
import { GoMirror } from 'react-icons/go'

const NoteMirror = ({
  profile,
  publicationId,
}: {
  profile: IProfile
  publicationId: string
}) => {
  const toast = useToast()
  const { createMirror } = usePost()
  const [followerOnly, setFollowerOnly] = useState(false)
  const { isOpen, onToggle, onClose } = useDisclosure()

  const mirrorNote = async () => {
    const createMirrorRequest = {
      profileId: profile?.id,
      publicationId,
      referenceModule: {
        followerOnlyReferenceModule: followerOnly,
      },
    }
    try {
      await createMirror(createMirrorRequest)
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
          icon={<GoMirror size="28" />}
          aria-label={''}
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
              <Button colorScheme="red" onClick={mirrorNote}>
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
