import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import MdEditor from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { Box, Container, SkeletonText } from '@chakra-ui/react'
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
  const profile = useAppStore((state) => state.defaultProfile)

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
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  })

  async function getPrivateNote() {
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
      await lit.connect()
      const { decryptedString } = await lit.decrypt(
        privateNote?.content as string,
        privateNote?.accessControlConditions as object,
        privateNote?.encryptedSymmetricKey as string
      )
      setNote((prev) => ({ ...prev, content: decryptedString as string }))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (id) {
      getPrivateNote()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <Container maxW="full" px={12}>
      <SkeletonText noOfLines={4} spacing="4" isLoaded={!isLoading}>
        <PrivateNoteInfo
          note={note as IPrivateMetadata}
          isDetailPage
          profile={profile}
        />
        <Box p="4" boxShadow="lg" m="4" borderRadius="sm">
          <MdEditor
            modelValue={note?.content as string}
            language="en-US"
            previewOnly
          />
        </Box>
      </SkeletonText>

      <SkeletonText noOfLines={20} mt={12} spacing="4" isLoaded={!isLoading} />
    </Container>
  )
}
export default PrivateNote
