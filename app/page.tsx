'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import useAuth from './context/useAuth'

interface AlertaStockAPI {
  nome: string
  quantidade_disponivel: number
}

interface Alerta {
  nome: string
  stock: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { isLoggedIn, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState({
    transaccoes: 0,
    clientes: 0,
    produtos: 0,
    alertas: [] as Alerta[],
  })

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    api.get('/dashboard/')
      .then(res => {
        const alertasAPI: AlertaStockAPI[] = res.data.alertas_stock
        const alertas: Alerta[] = alertasAPI.map(item => ({
          nome: item.nome,
          stock: item.quantidade_disponivel,
        }))
        setDashboard({
          transaccoes: res.data.transaccoes,
          clientes: res.data.clientes,
          produtos: res.data.produtos,
          alertas,
        })
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar dashboard:', err)
        if (err.response?.status === 401) {
          logout()
          router.push('/login')
        }
      })
  }, [isLoggedIn, logout, router])

  if (loading) {
    return <p>Carregando...</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Painel Principal</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card titulo="Transacções" valor={dashboard.transaccoes} />
        <Card titulo="Clientes" valor={dashboard.clientes} />
        <Card titulo="Produtos" valor={dashboard.produtos} />
        <AlertasCard alertas={dashboard.alertas} />
      </div>
    </div>
  )
}

function Card({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="bg-white shadow rounded-xl p-8 border border-indigo-500 text-indigo-700 min-h-[180px] w-full">
      <h2 className="text-gray-600 text-lg mb-2">{titulo}</h2>
      <p className="text-4xl font-bold">{valor}</p>
    </div>
  )
}

function AlertasCard({ alertas = [] }: { alertas?: Alerta[] }) {
  if (alertas.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl p-8 border border-red-500 text-red-600 min-h-[180px] w-full">
        <h2 className="text-lg mb-2">Alertas de Stock</h2>
        <p className="text-gray-500">Nenhum alerta</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-xl p-8 border border-red-500 text-red-600 min-h-[180px] w-full">
      <h2 className="text-lg mb-2">Alertas de Stock</h2>
      <ul className="text-sm list-disc pl-4 space-y-1">
        {alertas.map((item, idx) => (
          <li key={idx}>
            {item.nome} — Stock: <strong>{item.stock}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
