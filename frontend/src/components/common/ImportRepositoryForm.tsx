import type { FormEvent } from 'react'
import { useState } from 'react'
import { FolderGit2, Loader2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useAuth } from '@/context/useAuth'
import { createRepository } from '@/services/repository.service'


interface ImportRepositoryFormProps {
  onCreated: () => void
  onCancel: () => void
}


export default function ImportRepositoryForm({
  onCreated,
  onCancel,
}: ImportRepositoryFormProps) {
  const { token } = useAuth()

  const [githubUrl, setGithubUrl] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!token) {
      setError('Authentication required.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await createRepository(token, {
        githubUrl: githubUrl.trim(),
      })

      setGithubUrl('')
      onCreated()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to import repository.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111720]">

      <div className="border-b border-white/[0.06] px-6 py-5">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <FolderGit2 className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Import GitHub repository
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              CodeLens will clone and analyze your repository.
            </p>
          </div>

        </div>
      </div>


      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-6"
      >

        <div className="space-y-2">
          <label
            htmlFor="githubUrl"
            className="text-sm font-medium text-slate-300"
          >
            Repository URL
          </label>

          <Input
            id="githubUrl"
            type="url"
            value={githubUrl}
            onChange={(event) =>
              setGithubUrl(event.target.value)
            }
            placeholder="https://github.com/username/repository"
            required
            disabled={isSubmitting}
            className="border-white/[0.08] bg-black/20 text-white placeholder:text-slate-600 focus-visible:ring-violet-500"
          />

          <p className="text-xs text-slate-600">
            Only public GitHub repositories are supported
            by the current ingestion pipeline.
          </p>
        </div>


        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}


        <div className="flex items-center justify-between gap-4">

          <div className="hidden items-center gap-2 text-xs text-slate-600 sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Secure repository indexing
          </div>

          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-slate-400 hover:bg-white/[0.05] hover:text-white"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-violet-600 text-white hover:bg-violet-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FolderGit2 className="h-4 w-4" />
                  Import Repository
                </>
              )}
            </Button>
          </div>

        </div>

      </form>
    </div>
  )
}