import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import styles from '@/styles/components/Header.module.scss'

export default function Header() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogoClick = () => {
    if (router.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.replace('/')
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.wrapper}>
        <div className={styles.logo} onClick={handleLogoClick}>
          D&D Portal
        </div>

        {/* 🔹 НОВА смуга між лого і діями */}
        <div className={styles.separator}></div>

        <div className={styles.actions}>
          {user ? (
            <>
              <button onClick={() => router.push('/campaigns')}>Кампанії</button>
              <button onClick={() => router.push('/profile')}>Профіль</button>
            </>
          ) : (
            <button onClick={() => document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' })}>
              Ознайомитись
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
