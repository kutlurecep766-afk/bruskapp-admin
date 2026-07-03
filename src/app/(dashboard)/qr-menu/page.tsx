'use client'
import { useState, useEffect } from 'react'
import { QrCode, Plus, Copy, Check, ToggleLeft, ToggleRight, Download, Loader2, X, Square, CheckSquare, Printer, Wifi, DownloadCloud } from 'lucide-react'
import QRCode from 'qrcode'

export default function QrMenuPage() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [siteTitle, setSiteTitle] = useState('')
  const [masaNumbers, setMasaNumbers] = useState<number[]>([])
  const [qrEnabled, setQrEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newNumber, setNewNumber] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [currentStorefrontCfg, setCurrentStorefrontCfg] = useState<any>({})
  const [selectedMasa, setSelectedMasa] = useState<Set<number>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)
  const [qrDataUrls, setQrDataUrls] = useState<Record<number, string>>({})
  const [qrCached, setQrCached] = useState(false)
  const [printerIp, setPrinterIp] = useState('')
  const [printerPort, setPrinterPort] = useState('9100')
  const [printerEnabled, setPrinterEnabled] = useState(false)
  const [testPrinting, setTestPrinting] = useState(false)

  useEffect(() => {
    fetch('/api/tenants/me', { credentials: 'include' })
      .then(r => r.json())
      .then(t => {
        const tenant = t?.tenant || t
        if (tenant?.id) setTenantId(tenant.id)
        if (tenant?.slug) setSlug(tenant.slug)
        if (tenant?.siteTitle) setSiteTitle(tenant.siteTitle)
        if (tenant?.storefrontConfig) {
          const cfg = typeof tenant.storefrontConfig === 'string'
            ? JSON.parse(tenant.storefrontConfig)
            : tenant.storefrontConfig
          setCurrentStorefrontCfg(cfg)
          if (cfg.masaNumbers) setMasaNumbers(cfg.masaNumbers)
          if (cfg.qrEnabled !== undefined) setQrEnabled(cfg.qrEnabled)
        }
        if (tenant?.printerConfig) {
          const pc = typeof tenant.printerConfig === 'string' ? JSON.parse(tenant.printerConfig) : tenant.printerConfig
          if (pc.ip) setPrinterIp(pc.ip)
          if (pc.port) setPrinterPort(String(pc.port))
          if (pc.enabled !== undefined) setPrinterEnabled(pc.enabled)
        }
      })
      .catch(() => setError('Tenant bilgisi alınamadı'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setSelectedMasa(new Set(masaNumbers))
  }, [masaNumbers])

  const qrText = (num: number) => `https://bruskapp.com/masa/${slug}/${num}`

  const generateQrDataUrl = (text: string, size: number): string => {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' })
    const moduleCount = qr.modules.size
    const data = qr.modules.data
    const margin = 4
    const totalModules = moduleCount + margin * 2
    const moduleSize = Math.floor(size / totalModules)
    const actualSize = moduleSize * totalModules

    const canvas = document.createElement('canvas')
    canvas.width = actualSize
    canvas.height = actualSize
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, actualSize, actualSize)

    ctx.fillStyle = '#000000'
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (data[row * moduleCount + col]) {
          ctx.fillRect(
            (margin + col) * moduleSize,
            (margin + row) * moduleSize,
            moduleSize,
            moduleSize
          )
        }
      }
    }

    return canvas.toDataURL('image/png')
  }

  useEffect(() => {
    if (!slug || masaNumbers.length === 0) return
    setQrCached(false)
    let cancelled = false
    const generate = async () => {
      const map: Record<number, string> = {}
      for (const num of masaNumbers) {
        if (cancelled) break
        map[num] = generateQrDataUrl(qrText(num), 400)
      }
      if (!cancelled) { setQrDataUrls(map); setQrCached(true) }
    }
    setTimeout(generate, 0)
    return () => { cancelled = true }
  }, [masaNumbers, slug])

  const toggleSelect = (num: number) => {
    setSelectedMasa(prev => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num)
      else next.add(num)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedMasa.size === masaNumbers.length) setSelectedMasa(new Set())
    else setSelectedMasa(new Set(masaNumbers))
  }

  const saveConfig = async (updates: Record<string, any>) => {
    if (!tenantId) return
    setSaving(true)
    setSaved(false)
    try {
      const merged = { ...currentStorefrontCfg, ...updates }
      const res = await fetch(`/api/tenants/${tenantId}/theme`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storefrontConfig: merged }),
      })
      if (!res.ok) throw new Error('Kaydedilemedi')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const addNumbers = async () => {
    const parts = newNumber.split(',').map(s => s.trim()).filter(Boolean)
    const nums: number[] = []
    for (const part of parts) {
      if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number)
        if (!isNaN(a) && !isNaN(b) && a <= b) {
          for (let i = a; i <= b; i++) nums.push(i)
        }
      } else {
        const n = parseInt(part, 10)
        if (!isNaN(n)) nums.push(n)
      }
    }
    if (nums.length === 0) return
    const merged = Array.from(new Set([...masaNumbers, ...nums])).sort((a, b) => a - b)
    setMasaNumbers(merged)
    setNewNumber('')
    const updatedCfg = { ...currentStorefrontCfg, masaNumbers: merged }
    setCurrentStorefrontCfg(updatedCfg)
    await saveConfig(updatedCfg)
  }

  const removeNumber = async (num: number) => {
    const filtered = masaNumbers.filter(n => n !== num)
    setMasaNumbers(filtered)
    const updatedCfg = { ...currentStorefrontCfg, masaNumbers: filtered }
    setCurrentStorefrontCfg(updatedCfg)
    await saveConfig(updatedCfg)
  }

  const toggleEnabled = async () => {
    const next = !qrEnabled
    setQrEnabled(next)
    const updatedCfg = { ...currentStorefrontCfg, qrEnabled: next }
    setCurrentStorefrontCfg(updatedCfg)
    await saveConfig(updatedCfg)
  }

  const copyLink = (num: number, index: number) => {
    navigator.clipboard.writeText(`https://bruskapp.com/masa/${slug}/${num}`)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const copyAll = () => {
    const links = masaNumbers.map(n => `https://bruskapp.com/masa/${slug}/${n}`).join('\n')
    navigator.clipboard.writeText(links)
    setCopiedIndex(-1)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const savePrinterConfig = async () => {
    if (!tenantId) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/tenants/${tenantId}/theme`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerConfig: { ip: printerIp, port: parseInt(printerPort) || 9100, enabled: printerEnabled } }),
      })
      if (!res.ok) throw new Error('Kaydedilemedi')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const testPrint = async () => {
    setTestPrinting(true)
    await savePrinterConfig()
    setTestPrinting(false)
  }

  const downloadSelected = async () => {
    const toDownload = masaNumbers.filter(n => selectedMasa.has(n))
    if (toDownload.length === 0) return
    setIsDownloading(true)
    for (const num of toDownload) {
      await downloadSingle(num)
    }
    setIsDownloading(false)
  }

  const downloadSingle = async (num: number) => {
    const qrDataUrl = generateQrDataUrl(qrText(num), 460)
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject()
      img.src = qrDataUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 600, 600)

    const qrDisplaySize = img.width
    const qrX = (600 - qrDisplaySize) / 2
    const qrY = (600 - qrDisplaySize) / 2 - 20
    ctx.drawImage(img, qrX, qrY, qrDisplaySize, qrDisplaySize)

    ctx.fillStyle = '#000000'
    ctx.font = 'bold 32px -apple-system, Segoe UI, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(`MASA ${num}`, 300, qrY + qrDisplaySize + 20)

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve))
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `Masa${num}.png`
    link.href = url
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 300)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">QR Masa Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">{siteTitle || slug} — {masaNumbers.length} masa</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadSelected}
            disabled={selectedMasa.size === 0 || isDownloading}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? 'İndiriliyor...' : `Seçilenleri İndir (${selectedMasa.size})`}
          </button>
          {saved && <span className="text-xs text-emerald-400">Kaydedildi</span>}
          {saving && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Masa Sayısı</p>
          <p className="text-2xl font-bold text-white">{masaNumbers.length}</p>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">QR Menü Linki</p>
          <p className="text-sm font-mono text-blue-400 truncate mt-1">/masa/{slug}/[no]</p>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Durum</p>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={toggleEnabled} className="transition-all hover:opacity-80">
              {qrEnabled ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
            </button>
            <span className={`text-sm font-medium ${qrEnabled ? 'text-emerald-400' : 'text-gray-500'}`}>
              {qrEnabled ? 'Aktif' : 'Pasif'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Masa Numaraları</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newNumber}
            onChange={e => setNewNumber(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addNumbers() }}
            placeholder="Örn: 5,6,7 veya 1-10"
            className="flex-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all"
          />
          <button
            onClick={addNumbers}
            disabled={!newNumber.trim() || saving}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Ekle
          </button>
        </div>

        {masaNumbers.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-all">
              {selectedMasa.size === masaNumbers.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              {selectedMasa.size === masaNumbers.length ? 'Tümünü Bırak' : 'Tümünü Seç'}
            </button>
            <button onClick={copyAll} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-all">
              {copiedIndex === -1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIndex === -1 ? 'Kopyalandı' : 'Tüm Linkleri Kopyala'}
            </button>
          </div>
        )}

        {masaNumbers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <QrCode className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">Henüz masa numarası eklenmemiş</p>
            <p className="text-xs text-gray-600 mt-1">Yukarıdaki alana masa numaralarını girerek başlayın</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {masaNumbers.map((num, i) => {
              const isSelected = selectedMasa.has(num)
              return (
                <div
                  key={num}
                  onClick={() => toggleSelect(num)}
                  className={`relative bg-[#080b12]/50 border rounded-xl p-3 text-center transition-all cursor-pointer group ${
                    isSelected ? 'border-blue-500/40 ring-1 ring-blue-500/20' : 'border-[#1a2332] hover:border-blue-500/20'
                  }`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); removeNumber(num) }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute top-2 left-2 z-10">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Masa</p>
                  <p className="text-lg font-bold text-white mb-2">{num}</p>
                  {qrDataUrls[num] ? (
                    <img src={qrDataUrls[num]} alt={`QR Masa ${num}`} className="w-full aspect-square rounded-lg bg-white p-1 mb-2" />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-white/5 animate-pulse mb-2" />
                  )}
                  <p className="text-[10px] text-gray-600 truncate mb-2 font-mono">/masa/{slug}/{num}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyLink(num, i) }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                    style={{
                      backgroundColor: copiedIndex === i ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
                      borderColor: copiedIndex === i ? 'rgba(52,211,153,0.3)' : 'rgba(148,163,184,0.1)',
                      color: copiedIndex === i ? '#34d399' : 'rgba(148,163,184,0.6)',
                    }}
                  >
                    {copiedIndex === i ? (
                      <><Check className="w-3 h-3" /> Kopyalandı</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Linki Kopyala</>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center"><Printer className="w-4 h-4 text-gray-400" /></div>
            <h3 className="text-sm font-semibold text-white">Yazıcı & Bridge</h3>
          </div>
          <a href="https://bruskapp.com/api/uploads/bridge.exe" download className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-1.5">
            <DownloadCloud className="w-3.5 h-3.5" /> Bridge'i İndir
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Mağaza Kodun</label>
            <input type="text" value={slug} readOnly className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none cursor-default" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Yazıcı Bağlantısı</label>
            <div className="flex items-center h-[42px] rounded-xl border border-[#1a2332] px-4" style={{ backgroundColor: 'rgba(8,11,18,0.5)' }}>
              <span className="text-xs text-gray-400">Bridge uygulaması üzerinden yapılandırılır</span>
            </div>
          </div>
        </div>
        <div className="bg-[#080b12]/50 border border-[#1a2332] rounded-xl p-3 space-y-2">
          <p className="text-xs text-gray-400 font-medium">Kurulum Adımları:</p>
          <ol className="text-[11px] text-gray-500 space-y-1 ml-4 list-decimal">
            <li>Yukarıdaki butondan <strong className="text-gray-300">Bridge'i İndir</strong></li>
            <li>İndirilen <strong className="text-gray-300">BruskappBridge.exe</strong>'yi çalıştır</li>
            <li>Açılan sayfada mağaza kodunu yaz: <strong className="text-blue-400">{slug}</strong></li>
            <li>Yazıcı IP ve portunu gir, <strong className="text-gray-300">Başlat</strong>'a bas</li>
            <li>Artık her siparişte otomatik baskı alırsın</li>
          </ol>
        </div>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Hızlı Bilgiler</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <p>• QR menü linki: <span className="font-mono text-blue-400">https://bruskapp.com/masa/{slug}/[masaNo]</span></p>
          <p>• Maskara tıklayarak seçin, "Seçilenleri İndir" ile sadece seçilen masaları indirin</p>
          <p>• Her PNG sadece QR kod + masa numarası içerir, direk çıktıya hazırdır</p>
          <p>• Normal mağaza: <span className="font-mono text-blue-400">https://bruskapp.com/magaza/{slug}</span></p>
          <p>• Masa numaralarını virgülle ayırarak (5,6,7) veya aralık (1-10) şeklinde ekleyebilirsiniz</p>
          {qrEnabled && masaNumbers.length > 0 && (
            <p className="text-emerald-400/80 mt-3">✓ QR menü aktif. Masa QR kodlarını yazdırıp masalara yerleştirebilirsiniz.</p>
          )}
        </div>
      </div>
    </div>
  )
}
