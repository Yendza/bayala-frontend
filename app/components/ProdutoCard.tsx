// frontend/app/components/ProdutoCard.tsx
interface ProdutoCardProps {
  nome: string
  descricao: string
  preco_venda: string
  preco_aluguer: string
  categoria: string
  activo: boolean
}

export default function ProdutoCard({
  nome,
  descricao,
  preco_venda,
  preco_aluguer,
  categoria,
  activo,
}: ProdutoCardProps) {
  return (
    <div className="border p-4 rounded-xl shadow-md hover:shadow-lg transition">
      <h2 className="text-lg font-bold mb-2">{nome}</h2>
      <p className="text-sm text-gray-600 mb-2">{descricao}</p>
      <p className="text-sm">Venda: <strong>{preco_venda} MT</strong></p>
      <p className="text-sm">Aluguer: <strong>{preco_aluguer} MT</strong></p>
      <p className="text-sm">Categoria: {categoria}</p>
      <p className="text-sm">Activo: {activo ? 'Sim' : 'Não'}</p>
    </div>
  )
}
