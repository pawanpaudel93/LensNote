import { useEffect, useState } from 'react'
import { useClient } from 'urql'
import { useAccount } from 'wagmi'
import { getProfilesQuery } from '@/graphql/queries'
import MyProfile from '@/components/profile/MyProfile'
import { Container, HStack } from '@chakra-ui/react'
import { IProfile } from '@/interfaces'

export default function MyProfiles() {
  const client = useClient()
  const { address } = useAccount()
  const [profiles, setProfiles] = useState<IProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getMyProfiles = async () => {
    setIsLoading(true)
    try {
      const result = await client
        .query(getProfilesQuery, {
          request: {
            ownedBy: [address],
            limit: 10,
          },
        })
        .toPromise()
      setProfiles(result.data.profiles.items as IProfile[])
    } catch (e) {
      console.error(e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (address) getMyProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  if (isLoading) {
    return <div>Loading...</div>
  } else if (profiles.length === 0) {
    return <div>No profiles found</div>
  }

  return (
    <Container>
      <HStack spacing={6}>
        {profiles.map((profile, index) => (
          <MyProfile key={index} profile={profile} />
        ))}
      </HStack>
    </Container>
  )
}
