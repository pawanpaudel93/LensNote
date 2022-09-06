import { useSigner, useSignTypedData } from "wagmi"
import { getLensHubContract, splitSignature } from "../utils"
import { createSetDefaultProfileTypedDataMutation } from "../graphql/mutations"
import { useMutation } from "urql"
import { signedTypeData } from "../utils"
import { ethers, Signature } from "ethers"

export const useProfile = () => {
    const { data: signer } = useSigner()

    const [, createSetDefaultProfileTypedData] = useMutation(createSetDefaultProfileTypedDataMutation)
    const { signTypedDataAsync } = useSignTypedData()

    const setDefaultProfile = async (profileId: string) => {
        try {
            const lensHub = getLensHubContract(signer as ethers.Signer)
            const setDefaultProfileRequest = {
                request: { profileId }
            };
            const result = await createSetDefaultProfileTypedData(setDefaultProfileRequest)
            const typedData = result.data.createSetDefaultProfileTypedData.typedData;
            const signature = await signedTypeData(signTypedDataAsync, typedData.domain, typedData.types, typedData.value);
            const { v, r, s } = splitSignature(signature)
            const tx = await lensHub.setDefaultProfileWithSig({
                profileId: typedData.value.profileId,
                wallet: typedData.value.wallet,
                sig: { v, r, s, deadline: typedData.value.deadline }
            })
            await tx.wait()
        } catch (e) {
            console.log(e)
        }
    }

    return {
        setDefaultProfile
    }
}

