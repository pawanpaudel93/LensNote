import type { NextPage } from 'next'
import { FormEvent, useEffect, useState } from 'react'
import MdEditor, { type ToolbarNames } from 'md-editor-rt'
import { CreatableSelect, useChakraSelectProps } from 'chakra-react-select'
import {
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Radio,
  RadioGroup,
  Stack,
  HStack,
  useToast,
  useColorMode,
  Spinner,
} from '@chakra-ui/react'
import { usePost } from '@/hooks/usePost'
import { useAccount } from 'wagmi'
import { WMATIC_TOKEN_ADDRESS } from '@/constants'
import { CollectModules, CommonFeeCollectModuleParams } from '@/types'
import 'md-editor-rt/lib/style.css'
import useAppStore from '@/lib/store'
import { getErrorMessage, getRPCErrorMessage } from '@/lib/parser'
import { getDefaultToastOptions } from '@/lib/utils'
import usePersistStore from '@/lib/store/persist'
import { useIsMounted } from '@/hooks/useIsMounted'
import { saveAs } from 'file-saver'

const collectModuleTypes = {
  FreeCollectModule: 'Free Collect',
  RevertCollectModule: 'Revert Collect',
  FeeCollectModule: 'Fee Collect',
  LimitedFeeCollectModule: 'Limited Fee Collect',
  LimitedTimedFeeCollectModule: 'Limited Timed Fee Collect',
  TimedFeeCollectModule: 'Timed Fee Collect',
}

