import {
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
import { useMutation } from 'urql'
import { createProfileMutation } from '@/graphql/mutations'

export default function CreateProfile() {
  const [handle, setHandle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [, createProfile] = useMutation(createProfileMutation)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await createProfile({
      request: {
        handle,
        profilePictureUri: null,
        followModule: {
          freeFollowModule: true,
        },
      },
    })
    setIsLoading(false)
  }
  return (
    <Container size="md">
      <form onSubmit={submit}>
        <FormControl>
          <FormLabel htmlFor="handle">Profile handle</FormLabel>
          <Input
            id="handle"
            type="text"
            onChange={(e) => setHandle(e.target.value)}
          />
        </FormControl>
        <Center>
          <Button isLoading={isLoading} m={3} type="submit" colorScheme="blue">
            Create
          </Button>
        </Center>
      </form>
    </Container>
  )
}
