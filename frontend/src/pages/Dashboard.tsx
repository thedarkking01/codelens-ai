import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <main>
      <h1>CodeLens AI</h1>

      <p>Welcome, {user?.name}!</p>

      <p>{user?.email}</p>

      <button type="button" onClick={logout}>
        Logout
      </button>
    </main>
  )
}