"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Produto {
  id: number;
  nome: string;
  categoria_nome: string;
  preco_venda?: number;
  preco_aluguer?: number;
}

interface Item {
  produto: number | "";
  quantidade: number;
  tipo: "venda" | "aluguer";
}

interface Cliente {
  nome_cliente: string;
  nuit: string;
  celular: string;
}

export default function NovaCotacao() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [cliente, setCliente] = useState<Cliente>({
    nome_cliente: "",
    nuit: "",
    celular: "",
  });
  const [filtrosProdutos, setFiltrosProdutos] = useState<string[]>([""]);
  const [itens, setItens] = useState<Item[]>([
    { produto: "", quantidade: 1, tipo: "venda" },
  ]);

  useEffect(() => {
    api
      .get("/produtos-lista/")
      .then((res) => setProdutos(res.data))
      .catch((err) => console.error("Erro ao carregar produtos:", err));
  }, []);

  const actualizarItem = <K extends keyof Item>(
    index: number,
    campo: K,
    valor: Item[K]
  ) => {
    const novosItens = [...itens];
    novosItens[index][campo] = valor;
    setItens(novosItens);
  };

  const actualizarFiltroProduto = (index: number, valor: string) => {
    const novosFiltros = [...filtrosProdutos];
    novosFiltros[index] = valor;
    setFiltrosProdutos(novosFiltros);
  };

  const adicionarItem = () => {
    setItens([...itens, { produto: "", quantidade: 1, tipo: "venda" }]);
    setFiltrosProdutos([...filtrosProdutos, ""]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
    setFiltrosProdutos(filtrosProdutos.filter((_, i) => i !== index));
  };

  const calcularPrecoUnitario = (item: Item) => {
    const produtoObj = produtos.find((p) => p.id === item.produto);
    if (!produtoObj) return 0;
    return item.tipo === "venda"
      ? Number(produtoObj.preco_venda ?? 0)
      : Number(produtoObj.preco_aluguer ?? 0);
  };

  const { subtotal, iva, total } = useMemo(() => {
    let sub = 0;
    for (const item of itens) {
      sub += calcularPrecoUnitario(item) * item.quantidade;
    }
    const ivaCalc = sub * 0.16;
    return { subtotal: sub, iva: ivaCalc, total: sub + ivaCalc };
  }, [itens, produtos]);

  const submeter = async () => {
    try {
      if (!cliente.nome_cliente.trim()) {
        alert("Por favor, insira o nome do cliente.");
        return;
      }
      for (const item of itens) {
        if (!item.produto) {
          alert("Selecione todos os produtos.");
          return;
        }
        if (item.quantidade < 1) {
          alert("Quantidade deve ser no mínimo 1.");
          return;
        }
      }
      const response = await api.post("/cotacoes/", {
        nome_cliente: cliente.nome_cliente,
        nuit_cliente: cliente.nuit || null,
        celular_cliente: cliente.celular || null,
        itens,
      });
      router.push(`/cotacoes/factura/${response.data.id}`);
    } catch (error: any) {
      console.error("Erro na cotação:", error.response?.data || error.message);
      const data = error.response?.data;
      if (data?.stock) {
        alert(data.stock);
      } else {
        alert("Erro ao registar a cotação.");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 relative">
      <h1 className="text-2xl font-bold mb-4">Nova Cotação</h1>

      {/* Dados cliente */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Nome do cliente"
          value={cliente.nome_cliente}
          onChange={(e) =>
            setCliente({ ...cliente, nome_cliente: e.target.value })
          }
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

      {/* Itens */}
      {itens.map((item, index) => {
        const produtoSelecionado = produtos.find((p) => p.id === item.produto);
        const precoUnitario = calcularPrecoUnitario(item);
        const subtotalItem = precoUnitario * item.quantidade;

        const produtosFiltrados = filtrosProdutos[index]
          ? produtos.filter((p) =>
              p.nome.toLowerCase().includes(filtrosProdutos[index].toLowerCase())
            )
          : [];

        return (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 mb-8 items-center relative"
          >
            {/* Campo de produto */}
            <div className="relative col-span-2">
              <input
                type="text"
                value={
                  filtrosProdutos[index] ||
                  produtoSelecionado?.nome ||
                  ""
                }
                onChange={(e) => {
                  actualizarFiltroProduto(index, e.target.value);
                  actualizarItem(index, "produto", "");
                }}
                placeholder="Produto"
                className="border p-2 w-full"
              />
              {filtrosProdutos[index] && produtosFiltrados.length > 0 && (
                <ul className="border rounded mt-1 max-h-40 overflow-auto bg-white shadow z-10 absolute w-full">
                  {produtosFiltrados.map((p) => (
                    <li
                      key={p.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        actualizarFiltroProduto(index, "");
                        actualizarItem(index, "produto", p.id);
                      }}
                    >
                      {p.nome}{" "}
                      <span className="text-xs text-gray-500">
                        ({p.categoria_nome})
                      </span>
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
              onChange={(e) =>
                actualizarItem(index, "quantidade", Number(e.target.value))
              }
              className="border p-2"
            />

            {/* Tipo */}
            <select
              value={item.tipo}
              onChange={(e) =>
                actualizarItem(index, "tipo", e.target.value as "venda" | "aluguer")
              }
              className="border p-2"
            >
              <option value="venda">Venda</option>
              <option value="aluguer">Aluguer</option>
            </select>

            {/* Preço / Remover */}
            <div className="flex items-center gap-2">
              <div className="text-right p-2">{subtotalItem.toFixed(2)} MZN</div>
              <button
                onClick={() => removerItem(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
                type="button"
              >
                &times;
              </button>
            </div>
          </div>
        );
      })}

      {/* Totais */}
      <div className="text-right mt-4 mb-4 space-y-1">
        <p>
          <strong>Subtotal:</strong> {subtotal.toFixed(2)} MZN
        </p>
        <p>
          <strong>IVA (16%):</strong> {iva.toFixed(2)} MZN
        </p>
        <p className="text-lg font-bold">
          <strong>Total:</strong> {total.toFixed(2)} MZN
        </p>
      </div>

      <button
        onClick={adicionarItem}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        type="button"
      >
        Adicionar Produto
      </button>
      <br />
      <button
        onClick={submeter}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Finalizar Cotação
      </button>
    </div>
  );
}
