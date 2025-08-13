'use client'

import { useState } from 'react'
import api from '@/lib/api'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface VendaProduto {
    produto__id: number
    produto__nome: string
    quantidade_vendida: number
    receita: number
}

interface VendaCliente {
    cliente__id: number
    cliente__nome: string
    total_vendas: number
    num_transacoes: number
}

interface VendaPagamento {
    tipo_pagamento: string
    total: number
    num_transacoes: number
}

interface TransacaoDetalhe {
    id: number
    data: string
    cliente__nome: string
    tipo_pagamento: string
}

export default function RelatorioVendasCompleto() {
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [clienteId, setClienteId] = useState('')
    const [produtoId, setProdutoId] = useState('')
    const [tipoPagamento, setTipoPagamento] = useState('')
    const [tipoTransacao, setTipoTransacao] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [totalReceita, setTotalReceita] = useState(0)
    const [totalTransacoes, setTotalTransacoes] = useState(0)
    const [totalProdutosVendidos, setTotalProdutosVendidos] = useState(0)
    const [vendasProduto, setVendasProduto] = useState<VendaProduto[]>([])
    const [vendasCliente, setVendasCliente] = useState<VendaCliente[]>([])
    const [vendasPagamento, setVendasPagamento] = useState<VendaPagamento[]>([])
    const [ultimasTransacoes, setUltimasTransacoes] = useState<TransacaoDetalhe[]>([])

    async function buscarRelatorio() {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (dataInicio) params.append('data_inicio', dataInicio)
        if (dataFim) params.append('data_fim', dataFim)
        if (clienteId) params.append('cliente_id', clienteId)
        if (produtoId) params.append('produto_id', produtoId)
        if (tipoPagamento) params.append('tipo_pagamento', tipoPagamento)
        if (tipoTransacao) params.append('tipo_transacao', tipoTransacao)

        try {
            const res = await api.get(`/relatorios/vendas-completo/?${params.toString()}`)
            const data = res.data

            setTotalReceita(data.total_receita || 0)
            setTotalTransacoes(data.total_transacoes || 0)
            setTotalProdutosVendidos(data.total_produtos_vendidos || 0)
            setVendasProduto(Array.isArray(data.vendas_por_produto) ? data.vendas_por_produto : [])
            setVendasCliente(Array.isArray(data.vendas_por_cliente) ? data.vendas_por_cliente : [])
            setVendasPagamento(Array.isArray(data.vendas_por_tipo_pagamento) ? data.vendas_por_tipo_pagamento : [])
            setUltimasTransacoes(Array.isArray(data.ultimas_transacoes) ? data.ultimas_transacoes : [])
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Erro ao buscar relatório')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return `MZN ${value?.toFixed(2) || '0.00'}`
    }

    // Formatar intervalo de datas para o cabeçalho do PDF (exemplo: "01/06/2025 a 20/06/2025" ou "Todos")
    const formatDateInterval = () => {
        if (!dataInicio && !dataFim) return 'Todos os períodos'
        const formatDate = (d: string) => {
            if (!d) return ''
            const dt = new Date(d)
            return dt.toLocaleDateString('pt-MZ') // formato local Moçambique PT
        }
        if (dataInicio && dataFim) return `${formatDate(dataInicio)} a ${formatDate(dataFim)}`
        if (dataInicio) return `A partir de ${formatDate(dataInicio)}`
        if (dataFim) return `Até ${formatDate(dataFim)}`
        return 'Todos os períodos'
    }

    // Exportar Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new()

        // Resumo Geral
        const resumoData = [
            ['Total Receita', totalReceita],
            ['Total Transações', totalTransacoes],
            ['Total Produtos Vendidos', totalProdutosVendidos],
        ]
        const wsResumo = XLSX.utils.aoa_to_sheet(resumoData)
        XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Geral')

        // Vendas por Produto
        const vendasProdSheetData = [
            ['Produto', 'Quantidade', 'Receita'],
            ...vendasProduto.map(vp => [
                vp.produto__nome,
                vp.quantidade_vendida,
                formatCurrency(vp.receita),
            ]),
        ]
        const wsProdutos = XLSX.utils.aoa_to_sheet(vendasProdSheetData)
        XLSX.utils.book_append_sheet(wb, wsProdutos, 'Vendas por Produto')

        // Vendas por Cliente
        const vendasClienteSheetData = [
            ['Cliente', 'Total Vendas', 'Nº Transações'],
            ...vendasCliente.map(vc => [
                vc.cliente__nome,
                formatCurrency(vc.total_vendas),
                vc.num_transacoes,
            ]),
        ]
        const wsClientes = XLSX.utils.aoa_to_sheet(vendasClienteSheetData)
        XLSX.utils.book_append_sheet(wb, wsClientes, 'Vendas por Cliente')

        // Vendas por Tipo Pagamento
        const vendasPagSheetData = [
            ['Tipo Pagamento', 'Total', 'Nº Transações'],
            ...vendasPagamento.map(vp => [
                vp.tipo_pagamento,
                formatCurrency(vp.total),
                vp.num_transacoes,
            ]),
        ]
        const wsPagamentos = XLSX.utils.aoa_to_sheet(vendasPagSheetData)
        XLSX.utils.book_append_sheet(wb, wsPagamentos, 'Vendas por Pagamento')

        // Últimas Transações
        const ultimasTransSheetData = [
            ['ID', 'Data', 'Cliente', 'Tipo Pagamento'],
            ...ultimasTransacoes.map(t => [
                t.id,
                new Date(t.data).toLocaleString(),
                t.cliente__nome,
                t.tipo_pagamento,
            ]),
        ]
        const wsUltimas = XLSX.utils.aoa_to_sheet(ultimasTransSheetData)
        XLSX.utils.book_append_sheet(wb, wsUltimas, 'Últimas Transações')

        XLSX.writeFile(wb, 'relatorio_vendas_completo.xlsx')
    }

    // Exportar PDF corrigido usando autoTable(doc, {...})
    const exportToPDF = () => {
        const doc = new jsPDF()
        let yPos = 22

        doc.setFontSize(18)
        doc.text('Relatório Completo de Vendas', 14, yPos)
        yPos += 10

        doc.setFontSize(12)
        doc.text(`Período: ${formatDateInterval()}`, 14, yPos)
        yPos += 10

        doc.text(`Total Receita: ${formatCurrency(totalReceita)}`, 14, yPos)
        yPos += 8
        doc.text(`Total Transações: ${totalTransacoes}`, 14, yPos)
        yPos += 8
        doc.text(`Total Produtos Vendidos: ${totalProdutosVendidos}`, 14, yPos)
        yPos += 12

        const addTable = (title: string, head: string[], body: any[][]) => {
            doc.setFontSize(14)
            doc.text(title, 14, yPos)
            yPos += 6

            autoTable(doc, {
                startY: yPos,
                head: [head],
                body,
                theme: 'striped',
                margin: { left: 14, right: 14 },
                styles: { fontSize: 9 },
                didDrawPage: (data) => {
                    if (data.cursor) {
                        yPos = data.cursor.y + 10
                    }
                },
            })
        }

        addTable(
            'Vendas por Produto',
            ['Produto', 'Quantidade', 'Receita'],
            vendasProduto.map(vp => [vp.produto__nome, vp.quantidade_vendida, formatCurrency(vp.receita)])
        )
        addTable(
            'Vendas por Cliente',
            ['Cliente', 'Total Vendas', 'Nº Transações'],
            vendasCliente.map(vc => [vc.cliente__nome, formatCurrency(vc.total_vendas), vc.num_transacoes])
        )
        addTable(
            'Vendas por Tipo de Pagamento',
            ['Tipo Pagamento', 'Total', 'Nº Transações'],
            vendasPagamento.map(vp => [vp.tipo_pagamento, formatCurrency(vp.total), vp.num_transacoes])
        )
        addTable(
            'Últimas Transações',
            ['ID', 'Data', 'Cliente', 'Tipo Pagamento'],
            ultimasTransacoes.map(t => [t.id, new Date(t.data).toLocaleString(), t.cliente__nome, t.tipo_pagamento])
        )

        doc.save('relatorio_vendas_completo.pdf')
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Relatório Completo de Vendas</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                    type="date"
                    value={dataInicio}
                    onChange={e => setDataInicio(e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Data Início"
                />
                <input
                    type="date"
                    value={dataFim}
                    onChange={e => setDataFim(e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Data Fim"
                />
                <input
                    type="number"
                    value={clienteId}
                    onChange={e => setClienteId(e.target.value)}
                    className="border p-2 rounded"
                    placeholder="ID Cliente"
                />
                <input
                    type="number"
                    value={produtoId}
                    onChange={e => setProdutoId(e.target.value)}
                    className="border p-2 rounded"
                    placeholder="ID Produto"
                />
                <select
                    value={tipoPagamento}
                    onChange={e => setTipoPagamento(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Tipo Pagamento (Todos)</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="emola">E-Mola</option>
                    <option value="cheque">Cheque</option>
                    <option value="numerario">Numerário</option>
                    <option value="cartao">Cartão</option>
                </select>
                <select
                    value={tipoTransacao}
                    onChange={e => setTipoTransacao(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Tipo Transação (Todos)</option>
                    <option value="venda">Venda</option>
                    <option value="aluguer">Aluguer</option>
                </select>
            </div>

            <button
                onClick={buscarRelatorio}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                {loading ? 'Carregando...' : 'Gerar Relatório'}
            </button>

            <div className="mt-4 space-x-4">
                <button
                    onClick={exportToExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Exportar Excel
                </button>

                <button
                    onClick={exportToPDF}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Exportar PDF
                </button>
            </div>

            {error && <p className="text-red-600 mt-4">{error}</p>}

            {!loading && !error && (
                <>
                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">Resumo Geral</h2>
                        <p><strong>Total Receita:</strong> {formatCurrency(totalReceita)}</p>
                        <p><strong>Total Transações:</strong> {totalTransacoes}</p>
                        <p><strong>Total Produtos Vendidos:</strong> {totalProdutosVendidos}</p>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">Vendas por Produto</h2>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border p-2">Produto</th>
                                    <th className="border p-2">Quantidade</th>
                                    <th className="border p-2">Receita</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendasProduto.map(vp => (
                                    <tr key={vp.produto__id}>
                                        <td className="border p-2">{vp.produto__nome}</td>
                                        <td className="border p-2">{vp.quantidade_vendida}</td>
                                        <td className="border p-2">{formatCurrency(vp.receita)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">Vendas por Cliente</h2>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border p-2">Cliente</th>
                                    <th className="border p-2">Total Vendas</th>
                                    <th className="border p-2">Nº Transações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendasCliente.map(vc => (
                                    <tr key={vc.cliente__id}>
                                        <td className="border p-2">{vc.cliente__nome}</td>
                                        <td className="border p-2">{formatCurrency(vc.total_vendas)}</td>
                                        <td className="border p-2">{vc.num_transacoes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">Vendas por Tipo de Pagamento</h2>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border p-2">Tipo Pagamento</th>
                                    <th className="border p-2">Total</th>
                                    <th className="border p-2">Nº Transações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendasPagamento.map((vp, i) => (
                                    <tr key={i}>
                                        <td className="border p-2">{vp.tipo_pagamento}</td>
                                        <td className="border p-2">{formatCurrency(vp.total)}</td>
                                        <td className="border p-2">{vp.num_transacoes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">Últimas Transações</h2>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border p-2">ID</th>
                                    <th className="border p-2">Data</th>
                                    <th className="border p-2">Cliente</th>
                                    <th className="border p-2">Tipo Pagamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ultimasTransacoes.map(t => (
                                    <tr key={t.id}>
                                        <td className="border p-2">{t.id}</td>
                                        <td className="border p-2">{new Date(t.data).toLocaleString()}</td>
                                        <td className="border p-2">{t.cliente__nome}</td>
                                        <td className="border p-2">{t.tipo_pagamento}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </>
            )}
        </div>
    )
}
