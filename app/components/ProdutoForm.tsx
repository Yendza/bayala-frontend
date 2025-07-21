'use client'

import { useEffect, useState } from 'react'
import axiosClient from '@/lib/axiosClient'
import { useRouter } from 'next/navigation'

type ProdutoFormProps = {
  produtoId?: number
  dadosIniciais?: {
    nome: string
    descricao: string
    preco_venda: string
    preco_aluguer: string
    categoria: number | null
    activo: boolean
  }
  onFinalizado?: () => void
}

type Categoria = {
  id: number
  nome: string
}

export default function ProdutoForm({ produtoId, dadosIniciais, onFinalizado }: ProdutoFormProps) {
  const router = useRouter()

  const [nome, setNome] = useState(dadosIniciais?.nome || '')
  const [descricao, setDescricao] = useState(dadosIniciais?.descricao || '')
  const [precoVenda, setPrecoVenda] = useState(dadosIniciais?.preco_venda || '')
  const [precoAluguer, setPrecoAluguer] = useState(dadosIniciais?.preco_aluguer || '')
  const [categoria, setCategoria] = useState<number | ''>(dadosIniciais?.categoria || '')
  const [activo, setActivo] = useState(dadosIniciais?.activo ?? true)

  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    axiosClient.get('/categorias/')
      .then(res => setCategorias(res.data))
      .catch(err => console.error('Erro ao carregar categorias:', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const produto = {
      nome,
      descricao,
      preco_venda: precoVenda ? parseFloat(precoVenda) : null,
      preco_aluguer: precoAluguer ? parseFloat(precoAluguer) : null,
      categoria_id: categoria || null,
      activo,
    }

    try {
      if (produtoId) {
        await axiosClient.put(`/produtos/${produtoId}/`, produto)
      } else {
        await axiosClient.post('/produtos/', produto)
      }

      if (onFinalizado) {
        onFinalizado()
      } else {
        router.push('/produtos')
      }
    } catch (error: any) {
      if (error.response?.data) {
        console.error('Erro ao guardar produto:', error.response.data)
        alert('Erro ao guardar produto:\n' + JSON.stringify(error.response.data))
      } else {
        alert('Erro ao guardar produto.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium">Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descrição</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Preço de Venda</label>
        <input
          type="number"
          step="0.01"
          value={precoVenda}
          onChange={(e) => setPrecoVenda(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Preço de Aluguer</label>
        <input
          type="number"
          step="0.01"
          value={precoAluguer}
          onChange={(e) => setPrecoAluguer(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Categoria</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Selecionar</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={activo}
          onChange={() => setActivo(!activo)}
          className="mr-2"
        />
        <label className="text-sm">Activo</label>
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {produtoId ? 'Actualizar' : 'Criar'} Produto
      </button>
    </form>
  )
}
