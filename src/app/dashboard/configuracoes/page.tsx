'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Save, Settings, Loader2, UserCheck, Pencil } from 'lucide-react'
import { getTeams, createTeam, deleteTeam } from '@/lib/db/teams'
import { getAuxiliaries, createAuxiliary, updateAuxiliary, deleteAuxiliary } from '@/lib/db/auxiliaries'

const iCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"

export default function ConfiguracoesPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [newTeam, setNewTeam] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [auxiliaries, setAuxiliaries] = useState<any[]>([])
  const [auxLoading, setAuxLoading] = useState(true)
  const [newAuxName, setNewAuxName] = useState('')
  const [newAuxPct, setNewAuxPct] = useState('')
  const [savingAux, setSavingAux] = useState(false)
  const [editingAux, setEditingAux] = useState<string | null>(null)
  const [editAuxName, setEditAuxName] = useState('')
  const [editAuxPct, setEditAuxPct] = useState('')

  useEffect(() => {
    getTeams().then(setTeams).finally(() => setLoading(false))
    getAuxiliaries().then(setAuxiliaries).finally(() => setAuxLoading(false))
  }, [])

  async function handleAddTeam() {
    if (!newTeam.trim()) return
    setSaving(true)
    try {
      const team = await createTeam(newTeam.trim())
      setTeams(t => [...t, team])
      setNewTeam('')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTeam(id: string) {
    if (!confirm('Remover esta equipe?')) return
    await deleteTeam(id)
    setTeams(t => t.filter(x => x.id !== id))
  }

  async function handleAddAux() {
    if (!newAuxName.trim() || !newAuxPct) return
    setSavingAux(true)
    try {
      const aux = await createAuxiliary(newAuxName.trim(), parseFloat(newAuxPct))
      setAuxiliaries(a => [...a, aux])
      setNewAuxName('')
      setNewAuxPct('')
    } finally {
      setSavingAux(false)
    }
  }

  async function handleDeleteAux(id: string) {
    if (!confirm('Remover este auxiliar?')) return
    await deleteAuxiliary(id)
    setAuxiliaries(a => a.filter(x => x.id !== id))
  }

  function startEditAux(aux: any) {
    setEditingAux(aux.id)
    setEditAuxName(aux.name)
    setEditAuxPct(String(aux.percentage))
  }

  async function handleSaveAux(id: string) {
    if (!editAuxName.trim() || !editAuxPct) return
    const updated = await updateAuxiliary(id, editAuxName.trim(), parseFloat(editAuxPct))
    setAuxiliaries(a => a.map(x => x.id === id ? updated : x))
    setEditingAux(null)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gerencie equipes, auxiliares e preferências do sistema</p>
      </div>

      {/* Equipes */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold text-slate-800">Equipes</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {teams.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">Nenhuma equipe cadastrada</p>
            )}
            {teams.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{t.name}</span>
                <button onClick={() => handleDeleteTeam(t.id)} className="text-red-400 hover:text-red-600 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text" value={newTeam}
            onChange={e => setNewTeam(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTeam()}
            placeholder="Nome da nova equipe..."
            className={iCls}
          />
          <button onClick={handleAddTeam} disabled={saving || !newTeam.trim()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Adicionar
          </button>
        </div>
      </div>

      {/* Auxiliares */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserCheck className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold text-slate-800">Auxiliares / Ajudantes</h2>
          <p className="text-xs text-slate-400 font-normal ml-1">com percentual de comissão</p>
        </div>

        {auxLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {auxiliaries.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">Nenhum auxiliar cadastrado</p>
            )}
            {auxiliaries.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg gap-2">
                {editingAux === a.id ? (
                  <>
                    <input value={editAuxName} onChange={e => setEditAuxName(e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-orange-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400" />
                    <input type="number" min="0" max="100" step="0.5" value={editAuxPct} onChange={e => setEditAuxPct(e.target.value)}
                      className="w-20 px-2 py-1.5 border border-orange-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400" />
                    <span className="text-xs text-slate-500">%</span>
                    <button onClick={() => handleSaveAux(a.id)} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium px-2 py-1 bg-emerald-50 rounded">Salvar</button>
                    <button onClick={() => setEditingAux(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-slate-700 flex-1">{a.name}</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{a.percentage}%</span>
                    <button onClick={() => startEditAux(a)} className="text-slate-400 hover:text-slate-600 transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteAux(a.id)} className="text-red-400 hover:text-red-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
            <input type="text" value={newAuxName} onChange={e => setNewAuxName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddAux()}
              placeholder="Nome do auxiliar..."
              className={iCls} />
          </div>
          <div className="w-24">
            <label className="block text-xs font-medium text-slate-600 mb-1">% Comissão</label>
            <input type="number" min="0" max="100" step="0.5" value={newAuxPct} onChange={e => setNewAuxPct(e.target.value)}
              placeholder="Ex: 20"
              className={iCls} />
          </div>
          <button onClick={handleAddAux} disabled={savingAux || !newAuxName.trim() || !newAuxPct}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
            {savingAux ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Adicionar
          </button>
        </div>
      </div>

      {/* Dados da empresa */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold text-slate-800">Dados da Empresa</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da Empresa</label>
            <input type="text" defaultValue="Desentupidora Líder" className={iCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">CNPJ</label>
            <input type="text" defaultValue="50.773.617/0001-18" className={iCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
            <input type="text" defaultValue="(51) 99960-8260" className={iCls} />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
