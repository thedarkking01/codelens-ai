import { Link, useParams } from 'react-router-dom'

export default function RepositoryDetails() {
  const { repositoryId } = useParams()

  return (
    <main>
      <Link to="/dashboard">
        ← Back to Dashboard
      </Link>

      <h1>Repository</h1>

      <p>Repository ID: {repositoryId}</p>

      <p>
        Repository details will be implemented in
        Phase 10.4.
      </p>
    </main>
  )
}