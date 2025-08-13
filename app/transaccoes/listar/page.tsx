'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'

interface Produto {
    id: number
    nome: string
    preco_venda: number
    preco_aluguer: number
}

interface ItemTransaccao {
    id: number
    produto: Produto
    quantidade: number
    tipo: 'venda' | 'aluguer'
}

interface Cliente {
    id: number
    nome: string
    nuit: string
    celular: string
}

interface Transaccao {
    id: number
    data: string
    cliente: Cliente
    tipo_pagamento: string
    itens_detalhados: ItemTransaccao[]
    total: number
}

export default function ListaTransaccoes() {
    const [transaccoes, setTransaccoes] = useState<Transaccao[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')

    const fetchTransaccoes = async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (dataInicio) params.append('data_inicio', dataInicio)
            if (dataFim) params.append('data_fim', dataFim)

            const res = await api.get('/transaccoes/?' + params.toString())
            setTransaccoes(res.data)
        } catch (err: any) {
            setError('Erro ao buscar transacções')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransaccoes()
    }, [])

    const handleFiltrar = (e: React.FormEvent) => {
        e.preventDefault()
        fetchTransaccoes()
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Lista de Transacções</h1>

            <form onSubmit={handleFiltrar} className="mb-6 flex gap-4 flex-wrap items-end">
                <div>
                    <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">
                        Data Início
                    </label>
                    <input
                        type="date"
                        id="dataInicio"
                        value={dataInicio}
                        onChange={e => setDataInicio(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                <div>
                    <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700">
                        Data Fim
                    </label>
                    <input
                        type="date"
                        id="dataFim"
                        value={dataFim}
                        onChange={e => setDataFim(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Filtrar
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setDataInicio('')
                        setDataFim('')
                        fetchTransaccoes()
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Limpar
                </button>
            </form>

            {loading && <p>A carregar...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">ID</th>
                            <th className="border p-2">Data</th>
                            <th className="border p-2">Cliente</th>
                            <th className="border p-2">Itens</th>
                            <th className="border p-2">Pagamento</th>
                            <th className="border p-2">Total (MZN)</th>
                            <th className="border p-2">Factura</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaccoes.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="border p-2">{t.id}</td>
                                <td className="border p-2">{new Date(t.data).toLocaleString()}</td>
                                <td className="border p-2">{t.cliente.nome}</td>
                                <td className="border p-2">
                                    <ul className="list-disc list-inside">
                                        {t.itens_detalhados?.map(item => (
                                            <li key={item.id}>
                                                {item.quantidade}x {item.produto.nome} ({item.tipo})
                                            </li>
                                        ))}
                                    </ul>
                                </td>

                                <td className="border p-2 capitalize">{t.tipo_pagamento}</td>
                                <td className="border p-2 font-semibold">{Number(t.total || 0).toFixed(2)} MZN</td>
                                <td className="border p-2 text-center">
                                    <Link
                                        href={`/transaccoes/factura/${t.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Ver Factura
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
