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

export const CREATE_POST_TYPED_DATA = `
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

export const CREATE_COLLECT_TYPED_DATA = `
  mutation($request: CreateCollectRequest!) { 
    createCollectTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          CollectWithSig {
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
        pubId
        data
      }
     }
   }
 }
`
export const CREATE_MIRROR_TYPED_DATA = `
  mutation($request: CreateMirrorRequest!) { 
    createMirrorTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          MirrorWithSig {
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
        profileIdPointed
        pubIdPointed
                referenceModule
        referenceModuleData
        referenceModuleInitData
      }
     }
   }
 }
`

export const ADD_REACTION_MUTATION = `
  mutation($request: ReactionRequest!) { 
   addReaction(request: $request)
 }
`
export const REMOVE_REACTION_MUTATION = `
  mutation($request: ReactionRequest!) { 
   removeReaction(request: $request)
 }
`
