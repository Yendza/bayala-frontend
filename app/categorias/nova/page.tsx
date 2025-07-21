'use client'

import withAuth from "@/lib/withAuth";
import CategoriaForm from '@/app/components/CategoriaForm'

export default function NovaCategoriaPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nova Categoria</h1>
      <CategoriaForm />
    </div>
  )
}
