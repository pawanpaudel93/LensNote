import { useAccount, useSignMessage } from 'wagmi'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { useClient } from 'urql'
import { JWT_KEY } from '@/constants'
import { GET_CHALLENGE_QUERY, GET_PROFILE_QUERY } from '@/graphql/queries'
import { authenticateMutation } from '@/graphql/mutations'
import useAppStore from '@/lib/store'
import { IProfile } from '@/interfaces'

export const useLogin = () => {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const client = useClient()
  const setProfiles = useAppStore((state) => state.setProfiles)
  const setProfile = useAppStore((state) => state.setProfile)

  const generateChallenge = async () => {
    return await client
      .query(GET_CHALLENGE_QUERY, {
        address: address,
      })
      .toPromise()
  }

  const authenticate = async (signature: string) => {
    return await client
      .mutation(authenticateMutation, {
        address: address,
        signature: signature,
      })
      .toPromise()
  }

  const setMyProfiles = async () => {
    try {
      const result = await client
        .query(GET_PROFILE_QUERY, {
          request: {
            ownedBy: [address],
          },
        })
        .toPromise()
      const profiles = result.data.profiles.items as IProfile[]
      setProfiles(profiles)
      if (profiles.length > 0) {
        if (profiles.length === 1) {
          setProfile(profiles[0])
        } else {
          const defaultProfile = profiles.find((profile) => profile.isDefault)
          if (defaultProfile) {
            setProfile(defaultProfile)
          } else {
            setProfile(profiles[0])
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const login = async () => {
    const challengeResponse = await generateChallenge()
    const signature = await signMessageAsync({
      message: challengeResponse.data.challenge.text,
    })
    const authData = await authenticate(signature)
    const { accessToken, refreshToken } = authData.data.authenticate
    const decoded = jwtDecode<JwtPayload>(accessToken)
    const expiry = decoded?.exp
    localStorage.setItem(
      JWT_KEY,
      JSON.stringify({
        accessToken,
        refreshToken,
        expiry,
      })
    )
    await setMyProfiles()
  }

  return {
    login,
    setMyProfiles,
  }
}
