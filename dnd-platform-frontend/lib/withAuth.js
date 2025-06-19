import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [redirecting, setRedirecting] = useState(false)

    useEffect(() => {
      if (!loading && !user) {
        setRedirecting(true)
        router.push({
          pathname: '/',
          query: { auth: 'login' },
        })
      }
    }, [user, loading, router])

    if (loading || (!user && redirecting)) {
      return <p>Завантаження...</p>
    }

    return <WrappedComponent {...props} />
  }

  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return AuthComponent
}

export default withAuth
