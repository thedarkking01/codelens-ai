import {
  Bot,
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  Settings,
  Sparkles,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface SidebarProps {
  currentPath?: string
}

const navigation = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
]

const workspaceNavigation = [
  {
    label: 'Repositories',
    href: '/dashboard',
    icon: FolderGit2,
  },
  {
    label: 'AI Assistant',
    href: '/dashboard',
    icon: Bot,
  },
  {
    label: 'Architecture',
    href: '/dashboard',
    icon: GitBranch,
  },
]

export default function Sidebar({
  currentPath = '/dashboard',
}: SidebarProps) {
  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-white/[0.06] bg-[#0d1219] lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-white/[0.06] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 ring-1 ring-violet-400/20">
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>

          <div>
            <div className="text-sm font-semibold tracking-tight text-white">
              CodeLens AI
            </div>

            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Code Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = currentPath === item.href

            return (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-violet-500/10 text-violet-300'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            )
          })}
        </nav>

        <p className="mb-2 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Explore
        </p>

        <nav className="space-y-1">
          {workspaceNavigation.map((item) => {
            const Icon = item.icon

            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            )
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-3">
        <a
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
        >
          <Settings className="h-4 w-4" />
          Settings
        </a>
      </div>
    </aside>
  )
}