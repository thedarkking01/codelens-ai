import {
  Bell,
  Command,
  Search,
} from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'

interface TopbarProps {
  userName?: string
}

export default function Topbar({
  userName = 'User',
}: TopbarProps) {
  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0b0f14]/95 px-4 backdrop-blur-xl lg:px-6">
      {/* Search */}
      <div className="hidden w-full max-w-md md:block">
        <button
          type="button"
          className="flex h-9 w-full items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-left text-sm text-slate-500 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
        >
          <Search className="h-4 w-4" />

          <span className="flex-1">
            Search repositories, files...
          </span>

          <span className="flex items-center gap-1 rounded border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-slate-600">
            <Command className="h-3 w-3" />
            K
          </span>
        </button>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-white/[0.08]" />

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1.5 pr-2 transition-colors hover:bg-white/[0.05]"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-violet-500/15 text-xs text-violet-300">
              {initials}
            </AvatarFallback>
          </Avatar>

          <span className="hidden text-sm text-slate-300 sm:block">
            {userName}
          </span>
        </button>
      </div>
    </header>
  )
}