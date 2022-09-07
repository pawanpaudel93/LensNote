import type { NextPage } from 'next'
import { FormEvent, useEffect, useState } from 'react'
import MdEditor, { type ToolbarNames } from 'md-editor-rt'
import { v4 as uuidv4 } from 'uuid'
import { CreatableSelect, useChakraSelectProps } from 'chakra-react-select'
import {
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import {
  IMetadata,
  PublicationMetadataVersions,
  PublicationMainFocus,
  IProfile,
} from '@/interfaces/'
import { usePost } from '@/hooks/usePost'
import { getDefaultProfileQuery } from '@/graphql/queries'
import { useAccount } from 'wagmi'
import { useClient } from 'urql'
import { APP_NAME } from '@/constants'
import 'md-editor-rt/lib/style.css'

const CreateNote: NextPage = () => {
  const { createPost } = usePost()
  const { address } = useAccount()
  const client = useClient()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<IProfile>()
  const toolbarsExclude: ToolbarNames[] = ['github']
  const [metadata, setMetadata] = useState<IMetadata>({
    version: PublicationMetadataVersions.two,
    metadata_id: uuidv4(),
    name: '',
    description: '',
    content: '# Note',
    locale: 'en-US',
    tags: [],
    contentWarning: null,
    mainContentFocus: PublicationMainFocus.ARTICLE,
    external_url: null,
    image: null,
    imageMimeType: null,
    media: null,
    animation_url: null,
    attributes: [
      {
        displayType: null,
        traitType: 'type',
        value: 'note',
      },
      {
        displayType: null,
        traitType: 'isPrivate',
        value: 'false',
      },
    ],
    appId: APP_NAME,
  })

  const selectProps = useChakraSelectProps({
    placeholder: 'Tags...',
    value: metadata.tags?.map((tag) => ({ value: tag, label: tag })),
    isMulti: true,
    onChange: (tags) => {
      setMetadata((prev: IMetadata) => ({
        ...prev,
        tags: (tags as { label: string; value: string }[]).map(
          (tag) => tag.value
        ),
      }))
    },
  })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata,
        }),
      })
      const responseJSON = await response.json()
      // const contentURI = 'ipfs://' + responseJSON.contentID
      const contentURI = 'ipfs://' + responseJSON.contentID
      // const contentURI =
      //   'ipfs://bafkreia3tfgsxhb6osxm7b346fpvfgm2afwzbowry4rjxsg4kyefcgxoya'
      console.log(contentURI)
      await createPost({
        profileId: profile?.id,
        contentURI,
        // collectModule: {
        //   feeCollectModule: {
        //     amount: {
        //       currency: '0xD40282e050723Ae26Aeb0F77022dB14470f4e011',
        //       value: '0.01',
        //     },
        //     recipient: address,
        //     referralFee: 10.5,
        //     followerOnly: false,
        //   },
        // },
        collectModule: {
          freeCollectModule: { followerOnly: false },
        },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      })
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultProfile = async () => {
    try {
      const result = await client
        .query(getDefaultProfileQuery, {
          request: { ethereumAddress: address },
        })
        .toPromise()
      setProfile(result.data.defaultProfile)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (address) getDefaultProfile()
  }, [address])

  return (
    <Container maxW="full" px={12}>
      <form onSubmit={onSubmit}>
        <VStack spacing={2}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="Title"
              onChange={(e) => {
                setMetadata((prev: IMetadata) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={metadata.description as string}
              onChange={(e) =>
                setMetadata((prev: IMetadata) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description"
              size="sm"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Content</FormLabel>
            <MdEditor
              language="en-US"
              modelValue={metadata.content as string}
              toolbarsExclude={toolbarsExclude}
              onChange={(v: string) => {
                setMetadata((prev: IMetadata) => ({ ...prev, content: v }))
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Tags</FormLabel>
            <CreatableSelect {...selectProps} />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="isPrivate" mb="0">
              Make Note Private so no one can read it except you ???
            </FormLabel>
            <Switch
              id="isPrivate"
              onChange={() => {
                const updatedAttribute = metadata.attributes[1]
                updatedAttribute.value =
                  updatedAttribute.value === 'true' ? 'false' : 'true'
                setMetadata((prev: IMetadata) => ({
                  ...prev,
                  attributes: [metadata.attributes[0], updatedAttribute],
                }))
              }}
            />
          </FormControl>
          <Center>
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              Create Note
            </Button>
          </Center>
        </VStack>
      </form>
    </Container>
  )
}

export default CreateNote
