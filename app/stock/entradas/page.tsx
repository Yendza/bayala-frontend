'use client'

import { useEffect, useRef, useState } from 'react'
import axiosClient from '@/lib/axiosClient'
import html2pdf from 'html2pdf.js'
import * as XLSX from 'xlsx'

interface Produto {
    id: number
    nome: string
    categoria: string
}

interface Entrada {
    id: number
    produto: Produto
    quantidade_adicionada: number
    quantidade_anterior: number
    quantidade_actual: number
    data_entrada: string
}

interface Categoria {
    id: number
    nome: string
}

export default function ListaEntradas() {
    const [entradas, setEntradas] = useState<Entrada[]>([])
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [filtroProduto, setFiltroProduto] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [filtroDataInicio, setFiltroDataInicio] = useState('')
    const [filtroDataFim, setFiltroDataFim] = useState('')
    const pdfRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        axiosClient.get('/stock/entradas/').then(res => setEntradas(res.data))
        axiosClient.get('/produtos-lista/').then(res => setProdutos(res.data))
        axiosClient.get('/categorias/').then(res => setCategorias(res.data))
    }, [])

    const entradasFiltradas = entradas.filter(e => {
        if (!e.produto) return false

        const nomeProduto = e.produto.nome.toLowerCase()
        const nomeCategoria = e.produto.categoria?.toLowerCase() || ''
        const data = new Date(e.data_entrada)

        return (
            nomeProduto.includes(filtroProduto.toLowerCase()) &&
            (filtroCategoria === '' || nomeCategoria === filtroCategoria.toLowerCase()) &&
            (!filtroDataInicio || new Date(filtroDataInicio) <= data) &&
            (!filtroDataFim || data <= new Date(filtroDataFim))
        )
    })


    const exportarPDF = () => {
        if (pdfRef.current) {
            const options = {
                margin: 0.5,
                filename: 'lista-entradas-stock.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
            }
            html2pdf().set(options).from(pdfRef.current).save()
        }
    }

    const exportarExcel = () => {
        const data = entradasFiltradas.map(e => ({
            Produto: e.produto.nome,
            Categoria: e.produto.categoria,
            'Qtd. Anterior': e.quantidade_anterior,
            'Qtd. Adicionada': e.quantidade_adicionada,
            'Qtd. Actual': e.quantidade_actual,
            'Data de Entrada': new Date(e.data_entrada).toLocaleString('pt-PT'),
        }))
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Entradas')
        XLSX.writeFile(workbook, 'lista-entradas-stock.xlsx')
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Lista de Entradas de Stock</h1>

            {/* Botões de Exportação */}
            <div className="flex justify-end space-x-2 mb-4">
                <button
                    onClick={exportarPDF}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Exportar PDF
                </button>
                <button
                    onClick={exportarExcel}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Exportar Excel
                </button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Filtrar por produto"
                    value={filtroProduto}
                    onChange={e => setFiltroProduto(e.target.value)}
                    className="border px-3 py-2 rounded"
                />
                <select
                    value={filtroCategoria}
                    onChange={e => setFiltroCategoria(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="">Todas categorias</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={cat.nome}>
                            {cat.nome}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={e => setFiltroDataInicio(e.target.value)}
                    className="border px-3 py-2 rounded"
                />
                <input
                    type="date"
                    value={filtroDataFim}
                    onChange={e => setFiltroDataFim(e.target.value)}
                    className="border px-3 py-2 rounded"
                />
            </div>

            {/* Tabela com Ref para PDF */}
            <div ref={pdfRef} className="overflow-auto bg-white border rounded shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-800">
                        <tr>
                            <th className="p-2 border">Produto</th>
                            <th className="p-2 border">Categoria</th>
                            <th className="p-2 border">Qtd. Anterior</th>
                            <th className="p-2 border">Qtd. Adicionada</th>
                            <th className="p-2 border">Qtd. Actual</th>
                            <th className="p-2 border">Data de Entrada</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entradasFiltradas.length > 0 ? (
                            entradasFiltradas.map((entrada) => (
                                <tr key={entrada.id} className="text-gray-700">
                                    <td className="p-2 border">{entrada.produto.nome}</td>
                                    <td className="p-2 border">{entrada.produto.categoria}</td>
                                    <td className="p-2 border text-center">{entrada.quantidade_anterior}</td>
                                    <td className="p-2 border text-center">{entrada.quantidade_adicionada}</td>
                                    <td className="p-2 border text-center">{entrada.quantidade_actual}</td>
                                    <td className="p-2 border">
                                        {new Date(entrada.data_entrada).toLocaleString('pt-PT')}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    Nenhuma entrada encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Totalizador */}
                <div className="text-right p-4 font-semibold">
                    Total de Produtos Adicionados:{' '}
                    {entradasFiltradas.reduce((acc, e) => acc + e.quantidade_adicionada, 0)}
                </div>
            </div>
        </div>
    )
}
