import type { NextPage } from 'next'
import { useClient, useQuery } from 'urql'
import {
  GET_PUBLICATION_QUERY,
  GET_ALLOWANCE_QUERY,
  MODULE_APPROVAL_DATA,
} from '@/graphql/queries'
import { useRouter } from 'next/router'
import { ApprovedAllowanceAmount, INote } from '@/interfaces'
import NoteInfo from '@/components/Notes/NoteInfo'
import MdEditor from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import {
  Box,
  Button,
  Center,
  Container,
  SkeletonText,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { usePost } from '@/hooks/usePost'
import { useState } from 'react'
import NoteStats from '@/components/Notes/NoteStats'
import { WMATIC_TOKEN_ADDRESS, WMATIC_ABI } from '@/constants'
import { ethers } from 'ethers'
import { usePrepareSendTransaction, useSendTransaction, useSigner } from 'wagmi'
import { getDefaultToastOptions } from '@/lib/utils'
import { getRPCErrorMessage } from '@/lib/parser'

const Note: NextPage = () => {
  const [isCollecting, setIsCollecting] = useState(false)
  const { collectPost } = usePost()
  const { data: signer } = useSigner()
  const client = useClient()
  const toast = useToast()

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
  const {
    query: { id },
  } = useRouter()

  const [data] = useQuery({
    query: GET_PUBLICATION_QUERY,
    variables: {
      request: { publicationId: id },
    },
  })

  const [currencyData] = useQuery({
    query: GET_ALLOWANCE_QUERY,
    variables: {
      request: {
        currencies: [WMATIC_TOKEN_ADDRESS],
        collectModules: [
          'LimitedFeeCollectModule',
          'FeeCollectModule',
          'LimitedTimedFeeCollectModule',
          'TimedFeeCollectModule',
          'FreeCollectModule',
          'RevertCollectModule',
        ],
        followModules: [
          'FeeFollowModule',
          'RevertFollowModule',
          'ProfileFollowModule',
        ],
        referenceModules: ['FollowerOnlyReferenceModule'],
      },
    },
  })

  const approvedModuleAllowanceAmount: ApprovedAllowanceAmount[] =
    currencyData?.data?.approvedModuleAllowanceAmount ?? []
  const note: INote = data?.data?.publication

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
      await collectPost({ publicationId: id })
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
    <Container maxW="full" px={12}>
      <SkeletonText noOfLines={4} spacing="4" isLoaded={!data.fetching}>
        <NoteInfo note={note} isDetailPage />
        <NoteStats stats={note?.stats} />
        <Center>
          <VStack>
            {note?.hasCollectedByMe && (
              <Text color="green">You have already collected this note.</Text>
            )}
            <Button
              colorScheme="green"
              onClick={collectNote}
              isLoading={isCollecting}
            >
              {note?.hasCollectedByMe ? 'Collect Again' : 'Collect'}
            </Button>
          </VStack>
        </Center>
        <Box p="4" boxShadow="lg" m="4" borderRadius="sm">
          <MdEditor
            modelValue={note?.metadata?.content as string}
            language="en-US"
            previewOnly
          />
        </Box>
      </SkeletonText>

      <SkeletonText
        noOfLines={20}
        mt={12}
        spacing="4"
        isLoaded={!data.fetching}
      />
    </Container>
  )
}
export default Note
