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
  Spinner,
  Textarea,
  useColorMode,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'
import { connect, Connection } from '@tableland/sdk'
import ShareModal from 'lit-share-modal-v3'
import 'md-editor-rt/lib/style.css'
import lit from '@/lib/lit'
import { TABLELAND_NOTE_TABLE } from '@/constants'
import useAppStore from '@/lib/store'
import { IProfile } from '@/types'
import { getErrorMessage, getRPCErrorMessage } from '@/lib/parser'
import { getDefaultToastOptions } from '@/lib/utils'
import { SettingsIcon } from '@chakra-ui/icons'
import usePersistStore from '@/lib/store/persist'
import { useIsMounted } from '@/hooks/useIsMounted'
import saveAs from 'file-saver'

let tableland: Connection
const CreatePrivateNote: NextPage = () => {
  const { colorMode } = useColorMode()
  const mounted = useIsMounted()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const toast = useToast()
  const profile = useAppStore((store) => store.defaultProfile) as IProfile
  const [showShareModal, setShowShareModal] = useState(false)
  const toolbarsExclude: ToolbarNames[] = ['github']
  const [metadata, setMetadata] = usePersistStore((state) => [
    state.privateNote,
    state.setPrivateNote,
  ])

  const selectProps = useChakraSelectProps({
    placeholder: 'Tags...',
    value: (metadata.tags as string[])?.map((tag) => ({
      value: tag,
      label: tag,
    })),
    id: 'private-note-tags',
    instanceId: 'private-note-tags',
    isMulti: true,
    onChange: (tags) => {
      setMetadata({
        ...metadata,
        tags: (tags as { label: string; value: string }[]).map(
          (tag) => tag.value
        ),
      })
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
      if (isEmpty(metadata.accessControlConditions)) {
        return toast({
          title: 'Privacy settings required.',
          ...getDefaultToastOptions('error'),
        })
      }
      const { encryptedString, encryptedSymmetricKey } = await lit.encrypt(
        metadata.content,
        metadata.accessControlConditions
      )

      setMetadata({ ...metadata, encryptedSymmetricKey })

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
        if (metadata?.id) {
          const updateRes = await tableland.write(
            `update ${TABLELAND_NOTE_TABLE} set title='${
              metadata.title
            }', description='${
              metadata.description
            }', content='', contentId='${contentID}', tags='${
              metadata.tags
            }', encryptedSymmetricKey='${encryptedSymmetricKey}', accessControlConditions='${JSON.stringify(
              metadata.accessControlConditions
            )}', updatedAt=${new Date().getTime()} where id='${metadata.id}'`
          )
          console.log(updateRes)
        } else {
          const writeRes = await tableland.write(
            `insert into ${TABLELAND_NOTE_TABLE} (id, title, description, content, contentId, tags, lensId, encryptedSymmetricKey, accessControlConditions, isPublished, createdAt, updatedAt) values (
            '${uuidv4()}',
            '${metadata.title}', '${
              metadata.description
            }', '', '${contentID}', '${metadata.tags}', ${
              profile?.id
            }, '${encryptedSymmetricKey}', '${JSON.stringify(
              metadata.accessControlConditions
            )}', 0, ${metadata.createdAt}, ${metadata.updatedAt}
          )`
          )
          console.log(writeRes)
        }
      } else {
        if (metadata?.id) {
          const updateRes = await tableland.write(
            `update ${TABLELAND_NOTE_TABLE} set title='${
              metadata.title
            }', description='${
              metadata.description
            }', content='${encryptedString}', contentId='', tags='${
              metadata.tags
            }', encryptedSymmetricKey='${encryptedSymmetricKey}', accessControlConditions='${JSON.stringify(
              metadata.accessControlConditions
            )}', updatedAt=${new Date().getTime()} where id='${metadata.id}'`
          )
          console.log(updateRes)
        } else {
          const writeRes = await tableland.write(
            `insert into ${TABLELAND_NOTE_TABLE} (id, title, description, content, contentId, tags, lensId, encryptedSymmetricKey, accessControlConditions, isPublished, createdAt, updatedAt) values (
            '${uuidv4()}',
            '${metadata.title}', '${
              metadata.description
            }', '${encryptedString}', '', '${metadata.tags}', '${
              profile?.id
            }', '${encryptedSymmetricKey}', '${JSON.stringify(
              metadata.accessControlConditions
            )}', 0, ${metadata.createdAt}, ${metadata.updatedAt}
          )`
          )
          console.log(writeRes)
        }
      }
      toast({
        title: profile?.id ? 'Note Updated' : 'Note created.',
        description: `Note has been ${
          profile?.id ? 'updated' : 'created'
        } sucessfully.`,
        ...getDefaultToastOptions('success'),
      })
    } catch (error) {
      console.log(error)
      toast({
        title: `Note ${metadata?.id ? 'update' : 'creation'} error.`,
        description: getRPCErrorMessage(error),
        ...getDefaultToastOptions('error'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSave = (content: string) => {
    if (content) {
      const blob = new Blob([content], {
        type: 'text/plain;charset=utf-8',
      })

      saveAs(
        blob,
        `${metadata?.title ? metadata?.title.split(' ').join('-') : 'note'}.md`
      )
    }
  }

  const onUploadImg = async (
    files: Array<File>,
    callback: (urls: Array<string>) => void
  ) => {
    try {
      setIsUploading(true)
      const res = await Promise.all(
        files.map((file) => {
          return new Promise((rev, rej) => {
            const form = new FormData()
            form.append('file', file)

            fetch('/api/img/upload', {
              method: 'POST',
              body: form,
            })
              .then(async (res) => rev(await res.json()))
              .catch((error) => rej(error))
          })
        })
      )
      callback(res.map((item) => (item as { imageUrl: string }).imageUrl))
    } catch (error) {
      toast({
        title: 'Image Upload Error',
        description: getErrorMessage(error),
        ...getDefaultToastOptions('error'),
      })
    }
    setIsUploading(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUnifiedAccessControlConditionsSelected = (shareModalOutput: any) => {
    // setShowShareModal(false)
    setMetadata({
      ...metadata,
      accessControlConditions: shareModalOutput.unifiedAccessControlConditions,
    })
  }

  async function initTableland() {
    tableland = await connect({
      network: 'testnet',
      chain: 'polygon-mumbai',
    })
  }

  useEffect(() => {
    initTableland()
  }, [])

  if (!mounted) {
    return (
      <Center top="50%" left="50%" position="fixed">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    )
  }

  return (
    <Container
      maxW="full"
      px={12}
      borderWidth="1px"
      borderRadius="lg"
      w={{ sm: '100%', md: '98%' }}
      boxShadow={'2xl'}
      padding={4}
    >
      <form onSubmit={onSubmit}>
        <VStack spacing={2}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="Title"
              value={metadata.title}
              onChange={(e) => {
                setMetadata({
                  ...metadata,
                  title: e.target.value,
                })
              }}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={metadata.description as string}
              onChange={(e) =>
                setMetadata({
                  ...metadata,
                  description: e.target.value,
                })
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
              onSave={onSave}
              onUploadImg={onUploadImg}
              style={{
                padding: '25px',
              }}
              onChange={(v: string) => {
                setMetadata({
                  ...metadata,
                  content: v,
                })
              }}
              theme={colorMode}
              previewTheme="github"
              codeTheme="github"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Tags</FormLabel>
            <CreatableSelect {...selectProps} />
          </FormControl>
          <div>
            <Button
              onClick={() => setShowShareModal(true)}
              leftIcon={<SettingsIcon />}
              colorScheme="teal"
              variant="solid"
            >
              Privacy Setting
            </Button>

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
                  isModal={true}
                  onUnifiedAccessControlConditionsSelected={
                    onUnifiedAccessControlConditionsSelected
                  }
                  darkMode={colorMode === 'dark'}
                />
              </div>
            )}
          </div>
          <Center>
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              {profile?.id ? 'Update Note' : 'Create Note'}
            </Button>
          </Center>
        </VStack>
      </form>
    </Container>
  )
}

export default CreatePrivateNote
