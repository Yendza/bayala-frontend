'use client'

import { useEffect, useState } from 'react'
import axiosClient from '../lib/axiosClient' // ajusta o caminho se necessário


export default function AdicionarStock() {
  const [produtos, setProdutos] = useState([])
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    axiosClient.get('http://127.0.0.1:8000/api/produtos/')
      .then(res => setProdutos(res.data))
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!produtoId || !quantidade) {
      setMensagem('Preenche todos os campos.')
      return
    }

    try {
      // Verifica se já existe stock para este produto
      const res = await axiosClient.get('http://127.0.0.1:8000/api/stock/')
      const stockExistente = res.data.find(item => item.produto === parseInt(produtoId))

      if (stockExistente) {
        // Actualiza a quantidade existente
        await axiosClient.patch(`http://127.0.0.1:8000/api/stock/${stockExistente.id}/`, {
          quantidade_disponivel: stockExistente.quantidade_disponivel + parseInt(quantidade)
        })
        setMensagem('Stock actualizado com sucesso.')
      } else {
        // Cria novo registo de stock
        await axiosClient.post('http://127.0.0.1:8000/api/stock/', {
          produto: produtoId,
          quantidade_disponivel: parseInt(quantidade)
        })
        setMensagem('Stock adicionado com sucesso.')
      }

      setProdutoId('')
      setQuantidade('')
    } catch (error) {
      console.error(error)
      setMensagem('Erro ao actualizar o stock.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-bold mb-4">Adicionar/Aumentar Stock</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Produto</label>
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Selecciona um produto --</option>
            {produtos.map(prod => (
              <option key={prod.id} value={prod.id}>{prod.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Quantidade</label>
          <input
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Ex: 20"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Guardar
        </button>

        {mensagem && <p className="text-sm mt-2">{mensagem}</p>}
      </form>
    </div>
  )
}
