'use client'

import { useEffect, useState } from 'react'
import { Ruler, ChevronDown, ChevronUp } from 'lucide-react'

type SizeRow = { size: string; values: string[] }
type SizeTableData = {
  id: string
  name: string
  productType: string
  gender?: string | null
  category?: string | null
  columns: string[]
  rows: SizeRow[]
}

type Props = {
  productType: string
  gender?: string | null
  category?: string | null
  className?: string
}

export function SizeTableDisplay({ productType, gender, category, className = '' }: Props) {
  const [tables, setTables] = useState<SizeTableData[]>([])
  const [loading, setLoading] = useState(true)
  const [openTable, setOpenTable] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams({ productType })
    if (gender) params.set('gender', gender)
    if (category) params.set('category', category)

    type RawRow = { size: string; values: string }
    type RawTable = Omit<SizeTableData, 'columns' | 'rows'> & { columns: string; rows: RawRow[] }

    fetch(`/api/size-tables?${params}`)
      .then(r => r.json())
      .then((data: RawTable[]) => {
        const parsed: SizeTableData[] = data.map(t => ({
          ...t,
          columns: (() => { try { return JSON.parse(t.columns) } catch { return [] } })(),
          rows: t.rows.map(r => ({
            size: r.size,
            values: (() => { try { return JSON.parse(r.values) } catch { return [] } })(),
          })),
        }))
        setTables(parsed)
        if (parsed.length > 0) setOpenTable(parsed[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productType, gender, category])

  if (loading) return null
  if (tables.length === 0) return null

  return (
    <section className={`mt-10 ${className}`} id="tabela-medidas">
      <div className="flex items-center gap-2 mb-4">
        <Ruler size={18} className="text-brand-red flex-shrink-0" />
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-white">
          Tabela de Medidas
        </h2>
      </div>

      <div className="space-y-3">
        {tables.map(table => {
          const isOpen = openTable === table.id
          return (
            <div key={table.id} className="border border-white/10 overflow-hidden">
              {/* Accordion header — only shown when multiple tables */}
              {tables.length > 1 && (
                <button
                  onClick={() => setOpenTable(isOpen ? null : table.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-brand-graphite hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold text-brand-white">{table.name}</span>
                  {isOpen ? <ChevronUp size={16} className="text-brand-red" /> : <ChevronDown size={16} className="text-white/40" />}
                </button>
              )}

              {(isOpen || tables.length === 1) && table.columns.length > 0 && table.rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-red/10 border-b border-white/10">
                        <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-brand-red whitespace-nowrap">
                          Tamanho
                        </th>
                        {table.columns.map((col, i) => (
                          <th key={i} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-white/60 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, ri) => (
                        <tr
                          key={ri}
                          className={`border-b border-white/5 ${ri % 2 === 0 ? 'bg-brand-black/40' : 'bg-brand-graphite/30'}`}
                        >
                          <td className="px-4 py-2.5 font-bold text-brand-white whitespace-nowrap">
                            {row.size}
                          </td>
                          {table.columns.map((_, ci) => (
                            <td key={ci} className="px-4 py-2.5 text-brand-gray-text whitespace-nowrap">
                              {row.values[ci] ?? '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(isOpen || tables.length === 1) && (table.columns.length === 0 || table.rows.length === 0) && (
                <p className="px-4 py-6 text-sm text-white/30 text-center">
                  Tabela ainda não configurada.
                </p>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-white/30 mt-2">
        * Medidas em centímetros (cm). Variações de ±1 cm são normais.
      </p>
    </section>
  )
}
