import {
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { useMutation } from 'urql'
import { createProfileMutation } from '@/graphql/mutations'
import { getRPCErrorMessage } from '@/lib/parser'
import { getDefaultToastOptions } from '@/lib/utils'

export default function CreateProfile() {
  const [handle, setHandle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [, createProfile] = useMutation(createProfileMutation)
  const toast = useToast()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const profile = await createProfile({
        request: {
          handle,
          profilePictureUri: null,
          followModule: {
            freeFollowModule: true,
          },
        },
      })
      if (profile.error) throw profile.error
      toast({
        title: 'Account created.',
        description: `We've created your account handle ${handle} for you.`,
        ...getDefaultToastOptions('success'),
      })
    } catch (error) {
      toast({
        title: 'Account creation error.',
        description: getRPCErrorMessage(error),
        ...getDefaultToastOptions('error'),
      })
    } finally {
      setIsLoading(false)
    }
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
