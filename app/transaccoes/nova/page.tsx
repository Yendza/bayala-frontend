"use client";

import { useEffect, useState, useMemo } from "react";
import axiosClient from '@/lib/axiosClient'; // ajuste o caminho se necessário
import { useRouter } from "next/navigation";

interface Produto {
  id: number;
  nome: string;
  categoria_nome: string;
  preco_venda: number;
  preco_aluguer: number;
}

interface Item {
  produto: number | null;        // id do produto
  filtroProduto: string;         // texto digitado para filtrar
  quantidade: number;
  tipo: "venda" | "aluguer";
}

export default function NovaTransaccao() {
  const router = useRouter();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [cliente, setCliente] = useState({ nome: "", nuit: "", celular: "" });
  const [itens, setItens] = useState<Item[]>([
    { produto: null, filtroProduto: "", quantidade: 1, tipo: "venda" },
  ]);
  const [tipoPagamento, setTipoPagamento] = useState("numerario");

  useEffect(() => {
    axiosClient.get("/produtos-lista/")
      .then((res) => setProdutos(res.data))
      .catch(() => setProdutos([]));
  }, []);

  // Função atualizada com tipagem genérica para valor conforme a chave
  function actualizarItem<K extends keyof Item>(index: number, campo: K, valor: Item[K]) {
    const novosItens = [...itens];
    if (campo === "produto") {
      novosItens[index].produto = valor as number | null;
      const produtoSelecionado = produtos.find((p) => p.id === valor);
      novosItens[index].filtroProduto = produtoSelecionado ? produtoSelecionado.nome : "";
    } else if (campo === "filtroProduto") {
      novosItens[index].filtroProduto = valor as string;
      novosItens[index].produto = null; // limpar seleção ao digitar
    } else {
      novosItens[index][campo] = valor;
    }
    setItens(novosItens);
  }

  const adicionarItem = () => {
    setItens([...itens, { produto: null, filtroProduto: "", quantidade: 1, tipo: "venda" }]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const calcularPrecoUnitario = (item: Item) => {
    const produtoObj = produtos.find((p) => p.id === item.produto);
    if (!produtoObj) return 0;

    if (item.tipo === "venda") {
      return Number(produtoObj.preco_venda ?? 0);
    } else if (item.tipo === "aluguer") {
      return Number(produtoObj.preco_aluguer ?? 0);
    }
    return 0;
  };

  const { subtotal, iva, total } = useMemo(() => {
    let sub = 0;
    for (const item of itens) {
      sub += calcularPrecoUnitario(item) * item.quantidade;
    }
    const ivaCalc = sub * 0.16;
    return {
      subtotal: sub,
      iva: ivaCalc,
      total: sub + ivaCalc,
    };
  }, [itens, produtos]);

  const submeter = async () => {
    try {
      if (!cliente.nome.trim()) {
        alert("Por favor, insira o nome do cliente.");
        return;
      }

      let errosStock = [];

      for (const item of itens) {
        if (!item.produto) {
          alert("Selecione todos os produtos.");
          return;
        }

        if (item.quantidade < 1) {
          alert("Quantidade deve ser no mínimo 1.");
          return;
        }

        // Verifica stock real no backend
        const resposta = await axiosClient.get('/stock/stock-disponivel/', {
          params: { produto_id: item.produto }
        });

        const stockDisponivel = resposta.data.quantidade_disponivel ?? 0;

        if (item.quantidade > stockDisponivel) {
          const produtoObj = produtos.find((p) => p.id === item.produto);
          errosStock.push(`• ${produtoObj?.nome || 'Produto'}: disponível ${stockDisponivel}, solicitado ${item.quantidade}`);
        }
      }

      if (errosStock.length > 0) {
        alert("Stock insuficiente para os seguintes produtos:\n" + errosStock.join('\n'));
        return;
      }

      // Envia transação
      const response = await axiosClient.post("/transaccoes/", {
        cliente,
        tipo_pagamento: tipoPagamento,
        itens: itens.map((item) => ({
          produto: Number(item.produto),
          quantidade: Number(item.quantidade),
          tipo: item.tipo,
        })),
      });

      const id = response.data.id;
      router.push(`/transaccoes/factura/${id}`);

    } catch (error: any) {
      console.error("Erro na transacção:", error.response?.data || error.message);
      alert("Erro ao registar a transacção.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Nova Transacção</h1>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Nome do cliente"
          value={cliente.nome}
          onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="NUIT (opcional)"
          value={cliente.nuit}
          onChange={(e) => setCliente({ ...cliente, nuit: e.target.value })}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Celular (opcional)"
          value={cliente.celular}
          onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
          className="border p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Tipo de Pagamento</label>
        <select
          value={tipoPagamento}
          onChange={(e) => setTipoPagamento(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="numerario">Numerário</option>
          <option value="mpesa">M-Pesa</option>
          <option value="emola">E-Mola</option>
          <option value="cheque">Cheque</option>
        </select>
      </div>

      {itens.map((item, index) => {
        const precoUnitario = calcularPrecoUnitario(item);
        const subtotalItem = precoUnitario * item.quantidade;
        // Filtra produtos para o autocomplete (até 10 para performance)
        const produtosFiltrados = item.filtroProduto.length === 0
          ? []
          : produtos.filter(p =>
            p.nome.toLowerCase().includes(item.filtroProduto.toLowerCase())
          ).slice(0, 10);

        return (
          <div key={index} className="relative grid grid-cols-5 gap-4 mb-2 items-center">
            {/* Campo autocomplete */}
            <div className="col-span-1.3 relative">
              <input
                type="text"
                value={item.filtroProduto}
                onChange={(e) => actualizarItem(index, "filtroProduto", e.target.value)}
                className="border p-2 w-full"
                placeholder="Produto"
                autoComplete="off"
              />
              {/* Dropdown sugestões */}
              {produtosFiltrados.length > 0 && !item.produto && (
                <ul className="absolute z-10 max-h-40 overflow-auto bg-white border rounded w-full shadow">
                  {produtosFiltrados.map(p => (
                    <li
                      key={p.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => actualizarItem(index, "produto", p.id)}
                    >
                      {p.nome} <span className="text-xs text-gray-500">({p.categoria_nome})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quantidade */}
            <input
              type="number"
              min={1}
              value={item.quantidade}
              onChange={(e) => actualizarItem(index, "quantidade", Number(e.target.value))}
              className="border p-2"
            />

            {/* Tipo */}
            <select
              value={item.tipo}
              onChange={(e) => actualizarItem(index, "tipo", e.target.value as "venda" | "aluguer")}
              className="border p-2"
            >
              <option value="venda">Venda</option>
              <option value="aluguer">Aluguer</option>
            </select>

            {/* Preço unitário */}
            <div className="text-right p-2">{precoUnitario.toFixed(2)} MZN</div>

            {/* Subtotal e botão remover */}
            <div className="flex items-center gap-2">
              <div className="text-right p-2">{subtotalItem.toFixed(2)} MZN</div>
              <button
                onClick={() => removerItem(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
                title="Remover este produto"
                type="button"
              >
                &times;
              </button>
            </div>
          </div>
        );
      })}

      <div className="text-right mt-4 mb-4 space-y-1">
        <p><strong>Subtotal:</strong> {subtotal.toFixed(2)} MZN</p>
        <p><strong>IVA (16%):</strong> {iva.toFixed(2)} MZN</p>
        <p className="text-lg font-bold"><strong>Total:</strong> {total.toFixed(2)} MZN</p>
      </div>

      <button
        onClick={adicionarItem}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        type="button"
      >
        Adicionar Produto
      </button>

      <button
        onClick={submeter}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Finalizar Transacção
      </button>
    </div>
  );
}
