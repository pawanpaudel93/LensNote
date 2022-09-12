import MyProfile from '@/components/Profile/MyProfile'
import { Button, Center, Container, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import useAppStore from '@/lib/store'

export default function MyProfiles() {
  const profiles = useAppStore((state) => state.profiles)

  if (profiles.length === 0) {
    return (
      <Container>
        <Center>
          <NextLink passHref href="/create-profile">
            <Button mt={12} colorScheme="blue">
              Create Profile
            </Button>
          </NextLink>
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="full">
      <Center>
        <Stack direction={['column', 'row']} spacing={6}>
          {profiles.map((profile, index) => (
            <MyProfile key={index} profile={profile} />
          ))}
        </Stack>
      </Center>
    </Container>
  )
}
