import { NoteStats } from '@/interfaces'
import { Box, HStack, Tooltip } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { BsCollection, BsHeart } from 'react-icons/bs'
import { FaComment } from 'react-icons/fa'
import { GoMirror } from 'react-icons/go'

interface StatsCardProps {
  title: string
  stat: string
  icon: ReactNode
}
function StatsCard(props: StatsCardProps) {
  const { title, stat, icon } = props
  return (
    <Tooltip hasArrow label={title} placement="top">
      <HStack spacing={2}>
        <b>{stat}</b>
        {icon}
      </HStack>
    </Tooltip>
  )
}

export default function NoteStatsOnly({ stats }: { stats: NoteStats }) {
  return (
    <Box maxW="2xl" mx={'auto'} py={1}>
      <HStack spacing={5}>
        <StatsCard
          title={'Mirrors'}
          stat={(stats?.totalAmountOfMirrors ?? 0).toString()}
          icon={<GoMirror size={'1.2em'} />}
        />
        <StatsCard
          title={'Collects'}
          stat={(stats?.totalAmountOfCollects ?? 0).toString()}
          icon={<BsCollection size="1.2em" color="red" />}
        />
        <StatsCard
          title={'Likes'}
          stat={(stats?.totalUpvotes ?? 0).toString()}
          icon={<BsHeart size={'1.2em'} color="red" />}
        />
        <StatsCard
          title={'Comments'}
          stat={(stats?.totalAmountOfComments ?? 0).toString()}
          icon={<FaComment size={'1.2em'} />}
        />
      </HStack>
    </Box>
  )
}
