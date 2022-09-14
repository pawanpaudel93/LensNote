import MyProfile from '@/components/Profile/MyProfile'
import { Button, Center, Container, Stack, VStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import useAppStore from '@/lib/store'

export default function MyProfiles() {
  const profiles = useAppStore((state) => state.profiles)

  return (
    <Container maxW="full">
      <Center>
        <VStack spacing={4}>
          <Stack direction={['column', 'row']} spacing={6}>
            {profiles.map((profile, index) => (
              <MyProfile key={index} profile={profile} />
            ))}
          </Stack>
          <NextLink passHref href="/create-profile">
            <Button mt={12} colorScheme="blue">
              Create New Profile
            </Button>
          </NextLink>
        </VStack>
      </Center>
    </Container>
  )
}
