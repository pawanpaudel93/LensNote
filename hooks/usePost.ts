import {
  usePrepareSendTransaction,
  useSendTransaction,
  useSigner,
  useSignTypedData,
} from 'wagmi'
import { getLensHubContract, splitSignature } from '@/utils'
import {
  CREATE_COLLECT_TYPED_DATA,
  CREATE_POST_TYPED_DATA,
} from '@/graphql/mutations'
import { MODULE_APPROVAL_DATA } from '@/graphql/queries'
import { useClient, useMutation } from 'urql'
import { signedTypeData } from '@/utils'
import { ethers } from 'ethers'
import { WMATIC_TOKEN_ADDRESS } from '@/constants'

export const usePost = () => {
  const { data: signer } = useSigner()

  const [, createPostTypedData] = useMutation(CREATE_POST_TYPED_DATA)
  const [, createCollectTypedData] = useMutation(CREATE_COLLECT_TYPED_DATA)
  const client = useClient()
  const { signTypedDataAsync } = useSignTypedData()

  const { config: prepareTxn } = usePrepareSendTransaction({
    request: {},
  })
  const { sendTransactionAsync } = useSendTransaction({
    ...prepareTxn,
    mode: 'recklesslyUnprepared',
    onError(error: any) {
      console.log(error)
    },
  })

  const createPost = async (createPostRequest: unknown) => {
    try {
      const lensHub = getLensHubContract(signer as ethers.Signer)
      const result = await createPostTypedData({
        request: createPostRequest,
      })
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
    } catch (e) {
      console.log(e)
    }
  }

  const collectPost = async (
    collectRequest: unknown,
    collectModule: string
  ) => {
    try {
      const lensHub = getLensHubContract(signer as ethers.Signer)
      const result = await createCollectTypedData({
        request: collectRequest,
      })
      if (!result.data) {
        const result = await client
          .query(MODULE_APPROVAL_DATA, {
            request: {
              currency: WMATIC_TOKEN_ADDRESS,
              value: Number.MAX_SAFE_INTEGER.toString(),
              collectModule,
            },
          })
          .toPromise()
        const generateModuleCurrencyApprovalData =
          result.data.generateModuleCurrencyApprovalData

        const tx = await sendTransactionAsync?.({
          recklesslySetUnpreparedRequest: {
            from: generateModuleCurrencyApprovalData.from,
            to: generateModuleCurrencyApprovalData.to,
            data: generateModuleCurrencyApprovalData.data,
          },
        })
        await tx.wait()
        await collectPost(collectRequest, collectModule)
      }
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
    } catch (e) {
      console.log(e)
    }
  }

  return {
    createPost,
    collectPost,
  }
}
