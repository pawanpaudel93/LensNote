import { ApprovedAllowanceAmount, INote, IProfile } from '@/interfaces'
import {
  Box,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react'
import { ReactNode } from 'react'
import { FaComment } from 'react-icons/fa'
import NoteCollect from './NoteCollect'
import NoteMirror from './NoteMirror'
import NoteReact from './NoteReact'

interface StatsCardProps {
  title: string
  stat: string
  icon: ReactNode
}
function StatsCard(props: StatsCardProps) {
  const { title, stat, icon } = props
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={'1'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={useColorModeValue('gray.800', 'gray.500')}
      rounded={'lg'}
    >
      <Flex justifyContent={'space-between'}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={'medium'}>{title}</StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
            {stat}
          </StatNumber>
        </Box>
        <Box
          my={'auto'}
          color={useColorModeValue('gray.800', 'gray.200')}
          alignContent={'center'}
        >
          {icon}
        </Box>
      </Flex>
    </Stat>
  )
}

export default function NoteStats({
  approvedModuleAllowanceAmount,
  note,
  profile,
}: {
  approvedModuleAllowanceAmount: ApprovedAllowanceAmount[]
  note: INote
  profile: IProfile
}) {
  return (
    <Box maxW="2xl" mx={'auto'} py={4} px={{ base: 2, sm: 12, md: 17 }}>
      <SimpleGrid
        columns={{ base: 1, md: 4, sm: 2 }}
        spacing={{ base: 5, lg: 8 }}
      >
        <StatsCard
          title={'Mirrors'}
          stat={(note?.stats?.totalAmountOfMirrors ?? 0).toString()}
          icon={<NoteMirror profile={profile} publicationId={note?.id} />}
        />
        <StatsCard
          title={'Collects'}
          stat={(note?.stats?.totalAmountOfCollects ?? 0).toString()}
          icon={
            <NoteCollect
              note={note}
              approvedModuleAllowanceAmount={approvedModuleAllowanceAmount}
            />
          }
        />
        <StatsCard
          title={'Likes'}
          stat={(note?.stats?.totalUpvotes ?? 0).toString()}
          icon={<NoteReact note={note} profile={profile} />}
        />
        <StatsCard
          title={'Comments'}
          stat={(note?.stats?.totalAmountOfComments ?? 0).toString()}
          icon={<FaComment size={'1.5em'} />}
        />
      </SimpleGrid>
    </Box>
  )
}
