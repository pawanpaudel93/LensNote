import create from 'zustand'
import { IProfile } from '@/interfaces'

interface AppState {
  defaultProfile: IProfile | object
  profiles: IProfile[] | []
  setProfile: (defaultProfile: IProfile) => void
  setProfiles: (profiles: IProfile[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  defaultProfile: {},
  profiles: [],
  setProfile: (defaultProfile: IProfile) => set(() => ({ defaultProfile })),
  setProfiles: (profiles: IProfile[]) => set(() => ({ profiles })),
}))

export default useAppStore
