import { useSigner, useSignTypedData } from 'wagmi'
import { getLensHubContract, splitSignature } from '@/utils'
import {
  createSetDefaultProfileTypedDataMutation,
  CREATE_FOLLOW_TYPED_DATA,
  CREATE_UNFOLLOW_TYPED_DATA,
} from '@/graphql/mutations'
import { useMutation } from 'urql'
import { signedTypeData } from '@/utils'
import { ethers, Signer } from 'ethers'
import { LENS_FOLLOW_NFT_ABI } from '@/constants'

export const useProfile = () => {
  const { data: signer } = useSigner()

  const [, createSetDefaultProfileTypedData] = useMutation(
    createSetDefaultProfileTypedDataMutation
  )
  const [, createFollowTypedData] = useMutation(CREATE_FOLLOW_TYPED_DATA)
  const [, createUnfollowTypedData] = useMutation(CREATE_UNFOLLOW_TYPED_DATA)
  const { signTypedDataAsync } = useSignTypedData()

  const setDefaultProfile = async (profileId: string) => {
    const lensHub = getLensHubContract(signer as ethers.Signer)
    const setDefaultProfileRequest = {
      request: { profileId },
    }
    const result = await createSetDefaultProfileTypedData(
      setDefaultProfileRequest
    )
    if (result.error) throw result.error
    const typedData = result.data.createSetDefaultProfileTypedData.typedData
    const signature = await signedTypeData(
      signTypedDataAsync,
      typedData.domain,
      typedData.types,
      typedData.value
    )
    const { v, r, s } = splitSignature(signature)
    const tx = await lensHub.setDefaultProfileWithSig({
      profileId: typedData.value.profileId,
      wallet: typedData.value.wallet,
      sig: { v, r, s, deadline: typedData.value.deadline },
    })
    await tx.wait()
  }

  const follow = async (followRequestInfo: unknown) => {
    const lensHub = getLensHubContract(signer as ethers.Signer)
    const result = await createFollowTypedData({ request: followRequestInfo })
    const typedData = result.data.createFollowTypedData.typedData

    const signature = await signedTypeData(
      signTypedDataAsync,
      typedData.domain,
      typedData.types,
      typedData.value
    )
    const { v, r, s } = splitSignature(signature)
    const address = await signer?.getAddress()

    const tx = await lensHub.followWithSig({
      follower: address,
      profileIds: typedData.value.profileIds,
      datas: typedData.value.datas,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    })
    await tx.wait()
    console.log(tx.hash)
  }

  const unfollow = async (profileId: string) => {
    const result = await createUnfollowTypedData({
      request: {
        profile: profileId,
      },
    })

    const typedData = result.data.createUnfollowTypedData.typedData

    const signature = await signedTypeData(
      signTypedDataAsync,
      typedData.domain,
      typedData.types,
      typedData.value
    )
    const { v, r, s } = splitSignature(signature)

    // load up the follower nft contract
    const followNftContract = new ethers.Contract(
      typedData.domain.verifyingContract,
      LENS_FOLLOW_NFT_ABI,
      signer as Signer
    )

    const sig = {
      v,
      r,
      s,
      deadline: typedData.value.deadline,
    }

    const tx = await followNftContract.burnWithSig(typedData.value.tokenId, sig)
    await tx.wait()
  }

  return {
    setDefaultProfile,
    follow,
    unfollow,
  }
}
