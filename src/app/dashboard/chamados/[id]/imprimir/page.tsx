'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { getCall } from '@/lib/db/calls'
import { Printer, Share2 } from 'lucide-react'

const fmt = (v: number | string) =>
  `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

const billingLabel: Record<string, string> = {
  metro_linear: 'Metro Linear',
  metro_cubico: 'Metro Cúbico',
  litros: 'Litros',
  carga: 'Carga',
  valor_fechado: 'Valor Fechado',
  metro_quadrado: 'Metro Quadrado',
}

const originConfig: Record<string, { name: string; headerBg: string; headerText: string; accentBg: string }> = {
  site_lider:    { name: 'DESENTUPIDORA LÍDER',  headerBg: '#f97316', headerText: '#ffffff', accentBg: '#ffedd5' },
  site_poa:      { name: 'POA DESENTUPIDORA',    headerBg: '#1d4ed8', headerText: '#ffffff', accentBg: '#dbeafe' },
  indicacao:     { name: 'DESENTUPIDORA LÍDER',  headerBg: '#059669', headerText: '#ffffff', accentBg: '#d1fae5' },
  terceirizado:  { name: 'DESENTUPIDORA LÍDER',  headerBg: '#6b7280', headerText: '#ffffff', accentBg: '#f3f4f6' },
}

export default function ImprimirOSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [call, setCall] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCall(id).then(setCall).catch(console.error).finally(() => setLoading(false))
  }, [id])

  function handleShare() {
    if (!call || !so) return
    const clientName = (call.client?.name ?? call.contact_name ?? 'cliente').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_')
    document.title = `OS-${so.os_number}_${clientName}`
    window.print()
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Carregando...</div>
  if (!call) return <div className="flex items-center justify-center h-screen text-slate-500">Chamado não encontrado.</div>

  const so = call.service_orders?.[0]
  if (!so) return <div className="flex items-center justify-center h-screen text-slate-500">Este chamado não possui ordem de serviço.</div>

  const client = call.client
  const items = so.items ?? []
  const cfg = originConfig[call.origin] ?? originConfig.site_lider

  const levantamento = [
    so.has_floor_plan && 'Com planta baixa',
    so.has_no_floor_plan && 'Sem planta baixa',
    so.has_no_knowledge && 'Sem conhecimento',
    so.has_hydraulic_plan && 'Com planta hidráulica',
    so.has_no_hydraulic_plan && 'Sem planta hidráulica',
    so.has_guarantee && 'Garantia 30 dias',
    so.has_guarantee_60 && 'Garantia 60 dias',
    so.has_guarantee_90 && 'Garantia 90 dias',
    so.has_no_guarantee && 'Sem garantia',
  ].filter(Boolean)

  return (
    <>
      {/* Botões flutuantes — somem na impressão */}
      <div className="print:hidden fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition">
          <Share2 className="w-4 h-4" />
          Compartilhar OS
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition"
          style={{ backgroundColor: cfg.headerBg }}>
          <Printer className="w-4 h-4" />
          Imprimir / PDF
        </button>
      </div>

      <div className="print:m-0 min-h-screen bg-white p-4 sm:p-6 font-sans text-[13px] text-black max-w-[800px] mx-auto">
        {/* Cabeçalho com cor da empresa */}
        <div className="mb-0 rounded-t-sm overflow-hidden border-2 border-black">
          <div className="flex" style={{ backgroundColor: cfg.headerBg }}>
            {/* Dados empresa */}
            <div className="flex-1 p-3 text-[11px] leading-snug" style={{ color: cfg.headerText }}>
              <p className="font-black text-lg leading-tight">{cfg.name}</p>
              <p style={{ opacity: 0.85 }}>Atendimento 24h · Domingos e Feriados</p>
            </div>
            {/* OS número */}
            <div className="border-l-2 border-black/30 p-3 flex flex-col items-center justify-center w-36" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cfg.headerText }}>Ordem de Serviço</p>
              <p className="text-3xl font-black mt-1" style={{ color: cfg.headerText }}>{so.os_number}</p>
            </div>
          </div>
        </div>

        {/* Dados do cliente */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="px-3 py-1 font-bold text-center text-[11px] uppercase border-b border-black" style={{ backgroundColor: cfg.accentBg }}>
            Dados do Cliente
          </div>
          <div className="grid grid-cols-3 divide-x divide-black">
            <div className="p-2 col-span-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">Nome</p>
              <p className="font-semibold">{client?.name ?? call.contact_name ?? '—'}</p>
            </div>
            <div className="p-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">CNPJ / CPF</p>
              <p>{client?.cpf_cnpj ?? '—'}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 divide-x divide-black border-t border-black">
            <div className="p-2 col-span-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">Endereço</p>
              <p>{client?.address ?? so.call_address ?? call.call_address ?? '—'}</p>
            </div>
            <div className="p-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">Bairro</p>
              <p>{client?.neighborhood ?? '—'}</p>
            </div>
            <div className="p-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">CEP</p>
              <p>{client?.cep ?? '—'}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 divide-x divide-black border-t border-black">
            <div className="p-2 col-span-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">Município</p>
              <p>{client?.city ?? '—'}</p>
            </div>
            <div className="p-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">Fone</p>
              <p>{client?.phone ?? '—'}</p>
            </div>
            <div className="p-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">UF</p>
              <p>{client?.state ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Tipo de serviço */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="px-3 py-1 font-bold text-center text-[11px] uppercase border-b border-black" style={{ backgroundColor: cfg.accentBg }}>
            Dados do Serviço
          </div>
          <div className="grid grid-cols-2 divide-x divide-black">
            <div className="p-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">Categoria</p>
              <p>{call.service_category ?? '—'}</p>
            </div>
            <div className="p-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">Data</p>
              <p>{so.date ? new Date(so.date + 'T12:00:00').toLocaleDateString('pt-BR') : call.scheduled_date ? new Date(call.scheduled_date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</p>
            </div>
          </div>
          {(call.call_address || call.scheduled_time) && (
            <div className="grid grid-cols-2 divide-x divide-black border-t border-black">
              {call.call_address && (
                <div className="p-2 col-span-1">
                  <p className="text-[10px] font-bold uppercase text-gray-500">Endereço do Serviço</p>
                  <p>{call.call_address}</p>
                </div>
              )}
              {call.scheduled_time && (
                <div className="p-2">
                  <p className="text-[10px] font-bold uppercase text-gray-500">Horário</p>
                  <p className="font-bold">{String(call.scheduled_time).slice(0,5)}</p>
                </div>
              )}
            </div>
          )}
          {call.notes && (
            <div className="p-2 border-t border-black">
              <p className="text-[10px] font-bold uppercase text-gray-500">Observações do chamado</p>
              <p>{call.notes}</p>
            </div>
          )}
        </div>

        {/* Levantamento */}
        {levantamento.length > 0 && (
          <div className="border-x-2 border-b-2 border-black">
            <div className="px-3 py-1 font-bold text-center text-[11px] uppercase border-b border-black" style={{ backgroundColor: cfg.accentBg }}>
              Levantamento
            </div>
            <div className="p-2 flex flex-wrap gap-x-6 gap-y-1">
              {levantamento.map(item => (
                <span key={item as string} className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 border border-black flex items-center justify-center text-[10px]">✓</span>
                  <span>{item as string}</span>
                </span>
              ))}
              {so.billing_system && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 border border-black flex items-center justify-center text-[10px]">✓</span>
                  <span>{billingLabel[so.billing_system] ?? so.billing_system}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Itens do serviço */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="px-3 py-1 font-bold text-center text-[11px] uppercase border-b border-black" style={{ backgroundColor: cfg.accentBg }}>
            Serviços / Peças
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left p-2 w-12 border-r border-black font-bold">Qtd</th>
                <th className="text-left p-2 border-r border-black font-bold">Descrição</th>
                <th className="text-right p-2 w-28 border-r border-black font-bold">Vlr Unit.</th>
                <th className="text-right p-2 w-28 font-bold">Vlr Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="p-2 border-r border-black text-center">{item.quantity}</td>
                  <td className="p-2 border-r border-black">{item.description}</td>
                  <td className="p-2 border-r border-black text-right">{fmt(item.unit_price)}</td>
                  <td className="p-2 text-right">{fmt(item.total ?? item.quantity * item.unit_price)}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-2 text-center text-gray-400">Nenhum item</td></tr>
              )}
              {Array.from({ length: Math.max(0, 3 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-gray-200">
                  <td className="p-2 border-r border-black">&nbsp;</td>
                  <td className="p-2 border-r border-black">&nbsp;</td>
                  <td className="p-2 border-r border-black">&nbsp;</td>
                  <td className="p-2">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totais */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="flex">
            <div className="flex-1 p-3 border-r border-black">
              {so.conditions && (
                <>
                  <p className="text-[10px] font-bold uppercase text-gray-500">Condições de Pagamento</p>
                  <p className="mt-0.5">{so.conditions}</p>
                </>
              )}
              {so.observations && (
                <div className="mt-2">
                  <p className="text-[10px] font-bold uppercase text-gray-500">Observações</p>
                  <p className="mt-0.5">{so.observations}</p>
                </div>
              )}
            </div>
            <div className="w-52 divide-y divide-black">
              {Number(so.equipment_rental_value) > 0 && (
                <div className="flex justify-between px-3 py-1.5">
                  <span className="font-semibold">Locação / M.O.</span>
                  <span>{fmt(so.equipment_rental_value)}</span>
                </div>
              )}
              {Number(so.discount) > 0 && (
                <div className="flex justify-between px-3 py-1.5">
                  <span className="font-semibold">Desconto</span>
                  <span>- {fmt(so.discount)}</span>
                </div>
              )}
              {Number(so.taxes) > 0 && (
                <div className="flex justify-between px-3 py-1.5">
                  <span className="font-semibold">Impostos</span>
                  <span>{fmt(so.taxes)}</span>
                </div>
              )}
              <div className="flex justify-between px-3 py-2" style={{ backgroundColor: cfg.accentBg }}>
                <span className="font-bold text-[14px]">TOTAL</span>
                <span className="font-bold text-[14px]">{fmt(so.total_value)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parcelamento / NF */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="grid grid-cols-3 divide-x divide-black">
            {so.nf_number && (
              <div className="p-2">
                <p className="text-[10px] font-bold uppercase text-gray-500">Nº NF</p>
                <p>{so.nf_number}</p>
              </div>
            )}
            {so.payment_method && (
              <div className="p-2">
                <p className="text-[10px] font-bold uppercase text-gray-500">Forma de Pagamento</p>
                <p>{so.payment_method}</p>
              </div>
            )}
            {so.team && (
              <div className="p-2">
                <p className="text-[10px] font-bold uppercase text-gray-500">Equipe</p>
                <p>{so.team.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Assinaturas */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="grid grid-cols-3 divide-x divide-black">
            <div className="p-3">
              <p className="text-[10px] font-bold uppercase text-gray-500 mb-6">Data</p>
              <div className="border-t border-black pt-1">
                <p className="text-[10px] text-center text-gray-500">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="p-3">
              <p className="text-[10px] font-bold uppercase text-gray-500 mb-6">Técnico Responsável</p>
              <div className="border-t border-black pt-1">
                <p className="text-[10px] text-center text-gray-500">{so.driver ?? ''}</p>
              </div>
            </div>
            <div className="p-3">
              <p className="text-[10px] font-bold uppercase text-gray-500 mb-6">Assinatura do Cliente</p>
              <div className="border-t border-black pt-1">
                <p className="text-[10px] text-center text-gray-500">{client?.name ?? call.contact_name ?? ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center text-[10px] text-gray-400 mt-2">
          {cfg.name} · Atendimento 24 horas, inclusive domingos e feriados
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  )
}
