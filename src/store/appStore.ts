import { create } from 'zustand'
import type { Language, RegulationType, UserRole } from '../types'

interface AppState {
  regulation: RegulationType
  language: Language
  role: UserRole
  agentOpen: boolean
  setRegulation: (r: RegulationType) => void
  setLanguage: (l: Language) => void
  setRole: (r: UserRole) => void
  toggleAgent: () => void
}

export const useAppStore = create<AppState>((set) => ({
  regulation: 'PPWR',
  language: 'zh',
  role: 'admin',
  agentOpen: true,
  setRegulation: (regulation) => set({ regulation }),
  setLanguage: (language) => set({ language }),
  setRole: (role) => set({ role }),
  toggleAgent: () => set((s) => ({ agentOpen: !s.agentOpen })),
}))
