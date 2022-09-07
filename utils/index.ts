import { ethers, Signer, utils } from 'ethers'
import { LENS_HUB_ABI, LENS_HUB_CONTRACT_ADDRESS } from '@/constants'
import omitDeep from 'omit-deep'
import type { SignTypedDataArgs } from '@wagmi/core'

export const getLensHubContract = (signer: Signer) => {
  return new ethers.Contract(LENS_HUB_CONTRACT_ADDRESS, LENS_HUB_ABI, signer)
}

export const signedTypeData = async (
  signTypedDataAsync: (args?: SignTypedDataArgs | undefined) => Promise<string>,
  domain: string,
  types: string,
  value: string
) => {
  // remove the __typedname from the signature!
  return await signTypedDataAsync({
    domain: omitDeep(domain, '__typename'),
    types: omitDeep(types, '__typename'),
    value: omitDeep(value, '__typename'),
  })
}

export function splitSignature(signature: string) {
  return utils.splitSignature(signature)
}
