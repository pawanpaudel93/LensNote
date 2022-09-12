import type { NextPage } from 'next'
import { FormEvent, useEffect, useState } from 'react'
import MdEditor, { type ToolbarNames } from 'md-editor-rt'
import { CreatableSelect, useChakraSelectProps } from 'chakra-react-select'
import {
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { IProfile } from '@/interfaces/'
import { GET_DEFAULT_PROFILE_QUERY } from '@/graphql/queries'
import { useAccount } from 'wagmi'
import { useClient } from 'urql'
import { connect, Connection } from '@tableland/sdk'
import ShareModal from 'lit-share-modal-v3'
import 'md-editor-rt/lib/style.css'
import lit from '@/lib/lit'
import { TABLELAND_NOTE_TABLE } from '@/constants'

interface IPrivateMetadata {
  name: string
  description: string
  content: string
  tags: string[]
  handle: string
  contentCid: string
  encryptedSymmetricKey: string
  accessControlConditions: object
  createdAt: number
  updatedAt: number
}

let tableland: Connection
const CreatePrivateNote: NextPage = () => {
  const { address } = useAccount()
  const client = useClient()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<IProfile>()
  const [showShareModal, setShowShareModal] = useState(false)
  const toolbarsExclude: ToolbarNames[] = ['github']
  const unixTime = new Date().getTime()
  const [metadata, setMetadata] = useState<IPrivateMetadata>({
    name: '',
    description: '',
    content: '# Note',
    tags: [],
    handle: '',
    contentCid: '',
    encryptedSymmetricKey: '',
    accessControlConditions: {},
    createdAt: unixTime,
    updatedAt: unixTime,
  })

  const selectProps = useChakraSelectProps({
    placeholder: 'Tags...',
    value: metadata.tags?.map((tag) => ({ value: tag, label: tag })),
    isMulti: true,
    onChange: (tags) => {
      setMetadata((prev: IPrivateMetadata) => ({
        ...prev,
        tags: (tags as { label: string; value: string }[]).map(
          (tag) => tag.value
        ),
      }))
    },
  })

  function textKBSize(text: string) {
    return new Blob([text]).size / 1024
  }

  function isEmpty(obj: object) {
    for (const property in obj) {
      return false
    }
    return true
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      if (isEmpty(metadata.accessControlConditions)) return
      await lit.connect()
      const { encryptedString, encryptedSymmetricKey } = await lit.encrypt(
        metadata.content,
        metadata.accessControlConditions
      )

      setMetadata((prev) => ({ ...prev, encryptedSymmetricKey }))

      if (textKBSize(encryptedString) >= 1) {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            encryptedString,
          }),
        })
        const responseJSON = await response.json()
        const contentID = responseJSON.contentID
        const writeRes = await tableland.write(
          `insert into ${TABLELAND_NOTE_TABLE} (title, description, content, contentId, tags, lensId, encryptedSymmetricKey, accessControlConditions, createdAt, updatedAt) values (
            '${metadata.name}', '${
            metadata.description
          }', '', '${contentID}', '${metadata.tags.toString()}', ${
            profile?.id
          }, '${metadata.encryptedSymmetricKey}', '${JSON.stringify(
            metadata.accessControlConditions
          )}', ${metadata.createdAt}, ${metadata.updatedAt}
          )`
        )
        console.log(writeRes)
      } else {
        const writeRes = await tableland.write(
          `insert into ${TABLELAND_NOTE_TABLE} (title, description, content, contentId, tags, lensId, encryptedSymmetricKey, accessControlConditions, createdAt, updatedAt) values (
            '${metadata.name}', '${
            metadata.description
          }', '${encryptedString}', '', '${metadata.tags.toString()}', '${
            profile?.id
          }', '${metadata.encryptedSymmetricKey}', '${JSON.stringify(
            metadata.accessControlConditions
          )}', ${metadata.createdAt}, ${metadata.updatedAt}
          )`
        )
        console.log(writeRes)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const onUnifiedAccessControlConditionsSelected = (shareModalOutput: any) => {
    metadata.accessControlConditions =
      shareModalOutput.unifiedAccessControlConditions
    console.log(metadata)
  }

  const getDefaultProfile = async () => {
    try {
      const result = await client
        .query(GET_DEFAULT_PROFILE_QUERY, {
          request: { ethereumAddress: address },
        })
        .toPromise()
      setProfile(result.data.defaultProfile)
    } catch (e) {
      console.error(e)
    }
  }

  async function initTableland() {
    tableland = await connect({
      network: 'testnet',
      chain: 'polygon-mumbai',
    })
    // const token = await tableland.siwe()
    // console.log(token)
    const readRes = await tableland.read(
      `SELECT * FROM ${TABLELAND_NOTE_TABLE};`
    )
    console.log(readRes)
  }

  useEffect(() => {
    if (address) {
      getDefaultProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    initTableland()
  }, [])

  return (
    <Container maxW="full" px={12}>
      <form onSubmit={onSubmit}>
        <VStack spacing={2}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="Title"
              onChange={(e) => {
                setMetadata((prev: IPrivateMetadata) => ({
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
                setMetadata((prev: IPrivateMetadata) => ({
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
                setMetadata((prev: IPrivateMetadata) => ({
                  ...prev,
                  content: v,
                }))
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Tags</FormLabel>
            <CreatableSelect {...selectProps} />
          </FormControl>
          <div>
            <button onClick={() => setShowShareModal(true)}>
              Privacy Setting
            </button>

            {showShareModal && (
              <div
                style={{
                  width: '500px',
                  height: '700px',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: '1px solid #333',
                  borderRadius: '0.25em',
                  zIndex: 5,
                }}
              >
                <ShareModal
                  defaultChain={'mumbai'}
                  chainOptions={['mumbai']}
                  onClose={() => {
                    setShowShareModal(false)
                  }}
                  onUnifiedAccessControlConditionsSelected={
                    onUnifiedAccessControlConditionsSelected
                  }
                />
              </div>
            )}
          </div>
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

export default CreatePrivateNote
