import {
  IMetadata,
  IPrivateMetadata,
  PublicationMainFocus,
  PublicationMetadataDisplayType,
  PublicationMetadataVersions,
} from '@/interfaces'
import create from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { persist } from 'zustand/middleware'
import { APP_NAME } from '@/constants'

interface AppPerisistState {
  publicNote: IMetadata
  privateNote: IPrivateMetadata
  setPublicNote: (note: IMetadata) => void
  setPrivateNote: (note: IPrivateMetadata) => void
}

export const usePersistStore = create(
  persist<AppPerisistState>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, get) => ({
      privateNote: {
        title: '',
        description: '',
        content: '# Note',
        tags: [],
        contentCid: '',
        encryptedSymmetricKey: '',
        accessControlConditions: {},
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      publicNote: {
        version: PublicationMetadataVersions.two,
        metadata_id: uuidv4(),
        name: '',
        description: '',
        content: '# Note',
        locale: 'en-US',
        tags: [],
        contentWarning: null,
        mainContentFocus: PublicationMainFocus.ARTICLE,
        external_url: null,
        image: null,
        imageMimeType: null,
        media: null,
        animation_url: null,
        attributes: [
          {
            displayType: PublicationMetadataDisplayType.string,
            traitType: 'type',
            value: 'note',
          },
        ],
        appId: APP_NAME,
      },
      setPrivateNote: (privateNote) => set(() => ({ privateNote })),
      setPublicNote: (publicNote) => set(() => ({ publicNote })),
    }),
    {
      name: 'lensnote.store',
    }
  )
)

export default usePersistStore