const CreateNote: NextPage = () => {
  const { colorMode } = useColorMode()
  const { createPost } = usePost()
  const toast = useToast()
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const profile = useAppStore((store) => store.defaultProfile)
  const [collectModule, setCollectModule] = useState('FreeCollectModule')
  const toolbarsExclude: ToolbarNames[] = ['github']
  const [value, setValue] = useState('false')
  const [followerOnlyReference, setFollowerOnlyReference] = useState('false')
  const mounted = useIsMounted()
  const [collect, setCollect] = useState<CommonFeeCollectModuleParams>({
    collectLimit: '100000',
    amount: {
      currency: WMATIC_TOKEN_ADDRESS,
      value: '1',
    },
    recipient: address as string,
    referralFee: 10,
    followerOnly: false,
  })
  const metadata = usePersistStore((state) => state.publicNote)
  const setMetadata = usePersistStore((state) => state.setPublicNote)

  const selectProps = useChakraSelectProps({
    placeholder: 'Tags...',
    value: metadata.tags?.map((tag) => ({ value: tag, label: tag })),
    isMulti: true,
    id: 'public-note-tags',
    instanceId: 'public-note-tags',
    onChange: (tags) => {
      setMetadata({
        ...metadata,
        tags: (tags as { label: string; value: string }[]).map(
          (tag) => tag.value
        ),
      })
    },
  })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata,
        }),
      })
      const responseJSON = await response.json()
      const contentURI = 'ipfs://' + responseJSON.contentID
      // const contentURI =
      //   'ipfs://bafkreia3tfgsxhb6osxm7b346fpvfgm2afwzbowry4rjxsg4kyefcgxoya'
      console.log(contentURI)
      let collectModuleParams = {}
      if (CollectModules.FreeCollectModule === collectModule) {
        collectModuleParams = {
          freeCollectModule: {
            followerOnly: value === 'true',
          },
        }
      } else if (CollectModules.RevertCollectModule === collectModule) {
        collectModuleParams = {
          revertCollectModule: value === 'true',
        }
      } else if (
        collectModule === CollectModules.FeeCollectModule ||
        collectModule === CollectModules.TimedFeeCollectModule
      ) {
        collectModuleParams = {
          [collectModule.charAt(0).toLowerCase() + collectModule.slice(1)]: {
            amount: collect.amount,
            recipient: collect.recipient,
            referralFee: collect.referralFee,
            followerOnly: collect.followerOnly,
          },
        }
      } else {
        collectModuleParams = {
          [collectModule.charAt(0).toLowerCase() + collectModule.slice(1)]:
            collect,
        }
      }

      await createPost({
        profileId: profile?.id,
        contentURI,
        collectModule: collectModuleParams,
        referenceModule: {
          followerOnlyReferenceModule: followerOnlyReference === 'true',
        },
      })
      toast({
        title: 'Note created.',
        description: 'Note has been created sucessfully.',
        ...getDefaultToastOptions('success'),
      })
    } catch (error) {
      toast({
        title: 'Note creation error.',
        description: getRPCErrorMessage(error),
        ...getDefaultToastOptions('error'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSave = (content: string) => {
    if (content) {
      const blob = new Blob([content], {
        type: 'text/plain;charset=utf-8',
      })

      saveAs(
        blob,
        `${metadata?.name ? metadata?.name.split(' ').join('-') : 'note'}.md`
      )
    }
  }

  const onUploadImg = async (
    files: Array<File>,
    callback: (urls: Array<string>) => void
  ) => {
    if (files.length > 0) {
      try {
        setIsUploading(true)
        const res = await Promise.all(
          files.map((file) => {
            return new Promise((rev, rej) => {
              const form = new FormData()
              form.append('file', file)

              fetch('/api/img/upload', {
                method: 'POST',
                body: form,
              })
                .then(async (res) => rev(await res.json()))
                .catch((error) => rej(error))
            })
          })
        )
        callback(res.map((item) => (item as { imageUrl: string }).imageUrl))
      } catch (error) {
        toast({
          title: 'Image Upload Error',
          description: getErrorMessage(error),
          ...getDefaultToastOptions('error'),
        })
      }
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (address) {
      collect.recipient = address
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const CollectModuleComponent = () => {
    if (collectModule === CollectModules.FreeCollectModule) {
      return (
        <FormControl isRequired>
          <HStack>
            <FormLabel>Who can collect this Note ?</FormLabel>
            <RadioGroup onChange={setValue} value={value}>
              <Stack direction="row">
                <Radio value="false">All</Radio>
                <Radio value="true">Follower Only</Radio>
              </Stack>
            </RadioGroup>
          </HStack>
        </FormControl>
      )
    } else if (collectModule === CollectModules.RevertCollectModule) {
      return (
        <FormControl isRequired>
          <HStack>
            <FormLabel>Donot allow anyone to collect this Note ?</FormLabel>
            <RadioGroup onChange={setValue} value={value}>
              <Stack direction="row">
                <Radio value="true">True</Radio>
                <Radio value="false">False</Radio>
              </Stack>
            </RadioGroup>
          </HStack>
        </FormControl>
      )
    } else if (
      collectModule === CollectModules.FeeCollectModule ||
      collectModule === CollectModules.TimedFeeCollectModule
    ) {
      return (
        <VStack spacing={2} w="full">
          <FormControl isRequired>
            <FormLabel>Amount</FormLabel>
            <Input
              placeholder="Amount"
              type="number"
              value={collect.amount.value}
              onChange={(e) => {
                const amount = { ...collect.amount, value: e.target.value ?? 0 }
                setCollect((prev) => ({ ...prev, amount }))
              }}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Recipient Address</FormLabel>
            <Input
              placeholder="Recipient Address"
              value={collect.recipient}
              onChange={(e) =>
                setCollect((prev) => ({ ...prev, recipient: e.target.value }))
              }
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Referral Fee</FormLabel>
            <Input
              placeholder="Referral Fee"
              value={collect.referralFee}
              onChange={(e) =>
                setCollect((prev) => ({
                  ...prev,
                  referralFee: parseFloat(e.target.value ?? 0),
                }))
              }
            />
          </FormControl>
          <FormControl isRequired>
            <HStack>
              <FormLabel>Only Follower can collect ?</FormLabel>
              <RadioGroup
                onChange={(value) =>
                  setCollect((prev) => ({
                    ...prev,
                    followerOnly: value === 'true',
                  }))
                }
                value={value}
              >
                <Stack direction="row">
                  <Radio value="true">True</Radio>
                  <Radio value="false">False</Radio>
                </Stack>
              </RadioGroup>
            </HStack>
          </FormControl>
        </VStack>
      )
    }
    return (
      <VStack spacing={2} w="full">
        <FormControl isRequired>
          <FormLabel>Collect Limit</FormLabel>
          <Input
            placeholder="Collect Limit"
            type="number"
            value={collect.collectLimit}
            onChange={(e) =>
              setCollect((prev) => ({
                ...prev,
                collectLimit: e.target.value,
              }))
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <Input
            placeholder="Amount"
            type="number"
            value={collect.amount.value}
            onChange={(e) => {
              const amount = { ...collect.amount, value: e.target.value ?? 0 }
              setCollect((prev) => ({ ...prev, amount }))
            }}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Recipient Address</FormLabel>
          <Input
            placeholder="Recipient Address"
            value={collect.recipient}
            onChange={(e) =>
              setCollect((prev) => ({ ...prev, recipient: e.target.value }))
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Referral Fee</FormLabel>
          <Input
            placeholder="Referral Fee"
            value={collect.referralFee}
            onChange={(e) =>
              setCollect((prev) => ({
                ...prev,
                referralFee: parseFloat(e.target.value ?? 0),
              }))
            }
          />
        </FormControl>
        <FormControl isRequired>
          <HStack>
            <FormLabel>Only Follower can collect ?</FormLabel>
            <RadioGroup
              onChange={(value) =>
                setCollect((prev) => ({
                  ...prev,
                  followerOnly: value === 'true',
                }))
              }
              value={value}
            >
              <Stack direction="row">
                <Radio value="true">True</Radio>
                <Radio value="false">False</Radio>
              </Stack>
            </RadioGroup>
          </HStack>
        </FormControl>
      </VStack>
    )
  }

  if (!mounted) {
    return (
      <Center top="50%" left="50%" position="fixed">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    )
  }

  return (
    <Container
      maxW="full"
      px={12}
      borderWidth="1px"
      borderRadius="lg"
      w={{ sm: '100%', md: '98%' }}
      boxShadow={'2xl'}
      padding={4}
    >
      <form onSubmit={onSubmit}>
        <VStack spacing={2}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="Title"
              value={metadata.name}
              onChange={(e) => {
                setMetadata({
                  ...metadata,
                  name: e.target.value,
                })
              }}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={metadata.description as string}
              onChange={(e) =>
                setMetadata({
                  ...metadata,
                  description: e.target.value,
                })
              }
              placeholder="Description"
              size="sm"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Content</FormLabel>
            <MdEditor
              language="en-US"
              modelValue={metadata.content as string}
              toolbarsExclude={toolbarsExclude}
              onChange={(v: string) => {
                setMetadata({ ...metadata, content: v })
              }}
              onSave={onSave}
              onUploadImg={onUploadImg}
              style={{
                padding: '25px',
              }}
              theme={colorMode}
              previewTheme="github"
              codeTheme="github"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Tags</FormLabel>
            <CreatableSelect {...selectProps} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Select Module for Collect</FormLabel>
            <Select
              placeholder="Select Collect Module"
              value={collectModule}
              onChange={(e) => setCollectModule(e.target.value)}
            >
              {Object.entries(collectModuleTypes).map(([key, value]) => (
                <option value={key} key={key}>
                  {value}
                </option>
              ))}
            </Select>
          </FormControl>
          <CollectModuleComponent />
          <FormControl isRequired>
            <HStack>
              <FormLabel>
                Allow Follower Only to Comment or Mirror this Note ?
              </FormLabel>
              <RadioGroup
                onChange={setFollowerOnlyReference}
                value={followerOnlyReference}
              >
                <Stack direction="row">
                  <Radio value="true">True</Radio>
                  <Radio value="false">False</Radio>
                </Stack>
              </RadioGroup>
            </HStack>
          </FormControl>
          <Center>
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              Create Note
            </Button>
          </Center>
        </VStack>
      </form>
    </Container>
  )
}

export default CreateNote
