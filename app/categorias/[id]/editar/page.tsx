'use client';

import withAuth from "@/lib/withAuth";
import { useState, useEffect } from 'react';

type Produto = {
  id: number;
  nome: string;
};

type ItemVenda = {
  produtoId: number;
  quantidade: number;
};

export default function NovaTransaccao() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [tipo, setTipo] = useState('venda');
  const [dataAluguer, setDataAluguer] = useState('');
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/produtos/')
      .then((res) => res.json())
      .then((data) => setProdutos(data));
  }, []);

  const adicionarProduto = () => {
    if (!produtoId || quantidade < 1) return;

    setItensVenda((prev) => [
      ...prev,
      { produtoId: parseInt(produtoId), quantidade },
    ]);
    setProdutoId('');
    setQuantidade(1);
  };

  const removerProduto = (index: number) => {
    const novosItens = [...itensVenda];
    novosItens.splice(index, 1);
    setItensVenda(novosItens);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const corpo = {
      tipo,
      produtos: itensVenda,
      data_de_aluguer: tipo === 'aluguer' ? dataAluguer : null,
    };

    const res = await fetch('http://localhost:8000/api/transaccoes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });

    if (res.ok) {
      alert('Transacção registada com sucesso!');
      setProdutoId('');
      setQuantidade(1);
      setTipo('venda');
      setDataAluguer('');
      setItensVenda([]);
    } else {
      alert('Erro ao registar a transacção.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nova Transacção</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Produto:</label>
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className="block w-full border p-2 rounded"
          >
            <option value="">-- Selecione --</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Quantidade:</label>
          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(parseInt(e.target.value))}
            className="block w-full border p-2 rounded"
            min={1}
          />
        </div>

        <button
          type="button"
          onClick={adicionarProduto}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Adicionar Produto
        </button>

        {itensVenda.length > 0 && (
          <div className="mt-4 border p-4 rounded bg-gray-100">
            <h2 className="text-lg font-semibold mb-2">Produtos Seleccionados:</h2>
            <ul>
              {itensVenda.map((item, index) => {
                const produto = produtos.find((p) => p.id === item.produtoId);
                return (
                  <li key={index} className="flex justify-between items-center">
                    {produto?.nome} — {item.quantidade}
                    <button
                      type="button"
                      onClick={() => removerProduto(index)}
                      className="text-red-500 ml-4"
                    >
                      Remover
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div>
          <label>Tipo:</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="block w-full border p-2 rounded"
            required
          >
            <option value="venda">Venda</option>
            <option value="aluguer">Aluguer</option>
          </select>
        </div>

        {tipo === 'aluguer' && (
          <div>
            <label>Data de Aluguer:</label>
            <input
              type="date"
              value={dataAluguer}
              onChange={(e) => setDataAluguer(e.target.value)}
              className="block w-full border p-2 rounded"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={itensVenda.length === 0}
        >
          Registar Transacção
        </button>
      </form>
    </div>
  );
}
