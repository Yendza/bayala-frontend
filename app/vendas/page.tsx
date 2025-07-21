// frontend/app/vendas/page.tsx
import withAuth from "@/lib/withAuth";
import React from 'react';

const VendasPage = () => {
  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Vendas</h1>
      <ul>
        <li>Venda de Computador</li>
        <li>Venda de Impressora</li>
        <li>Venda de Toner</li>
      </ul>
    </div>
  );
};

export default VendasPage;
