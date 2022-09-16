import { useSigner, useSignTypedData } from 'wagmi'
import { getLensHubContract, splitSignature } from '@/utils'
import {
  ADD_REACTION_MUTATION,
  CREATE_COLLECT_TYPED_DATA,
  CREATE_MIRROR_TYPED_DATA,
  CREATE_POST_TYPED_DATA,
  REMOVE_REACTION_MUTATION,
} from '@/graphql/mutations'
import { useMutation } from 'urql'
import { signedTypeData } from '@/utils'
import { ethers } from 'ethers'

export const usePost = () => {
  const { data: signer } = useSigner()

  const [, createPostTypedData] = useMutation(CREATE_POST_TYPED_DATA)
  const [, createCollectTypedData] = useMutation(CREATE_COLLECT_TYPED_DATA)
  const [, createMirrorTypedData] = useMutation(CREATE_MIRROR_TYPED_DATA)
  const [, addReaction] = useMutation(ADD_REACTION_MUTATION)
  const [, removeReaction] = useMutation(REMOVE_REACTION_MUTATION)
  const { signTypedDataAsync } = useSignTypedData()

  const createPost = async (createPostRequest: unknown) => {
    const lensHub = getLensHubContract(signer as ethers.Signer)
    const result = await createPostTypedData({
      request: createPostRequest,
    })
    if (result.error) throw result.error
    const typedData = result.data.createPostTypedData.typedData
    const signature = await signedTypeData(
      signTypedDataAsync,
      typedData.domain,
      typedData.types,
      typedData.value
    )
    const { v, r, s } = splitSignature(signature)
    const tx = await lensHub.postWithSig({
      profileId: typedData.value.profileId,
      contentURI: typedData.value.contentURI,
      collectModule: typedData.value.collectModule,
      collectModuleInitData: typedData.value.collectModuleInitData,
      referenceModule: typedData.value.referenceModule,
      referenceModuleInitData: typedData.value.referenceModuleInitData,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    })
    console.log(await tx.wait())
  }

  const collectPost = async (collectRequest: unknown) => {
    const lensHub = getLensHubContract(signer as ethers.Signer)
    const result = await createCollectTypedData({
      request: collectRequest,
    })
    if (result.error) throw result.error
    const typedData = result.data.createCollectTypedData.typedData

    const signature = await signedTypeData(
      signTypedDataAsync,
      typedData.domain,
      typedData.types,
      typedData.value
    )
    const { v, r, s } = splitSignature(signature)

    const tx = await lensHub.collectWithSig({
      collector: await signer?.getAddress(),
      profileId: typedData.value.profileId,
      pubId: typedData.value.pubId,
      data: typedData.value.data,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    })
    console.log(tx.hash)
    await tx.wait()
  }

  const createMirror = async (createMirrorRequest: unknown) => {
    const lensHub = getLensHubContract(signer as ethers.Signer)
    const result = await createMirrorTypedData({ request: createMirrorRequest })
    if (result.error) throw result.error
    const typedData = result.data.createMirrorTypedData.typedData

    const signature = await signedTypeData(
      signTypedDataAsync,
      typedData.domain,
      typedData.types,
      typedData.value
    )
    const { v, r, s } = splitSignature(signature)

    const tx = await lensHub.mirrorWithSig({
      profileId: typedData.value.profileId,
      profileIdPointed: typedData.value.profileIdPointed,
      pubIdPointed: typedData.value.pubIdPointed,
      referenceModuleData: typedData.value.referenceModuleData,
      referenceModule: typedData.value.referenceModule,
      referenceModuleInitData: typedData.value.referenceModuleInitData,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    })
    await tx.wait()
  }

  const reactPost = async (
    reactionRequest: unknown,
    type: 'ADD' | 'REMOVE'
  ) => {
    if (type === 'ADD') {
      const result = await addReaction({
        request: reactionRequest,
      })
      if (result.error) throw result.error
    } else {
      const result = await removeReaction({
        request: reactionRequest,
      })
      if (result.error) throw result.error
    }
  }

  return {
    createPost,
    collectPost,
    createMirror,
    reactPost,
  }
}
