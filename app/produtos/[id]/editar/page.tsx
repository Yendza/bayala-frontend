'use client'

import withAuth from "@/lib/withAuth";
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axiosClient from '@/lib/axiosClient' // caminho ajustado
import ProdutoForm from '@/app/components/ProdutoForm'

type ProdutoData = {
  nome: string
  descricao: string
  preco_venda: string
  preco_aluguer: string
  categoria: number | null
  activo: boolean
}

function EditarProdutoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [produto, setProduto] = useState<ProdutoData | null>(null)

  useEffect(() => {
    axiosClient.get(`/produtos/${id}/`)
      .then(res => setProduto(res.data))
      .catch(err => console.error('Erro ao carregar produto:', err))
  }, [id])

  const handleProdutoActualizado = () => {
    // Após atualização, redireciona para a lista
    router.push('/produtos')
  }

  if (!produto) return <p>A carregar...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Produto</h1>
      <ProdutoForm
        produtoId={Number(id)}
        dadosIniciais={produto}
        onFinalizado={handleProdutoActualizado}
      />
    </div>
  )
}

export default withAuth(EditarProdutoPage)
