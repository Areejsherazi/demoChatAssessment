import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../lib/useAuth'
import Header from '../components/ui/Header'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="app-root">
        <Header />
        <main className="container">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  )
}
