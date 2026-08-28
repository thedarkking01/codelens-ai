import { useCallback, useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Box,
  CheckCircle2,
  Clock3,
  FolderGit2,
  GitBranch,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { useAuth } from '@/context/useAuth'
import {
  deleteRepository,
  getRepositories,
} from '@/services/repository.service'

import type { Repository } from '@/types/repository'

import ImportRepositoryForm from '@/components/common/ImportRepositoryForm'


function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'READY':
      return {
        label: 'Ready',
        className:
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        icon: CheckCircle2,
      }

    case 'PROCESSING':
    case 'INDEXING':
    case 'CLONING':
      return {
        label: 'Indexing',
        className:
          'border-amber-500/20 bg-amber-500/10 text-amber-400',
        icon: Loader2,
      }

    case 'FAILED':
      return {
        label: 'Failed',
        className:
          'border-red-500/20 bg-red-500/10 text-red-400',
        icon: Clock3,
      }

    default:
      return {
        label: 'Pending',
        className:
          'border-slate-500/20 bg-slate-500/10 text-slate-400',
        icon: Clock3,
      }
  }
}


function getRepositoryName(repository: Repository) {
  if (repository.name) {
    return repository.name
  }

  const parts = repository.githubUrl.split('/')

  return parts.at(-1) || 'Repository'
}


export default function Dashboard() {
  const { token } = useAuth()

  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showImportForm, setShowImportForm] = useState(false)

  const loadRepositories = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError('')
    try {
      const response = await getRepositories(token)
      setRepositories(response.data)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to load repositories',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])


  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!token) return
      try {
        const response = await getRepositories(token)
        if (!cancelled) setRepositories(response.data)
      } catch (error) {
        if (!cancelled)
          setError(
            error instanceof Error ? error.message : 'Failed to load repositories',
          )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [token])


  async function handleDelete(repositoryId: string) {
    if (!token) {
      return
    }

    const confirmed = window.confirm(
      'Delete this repository?',
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteRepository(token, repositoryId)

      setRepositories((current) =>
        current.filter(
          (repository) => repository.id !== repositoryId,
        ),
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to delete repository',
      )
    }
  }


  const readyCount = repositories.filter(
    (repository) =>
      repository.status.toUpperCase() === 'READY',
  ).length


  const indexingCount = repositories.filter(
    (repository) =>
      ['PROCESSING', 'INDEXING', 'CLONING'].includes(
        repository.status.toUpperCase(),
      ),
  ).length


  return (
    <div className="min-h-full bg-[#0b0f14]">
      <div className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">

        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#141a24] via-[#111720] to-[#0e131b] p-7 shadow-2xl shadow-black/10">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative">
            <div className="mb-3 flex items-center gap-2 text-violet-400">
              <Sparkles className="h-4 w-4" />

              <span className="text-xs font-medium uppercase tracking-[0.18em]">
                Repository Intelligence
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Understand your codebase.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Explore repositories, understand architecture,
              search code semantically, and ask AI questions
              about your entire codebase.
            </p>
          </div>
        </section>


        {/* Stats */}
        <section className="mb-10 grid gap-4 sm:grid-cols-3">

          <Card className="border-white/[0.07] bg-[#111720] shadow-none">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Repositories
                </p>

                <p className="mt-2 text-3xl font-semibold text-white">
                  {repositories.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <FolderGit2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>


          <Card className="border-white/[0.07] bg-[#111720] shadow-none">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Ready
                </p>

                <p className="mt-2 text-3xl font-semibold text-white">
                  {readyCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>


          <Card className="border-white/[0.07] bg-[#111720] shadow-none">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Indexing
                </p>

                <p className="mt-2 text-3xl font-semibold text-white">
                  {indexingCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <GitBranch className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

        </section>


        {/* Repository heading */}
        <section>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                Workspace
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Your repositories
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage and explore your indexed codebases.
              </p>
            </div>

            <Button
              onClick={() =>
                setShowImportForm((current) => !current)
              }
              className="gap-2 bg-violet-600 text-white hover:bg-violet-500"
            >
              <Plus className="h-4 w-4" />

              {showImportForm
                ? 'Close'
                : 'Import Repository'}
            </Button>

          </div>


          {/* Import */}
          {showImportForm && (
            <div className="mb-6">
              <ImportRepositoryForm
                onCreated={() => {
                  setShowImportForm(false)
                  void loadRepositories()
                }}
                onCancel={() =>
                  setShowImportForm(false)
                }
              />
            </div>
          )}


          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}


          {/* Loading */}
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]"
                />
              ))}
            </div>
          ) : repositories.length === 0 ? (

            <Card className="border-dashed border-white/[0.1] bg-[#111720] shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <Box className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  No repositories yet
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Import a GitHub repository and let CodeLens
                  analyze its structure, dependencies, and code.
                </p>

                <Button
                  onClick={() =>
                    setShowImportForm(true)
                  }
                  className="mt-6 gap-2 bg-violet-600 hover:bg-violet-500"
                >
                  <Plus className="h-4 w-4" />
                  Import your first repository
                </Button>

              </CardContent>
            </Card>

          ) : (

            <div className="grid gap-4">

              {repositories.map((repository) => {
                const status = getStatusStyle(
                  repository.status,
                )

                const StatusIcon = status.icon

                return (
                  <Card
                    key={repository.id}
                    className="group border-white/[0.07] bg-[#111720] shadow-none transition-all duration-200 hover:border-white/[0.13] hover:bg-[#141b25]"
                  >

                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex min-w-0 gap-4">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-slate-300">
                            <FolderGit2 className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <CardTitle className="truncate text-base text-white">
                              {getRepositoryName(repository)}
                            </CardTitle>

                            <a
                              href={repository.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 block max-w-xl truncate font-mono text-xs text-slate-500 transition-colors hover:text-violet-400"
                            >
                              {repository.githubUrl}
                            </a>
                          </div>

                        </div>


                        <Badge
                          variant="outline"
                          className={`w-fit gap-1.5 ${status.className}`}
                        >
                          <StatusIcon
                            className={`h-3.5 w-3.5 ${
                              repository.status.toUpperCase() ===
                                'PROCESSING'
                                ? 'animate-spin'
                                : ''
                            }`}
                          />

                          {status.label}
                        </Badge>

                      </div>
                    </CardHeader>


                    <Separator className="bg-white/[0.06]" />


                    <CardContent className="flex flex-col justify-between gap-4 pt-4 sm:flex-row sm:items-center">

                      <div className="flex items-center gap-5 text-xs text-slate-500">

                        <span className="flex items-center gap-1.5">
                          <GitBranch className="h-3.5 w-3.5" />

                          {repository.branch || 'main'}
                        </span>

                        <span>
                          GitHub Repository
                        </span>

                      </div>


                      <div className="flex items-center gap-2">

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete(repository.id)
                          }
                          className="gap-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>


                        <Link
                          to={`/repositories/${repository.id}`}
                          className="inline-flex h-7 items-center gap-2 rounded-[min(var(--radius-md),12px)] bg-white/[0.06] px-2.5 text-[0.8rem] text-slate-200 transition-colors hover:bg-violet-500/10 hover:text-violet-300"
                        >
                          Open
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>

                      </div>

                    </CardContent>

                  </Card>
                )
              })}

            </div>
          )}

        </section>

      </div>
    </div>
  )
}