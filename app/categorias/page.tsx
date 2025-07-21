'use client'

import withAuth from "@/lib/withAuth";
import { useEffect, useState } from 'react'
import axiosClient from '@/lib/axiosClient' // ajusta o caminho se necessário
import Link from 'next/link'

type Categoria = {
  id: number
  nome: string
}

export default function ListaCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    axiosClient.get('http://localhost:8000/api/categorias/')
      .then(response => setCategorias(response.data))
      .catch(error => console.error('Erro ao carregar categorias:', error))
  }, [])

  const eliminarCategoria = async (id: number) => {
    const confirmar = confirm('Desejas realmente eliminar esta categoria?')
    if (!confirmar) return

    try {
      await axiosClient.delete(`http://localhost:8000/api/categorias/${id}/`)
      setCategorias(categorias.filter(c => c.id !== id))
    } catch (error) {
      alert('Erro ao eliminar categoria.')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Link href="/categorias/nova">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Adicionar Categoria
          </button>
        </Link>
      </div>

      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border">Nome</th>
            <th className="py-2 px-4 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border-b">
              <td className="p-2">{cat.nome}</td>
              <td className="p-2 flex gap-2">
                <Link href={`/categorias/${cat.id}/editar`} className="text-blue-600 hover:underline">
                  Editar
                </Link>
                <button
                  onClick={() => eliminarCategoria(cat.id)}
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
  )
}
