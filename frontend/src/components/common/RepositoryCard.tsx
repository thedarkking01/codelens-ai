import { Link } from 'react-router-dom'
import type { Repository } from '../../types/repository'

interface RepositoryCardProps {
  repository: Repository
  onDelete: (repositoryId: string) => void
}

function getStatusLabel(status: string) {
  return status.replaceAll('_', ' ')
}

export default function RepositoryCard({
  repository,
  onDelete,
}: RepositoryCardProps) {
  return (
    <article className="repository-card">
      <div className="repository-card-header">
        <div>
          <h2>{repository.name}</h2>

          <a
            href={repository.githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            {repository.githubUrl}
          </a>
        </div>

        <span className={`status status-${repository.status.toLowerCase()}`}>
          {getStatusLabel(repository.status)}
        </span>
      </div>

      <div className="repository-card-footer">
        <Link to={`/repositories/${repository.id}`}>
          Open Repository
        </Link>

        <button
          type="button"
          onClick={() => onDelete(repository.id)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}