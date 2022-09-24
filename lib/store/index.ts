import create from 'zustand'
import { IProfile } from '@/types'

interface AppState {
  defaultProfile: IProfile | null
  profiles: IProfile[] | []
  setProfile: (defaultProfile: IProfile) => void
  setProfiles: (profiles: IProfile[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  defaultProfile: null,
  profiles: [],
  setProfile: (defaultProfile: IProfile) => set(() => ({ defaultProfile })),
  setProfiles: (profiles: IProfile[]) => set(() => ({ profiles })),
}))

export default useAppStore
