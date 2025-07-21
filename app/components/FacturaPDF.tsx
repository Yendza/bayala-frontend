'use client'

import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

interface Item {
  nome: string;
  quantidade: number;
  preco: number;
}

interface FacturaProps {
  numero: string;
  data: string;
  cliente: string;
  nuit?: string;
  celular?: string;
  produtos: Item[];
  ivaPercentagem: number;
  logoUrl: string;
}

export default function FacturaPDF({
  numero,
  data,
  cliente,
  nuit,
  celular,
  produtos,
  ivaPercentagem,
  logoUrl
}: FacturaProps) {
  const facturaRef = useRef<HTMLDivElement>(null);

  const gerarPDF = () => {
    const element = facturaRef.current;
    if (element) {
      html2pdf()
        .set({
          margin: 10,
          filename: `factura_${numero}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
    }
  };

  const subtotal = produtos.reduce((acc, item) => acc + item.quantidade * item.preco, 0);
  const iva = subtotal * (ivaPercentagem / 100);
  const total = subtotal + iva;

  return (
    <div className="p-4">
      <button
        onClick={gerarPDF}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Gerar PDF
      </button>

      <div ref={facturaRef} className="p-6 bg-white text-black max-w-[800px] mx-auto border rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <img src={logoUrl} alt="Logotipo" className="h-20" />
          <div className="text-right">
            <h2 className="text-xl font-bold">FACTURA Nº {numero}</h2>
            <p>Data: {data}</p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Cliente:</h3>
          <p>Nome: {cliente}</p>
          {nuit && <p>NUIT: {nuit}</p>}
          {celular && <p>Celular: {celular}</p>}
        </div>

        <table className="w-full border border-gray-300 mb-4 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Produto</th>
              <th className="border p-2 text-right">Qtd</th>
              <th className="border p-2 text-right">Preço Unitário</th>
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.nome}</td>
                <td className="border p-2 text-right">{item.quantidade}</td>
                <td className="border p-2 text-right">{item.preco.toFixed(2)} MZN</td>
                <td className="border p-2 text-right">{(item.quantidade * item.preco).toFixed(2)} MZN</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right text-sm">
          <p>Subtotal: {subtotal.toFixed(2)} MZN</p>
          <p>IVA ({ivaPercentagem}%): {iva.toFixed(2)} MZN</p>
          <p className="font-bold text-lg">Total: {total.toFixed(2)} MZN</p>
        </div>

        <p className="mt-6 text-xs text-center">Obrigado pela sua preferência!</p>
      </div>
    </div>
  );
}
