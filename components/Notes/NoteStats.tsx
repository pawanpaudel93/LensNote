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
import { BsCollection } from 'react-icons/bs'
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
  stats,
}: {
  stats: {
    totalAmountOfMirrors: number
    totalAmountOfCollects: number
    totalAmountOfComments: number
  }
}) {
  return (
    <Box maxW="2xl" mx={'auto'} py={4} px={{ base: 2, sm: 12, md: 17 }}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <StatsCard
          title={'Mirrors'}
          stat={(stats?.totalAmountOfMirrors ?? 0).toString()}
          icon={<GoMirror size={'2em'} />}
        />
        <StatsCard
          title={'Collects'}
          stat={(stats?.totalAmountOfCollects ?? 0).toString()}
          icon={<BsCollection size={'2em'} />}
        />
        <StatsCard
          title={'Comments'}
          stat={(stats?.totalAmountOfComments ?? 0).toString()}
          icon={<FaComment size={'2em'} />}
        />
      </SimpleGrid>
    </Box>
  )
}
