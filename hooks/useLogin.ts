import { useAccount, useSignMessage } from 'wagmi'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { useClient } from 'urql'
import { JWT_KEY } from '@/constants'
import { GET_CHALLENGE_QUERY } from '@/graphql/queries'
import { authenticateMutation } from '@/graphql/mutations'

export const useLogin = () => {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const client = useClient()

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
  }

  return {
    login,
  }
}
