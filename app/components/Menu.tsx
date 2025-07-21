'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useAuth from '../hooks/useAuth'
import {
    MdHome,
    MdListAlt,
    MdInventory,
    MdAssessment,
    MdRequestQuote,
    MdSettings,
} from 'react-icons/md'

interface MenuProps {
    isOpen: boolean
    onClose: () => void
}

export default function Menu({ isOpen, onClose }: MenuProps) {
    const { isLoggedIn } = useAuth()
    const pathname = usePathname()
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({})

    if (!isLoggedIn) return null

    const toggleMenu = (menuKey: string) => {
        setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }))
    }

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-30"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          pt-20
        `}
            >
                <h2 className="text-2xl font-bold mb-8 text-blue-700 px-6">Menu</h2>

                <ul className="flex flex-col gap-2 px-6">

                    {/* Página Inicial */}
                    <li>
                        <Link
                            href="/"
                            className={`flex items-center gap-3 rounded font-medium ${pathname === '/'
                                ? 'bg-blue-600 text-white px-4 py-2'
                                : 'text-gray-700 hover:bg-blue-100 px-4 py-2'
                                }`}
                            onClick={onClose}
                        >
                            <MdHome size={24} />
                            <span>Página Inicial</span>
                        </Link>
                    </li>

                    {/* Transacções */}
                    <li>
                        <button
                            onClick={() => toggleMenu('transaccoes')}
                            className="flex items-center gap-3 w-full text-left font-medium text-gray-700 hover:bg-blue-100 rounded px-4 py-2"
                        >
                            <MdListAlt size={24} />
                            <span>Transacções</span>
                            <span className="ml-auto">{openMenus['transaccoes'] ? '▲' : '▼'}</span>
                        </button>
                        {openMenus['transaccoes'] && (
                            <ul className="pl-10 mt-1 flex flex-col gap-1 text-sm">
                                <li>
                                    <Link
                                        href="/transaccoes/nova"
                                        className={`block px-2 py-1 rounded ${pathname === '/transaccoes/nova'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-blue-100'
                                            }`}
                                        onClick={onClose}
                                    >
                                        Nova Transacção
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/transaccoes/listar"
                                        className={`block px-2 py-1 rounded ${pathname === '/transaccoes/listar'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-blue-100'
                                            }`}
                                        onClick={onClose}
                                    >
                                        Ver Transacções
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Produtos */}
                    <li>
                        <button
                            onClick={() => toggleMenu('produtos')}
                            className="flex items-center gap-3 w-full text-left font-medium text-gray-700 hover:bg-blue-100 rounded px-4 py-2"
                        >
                            <MdInventory size={24} />
                            <span>Produtos</span>
                            <span className="ml-auto">{openMenus['produtos'] ? '▲' : '▼'}</span>
                        </button>
                        {openMenus['produtos'] && (
                            <ul className="pl-10 mt-1 flex flex-col gap-1 text-sm">
                                <li>
                                    <Link
                                        href="/produtos/lista"
                                        className={`block px-2 py-1 rounded ${pathname === '/produtos/lista'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-blue-100'
                                            }`}
                                        onClick={onClose}
                                    >
                                        Lista
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/stock/ver"
                                        className={`block px-2 py-1 rounded ${pathname === '/stock/ver'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-blue-100'
                                            }`}
                                        onClick={onClose}
                                    >
                                        Consultar Stock
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/stock/adicionar"
                                        className={`block px-2 py-1 rounded ${pathname === '/stock/adicionar'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-blue-100'
                                            }`}
                                        onClick={onClose}
                                    >
                                        Adicionar Stock
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/stock/entradas"
                                        className={`block px-2 py-1 rounded ${pathname === '/stock/entradas'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-blue-100'
                                            }`}
                                        onClick={onClose}
                                    >
                                        Lista de Entradas
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Relatórios */}
                    <li>
                        <Link
                            href="/relatorios"
                            className={`flex items-center gap-3 rounded font-medium ${pathname.startsWith('/relatorios')
                                ? 'bg-blue-600 text-white px-4 py-2'
                                : 'text-gray-700 hover:bg-blue-100 px-4 py-2'
                                }`}
                            onClick={onClose}
                        >
                            <MdAssessment size={24} />
                            <span>Relatórios</span>
                        </Link>
                    </li>

                    {/* Cotações */}
                    <li>
                        <button
                            onClick={() => toggleMenu('cotacoes')}
                            className="flex items-center gap-3 w-full text-left font-medium text-gray-700 hover:bg-blue-100 rounded px-4 py-2"
                        >
                            <MdRequestQuote size={24} />
                            <span>Cotações</span>
                            <span className="ml-auto">{openMenus['cotacoes'] ? '▲' : '▼'}</span>
                        </button>
                        {openMenus['cotacoes'] && (
                            <ul className="pl-10 mt-1 flex flex-col gap-1 text-sm">
                                <li>
                                    <Link
                                        href="/cotacoes/nova"
                                        className={`block px-2 py-1 rounded ${pathname === '/cotacoes/nova'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-blue-100'
                                            }`}
                                        onClick={onClose}
                                    >
                                        Nova Cotação
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/cotacoes/listar"
                                        className={`block px-2 py-1 rounded ${pathname === '/cotacoes/listar'
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-blue-100'
                                            }`}
                                        onClick={onClose}
                                    >
                                        Ver Cotações
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Configurações (desabilitado por enquanto) */}
                    <li>
                        <button
                            className="flex items-center gap-3 w-full text-left font-medium text-gray-400 px-4 py-2 cursor-not-allowed"
                            disabled
                        >
                            <MdSettings size={24} />
                            <span>Configurações</span>
                        </button>
                    </li>

                </ul>
            </aside>
        </>
    )
}
