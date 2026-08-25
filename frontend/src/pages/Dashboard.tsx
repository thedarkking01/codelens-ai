import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import {
  deleteRepository,
  getRepositories,
} from '../services/repository.service'

import type { Repository } from '../types/repository'

import RepositoryCard from '../components/common/RepositoryCard'
import ImportRepositoryForm from '../components/common/ImportRepositoryForm'

export default function Dashboard() {
  const { user, token, logout } = useAuth()

  const [repositories, setRepositories] = useState<
    Repository[]
  >([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showImportForm, setShowImportForm] =
    useState(false)

  const loadRepositories = useCallback(async () => {
    if (!token) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await getRepositories(token)

      setRepositories(response.data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load repositories',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadRepositories()
  }, [loadRepositories])

  async function handleDelete(repositoryId: string) {
    if (!token) {
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this repository?',
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

  function handleRepositoryCreated() {
    setShowImportForm(false)
    loadRepositories()
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>CodeLens AI</h1>
          <p>Repository Intelligence Platform</p>
        </div>

        <div>
          <span>{user?.name}</span>

          <button
            type="button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-title">
          <div>
            <h2>Your Repositories</h2>
            <p>
              Explore and understand your codebase with AI.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowImportForm((current) => !current)
            }
          >
            {showImportForm
              ? 'Close'
              : '+ Import Repository'}
          </button>
        </div>

        {showImportForm && (
          <ImportRepositoryForm
            onCreated={handleRepositoryCreated}
            onCancel={() => setShowImportForm(false)}
          />
        )}

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {isLoading ? (
          <p>Loading repositories...</p>
        ) : repositories.length === 0 ? (
          <section className="empty-state">
            <h3>No repositories yet</h3>

            <p>
              Import your first GitHub repository to get
              started.
            </p>

            <button
              type="button"
              onClick={() => setShowImportForm(true)}
            >
              Import Repository
            </button>
          </section>
        ) : (
          <section className="repository-grid">
            {repositories.map((repository) => (
              <RepositoryCard
                key={repository.id}
                repository={repository}
                onDelete={handleDelete}
              />
            ))}
          </section>
        )}
      </section>
    </main>
  )
}