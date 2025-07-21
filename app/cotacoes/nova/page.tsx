"use client";

import { useEffect, useState, useMemo } from "react";
import axiosClient from '@/lib/axiosClient'; // ajuste o caminho se necessário
import { useRouter } from "next/navigation";

export default function NovaCotacao() {
    const router = useRouter();

    const [produtos, setProdutos] = useState([]);
    const [cliente, setCliente] = useState({ nome_cliente: "", nuit: "", celular: "" });
    // filtrosProdutos controla o texto digitado em cada input de produto
    const [filtrosProdutos, setFiltrosProdutos] = useState([""]);
    const [itens, setItens] = useState([{ produto: "", quantidade: 1, tipo: "venda" }]);

    useEffect(() => {
        axiosClient.get("/produtos-lista/")
            .then(res => setProdutos(res.data))
            .catch(err => console.error("Erro ao carregar produtos:", err));
    }, []);

    const actualizarItem = (index, campo, valor) => {
        const novosItens = [...itens];
        if (campo === "produto") {
            valor = Number(valor);  // converte id do produto para número
        }
        novosItens[index][campo] = valor;
        setItens(novosItens);
    };

    // Atualiza filtro do input para mostrar autocomplete
    const actualizarFiltroProduto = (index, valor) => {
        const novosFiltros = [...filtrosProdutos];
        novosFiltros[index] = valor;
        setFiltrosProdutos(novosFiltros);
    };

    const adicionarItem = () => {
        setItens([...itens, { produto: "", quantidade: 1, tipo: "venda" }]);
        setFiltrosProdutos([...filtrosProdutos, ""]);
    };

    const removerItem = (index) => {
        setItens(itens.filter((_, i) => i !== index));
        setFiltrosProdutos(filtrosProdutos.filter((_, i) => i !== index));
    };

    const calcularPrecoUnitario = (item) => {
        const produtoObj = produtos.find(p => p.id.toString() === item.produto.toString());
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

            // Envia dados ao backend
            const response = await axiosClient.post("/cotacoes/", {
                nome_cliente: cliente.nome_cliente,
                nuit_cliente: cliente.nuit || null,
                celular_cliente: cliente.celular || null,
                itens,
            });

            const id = response.data.id;
            router.push(`/cotacoes/factura/${id}`);
        } catch (error) {
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

            <div className="grid grid-cols-3 gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Nome do cliente"
                    value={cliente.nome_cliente}
                    onChange={(e) => setCliente({ ...cliente, nome_cliente: e.target.value })}
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

            {itens.map((item, index) => {
                const precoUnitario = calcularPrecoUnitario(item);
                const subtotalItem = precoUnitario * item.quantidade;

                // Produtos filtrados para autocomplete (baseado no filtro do input)
                const produtosFiltrados = filtrosProdutos[index]
                    ? produtos.filter(p => p.nome.toLowerCase().includes(filtrosProdutos[index].toLowerCase()))
                    : [];

                return (
                    <div key={index} className="grid grid-cols-5 gap-4 mb-8 items-center relative">
                        {/* Input com autocomplete */}
                        <div className="relative col-span-1.6">
                            <input
                                type="text"
                                value={filtrosProdutos[index] || ""}
                                onChange={(e) => {
                                    actualizarFiltroProduto(index, e.target.value);
                                    actualizarItem(index, "produto", "");
                                }}
                                placeholder="Produto"
                                className="border p-2 w-full"
                            />
                            {filtrosProdutos[index] && produtosFiltrados.length > 0 && (
                                <ul className="border rounded mt-1 max-h-40 overflow-auto bg-white shadow z-10 absolute w-full">
                                    {produtosFiltrados.map(p => (
                                        <li
                                            key={p.id}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                actualizarFiltroProduto(index, ""); // limpa filtro para fechar lista
                                                actualizarItem(index, "produto", p.id);
                                            }}
                                        >
                                            {p.nome} <span className="text-xs text-gray-500">({p.categoria_nome})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <input
                            type="number"
                            min={1}
                            value={item.quantidade}
                            onChange={(e) => actualizarItem(index, "quantidade", Number(e.target.value))}
                            className="border p-2"
                        />

                        <select
                            value={item.tipo}
                            onChange={(e) => actualizarItem(index, "tipo", e.target.value)}
                            className="border p-2"
                        >
                            <option value="venda">Venda</option>
                            <option value="aluguer">Aluguer</option>
                        </select>

                        <div className="text-right p-2">{precoUnitario.toFixed(2)} MZN</div>
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
            <br />
            <button onClick={submeter} className="bg-green-600 text-white px-4 py-2 rounded">
                Finalizar Cotação
            </button>
        </div>
    );
}
