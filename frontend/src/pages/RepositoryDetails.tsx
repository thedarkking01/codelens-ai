import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ExternalLink,
  FileCode2,
  Folder,
  GitBranch,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { useAuth } from '@/context/useAuth'
import {
  getRepository,
  getRepositoryFiles,
} from '@/services/repository.service'

import type { Repository, RepositoryFile } from '@/types/repository'


function getStatusInfo(status: string) {
  switch (status.toUpperCase()) {
    case 'READY':
      return {
        label: 'Ready',
        className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      }
    case 'PROCESSING':
    case 'INDEXING':
    case 'CLONING':
      return {
        label: 'Indexing',
        className: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
      }
    case 'FAILED':
      return {
        label: 'Failed',
        className: 'border-red-500/20 bg-red-500/10 text-red-400',
      }
    default:
      return {
        label: 'Pending',
        className: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
      }
  }
}

function getFileExtension(file: RepositoryFile) {
  if (file.extension) return file.extension.replace('.', '').toUpperCase()
  const parts = file.name.split('.')
  return parts.length > 1 ? (parts.at(-1)?.toUpperCase() ?? 'FILE') : 'FILE'
}


export default function RepositoryDetails() {
  const { repositoryId } = useParams<{ repositoryId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [repository, setRepository] = useState<Repository | null>(null)
  const [files, setFiles] = useState<RepositoryFile[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadRepository = useCallback(
    async (showRefreshing = false) => {
      if (!token || !repositoryId) return

      if (showRefreshing) setIsRefreshing(true)
      else setIsLoading(true)

      setError('')

      try {
        const [repoRes, filesRes] = await Promise.all([
          getRepository(token, repositoryId),
          getRepositoryFiles(token, repositoryId),
        ])
        setRepository(repoRes.data)
        setFiles(filesRes.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repository')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [token, repositoryId],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!token || !repositoryId) return

      try {
        const [repoRes, filesRes] = await Promise.all([
          getRepository(token, repositoryId),
          getRepositoryFiles(token, repositoryId),
        ])
        if (!cancelled) {
          setRepository(repoRes.data)
          setFiles(filesRes.data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load repository')
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => { cancelled = true }
  }, [token, repositoryId])

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return files
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.path.toLowerCase().includes(query) ||
        f.language?.toLowerCase().includes(query),
    )
  }, [files, search])


  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
          <p className="text-sm">Loading repository...</p>
        </div>
      </div>
    )
  }

  if (error || !repository) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Card className="border-red-500/20 bg-[#111720]">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-red-400">{error || 'Repository not found'}</p>
            <Button variant="outline" className="mt-5" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = getStatusInfo(repository.status)

  return (
    <div className="min-h-full bg-[#0b0f14]">
      <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Repositories
          </Link>
          <span className="text-slate-700">/</span>
          <span className="max-w-[250px] truncate text-slate-300">{repository.name}</span>
        </div>

        {/* Repository Header */}
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#151c27] via-[#111720] to-[#0d1219]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative p-6 lg:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-violet-400">
                  <Sparkles className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                      {repository.name}
                    </h1>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </div>

                  <a
                    href={repository.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex max-w-xl items-center gap-1.5 truncate font-mono text-xs text-slate-500 hover:text-violet-400"
                  >
                    {repository.githubUrl}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5" />
                      {repository.branch || 'main'}
                    </span>
                    <span>{files.length} files</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadRepository(true)}
                disabled={isRefreshing}
                className="gap-2 border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-1 border-b border-white/[0.07]">
          <button type="button" className="border-b-2 border-violet-500 px-4 py-3 text-sm font-medium text-white">
            Overview
          </button>
          <button type="button" className="px-4 py-3 text-sm text-slate-500 transition-colors hover:text-slate-300">
            Code Explorer
          </button>
          <button type="button" className="px-4 py-3 text-sm text-slate-500 transition-colors hover:text-slate-300">
            AI Chat
          </button>
          <button type="button" className="px-4 py-3 text-sm text-slate-500 transition-colors hover:text-slate-300">
            Architecture
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

          {/* Files */}
          <Card className="border-white/[0.07] bg-[#111720] shadow-none">
            <CardHeader className="border-b border-white/[0.06]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base text-white">Repository files</CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    Browse the source code indexed by CodeLens AI.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search files..."
                    className="h-9 border-white/[0.07] bg-black/20 pl-9 text-xs text-white placeholder:text-slate-600"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Folder className="h-7 w-7 text-slate-700" />
                  <p className="mt-3 text-sm text-slate-500">No files found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.025]"
                      onClick={() => navigate(`/repositories/${repository.id}/files/${file.id}`)}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                        <FileCode2 className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm text-slate-200">{file.path}</p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {file.language || 'Unknown language'}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className="hidden border-white/[0.07] bg-white/[0.02] text-[10px] text-slate-500 sm:flex"
                      >
                        {getFileExtension(file)}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-white/[0.07] bg-[#111720] shadow-none">
              <CardHeader>
                <CardTitle className="text-sm text-white">Repository intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Files</span>
                  <span className="font-mono text-sm text-white">{files.length}</span>
                </div>
                <Separator className="bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Branch</span>
                  <span className="font-mono text-sm text-white">{repository.branch || 'main'}</span>
                </div>
                <Separator className="bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className="text-sm text-emerald-400">{status.label}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-500/10 bg-gradient-to-br from-violet-500/[0.08] to-transparent shadow-none">
              <CardContent className="p-5">
                <Sparkles className="h-5 w-5 text-violet-400" />
                <h3 className="mt-4 font-semibold text-white">Ask CodeLens AI</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Ask questions about this repository, architecture, authentication,
                  dependencies, and implementation details.
                </p>
                <Button
                  className="mt-5 w-full gap-2 bg-violet-600 hover:bg-violet-500"
                  disabled={repository.status !== 'READY'}
                >
                  <Sparkles className="h-4 w-4" />
                  Open AI Assistant
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
