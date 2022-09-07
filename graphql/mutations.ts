export const authenticateMutation = `
  mutation Authenticate(
    $address: EthereumAddress!
    $signature: Signature!
  ) {
      authenticate(request: {
      address: $address,
      signature: $signature
    }) {
    accessToken
    refreshToken
    }
  }
`

export const refreshMutation = `
    mutation Refresh(
      $refreshToken: Jwt!
    ) {
      refresh(request: {
        refreshToken: $refreshToken
      }) {
        accessToken
        refreshToken
      }
    }
`

export const createProfileMutation = `
  mutation CreateProfile($request: CreateProfileRequest!) {
    createProfile(request: $request) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
      __typename
    }
  }
`

export const createSetDefaultProfileTypedDataMutation = `
  mutation($request: CreateSetDefaultProfileRequest!) { 
    createSetDefaultProfileTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          SetDefaultProfileWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          wallet
          profileId
        }
      }
    }
  }
`

export const createPostTypedDataMutation = `
mutation($request: CreatePublicPostRequest!) { 
  createPostTypedData(request: $request) {
    id
    expiresAt
    typedData {
      types {
        PostWithSig {
          name
          type
        }
      }
    domain {
      name
      chainId
      version
      verifyingContract
    }
    value {
      nonce
      deadline
      profileId
      contentURI
      collectModule
      collectModuleInitData
      referenceModule
      referenceModuleInitData
    }
  }
 }
}
`
