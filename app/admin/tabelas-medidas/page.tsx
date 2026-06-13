'use client'

import { useEffect, useState, useCallback } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Trash2, Save, Edit2, X, ChevronDown, ChevronUp, Check } from 'lucide-react'

type SizeRow = { size: string; values: string[] }
type SizeTable = {
  id: string
  name: string
  productType: string
  gender: string | null
  category: string | null
  columns: string[]
  active: boolean
  sortOrder: number
  rows: SizeRow[]
}

const PRODUCT_TYPES = [
  { value: 'OVERSIZED', label: 'Oversized' },
  { value: 'CAMISETA', label: 'Camiseta' },
  { value: 'DRYFIT', label: 'DryFit' },
]
const GENDERS = [
  { value: '', label: 'Unissex (todos)' },
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMININO', label: 'Feminino' },
]
const COMMON_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG']
const INPUT = 'w-full bg-black/30 border border-white/10 text-white placeholder-white/20 px-3 py-2 text-sm focus:outline-none focus:border-brand-red/60'

function TableEditor({ table, onSave, onCancel }: {
  table: Partial<SizeTable>
  onSave: (t: SizeTable) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(table.name ?? '')
  const [productType, setProductType] = useState(table.productType ?? 'DRYFIT')
  const [gender, setGender] = useState(table.gender ?? '')
  const [category, setCategory] = useState(table.category ?? '')
  const [active, setActive] = useState(table.active ?? true)
  const [columns, setColumns] = useState<string[]>(table.columns ?? ['Busto (cm)', 'Cintura (cm)', 'Comprimento (cm)'])
  const [rows, setRows] = useState<SizeRow[]>(
    table.rows?.length ? table.rows : COMMON_SIZES.map(s => ({ size: s, values: [] }))
  )
  const [saving, setSaving] = useState(false)
  const [newCol, setNewCol] = useState('')

  const addColumn = () => {
    if (!newCol.trim()) return
    setColumns(c => [...c, newCol.trim()])
    setNewCol('')
  }
  const removeColumn = (i: number) => {
    setColumns(c => c.filter((_, ci) => ci !== i))
    setRows(r => r.map(row => ({ ...row, values: row.values.filter((_, vi) => vi !== i) })))
  }
  const addRow = () => setRows(r => [...r, { size: '', values: Array(columns.length).fill('') }])
  const removeRow = (i: number) => setRows(r => r.filter((_, ri) => ri !== i))
  const updateRow = (ri: number, field: 'size' | number, val: string) => {
    setRows(r => r.map((row, idx) => {
      if (idx !== ri) return row
      if (field === 'size') return { ...row, size: val }
      const vals = [...row.values]
      while (vals.length < columns.length) vals.push('')
      vals[field as number] = val
      return { ...row, values: vals }
    }))
  }

  async function handleSave() {
    if (!name || !productType) return
    setSaving(true)
    const body = {
      name, productType,
      gender: gender || null,
      category: category || null,
      columns, active,
      rows: rows.filter(r => r.size.trim()).map((r, i) => ({
        size: r.size.trim(),
        values: columns.map((_, ci) => r.values[ci] ?? ''),
        sortOrder: i,
      })),
    }

    const url = table.id ? `/api/admin/size-tables/${table.id}` : '/api/admin/size-tables'
    const method = table.id ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      const saved = await res.json()
      onSave({
        ...saved,
        columns: (() => { try { return JSON.parse(saved.columns) } catch { return [] } })(),
        rows: (saved.rows ?? []).map((r: { size: string; values: string }) => ({
          size: r.size,
          values: (() => { try { return JSON.parse(r.values) } catch { return [] } })(),
        })),
      })
    }
    setSaving(false)
  }

  return (
    <div className="bg-brand-graphite border border-white/10 p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Nome da Tabela *</label>
          <input value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Ex: DryFit Masculino Regata" />
        </div>
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Tipo de Produto *</label>
          <select value={productType} onChange={e => setProductType(e.target.value)} className={INPUT}>
            {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Gênero</label>
          <select value={gender} onChange={e => setGender(e.target.value)} className={INPUT}>
            {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">
            Subcategoria <span className="text-white/20">(ex: regata, slim, top-academia)</span>
          </label>
          <input value={category} onChange={e => setCategory(e.target.value)} className={INPUT} placeholder="Deixe vazio para padrão" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="active-chk" checked={active} onChange={e => setActive(e.target.checked)} className="cursor-pointer" />
        <label htmlFor="active-chk" className="text-sm text-white/60 cursor-pointer">Tabela ativa (visível para clientes)</label>
      </div>

      {/* Columns */}
      <div>
        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Colunas de Medidas</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {columns.map((col, i) => (
            <span key={i} className="flex items-center gap-1 bg-white/10 px-2 py-1 text-xs text-white/80">
              {col}
              <button onClick={() => removeColumn(i)} className="text-red-400 hover:text-red-300 cursor-pointer ml-1"><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newCol}
            onChange={e => setNewCol(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addColumn()}
            className={`${INPUT} flex-1`}
            placeholder="Ex: Busto (cm)"
          />
          <button onClick={addColumn} className="px-3 py-2 bg-brand-red text-white text-sm cursor-pointer hover:bg-brand-dark-red transition-colors">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Rows */}
      <div>
        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Linhas (por tamanho)</label>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-2 py-2 text-xs text-white/40 uppercase">Tamanho</th>
                {columns.map((col, i) => (
                  <th key={i} className="text-left px-2 py-2 text-xs text-white/40 uppercase whitespace-nowrap">{col}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/5">
                  <td className="px-2 py-1.5">
                    <input
                      value={row.size}
                      onChange={e => updateRow(ri, 'size', e.target.value)}
                      className={`${INPUT} w-20`}
                      placeholder="P"
                    />
                  </td>
                  {columns.map((_, ci) => (
                    <td key={ci} className="px-2 py-1.5">
                      <input
                        value={row.values[ci] ?? ''}
                        onChange={e => updateRow(ri, ci, e.target.value)}
                        className={`${INPUT} w-28`}
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    <button onClick={() => removeRow(ri)} className="text-red-400 hover:text-red-300 cursor-pointer p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addRow} className="mt-2 flex items-center gap-1 text-xs text-brand-red hover:text-white cursor-pointer transition-colors">
          <Plus size={14} /> Adicionar linha
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="btn-secondary flex items-center gap-2 cursor-pointer"><X size={14} /> Cancelar</button>
        <button onClick={handleSave} disabled={saving || !name} className="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50">
          {saving ? 'Salvando...' : <><Check size={14} /> Salvar Tabela</>}
        </button>
      </div>
    </div>
  )
}

export default function TabelasMedidasPage() {
  const [tables, setTables] = useState<SizeTable[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const parseTables = (raw: Array<SizeTable & { columns: string; rows: Array<{ size: string; values: string }> }>) =>
    raw.map(t => ({
      ...t,
      columns: (() => { try { return JSON.parse(t.columns) } catch { return [] } })() as string[],
      rows: (t.rows ?? []).map(r => ({
        size: r.size,
        values: (() => { try { return JSON.parse(r.values) } catch { return [] } })() as string[],
      })),
    }))

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/size-tables')
    if (res.ok) setTables(parseTables(await res.json()))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function deleteTable(id: string) {
    if (!confirm('Excluir esta tabela de medidas?')) return
    await fetch(`/api/admin/size-tables/${id}`, { method: 'DELETE' })
    setTables(t => t.filter(x => x.id !== id))
  }

  const typeLabel: Record<string, string> = { OVERSIZED: 'Oversized', CAMISETA: 'Camiseta', DRYFIT: 'DryFit' }
  const genderLabel: Record<string, string> = { MASCULINO: 'Masc.', FEMININO: 'Fem.' }

  return (
    <div className="min-h-screen bg-brand-black flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-brand-red text-xs font-bold uppercase tracking-[0.3em] mb-1">Admin</p>
            <h1 className="heading-display text-4xl text-white">TABELAS DE MEDIDAS</h1>
            <p className="text-sm text-white/40 mt-1">
              Cadastre e edite as tabelas que aparecem nas páginas de produtos para cada tipo, gênero e subcategoria.
            </p>
          </div>
          {editingId !== 'new' && (
            <button
              onClick={() => setEditingId('new')}
              className="btn-primary flex items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <Plus size={16} /> Nova Tabela
            </button>
          )}
        </div>

        {editingId === 'new' && (
          <div className="mb-6">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Nova Tabela</p>
            <TableEditor
              table={{}}
              onSave={saved => { setTables(t => [saved, ...t]); setEditingId(null) }}
              onCancel={() => setEditingId(null)}
            />
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-white/30">Carregando...</div>
        ) : tables.length === 0 ? (
          <div className="py-20 text-center text-white/30">
            <p className="mb-4">Nenhuma tabela cadastrada ainda.</p>
            <button onClick={() => setEditingId('new')} className="btn-primary cursor-pointer">
              <Plus size={16} /> Criar primeira tabela
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tables.map(table => (
              <div key={table.id} className="border border-white/10 bg-brand-graphite/50">
                {editingId === table.id ? (
                  <TableEditor
                    table={table}
                    onSave={saved => { setTables(t => t.map(x => x.id === saved.id ? saved : x)); setEditingId(null) }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between px-4 py-3 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => setExpandedId(expandedId === table.id ? null : table.id)}
                          className="text-white/40 hover:text-white cursor-pointer flex-shrink-0"
                        >
                          {expandedId === table.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">{table.name}</span>
                            {!table.active && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 uppercase">Inativa</span>}
                          </div>
                          <p className="text-xs text-white/40 mt-0.5">
                            {typeLabel[table.productType] ?? table.productType}
                            {table.gender ? ` · ${genderLabel[table.gender] ?? table.gender}` : ' · Unissex'}
                            {table.category ? ` · ${table.category}` : ''}
                            {' · '}{table.rows.length} tamanhos · {table.columns.length} colunas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setEditingId(table.id)} className="p-2 text-white/40 hover:text-white cursor-pointer transition-colors" title="Editar">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => deleteTable(table.id)} className="p-2 text-white/40 hover:text-red-400 cursor-pointer transition-colors" title="Excluir">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {expandedId === table.id && table.columns.length > 0 && table.rows.length > 0 && (
                      <div className="border-t border-white/10 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-black/20">
                              <th className="px-4 py-2 text-left text-white/40 font-semibold uppercase">Tam.</th>
                              {table.columns.map((col, i) => (
                                <th key={i} className="px-4 py-2 text-left text-white/40 font-semibold uppercase whitespace-nowrap">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row, ri) => (
                              <tr key={ri} className="border-t border-white/5">
                                <td className="px-4 py-2 font-bold text-white">{row.size}</td>
                                {table.columns.map((_, ci) => (
                                  <td key={ci} className="px-4 py-2 text-white/60">{row.values[ci] ?? '—'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
