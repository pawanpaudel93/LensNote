import {
  Heading,
  Avatar,
  Box,
  Center,
  Image,
  Flex,
  Text,
  Stack,
  Button,
  useColorModeValue,
  Tag,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { IProfile } from '@/types'
import { getDefaultToastOptions } from '@/lib/utils'
import { getRPCErrorMessage } from '@/lib/parser'

export default function MyProfile({ profile }: { profile: IProfile }) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { setDefaultProfile } = useProfile()
  return (
    <Center py={6}>
      <Box
        maxW={'270px'}
        w={'full'}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow={'2xl'}
        rounded={'md'}
        overflow={'hidden'}
      >
        <Image
          h={'120px'}
          w={'full'}
          src={
            profile.coverPicture?.original.url ??
            'https://images.unsplash.com/photo-1612865547334-09cb8cb455da?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
          }
          objectFit={'cover'}
          alt="profile"
        />
        <Flex justify={'center'} mt={-12}>
          <Avatar
            size={'xl'}
            src={
              profile.picture?.original.url ??
              `https://avatars.dicebear.com/api/pixel-art/${profile?.id}.svg`
            }
            css={{
              border: '2px solid white',
            }}
          />
        </Flex>

        <Box p={6}>
          <Stack spacing={0} align={'center'} mb={5}>
            <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'}>
              {profile.handle}
            </Heading>
            {profile.bio && <Text color={'gray.500'}>{profile.bio}</Text>}
          </Stack>

          <Stack direction={'row'} justify={'center'} spacing={6}>
            <Stack spacing={0} align={'center'}>
              <Text fontWeight={600}>{profile.stats.totalCollects}</Text>
              <Text fontSize={'sm'} color={'gray.500'}>
                Collects
              </Text>
            </Stack>
            <Stack spacing={0} align={'center'}>
              <Text fontWeight={600}>{profile.stats.totalComments}</Text>
              <Text fontSize={'sm'} color={'gray.500'}>
                Comments
              </Text>
            </Stack>
          </Stack>
          <Stack direction={'row'} justify={'center'} spacing={6}>
            <Stack spacing={0} align={'center'}>
              <Text fontWeight={600}>{profile.stats.totalFollowers}</Text>
              <Text fontSize={'sm'} color={'gray.500'}>
                Followers
              </Text>
            </Stack>
            <Stack spacing={0} align={'center'}>
              <Text fontWeight={600}>{profile.stats.totalFollowing}</Text>
              <Text fontSize={'sm'} color={'gray.500'}>
                Following
              </Text>
            </Stack>
          </Stack>
          <Stack direction={'row'} justify={'center'} spacing={6}>
            <Stack spacing={0} align={'center'}>
              <Text fontWeight={600}>{profile.stats.totalMirrors}</Text>
              <Text fontSize={'sm'} color={'gray.500'}>
                Mirrors
              </Text>
            </Stack>
            <Stack spacing={0} align={'center'}>
              <Text fontWeight={600}>{profile.stats.totalPosts}</Text>
              <Text fontSize={'sm'} color={'gray.500'}>
                Posts
              </Text>
            </Stack>
            <Stack spacing={0} align={'center'}>
              <Text fontWeight={600}>{profile.stats.totalPublications}</Text>
              <Text fontSize={'sm'} color={'gray.500'}>
                Publications
              </Text>
            </Stack>
          </Stack>

          {profile.isDefault ? (
            <Button
              w={'full'}
              as={Tag}
              mt={8}
              bg="green.300"
              color={'white'}
              rounded={'md'}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
            >
              Default Profile
            </Button>
          ) : (
            <Button
              w={'full'}
              mt={8}
              // eslint-disable-next-line react-hooks/rules-of-hooks
              bg={useColorModeValue('#151f21', 'gray.900')}
              color={'white'}
              rounded={'md'}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              onClick={async () => {
                try {
                  setIsLoading(true)
                  toast({
                    title: 'Default profile success.',
                    description: `Profile handle ${profile.handle} has been set as default profile.`,
                    ...getDefaultToastOptions('success'),
                  })
                  await setDefaultProfile(profile.id)
                } catch (error) {
                  toast({
                    title: 'Default profile selection error.',
                    description: getRPCErrorMessage(error),
                    ...getDefaultToastOptions('error'),
                  })
                }
                setIsLoading(false)
              }}
              isLoading={isLoading}
            >
              Set Default Profile
            </Button>
          )}
        </Box>
      </Box>
    </Center>
  )
}
