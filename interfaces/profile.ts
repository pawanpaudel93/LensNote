type Picture = {
  original: { mimeType: null | string; url: string }
}
export interface IProfile {
  id: string
  name: string | null
  bio: string | null
  attributes: []
  metadata: string | null
  isDefault: boolean
  picture: null | Picture
  handle: string
  coverPicture: null | Picture
  ownedBy: string
  dispatcher: null
  isFollowedByMe?: boolean
  stats: {
    totalFollowers: number
    totalFollowing: number
    totalPosts: number
    totalComments: number
    totalMirrors: number
    totalPublications: number
    totalCollects: number
  }
  followModule: null
}
