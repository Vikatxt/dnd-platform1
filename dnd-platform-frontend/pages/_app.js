import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import '@/styles/globals.scss'
import { AuthProvider } from '@/context/AuthContext'
import { AuthModalProvider } from '@/context/AuthModalContext'
import AuthModal from '@/components/AuthModal'
import Header from '@/components/Header'
import LoaderOverlay from '@/components/LoaderOverlay'

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const timeoutRef = useRef(null)

  useEffect(() => {
    const handleStart = () => {
      // ⏱ запускаємо затримку — loader з’явиться тільки через 300мс
      timeoutRef.current = setTimeout(() => {
        setLoading(true)
      }, 300)
    }

    const handleStop = () => {
      // ❌ якщо запит завершився швидко — не показуємо лоадер
      clearTimeout(timeoutRef.current)
      setLoading(false)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  return (
    <AuthProvider>
      <AuthModalProvider>
        {loading && <LoaderOverlay />}
        {!Component.hideHeader && <Header />}
        <Component {...pageProps} />
        <AuthModal />
      </AuthModalProvider>
    </AuthProvider>
  )
}
