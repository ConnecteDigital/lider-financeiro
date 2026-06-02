'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createExpense } from '@/lib/db/expenses'
import { getSuppliers } from '@/lib/db/suppliers'
import { getClients } from '@/lib/db/clients'

const BASE_CATEGORIES = [
  'Frota', 'Pessoal', 'Marketing', 'Administrativo', 'Operacional', 'Impostos',
  'Saldo Google', 'Outros'
]

const GOOGLE_SITES = ['Site Líder', 'Site POA', 'Ambos']

const iCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"

export default function NovaSaidaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  const [form, setForm] = useState({
    description: '',
    category: 'Operacional',
    amount: '',
    type: 'avulso',
    due_date: new Date().toISOString().split('T')[0],
    recurrence_day: '',
    notes: '',
    supplier_id: '',
    client_id: '',
    google_site: '',
  })

  useEffect(() => {
    Promise.all([getSuppliers(), getClients()])
      .then(([s, c]) => { setSuppliers(s); setClients(c) })
      .catch(console.error)
    // Load custom categories from localStorage
    try {
      const saved = localStorage.getItem('expense_custom_categories')
      if (saved) setCustomCategories(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const allCategories = [...BASE_CATEGORIES, ...customCategories]

  function addCustomCategory() {
    if (!newCategory.trim() || allCategories.includes(newCategory.trim())) return
    const updated = [...customCategories, newCategory.trim()]
    setCustomCategories(updated)
    localStorage.setItem('expense_custom_categories', JSON.stringify(updated))
    set('category', newCategory.trim())
    setNewCategory('')
    setShowNewCategory(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createExpense({
        ...form,
        amount: parseFloat(form.amount),
        status: form.type === 'avulso' ? 'pago' : 'pendente',
        paid_date: form.type === 'avulso' ? form.due_date : null,
        recurrence_day: form.type === 'fixo' && form.recurrence_day ? parseInt(form.recurrence_day) : null,
        supplier_id: form.supplier_id || null,
        client_id: form.client_id || null,
        google_site: form.category === 'Saldo Google' ? (form.google_site || null) : null,
      })
      router.push('/dashboard/saidas')
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/saidas" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lançar Saída</h1>
          <p className="text-slate-500 text-sm">Registre uma nova despesa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição *</label>
          <input type="text" required value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Ex: Gasolina, Parcela Caminhão..."
            className={iCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Categoria</label>
              <button type="button" onClick={() => setShowNewCategory(!showNewCategory)}
                className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Nova
              </button>
            </div>
            {showNewCategory && (
              <div className="flex gap-1 mb-2">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  placeholder="Nome da categoria"
                  className="flex-1 px-2 py-1.5 border border-orange-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                />
                <button type="button" onClick={addCustomCategory}
                  className="bg-orange-500 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-orange-600">
                  OK
                </button>
              </div>
            )}
            <select value={form.category} onChange={e => set('category', e.target.value)} className={iCls}>
              {allCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor (R$) *</label>
            <input type="number" required min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
              className={iCls} />
          </div>
        </div>

        {/* Google Saldo - campo de site */}
        {form.category === 'Saldo Google' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-blue-700">Saldo do Google Ads</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Qual site?</label>
              <div className="flex flex-wrap gap-2">
                {GOOGLE_SITES.map(s => (
                  <button key={s} type="button" onClick={() => set('google_site', s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${form.google_site === s ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
          <div className="flex gap-2">
            {[{ v: 'avulso', l: 'Avulso (único)' }, { v: 'fixo', l: 'Fixo (recorrente)' }].map(t => (
              <button key={t.v} type="button" onClick={() => set('type', t.v)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${form.type === t.v ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {form.type === 'fixo' ? 'Data do próximo vencimento' : 'Data de vencimento'} *
            </label>
            <input type="date" required value={form.due_date} onChange={e => set('due_date', e.target.value)}
              className={iCls} />
          </div>
          {form.type === 'fixo' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Dia do vencimento mensal</label>
              <input type="number" min="1" max="31" value={form.recurrence_day} onChange={e => set('recurrence_day', e.target.value)}
                placeholder="Ex: 10"
                className={iCls} />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Fornecedor</label>
          <select value={form.supplier_id} onChange={e => set('supplier_id', e.target.value)} className={iCls}>
            <option value="">— Nenhum —</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Não encontrou? <Link href="/dashboard/fornecedores/novo" className="text-orange-500 hover:underline">Cadastrar fornecedor</Link>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Cliente <span className="text-slate-400 font-normal">(para mensalidades recorrentes)</span>
          </label>
          <select value={form.client_id} onChange={e => set('client_id', e.target.value)} className={iCls}>
            <option value="">— Nenhum —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações</label>
          <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
            className={`${iCls} resize-none`} />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{error}</div>}

        <div className="flex gap-3 justify-end pt-2">
          <Link href="/dashboard/saidas"
            className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition">
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar Saída'}
          </button>
        </div>
      </form>
    </div>
  )
}
