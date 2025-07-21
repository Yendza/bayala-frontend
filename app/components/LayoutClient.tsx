'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Menu from './Menu'
import { AuthProvider } from '../context/AuthContext'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
    const [showMenu, setShowMenu] = useState(false)
    const pathname = usePathname()

    const showLayout = pathname !== '/login'

    return (
        <AuthProvider>
            <div className="bg-gray-100 text-gray-800 min-h-screen flex flex-col">
                {showLayout && <Header onToggleMenu={() => setShowMenu(!showMenu)} />}
                <div className="flex flex-1 min-h-0">
                    {showLayout && <Menu isOpen={showMenu} onClose={() => setShowMenu(false)} />}
                    <main
                        className={`flex-1 p-6 overflow-auto transition-all duration-300 ${showLayout ? (showMenu ? 'ml-64 mt-20' : 'ml-0 mt-20') : ''
                            }`}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    )
}
