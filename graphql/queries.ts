export const getChallengeQuery = `
  query Challenge($address: EthereumAddress!) {
    challenge(request: {address: $address}) { text }
  }
`
export const getDefaultProfileQuery = `
  query($request: DefaultProfileRequest!) {
    defaultProfile(request: $request) {
      id
      name
      bio
      attributes {
        displayType
        traitType
        key
        value
      }
      metadata
      isDefault
      picture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
        __typename
      }
      handle
      coverPicture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
        __typename
      }
      ownedBy
      dispatcher {
        address
        canUseRelay
      }
      stats {
        totalFollowers
        totalFollowing
        totalPosts
        totalComments
        totalMirrors
        totalPublications
        totalCollects
      }
      followModule {
        ... on FeeFollowModuleSettings {
          type
          amount {
            asset {
              symbol
              name
              decimals
              address
            }
            value
          }
          recipient
        }
        ... on ProfileFollowModuleSettings {
          type
        }
        ... on RevertFollowModuleSettings {
          type
        }
      }
    }
  }
`
export const getProfilesQuery = `
query($request: ProfileQueryRequest!) {
  profiles(request: $request) {
      items {
      id
      name
      bio
        attributes {
        displayType
        traitType
        key
        value
      }
      metadata
      isDefault
        picture {
          ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
          ... on MediaSet {
            original {
            url
            mimeType
          }
        }
        __typename
      }
      handle
        coverPicture {
          ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
          ... on MediaSet {
            original {
            url
            mimeType
          }
        }
        __typename
      }
      ownedBy
        dispatcher {
        address
        canUseRelay
      }
        stats {
        totalFollowers
        totalFollowing
        totalPosts
        totalComments
        totalMirrors
        totalPublications
        totalCollects
      }
        followModule {
          ... on FeeFollowModuleSettings {
          type
            amount {
              asset {
              symbol
              name
              decimals
              address
            }
            value
          }
          recipient
        }
          ... on ProfileFollowModuleSettings {
          type
        }
          ... on RevertFollowModuleSettings {
          type
        }
      }
    }
      pageInfo {
      prev
      next
      totalCount
    }
  }
}
`