'use client'

import withAuth from "@/lib/withAuth"
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'

type Produto = {
  id: number
  nome: string
  categoria_nome?: string
  preco_venda: string
  preco_aluguer?: string | null
  activo: boolean
}

function ListaProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    api.get('/produtos/')
      .then(response => setProdutos(response.data))
      .catch(error => console.error('Erro ao carregar produtos:', error))
  }, [])

  const eliminarProduto = async (id: number, nome: string) => {
    const confirmar = confirm(`Desejas realmente eliminar o produto "${nome}"?`)
    if (!confirmar) return

    try {
      await api.delete(`/produtos/${id}/`)
      setProdutos(produtos.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erro ao eliminar o produto:', error)
      alert('Erro ao eliminar o produto.')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <Link href="/produtos/novo">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            + Adicionar Produto
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white shadow rounded">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="py-3 px-4 border-b">Nome</th>
              <th className="py-3 px-4 border-b">Categoria</th>
              <th className="py-3 px-4 border-b">Preço Venda</th>
              <th className="py-3 px-4 border-b">Preço Aluguer</th>
              <th className="py-3 px-4 border-b">Activo</th>
              <th className="py-3 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{produto.nome}</td>
                <td className="px-4 py-2 border-b">{produto.categoria_nome || '—'}</td>
                <td className="px-4 py-2 border-b">
                  {parseFloat(produto.preco_venda).toFixed(2)} MZN
                </td>
                <td className="px-4 py-2 border-b">
                  {produto.preco_aluguer
                    ? `${parseFloat(produto.preco_aluguer).toFixed(2)} MZN`
                    : '—'}
                </td>
                <td className="px-4 py-2 border-b">{produto.activo ? 'Sim' : 'Não'}</td>
                <td className="px-4 py-2 border-b flex gap-3">
                  <Link
                    href={`/produtos/${produto.id}/editar`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => eliminarProduto(produto.id, produto.nome)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default withAuth(ListaProdutos)
