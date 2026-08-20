'use client'
import { Printer, CheckCircle2, AlertTriangle, Loader2, PlugZap, Unplug, Play, Armchair, Globe, Bell } from 'lucide-react'
import type { PrinterState } from './usePrinter'

interface PrinterManagerProps {
  printer: PrinterState
}

export default function PrinterManager({ printer }: PrinterManagerProps) {
  const {
    supported, connected, autoPrint, printTable, printOnline, printWaiter, busy, status, logs,
    connect, disconnect, testPrint,
    setAutoPrint, setPrintTable, setPrintOnline, setPrintWaiter,
  } = printer

  const toggle = (set: (v: boolean) => void, value: boolean) => (
    <button onClick={() => set(!value)}
      className={'relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ' + (value ? 'bg-emerald-500' : 'bg-gray-300')}>
      <span className={'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ' + (value ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )

  return (
    <div className="rounded-2xl bg-white border border-blue-100 p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Printer size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold text-sm">USB Fiş Yazıcısı</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span className={'w-1.5 h-1.5 rounded-full ' + (connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
              {status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={testPrint} disabled={busy || !connected}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Test Fişi
          </button>
          {connected ? (
            <button onClick={disconnect} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-blue-200 text-gray-600 hover:text-red-500 hover:border-red-300 transition-all text-sm font-semibold">
              <Unplug size={16} /> Kapat
            </button>
          ) : (
            <button onClick={connect} disabled={busy || !supported}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />} Yazıcı Bağla
            </button>
          )}
        </div>
      </div>

      {!supported && (
        <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Bu tarayıcı <b>Web Serial</b> desteklemiyor. USB fiş yazıcısını bağlamak için Chrome veya Edge (masaüstü) kullanın.
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-blue-50/60 border border-blue-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/30">
            <CheckCircle2 size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-800 font-semibold">Otomatik fiş basımı</p>
            <p className="text-[11px] text-gray-500">Açıkken yeni siparişler ve seçilen türlerdeki garson çağrıları otomatik basılır — hangi sekmede olursan ol</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={'text-xs font-bold ' + (autoPrint ? 'text-emerald-600' : 'text-gray-400')}>{autoPrint ? 'Açık' : 'Kapalı'}</span>
          {toggle(setAutoPrint, autoPrint)}
        </div>
      </div>

      {autoPrint && (
        <div className="mt-3 rounded-xl bg-white border border-blue-100 p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3">Hangi siparişler fiş olsun?</p>
          <div className="flex flex-col gap-2">
            {([
              { key: 'printTable', label: 'Masa QR siparişleri', desc: 'Masa koduyla verilen siparişler', icon: Armchair, value: printTable, set: setPrintTable },
              { key: 'printOnline', label: 'Online QR siparişleri', desc: 'Online QR menüden gelen siparişler', icon: Globe, value: printOnline, set: setPrintOnline },
              { key: 'printWaiter', label: 'Garson çağrıları', desc: 'Masadan yapılan garson çağrıları', icon: Bell, value: printWaiter, set: setPrintWaiter },
            ]).map(x => {
              const Icon = x.icon
              const active = x.value
              return (
                <button key={x.key} onClick={() => x.set(!active)}
                  className={'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.98] ' + (active ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-600/30' : 'bg-white border-blue-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50')}>
                  <div className={'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ' + (active ? 'bg-white/25' : 'bg-blue-50')}>
                    <Icon size={14} className={active ? 'text-white' : 'text-blue-500'} />
                  </div>
                  <div className="flex-1">
                    <p className={'text-sm font-semibold ' + (active ? 'text-white' : 'text-gray-800')}>{x.label}</p>
                    <p className={'text-[10px] ' + (active ? 'text-white/80' : 'text-gray-400')}>{x.desc}</p>
                  </div>
                  <div className={'w-9 h-5 rounded-full transition-colors flex-shrink-0 ' + (active ? 'bg-emerald-400' : 'bg-gray-300')}>
                    <span className={'block w-4 h-4 rounded-full bg-white shadow transition-all mt-0.5 ' + (active ? 'ml-[18px]' : 'ml-0.5')} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {connected && autoPrint && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle2 size={14} />
          Paneldeki hangi sekmede olursan ol, hatta başka tarayıcı sekmesi açsan bile fişler basılmaya devam eder.
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-4 bg-blue-50/40 border border-blue-100 rounded-xl p-3 max-h-28 overflow-y-auto">
          {logs.map((l, i) => (
            <p key={i} className="text-[11px] font-mono text-gray-500 mb-0.5">› {l}</p>
          ))}
        </div>
      )}
    </div>
  )
}