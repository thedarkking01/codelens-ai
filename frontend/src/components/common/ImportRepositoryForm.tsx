import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createRepository } from '../../services/repository.service'

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
      setError('You are not authenticated.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await createRepository(token, {
        githubUrl,
      })

      setGithubUrl('')
      onCreated()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to import repository',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="import-form">
      <h2>Import GitHub Repository</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="githubUrl">
          GitHub Repository URL
        </label>

        <input
          id="githubUrl"
          type="url"
          value={githubUrl}
          onChange={(event) =>
            setGithubUrl(event.target.value)
          }
          placeholder="https://github.com/username/repository"
          required
        />

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Importing...'
              : 'Import Repository'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}