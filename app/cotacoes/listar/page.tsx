'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axiosClient';
import Link from 'next/link';

interface Cotacao {
    id: number;
    numero: string;
    nome_cliente: string;
    data: string;
    total: string; // já calculado no backend com IVA
}

export default function ListaCotacoesPage() {
    const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axiosClient.get('/cotacoes/')
            .then(res => {
                setCotacoes(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Erro ao carregar cotações');
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-4">A carregar cotações...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Lista de Cotações</h1>
            {cotacoes.length === 0 && <p>Nenhuma cotação encontrada.</p>}

            <table className="w-full border border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2 text-left">Nº Cotação</th>
                        <th className="border px-4 py-2 text-left">Cliente</th>
                        <th className="border px-4 py-2 text-left">Data</th>
                        <th className="border px-4 py-2 text-right">Total (MZN)</th>
                        <th className="border px-4 py-2 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {cotacoes.map(cotacao => (
                        <tr key={cotacao.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{cotacao.numero}</td>
                            <td className="border px-4 py-2">{cotacao.nome_cliente}</td>
                            <td className="border px-4 py-2">{new Date(cotacao.data).toLocaleDateString()}</td>
                            <td className="border px-4 py-2 text-right">{Number(cotacao.total).toFixed(2)}</td>
                            <td className="border px-4 py-2 text-center">
                                <Link href={`/cotacoes/factura/${cotacao.id}`} className="text-blue-600 hover:underline">
                                    Ver Cotação
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
