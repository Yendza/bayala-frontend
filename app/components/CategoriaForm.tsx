'use client'

import { useState, useEffect } from 'react'
import axiosClient from '@/lib/axiosClient' // ajusta o caminho se necessário
import { useRouter } from 'next/navigation'

type CategoriaFormProps = {
  categoriaId?: number
  nomeInicial?: string
  onFinalizado?: () => void
}

export default function CategoriaForm({ categoriaId, nomeInicial = '', onFinalizado }: CategoriaFormProps) {
  const [nome, setNome] = useState(nomeInicial)
  const router = useRouter()

  useEffect(() => {
    if (categoriaId && !nomeInicial) {
      axiosClient.get(`http://localhost:8000/api/categorias/${categoriaId}/`)
        .then(res => setNome(res.data.nome))
        .catch(err => console.error('Erro ao buscar categoria:', err))
    }
  }, [categoriaId, nomeInicial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (categoriaId) {
        await axiosClient.put(`http://localhost:8000/api/categorias/${categoriaId}/`, { nome })
      } else {
        await axiosClient.post('http://localhost:8000/api/categorias/', { nome })
      }

      if (onFinalizado) {
        onFinalizado()
      } else {
        router.push('/categorias')
      }
    } catch (error) {
      alert('Erro ao guardar categoria.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium">Nome da Categoria</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {categoriaId ? 'Actualizar' : 'Criar'} Categoria
      </button>
    </form>
  )
}
