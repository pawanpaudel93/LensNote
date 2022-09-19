import type { NextPage } from 'next'
import { APP_NAME } from '@/constants'
import { GET_PROFILE_QUERY, GET_PUBLICATIONS_QUERY } from '@/graphql/queries'
import { useClient, useQuery } from 'urql'
import { INote, IProfile, PaginatedResultInfo } from '@/interfaces'
import NoteInfo from '@/components/Notes/NoteInfo'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useState } from 'react'
import {
  Button,
  Flex,
  Image,
  Text,
  Box,
  Center,
  Container,
  SkeletonText,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useProfile } from '@/hooks/useProfile'
import { getDefaultToastOptions } from '@/lib/utils'
import useAppStore from '@/lib/store'

const Profile: NextPage = () => {
  const client = useClient()
  const toast = useToast()
  const [notes, setNotes] = useState<INote[]>([])
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [fetching, setFetching] = useState(true)
  const { follow, unfollow } = useProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const signedProfile = useAppStore((state) => state.defaultProfile)

  const {
    query: { handle },
  } = useRouter()

  const [data] = useQuery({
    query: GET_PROFILE_QUERY,
    variables: {
      request: { handle },
    },
  })

  const profile = data?.data?.profile as IProfile

  const initialFetch = async () => {
    const result = await client
      .query(GET_PUBLICATIONS_QUERY, {
        request: {
          profileId: profile?.id,
          publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
          limit: 10,
          sources: [APP_NAME],
        },
      })
      .toPromise()
    if (result.data) {
      setNotes([...notes, ...result?.data?.publications?.items])
      setPageInfo(result?.data?.publications?.pageInfo)
    }
    setFetching(false)
  }

  const fetchMore = async () => {
    const result = await client
      .query(GET_PUBLICATIONS_QUERY, {
        request: {
          profileId: profile?.id,
          publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
          limit: 10,
          cursor: pageInfo?.next,
          sources: [APP_NAME],
        },
      })
      .toPromise()
    if (result.data) {
      setNotes([...notes, ...result?.data?.publications?.items])
      setPageInfo(result?.data?.publications?.pageInfo)
    }
  }

  async function followOrUnfollowUser() {
    try {
      setIsLoading(true)
      if (isFollowing) {
        await unfollow(profile.id)
        setIsFollowing(false)
        toast({
          title: 'Unfollow sucessful.',
          ...getDefaultToastOptions('success'),
        })
      } else {
        await follow({ follow: [{ profile: profile.id }] })
        setIsFollowing(true)
        toast({
          title: 'Follow successful',
          ...getDefaultToastOptions('success'),
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: isFollowing ? 'Unfollow error.' : 'Follow error.',
        ...getDefaultToastOptions('error'),
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (profile?.id && notes.length === 0) {
      initialFetch()
      setIsFollowing(profile?.isFollowedByMe === true ? true : false)
    }
  }, [profile?.id])

  return fetching && notes.length === 0 ? (
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
    <Container maxW="full" px={{ base: 4, md: 12 }}>
      <Box position="relative" h="500px">
        <Box
          position="absolute"
          h="full"
          w="full"
          backgroundPosition="center"
          backgroundSize="cover"
          backgroundImage={
            profile?.coverPicture?.original?.url ??
            'https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=2710&amp;q=80'
          }
        >
          <Text
            w="full"
            h="full"
            position="absolute"
            bg="black"
            opacity="50%"
          ></Text>
        </Box>
      </Box>
      <Box position="relative" py="16" backgroundColor="gray.200">
        <Box px="4" mx="auto">
          <Flex
            position="relative"
            bg="white"
            w="full"
            mb="6"
            shadow="xl"
            mt="-64"
            minW="0"
            rounded="lg"
            direction="column"
            overflowWrap="break-word"
          >
            <Box px="6">
              <Flex justify="center">
                <Flex w="full" px="4" justify="flex-start">
                  <Box position="relative" left={{ md: '10%' }}>
                    <Image
                      alt="background"
                      src={
                        profile?.picture?.original?.url ??
                        `https://avatars.dicebear.com/api/pixel-art/${profile?.id}.svg`
                      }
                      bgColor="gray.200"
                      rounded="lg"
                      shadow="xl"
                      h="auto"
                      align="middle"
                      position="absolute"
                      m="-16"
                      ml={{ base: -20, lg: -16 }}
                      maxW="150px"
                    />
                  </Box>
                </Flex>
                <Box w="full">
                  <Flex justify="center" py="4" pt={{ base: 8, lg: 4 }}>
                    <Box mr="4" p="3" textAlign="center">
                      <Text
                        fontSize="xl"
                        fontWeight="bold"
                        textTransform="uppercase"
                        display="block"
                        letterSpacing="wide"
                        textColor="gray.600"
                      >
                        {profile?.stats?.totalFollowing}
                      </Text>
                      <Text fontSize="sm" textColor="gray.400">
                        Following
                      </Text>
                    </Box>
                    <Box mr="3" p="3" textAlign="center">
                      <Text
                        fontSize="xl"
                        fontWeight="bold"
                        textTransform="uppercase"
                        display="block"
                        letterSpacing="wide"
                        textColor="gray.600"
                      >
                        {profile?.stats?.totalFollowers}
                      </Text>
                      <Text fontSize="sm" textColor="gray.400">
                        Followers
                      </Text>
                    </Box>
                    <Box mr={{ lg: 4 }} p="3" textAlign="center">
                      <Text
                        textTransform="uppercase"
                        fontSize="xl"
                        fontWeight="bold"
                        display="block"
                        letterSpacing="wide"
                        textColor="gray.600"
                      >
                        {profile?.stats?.totalPosts}
                      </Text>
                      <Text fontSize="sm" textColor="gray.400">
                        Notes
                      </Text>
                    </Box>
                    <Box mr={{ lg: 4 }} p="3" textAlign="center">
                      {signedProfile?.handle === profile?.handle && (
                        <Button
                          rounded={'full'}
                          bg={'blue.400'}
                          color={'white'}
                          boxShadow={
                            '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
                          }
                          _hover={{
                            bg: 'blue.500',
                          }}
                          _focus={{
                            bg: 'blue.500',
                          }}
                          isLoading={isLoading}
                          onClick={followOrUnfollowUser}
                        >
                          {isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                      )}
                    </Box>
                  </Flex>
                </Box>
              </Flex>
              <Box textAlign="center">
                <Text
                  fontSize="2xl"
                  fontWeight="semibold"
                  mb="2"
                  textColor="gray.700"
                >
                  {profile?.name ?? 'No Name'}
                </Text>
                <Box fontSize="sm" fontWeight="bold" textColor="gray.400">
                  {profile?.handle}
                </Box>
                <Box mb="2" mt="10" textColor="gray.600">
                  {profile?.bio ?? 'No bio yet!!!'}
                </Box>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
      <InfiniteScroll
        dataLength={notes.length}
        next={fetchMore}
        hasMore={notes.length !== pageInfo?.totalCount}
        loader={
          <Center mt="5px">
            <h4>Loading more notes...</h4>
          </Center>
        }
        endMessage={
          <Center mt="5px">
            <b>No more notes...</b>
          </Center>
        }
      >
        <VStack spacing={2}>
          {notes.map((note, index) => (
            <NoteInfo key={index} note={note} isDetailPage={false} />
          ))}
        </VStack>
      </InfiniteScroll>
    </Container>
  )
}

export default Profile
