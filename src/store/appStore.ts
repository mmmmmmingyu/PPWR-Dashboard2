import { create } from 'zustand'
import type { Language, RegulationType, UserRole } from '../types'

interface AppState {
  regulation: RegulationType
  language: Language
  role: UserRole
  agentOpen: boolean
  sidebarExpanded: boolean
  overlaysVisible: boolean
  setRegulation: (r: RegulationType) => void
  setLanguage: (l: Language) => void
  setRole: (r: UserRole) => void
  toggleAgent: () => void
  toggleSidebar: () => void
  toggleOverlaysVisible: () => void
}

const SIDEBAR_KEY = 'ppwr-sidebar-expanded'
const OVERLAYS_VISIBLE_KEY = 'ppwr-overlays-visible'

export const useAppStore = create<AppState>((set) => ({
  regulation: 'PPWR',
  language: 'zh',
  role: 'admin',
  agentOpen: false,
  sidebarExpanded: localStorage.getItem(SIDEBAR_KEY) === 'true',
  overlaysVisible: localStorage.getItem(OVERLAYS_VISIBLE_KEY) !== 'false',
  setRegulation: (regulation) => set({ regulation }),
  setLanguage: (language) => set({ language }),
  setRole: (role) => set({ role }),
  toggleAgent: () => set((s) => ({ agentOpen: !s.agentOpen })),
  toggleSidebar: () =>
    set((s) => {
      const sidebarExpanded = !s.sidebarExpanded
      localStorage.setItem(SIDEBAR_KEY, String(sidebarExpanded))
      return { sidebarExpanded }
    }),
  toggleOverlaysVisible: () =>
    set((s) => {
      const overlaysVisible = !s.overlaysVisible
      localStorage.setItem(OVERLAYS_VISIBLE_KEY, String(overlaysVisible))
      return { overlaysVisible }
    }),
}))
