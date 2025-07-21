'use client'

import { useEffect, useState } from 'react'
import axiosClient from '@/lib/axiosClient'
import { useRouter } from 'next/navigation'

interface Produto {
    id: number
    nome: string
    categoria_nome: string
}

export default function AdicionarStockPage() {
    const router = useRouter()
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [filtro, setFiltro] = useState('')
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
    const [quantidade, setQuantidade] = useState(1)
    const [feedback, setFeedback] = useState<string | null>(null)

    useEffect(() => {
        axiosClient.get('/produtos-lista/')
            .then(res => setProdutos(res.data))
            .catch(() => setProdutos([]))
    }, [])

    const produtosFiltrados = filtro.length === 0
        ? []
        : produtos.filter(p => p.nome.toLowerCase().includes(filtro.toLowerCase()))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!produtoSelecionado || quantidade <= 0) {
            setFeedback('Preencha todos os campos corretamente.')
            return
        }

        try {
            await axiosClient.post('/stock/', {
                produto_id: produtoSelecionado.id,
                quantidade,
                // estado removido aqui, conforme solicitado
            })
            setFeedback('Stock adicionado com sucesso.')
            setProdutoSelecionado(null)
            setFiltro('')
            setQuantidade(1)
        } catch (error) {
            setFeedback('Erro ao adicionar stock.')
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Adicionar Stock</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow border">

                {/* Campo de Autocomplete */}
                <div>
                    <label className="block mb-1 font-medium">Produto</label>
                    <input
                        type="text"
                        value={produtoSelecionado ? produtoSelecionado.nome : filtro}
                        onChange={e => {
                            setFiltro(e.target.value)
                            setProdutoSelecionado(null)
                        }}
                        className="w-full p-2 border rounded"
                        placeholder="Digite o nome do produto"
                    />
                    {filtro && !produtoSelecionado && (
                        <ul className="border rounded mt-1 max-h-40 overflow-auto bg-white shadow z-10">
                            {produtosFiltrados.length > 0 ? (
                                produtosFiltrados.map(p => (
                                    <li
                                        key={p.id}
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setProdutoSelecionado(p)
                                            setFiltro(p.nome)
                                        }}
                                    >
                                        {p.nome} <span className="text-xs text-gray-500">({p.categoria_nome})</span>
                                    </li>
                                ))
                            ) : (
                                <li className="p-2 text-sm text-gray-500">Nenhum produto encontrado</li>
                            )}
                        </ul>
                    )}
                </div>

                {/* Quantidade */}
                <div>
                    <label className="block mb-1 font-medium">Quantidade</label>
                    <input
                        type="number"
                        min={1}
                        value={quantidade}
                        onChange={e => {
                            const val = parseInt(e.target.value)
                            setQuantidade(isNaN(val) ? 0 : val)
                        }}
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Botão */}
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Adicionar Stock
                </button>

                {/* Feedback */}
                {feedback && <p className="text-sm mt-2">{feedback}</p>}
            </form>
        </div>
    )
}
