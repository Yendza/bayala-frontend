'use client';

import { useEffect, useState } from "react";
import api from '@/lib/api';
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Produto {
  nome?: string;
  preco_venda?: number | null;
  preco_aluguer?: number | null;
}

interface Item {
  produto?: Produto | null;
  tipo: string;
  quantidade: number;
}

interface Cliente {
  nome?: string;
  nuit?: string;
  celular?: string;
}

interface Transaccao {
  id: number;
  numero: string;
  data: string;
  cliente?: Cliente | null;
  itens_detalhados?: Item[];
}

export default function FacturaPage() {
  const { id } = useParams();
  const [transaccao, setTransaccao] = useState<Transaccao | null>(null);

  useEffect(() => {
    api
      .get(`/transaccoes/${id}/`)
      .then((res) => setTransaccao(res.data))
      .catch((err) => console.error("Erro a carregar transacção:", err));
  }, [id]);

  const exportarPDF = async () => {
    const input = document.getElementById("factura-oficial");
    if (!input) return alert("Elemento da factura não encontrado.");
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`factura-${id}.pdf`);
  };

  const calcularPrecoUnitario = (item: Item): number => {
    if (!item.produto) return 0;
    if (item.tipo === "venda") {
      return Number(item.produto.preco_venda ?? 0);
    } else if (item.tipo === "aluguer") {
      return Number(item.produto.preco_aluguer ?? 0);
    }
    return 0;
  };

  if (!transaccao) return <div className="p-4">A carregar factura...</div>;

  // Usar itens_detalhados para ter produto e dados completos
  const itens = transaccao.itens_detalhados ?? [];

  const subtotal = itens.reduce((acc, item) => {
    const preco = calcularPrecoUnitario(item);
    return acc + preco * item.quantidade;
  }, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div id="factura-oficial" className="border rounded p-4 bg-white shadow">
        <div className="flex justify-between mb-6">
          <div>
            <img src="/logo_empresa.png" alt="Logotipo" className="h-16 mb-2" />
            <p>NUIT: 400549109</p>
            <p>Celular: 84/87 4221350</p>
            <p>Av. Maguiguana, Maputo</p>
            <p>Email: bayala@bayala.co.mz</p>
          </div>
          <div className="text-right">
            <p><strong>Factura Nº:</strong> {transaccao.numero}</p>
            <p><strong>Data:</strong> {new Date(transaccao.data).toLocaleString()}</p>
            <p><strong>Cliente:</strong> {transaccao.cliente?.nome ?? 'N/A'}</p>
            {transaccao.cliente?.nuit && <p><strong>NUIT:</strong> {transaccao.cliente.nuit}</p>}
            {transaccao.cliente?.celular && <p><strong>Celular:</strong> {transaccao.cliente.celular}</p>}
          </div>
        </div>

        <table className="w-full border border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Produto</th>
              <th className="border px-4 py-2 text-right">Qtd</th>
              <th className="border px-4 py-2 text-right">Tipo</th>
              <th className="border px-4 py-2 text-right">Preço Unitário</th>
              <th className="border px-4 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, i) => {
              const preco = calcularPrecoUnitario(item);
              const subtotalItem = preco * item.quantidade;
              return (
                <tr key={i}>
                  <td className="border px-4 py-2">{item.produto?.nome ?? "Produto"}</td>
                  <td className="border px-4 py-2 text-right">{item.quantidade}</td>
                  <td className="border px-4 py-2 text-right capitalize">{item.tipo}</td>
                  <td className="border px-4 py-2 text-right">{preco.toFixed(2)} MZN</td>
                  <td className="border px-4 py-2 text-right">{subtotalItem.toFixed(2)} MZN</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="text-right mt-4">
          <p><strong>Subtotal:</strong> {subtotal.toFixed(2)} MZN</p>
          <p><strong>IVA (16%):</strong> {iva.toFixed(2)} MZN</p>
          <p className="text-lg"><strong>Total:</strong> {total.toFixed(2)} MZN</p>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={exportarPDF}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Exportar PDF
        </button>
      </div>
    </div>
  );
}
