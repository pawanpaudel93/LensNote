export interface IProfile {
    id: string;
    name: string | null;
    bio: string | null;
    attributes: [];
    metadata: string | null;
    isDefault: boolean;
    picture: string | null;
    handle: string;
    coverPicture: string | null;
    ownedBy: string;
    dispatcher: null;
    stats: {
        totalFollowers: number;
        totalFollowing: number;
        totalPosts: number;
        totalComments: number;
        totalMirrors: number;
        totalPublications: number;
        totalCollects: number;
    };
    followModule: null;
}