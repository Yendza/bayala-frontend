// app/layout.tsx
import './styles/globals.css'
import LayoutClient from './components/LayoutClient'
import { AuthProvider } from './context/AuthContext'

export const metadata = {
  title: 'Controller',
  description: 'Sistema de Gestão',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <AuthProvider>
          <LayoutClient>{children}</LayoutClient>
        </AuthProvider>
      </body>
    </html>
  )
}
