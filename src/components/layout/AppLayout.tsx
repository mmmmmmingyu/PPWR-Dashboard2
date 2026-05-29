import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { AgentPanel } from '../ai/AgentPanel'

export function AppLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/80">
          <Outlet />
        </main>
        <AgentPanel />
      </div>
    </div>
  )
}
