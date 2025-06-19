import withAuth from '@/lib/withAuth'
import { useAuth } from '@/context/AuthContext'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1>Вітаю, {user.name}!</h1>
      <p>Ваша роль: {user.role}</p>
      <button onClick={logout}>Вийти</button>
    </div>
  )
}

export default withAuth(Dashboard)
