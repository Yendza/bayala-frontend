'use client'

import { useEffect, useState, useRef } from 'react'
import axiosClient from '@/lib/axiosClient'
import html2pdf from 'html2pdf.js'
import * as XLSX from 'xlsx'

interface Categoria {
    id: number
    nome: string
}

interface Produto {
    id: number
    nome: string
    categoria_nome: string
}

interface StockItem {
    produto: Produto
    quantidade: number
    data_entrada: string
}

export default function RelatorioStock() {
    const [stock, setStock] = useState<StockItem[]>([])
    const [filtroProduto, setFiltroProduto] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const pdfRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        axiosClient.get('/stock/stock-agrupado/').then(res => setStock(res.data))
        axiosClient.get('/categorias/').then(res => setCategorias(res.data))
    }, [])

    const stockFiltrado = stock
        .filter(item => item.produto.nome.toLowerCase().includes(filtroProduto.toLowerCase()))
        .filter(item => filtroCategoria === '' || item.produto.categoria_nome === filtroCategoria)
        .sort((a, b) => a.produto.nome.localeCompare(b.produto.nome))

    const exportarPDF = () => {
        if (pdfRef.current) {
            const options = {
                margin: 0.5,
                filename: 'relatorio-stock.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            }
            html2pdf().set(options).from(pdfRef.current).save()
        }
    }

    const exportarExcel = () => {
        const data = stockFiltrado.map(item => ({
            Produto: item.produto.nome,
            Quantidade: item.quantidade,
            Categoria: item.produto.categoria_nome,
            Data: new Date(item.data_entrada).toLocaleString('pt-PT'),
        }))
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock')
        XLSX.writeFile(workbook, 'relatorio-stock.xlsx')
    }

    const totalStock = stockFiltrado.reduce((acc, item) => acc + item.quantidade, 0)
    const dataEmissao = new Date().toLocaleDateString('pt-PT')

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Relatório de Stock</h1>
                <div className="space-x-2">
                    <button onClick={exportarPDF} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Exportar PDF
                    </button>
                    <button onClick={exportarExcel} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Exportar Excel
                    </button>
                </div>
            </div>

            <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <input
                    type="text"
                    placeholder="Filtrar por produto..."
                    value={filtroProduto}
                    onChange={e => setFiltroProduto(e.target.value)}
                    className="border px-3 py-2 rounded w-full md:w-1/3"
                />
                <select
                    value={filtroCategoria}
                    onChange={e => setFiltroCategoria(e.target.value)}
                    className="border px-3 py-2 rounded w-full md:w-1/3"
                >
                    <option value="">Todas as categorias</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={cat.nome}>
                            {cat.nome}
                        </option>
                    ))}
                </select>
            </div>

            <div ref={pdfRef} className="bg-white p-6 rounded shadow border text-sm text-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold">BAYALA - Sistema de Gestão</h2>
                        <p className="text-xs">Av. Maguiguana, Maputo</p>
                        <p className="text-xs">Celular: +258 84/87 4221350</p>
                        <p className="text-xs">Nuit: 400549109</p>
                    </div>
                    <img src="/logo_empresa.png" alt="Logo" className="h-16" />
                </div>

                <h2 className="text-lg font-semibold text-center mb-4 underline">Relatório de Stock</h2>

                <table className="w-full border border-gray-300 rounded mb-4 text-xs">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Produto</th>
                            <th className="p-2 border">Quantidade</th>
                            <th className="p-2 border">Categoria</th>
                            <th className="p-2 border">Data da Última Entrada</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockFiltrado.map((item, i) => (
                            <tr
                                key={i}
                                className={item.quantidade <= 5 ? 'bg-red-100 text-red-700 font-semibold' : ''}
                            >
                                <td className="p-2 border">{item.produto.nome}</td>
                                <td className="p-2 border">{item.quantidade}</td>
                                <td className="p-2 border">{item.produto.categoria_nome}</td>
                                <td className="p-2 border">
                                    {new Date(item.data_entrada).toLocaleString('pt-PT', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="text-right font-semibold mb-4">
                    Total Geral de Stock: {totalStock}
                </div>

                <div className="flex justify-between items-center mt-12 text-xs">
                    <p>Data de Emissão: {dataEmissao}</p>
                    <div className="text-center">
                        <p>_________________________</p>
                        <p>Assinatura</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
