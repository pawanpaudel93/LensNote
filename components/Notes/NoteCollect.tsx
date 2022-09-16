import { WMATIC_TOKEN_ADDRESS, WMATIC_ABI } from '@/constants'
import { MODULE_APPROVAL_DATA } from '@/graphql/queries'
import { usePost } from '@/hooks/usePost'
import { ApprovedAllowanceAmount, INote } from '@/interfaces'
import { getRPCErrorMessage } from '@/lib/parser'
import { getDefaultToastOptions } from '@/lib/utils'
import { IconButton, Tooltip, useToast } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { useState } from 'react'
import { BsCollection } from 'react-icons/bs'
import { useClient } from 'urql'
import { usePrepareSendTransaction, useSendTransaction, useSigner } from 'wagmi'

const NoteCollect = ({
  approvedModuleAllowanceAmount,
  note,
}: {
  approvedModuleAllowanceAmount: ApprovedAllowanceAmount[]
  note: INote
}) => {
  const [isCollecting, setIsCollecting] = useState(false)
  const toast = useToast()
  const client = useClient()
  const { data: signer } = useSigner()
  const { collectPost } = usePost()

  const { config: prepareTxn } = usePrepareSendTransaction({
    request: {},
  })
  const { sendTransactionAsync } = useSendTransaction({
    ...prepareTxn,
    mode: 'recklesslyUnprepared',
    onError(error: unknown) {
      console.log(error)
    },
  })

  const collectNote = async () => {
    try {
      setIsCollecting(true)
      const wMatic = new ethers.Contract(
        WMATIC_TOKEN_ADDRESS,
        WMATIC_ABI,
        signer as ethers.Signer
      )
      const noteType = note.collectModule.type
      const allowance = parseInt(
        approvedModuleAllowanceAmount.find(
          (allowanceModule) => allowanceModule.module === noteType
        )?.allowance ?? '0x00'
      )
      const collectPrice = parseFloat(note.collectModule.amount.value)
      const walletBalance = parseFloat(
        ethers.utils.formatEther(
          await wMatic.balanceOf(await signer?.getAddress())
        )
      )

      if (walletBalance < collectPrice) {
        console.log('wallet balance is low')
        const tx = await wMatic.deposit({
          value: ethers.utils.parseEther(
            (collectPrice - walletBalance).toFixed(18).toString()
          ),
        })
        await tx.wait()
      }
      if (
        allowance === 0 ||
        allowance <
          parseInt(ethers.utils.parseEther(collectPrice.toString()).toString())
      ) {
        const result = await client
          .query(MODULE_APPROVAL_DATA, {
            request: {
              currency: WMATIC_TOKEN_ADDRESS,
              value: Number.MAX_SAFE_INTEGER.toString(),
              collectModule: noteType,
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
      }
      await collectPost({ publicationId: note?.id })
      toast({
        title: 'Note collected.',
        description: 'Note has been collected sucessfully.',
        ...getDefaultToastOptions('success'),
      })
    } catch (error) {
      toast({
        title: 'Note collection error.',
        description: getRPCErrorMessage(error),
        ...getDefaultToastOptions('error'),
      })
    } finally {
      setIsCollecting(false)
    }
  }

  return (
    <Tooltip
      hasArrow
      label={note?.hasCollectedByMe ? 'Collect Again' : 'Collect'}
      placement="top"
      shouldWrapChildren
      mt="3"
    >
      <IconButton
        onClick={collectNote}
        isLoading={isCollecting}
        icon={<BsCollection color="red" size="28" />}
        aria-label={''}
      />
    </Tooltip>
  )
}
export default NoteCollect
