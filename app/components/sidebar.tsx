'use client'

import Link from 'next/link'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <>
            {/* Overlay atrás do menu, fecha ao clicar */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            ></div>

            <nav
                className={`fixed top-0 left-0 h-full bg-white shadow-md w-64 p-6 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } z-40`}
            >
                <ul className="space-y-6">
                    <li>
                        <Link href="/" onClick={onClose} className="text-lg font-medium hover:text-indigo-600">
                            Página Inicial
                        </Link>
                    </li>
                    <li>
                        <Link href="/transaccoes" onClick={onClose} className="text-lg font-medium hover:text-indigo-600">
                            Transacções
                        </Link>
                    </li>
                    <li>
                        <Link href="/produtos" onClick={onClose} className="text-lg font-medium hover:text-indigo-600">
                            Produtos
                        </Link>
                    </li>
                    <li>
                        <Link href="/stock" onClick={onClose} className="text-lg font-medium hover:text-indigo-600">
                            Stock
                        </Link>
                    </li>
                    <li>
                        <Link href="/relatorios" onClick={onClose} className="text-lg font-medium hover:text-indigo-600">
                            Relatórios
                        </Link>
                    </li>
                    <li>
                        <Link href="/cotacoes" onClick={onClose} className="text-lg font-medium hover:text-indigo-600">
                            Cotações
                        </Link>
                    </li>
                    <li>
                        <Link href="/configuracoes" onClick={onClose} className="text-lg font-medium hover:text-indigo-600">
                            Configurações
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}
