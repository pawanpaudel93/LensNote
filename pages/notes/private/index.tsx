import type { NextPage } from 'next'
import { TABLELAND_NOTE_TABLE } from '@/constants'
import { Box, Container, SkeletonText, VStack } from '@chakra-ui/react'
import { connect, Connection, resultsToObjects } from '@tableland/sdk'
import 'md-editor-rt/lib/style.css'
import { useEffect, useState } from 'react'
import useAppStore from '@/lib/store'
import { IPrivateMetadata } from '@/interfaces'
import PrivateNoteInfo from '@/components/Notes/PrivateNoteInfo'

let tableland: Connection
const PrivateNotes: NextPage = () => {
  const profile = useAppStore((state) => state.defaultProfile)
  const [notes, setNotes] = useState<IPrivateMetadata[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  async function initTableland() {
    tableland = await connect({
      network: 'testnet',
      chain: 'polygon-mumbai',
    })
    const readRes = await tableland.read(
      `SELECT * FROM ${TABLELAND_NOTE_TABLE} where lensId='${profile?.id}'`
    )
    const notes = resultsToObjects(readRes) as IPrivateMetadata[]
    console.log(notes)
    setNotes(notes)
    setIsLoaded(true)
  }

  useEffect(() => {
    if (profile) {
      initTableland()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  return !isLoaded ? (
    <Container maxW="full" px={12}>
      {Array(4)
        .fill(0)
        .map((_, index) => (
          <Box padding="6" my={6} boxShadow="lg" bg="white" key={index}>
            <SkeletonText mt="4" noOfLines={3} spacing="4" />
          </Box>
        ))}
    </Container>
  ) : (
    <Container maxW="full" px={12}>
      <VStack spacing={2}>
        {notes.map((note, index) => (
          <PrivateNoteInfo key={index} note={note} isDetailPage={false} />
        ))}
      </VStack>
    </Container>
  )
}

export default PrivateNotes
