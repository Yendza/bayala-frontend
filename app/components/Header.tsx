'use client'

import { useRouter } from 'next/navigation'
import useAuth from '../hooks/useAuth'
import { MdLogout, MdMenu, MdSettings } from 'react-icons/md'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
  onToggleMenu?: () => void
}

export default function Header({ onToggleMenu }: HeaderProps) {
  const router = useRouter()
  const { isLoggedIn, logout, loading, user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleChangePassword = () => {
    router.push('/alterar-senha')
    setDropdownOpen(false)
  }

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Se ainda está carregando a autenticação, não renderiza nada
  if (loading) return null

  // Se o usuário não estiver logado, não mostra o Header
  if (!isLoggedIn) return null

  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={32} height={32} />
        <span className="text-2xl font-bold text-red-600">Controller - Sistema de Gestão</span>
      </div>

      <div className="flex items-center gap-6 relative">
        {onToggleMenu && (
          <button
            onClick={onToggleMenu}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <MdMenu size={28} />
          </button>
        )}

        {/* Nome do usuário e dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="font-semibold text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            Olá, {user?.username ?? 'Usuário'}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-50">
              <button
                onClick={handleChangePassword}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-blue-100 text-left text-gray-800 font-medium"
              >
                <MdSettings size={18} /> Alterar Senha
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-blue-100 text-left text-gray-800 font-medium"
              >
                <MdLogout size={18} /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
