'use client'

import withAuth from "@/lib/withAuth";
import ProdutoForm from '@/app/components/ProdutoForm'

function NovoProdutoPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Novo Produto</h1>
      <ProdutoForm />
    </div>
  )
}

export default withAuth(NovoProdutoPage)
