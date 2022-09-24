import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import MdEditor from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Container,
  SkeletonText,
  useColorMode,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import PrivateNoteInfo from '@/components/Notes/PrivateNoteInfo'
import { IPrivateMetadata } from '@/interfaces'
import { TABLELAND_NOTE_TABLE } from '@/constants'
import { Connection, connect, resultsToObjects } from '@tableland/sdk'
import lit from '@/lib/lit'
import useAppStore from '@/lib/store'

let tableland: Connection
const PrivateNote: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(true)
  const profile = useAppStore((state) => state.defaultProfile)
  const { colorMode } = useColorMode()

  const {
    query: { id },
  } = useRouter()

  const [note, setNote] = useState<IPrivateMetadata>({
    id: id as string,
    lensId: '',
    title: '',
    description: '',
    content: '',
    tags: '',
    contentId: '',
    encryptedSymmetricKey: '',
    accessControlConditions: [],
    isPublished: 0,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  })

  async function getPrivateNote() {
    try {
      tableland = await connect({
        network: 'testnet',
        chain: 'polygon-mumbai',
      })
      const readRes = await tableland.read(
        `SELECT * FROM ${TABLELAND_NOTE_TABLE} where id='${id}'`
      )
      const notes = resultsToObjects(readRes) as IPrivateMetadata[]

      if (notes.length > 0) {
        const privateNote = notes[0]
        if (privateNote.contentId) {
          privateNote.content = await (
            await fetch(`https://${privateNote.contentId}.ipfs.w3s.link/`)
          ).text()
        }

        setNote(privateNote)
        const { decryptedString } = await lit.decrypt(
          privateNote?.content as string,
          privateNote?.accessControlConditions as object,
          privateNote?.encryptedSymmetricKey as string
        )
        setNote((prev) => ({ ...prev, content: decryptedString as string }))
      }
    } catch (error: any) {
      if (error.errorCode === 'not_authorized') {
        setIsAuthorized(false)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (id) {
      getPrivateNote()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return isLoading ? (
    <Container maxW="full" px={12}>
      <SkeletonText noOfLines={4} spacing="4" isLoaded={!isLoading} />
      <SkeletonText noOfLines={20} mt={12} spacing="4" isLoaded={!isLoading} />
    </Container>
  ) : (
    <Container maxW="full" px={12}>
      <PrivateNoteInfo
        note={note as IPrivateMetadata}
        isDetailPage
        profile={profile}
      />
      <Box p="4" boxShadow="lg" m="4" borderRadius="sm">
        {isAuthorized ? (
          <MdEditor
            modelValue={note?.content as string}
            language="en-US"
            theme={colorMode}
            style={{
              padding: '25px',
            }}
            previewOnly
            previewTheme="github"
            codeTheme="github"
          />
        ) : (
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Not Authorized!
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              You are not authorized to view this private note.
            </AlertDescription>
          </Alert>
        )}
      </Box>
    </Container>
  )
}
export default PrivateNote
