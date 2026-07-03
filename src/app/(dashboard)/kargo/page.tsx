'use client'
import { useState, useEffect } from 'react'
import { Truck, CheckCircle, AlertCircle, Copy, EyeOff, Eye, Wallet, Loader2, Plus, MapPin, DollarSign } from 'lucide-react'

type Tab = 'connect' | 'fiyat' | 'adresler' | 'gonderi' | 'takip' | 'cuzdan'

export default function KargoPage() {
  const [tab, setTab] = useState<Tab>('connect')
  const [mesaj, setMesaj] = useState<{ tip: 'success' | 'error'; yazi: string } | null>(null)
  const [kaydediyor, setKaydediyor] = useState(false)
  const [bagli, setBagli] = useState(false)

  // Auth
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Providers
  const [firmalar, setFirmalar] = useState<any[]>([])
  const [firmaYukleniyor, setFirmaYukleniyor] = useState(false)

  // Price calc
  const [hesapDesi, setHesapDesi] = useState('5')
  const [hesapSonuc, setHesapSonuc] = useState<any[]>([])
  const [hesapYukleniyor, setHesapYukleniyor] = useState(false)

  // Addresses
  const [adresler, setAdresler] = useState<any[]>([])
  const [adresForm, setAdresForm] = useState({ title: '', name: '', surname: '', phone: '', email: '', city: '', district: '', fullAddress: '', zipCode: '' })
  const [adresEkle, setAdresEkle] = useState(false)
  const [adresYukleniyor, setAdresYukleniyor] = useState(false)
  const [adresKaydediyor, setAdresKaydediyor] = useState(false)

  // Shipment
  const [gonderiForm, setGonderiForm] = useState({ baslik: '', firmaKodu: '', gonderenAdresId: '', aliciAdresId: '', desi: '1', en: '0.01', boy: '0.01', derinlik: '0.01', agirlik: '0.5' })
  const [gonderiSonuc, setGonderiSonuc] = useState<any>(null)
  const [gonderiYukleniyor, setGonderiYukleniyor] = useState(false)

  // Track
  const [takipNo, setTakipNo] = useState('')
  const [takipSonuc, setTakipSonuc] = useState<any>(null)
  const [takipYukleniyor, setTakipYukleniyor] = useState(false)

  // Wallet
  const [cuzdan, setCuzdan] = useState<any>(null)
  const [cuzdanYukleniyor, setCuzdanYukleniyor] = useState(false)
  const [gonderiler, setGonderiler] = useState<any[]>([])
  const [gonderiGecmisYukleniyor, setGonderiGecmisYukleniyor] = useState(false)

  useEffect(() => {
    fetch('/api/kargomucuz/status', { credentials: 'include' })
      .then(r => r.json()).then(d => {
        setBagli(d.success);
        if (d.success) { firmalariYukle(); adresleriYukle(); gonderiGecmisiniYukle(); cuzdaniYukle() }
      })
      .catch(() => {})
  }, [])

  const firmalariYukle = async () => {
    setFirmaYukleniyor(true)
    const r = await fetch('/api/kargomucuz/providers', { credentials: 'include' })
    const d = await r.json()
    if (Array.isArray(d)) setFirmalar(d.filter((f: any) => f.isActive))
    setFirmaYukleniyor(false)
  }

  const adresleriYukle = async () => {
    setAdresYukleniyor(true)
    const r = await fetch('/api/kargomucuz/addresses', { credentials: 'include' })
    const d = await r.json()
    if (Array.isArray(d)) setAdresler(d)
    setAdresYukleniyor(false)
  }

  const gonderiGecmisiniYukle = async () => {
    setGonderiGecmisYukleniyor(true)
    const r = await fetch('/api/kargomucuz/shipments', { credentials: 'include' })
    const d = await r.json()
    if (Array.isArray(d)) setGonderiler(d)
    setGonderiGecmisYukleniyor(false)
  }

  const cuzdaniYukle = async () => {
    setCuzdanYukleniyor(true)
    try { const r = await fetch('/api/kargomucuz/wallet', { credentials: 'include' }); const d = await r.json(); setCuzdan(d) } catch {}
    setCuzdanYukleniyor(false)
  }

  const baglan = async () => {
    setKaydediyor(true); setMesaj(null)
    const r = await fetch('/api/kargomucuz/connect', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const d = await r.json()
    if (d.success) { setBagli(true); setMesaj({ tip: 'success', yazi: 'Bağlantı başarılı' }); firmalariYukle(); adresleriYukle(); gonderiGecmisiniYukle(); cuzdaniYukle() }
    else setMesaj({ tip: 'error', yazi: d.message || 'Bağlantı başarısız' })
    setKaydediyor(false)
  }

  const fiyatHesapla = async () => {
    setHesapYukleniyor(true); setHesapSonuc([])
    const sonuclar: any[] = []
    for (const f of firmalar) {
      try {
        const r = await fetch('/api/kargomucuz/price?provider=' + f.providerServiceCode + '&desi=' + hesapDesi, { credentials: 'include' })
        const d = await r.json()
        const data = Array.isArray(d) ? d : d?.data ? [d.data] : [d]
        data.forEach((item: any) => sonuclar.push({ ...item, title: f.title, imageUrl: f.imageUrl, providerServiceCode: f.providerServiceCode }))
      } catch {}
    }
    setHesapSonuc(sonuclar.sort((a: any, b: any) => (a.amount || 0) - (b.amount || 0)))
    setHesapYukleniyor(false)
  }

  const adresKaydet = async () => {
    setAdresKaydediyor(true); setMesaj(null)
    const r = await fetch('/api/kargomucuz/address', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adresForm),
    })
    const d = await r.json()
    if (d?.data || d?._id) { setMesaj({ tip: 'success', yazi: 'Adres kaydedildi' }); setAdresEkle(false); setAdresForm({ title: '', name: '', surname: '', phone: '', email: '', city: '', district: '', fullAddress: '', zipCode: '' }); adresleriYukle() }
    else setMesaj({ tip: 'error', yazi: d.message || 'Kaydedilemedi' })
    setAdresKaydediyor(false)
  }

  const gonderiOlustur = async () => {
    setGonderiYukleniyor(true); setMesaj(null); setGonderiSonuc(null)
    const r = await fetch('/api/kargomucuz/shipment', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: gonderiForm.baslik, providerServiceCode: gonderiForm.firmaKodu, selectedSenderAddressId: gonderiForm.gonderenAdresId, selectedReceiverAddressId: gonderiForm.aliciAdresId, packageInfo: { desiOrKg: gonderiForm.desi, width: gonderiForm.en, height: gonderiForm.boy, depth: gonderiForm.derinlik, weight: gonderiForm.agirlik } }),
    })
    const d = await r.json()
    if (r.ok) { setGonderiSonuc(d); setMesaj({ tip: 'success', yazi: 'Kargo oluşturuldu!' }); gonderiGecmisiniYukle() }
    else setMesaj({ tip: 'error', yazi: d.message || 'Hata' })
    setGonderiYukleniyor(false)
  }

  const sorgula = async () => {
    if (!takipNo) return; setTakipYukleniyor(true); setTakipSonuc(null)
    const r = await fetch('/api/kargomucuz/track/' + takipNo, { credentials: 'include' })
    setTakipSonuc(await r.json()); setTakipYukleniyor(false)
  }

  const enUcuzFirma = (hesapSonuc.length > 0 ? hesapSonuc.reduce((min: any, f: any) => (f.amount || 0) < (min.amount || Infinity) ? f : min, hesapSonuc[0]) : null)

  const sekmeler: { key: Tab; label: string }[] = [
    { key: 'connect', label: 'Bağlantı' },
    { key: 'fiyat', label: 'Fiyat Hesapla' },
    { key: 'adresler', label: 'Adresler' },
    { key: 'gonderi', label: 'Kargo Oluştur' },
    { key: 'takip', label: 'Takip' },
    { key: 'cuzdan', label: 'Cüzdan' },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Kargo</h1><p className="text-sm text-gray-500 mt-1">KargoMucuz ile akıllı kargo yönetimi</p></div>
      {bagli && (
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl shadow-sm shadow-emerald-500/5">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle size={18} className="text-emerald-400" /></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-300">KargoMucuz Bağlı</p>
            <p className="text-xs text-emerald-500/70 mt-0.5">{email ? email : 'API ile bağlı'} · {firmalar.length} kargo firması</p>
          </div>
          {hesapSonuc.length > 0 && enUcuzFirma && (
            <div className="text-right">
              <p className="text-xs text-gray-500">En ucuz</p>
              <p className="text-sm font-semibold text-emerald-400">{enUcuzFirma.amount} {enUcuzFirma.currency?.toUpperCase()}</p>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-1 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl p-1 w-fit overflow-x-auto">
        {sekmeler.map(s => (
          <button key={s.key} onClick={() => setTab(s.key)} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ' + (tab === s.key ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white')}>{s.label}</button>
        ))}
      </div>
      {mesaj && (
        <div className={'flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ' + (mesaj.tip === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
          {mesaj.tip === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}{mesaj.yazi}
        </div>
      )}

      {tab === 'connect' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4 max-w-lg">
          <p className="text-xs text-gray-500">KargoMucuz panel bilgilerinizle giriş yapın.</p>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">E-posta</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm" placeholder="ornek@mail.com" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Şifre</label><div className="relative"><input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm pr-10" /><button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <button onClick={baglan} disabled={kaydediyor || !email || !password} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">{kaydediyor ? 'Bağlanıyor...' : bagli ? 'Yeniden Bağlan' : 'Bağlan'}</button>
        </div>
      )}

      {tab === 'fiyat' && (
        <div className="space-y-4">
          <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
            {!bagli ? <p className="text-amber-400 text-sm">Önce bağlanın.</p> : (
              <>
                <div className="flex gap-3 items-end">
                  <div className="flex-1"><label className="block text-sm font-medium text-gray-400 mb-1">Desi / Kg</label><input type="number" step="0.5" min="0.5" value={hesapDesi} onChange={e => setHesapDesi(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm" /></div>
                  <button onClick={fiyatHesapla} disabled={hesapYukleniyor || firmalar.length === 0} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"><DollarSign size={16} />{hesapYukleniyor ? 'Hesaplanıyor...' : 'Tüm Firmaları Karşılaştır'}</button>
                </div>
                {hesapSonuc.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-500">{hesapDesi} desi için {hesapSonuc.length} sonuç · En ucuz: <span className="text-emerald-400 font-medium">{enUcuzFirma?.title} — {enUcuzFirma?.amount} {enUcuzFirma?.currency?.toUpperCase()}</span></p>
                    {hesapSonuc.map((f: any, i: number) => (
                      <div key={i} className={'flex items-center gap-3 p-3 rounded-xl border ' + (i === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#080b12] border-[#1a2332]')}>
                        {f.imageUrl && <img src={f.imageUrl} alt={f.title} className="w-8 h-8 object-contain rounded" />}
                        <div className="flex-1"><p className="text-white text-sm font-medium">{f.title}</p><p className="text-xs text-gray-500">{f.cost ? 'Maliyet: ' + f.cost : ''} {f.profit ? ' · Kar: ' + f.profit : ''}</p></div>
                        <div className="text-right"><p className={'text-sm font-bold ' + (i === 0 ? 'text-emerald-400' : 'text-white')}>{f.amount} {f.currency?.toUpperCase()}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'adresler' && (
        <div className="space-y-4">
          <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2"><MapPin size={16} />Adreslerim</h3>
              <button onClick={() => setAdresEkle(!adresEkle)} className="text-xs px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 flex items-center gap-1"><Plus size={12} />{adresEkle ? 'İptal' : 'Yeni Adres'}</button>
            </div>
            {adresEkle && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 bg-[#080b12] rounded-xl border border-[#1a2332]">
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Adres Başlığı</label><input type="text" value={adresForm.title} onChange={e => setAdresForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 bg-[#0d1117] border border-[#1a2332] rounded-lg text-white text-sm" placeholder="Evim / İşim" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Ad Soyad</label><input type="text" value={adresForm.name + ' ' + adresForm.surname} onChange={e => { const [n, ...s] = e.target.value.split(' '); setAdresForm(f => ({ ...f, name: n, surname: s.join(' ') })) }} className="w-full px-3 py-2 bg-[#0d1117] border border-[#1a2332] rounded-lg text-white text-sm" placeholder="Ahmet Yılmaz" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Telefon</label><input type="text" value={adresForm.phone} onChange={e => setAdresForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 bg-[#0d1117] border border-[#1a2332] rounded-lg text-white text-sm" placeholder="+905321234567" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">E-posta</label><input type="email" value={adresForm.email} onChange={e => setAdresForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 bg-[#0d1117] border border-[#1a2332] rounded-lg text-white text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Şehir</label><input type="text" value={adresForm.city} onChange={e => setAdresForm(f => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2 bg-[#0d1117] border border-[#1a2332] rounded-lg text-white text-sm" placeholder="İstanbul" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">İlçe</label><input type="text" value={adresForm.district} onChange={e => setAdresForm(f => ({ ...f, district: e.target.value }))} className="w-full px-3 py-2 bg-[#0d1117] border border-[#1a2332] rounded-lg text-white text-sm" placeholder="Kadıköy" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-400 mb-1">Açık Adres</label><textarea value={adresForm.fullAddress} onChange={e => setAdresForm(f => ({ ...f, fullAddress: e.target.value }))} className="w-full px-3 py-2 bg-[#0d1117] border border-[#1a2332] rounded-lg text-white text-sm h-16" /></div>
                <div className="md:col-span-2"><button onClick={adresKaydet} disabled={adresKaydediyor || !adresForm.name || !adresForm.fullAddress} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-sm disabled:opacity-50">{adresKaydediyor ? 'Kaydediliyor...' : 'Adresi Kaydet'}</button></div>
              </div>
            )}
            {adresYukleniyor ? <p className="text-gray-500 text-sm">Yükleniyor...</p> : adresler.length === 0 ? <p className="text-gray-500 text-sm">Henüz adres eklenmemiş. Kargo oluşturmak için önce adres ekleyin.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{adresler.map((a: any) => (
                <div key={a._id} className="bg-[#080b12] border border-[#1a2332] rounded-xl p-4">
                  <p className="text-white text-sm font-medium">{a.title || a.name} {a.surname}</p>
                  <p className="text-xs text-gray-500 mt-1">{a.fullAddress || a.address}, {a.district}/{a.city}</p>
                  <p className="text-xs text-gray-600 mt-1">{a.phone || ''} {a.email ? '· ' + a.email : ''}</p>
                </div>
              ))}</div>
            )}
          </div>
        </div>
      )}

      {tab === 'gonderi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Gönderi Bilgileri</h3>
            {!bagli ? <p className="text-amber-400 text-sm">Önce bağlanın.</p> : (
              <>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Başlık</label><input type="text" value={gonderiForm.baslik} onChange={e => setGonderiForm(f => ({ ...f, baslik: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm" placeholder="Sipariş #123" /></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Kargo Firması</label><select value={gonderiForm.firmaKodu} onChange={e => setGonderiForm(f => ({ ...f, firmaKodu: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm">{firmalar.map(f => (<option key={f._id} value={f.providerServiceCode}>{f.title}</option>))}</select></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Gönderici Adresi</label><select value={gonderiForm.gonderenAdresId} onChange={e => setGonderiForm(f => ({ ...f, gonderenAdresId: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm"><option value="">Seçin</option>{adresler.map(a => (<option key={a._id} value={a._id}>{a.title || a.name} - {a.city}</option>))}</select></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Alıcı Adresi</label><select value={gonderiForm.aliciAdresId} onChange={e => setGonderiForm(f => ({ ...f, aliciAdresId: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm"><option value="">Seçin</option>{adresler.map(a => (<option key={a._id} value={a._id}>{a.title || a.name} - {a.city}</option>))}</select></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Desi</label><input type="text" value={gonderiForm.desi} onChange={e => setGonderiForm(f => ({ ...f, desi: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">En (cm)</label><input type="text" value={gonderiForm.en} onChange={e => setGonderiForm(f => ({ ...f, en: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Boy (cm)</label><input type="text" value={gonderiForm.boy} onChange={e => setGonderiForm(f => ({ ...f, boy: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Derinlik (cm)</label><input type="text" value={gonderiForm.derinlik} onChange={e => setGonderiForm(f => ({ ...f, derinlik: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Ağırlık (kg)</label><input type="text" value={gonderiForm.agirlik} onChange={e => setGonderiForm(f => ({ ...f, agirlik: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm" /></div>
                </div>
                {cuzdan && typeof cuzdan?.balance === 'number' && cuzdan.balance < 50 && (
                  <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs flex items-center gap-2"><AlertCircle size={12} />Bakiyeniz düşük ({cuzdan.balance} TL). Kargo oluşturmak için <a href="https://app.kargomucuz.com" target="_blank" rel="noopener noreferrer" className="underline text-amber-300">bakiye yükleyin</a>.</div>
                )}
                <button onClick={gonderiOlustur} disabled={gonderiYukleniyor || !gonderiForm.firmaKodu || !gonderiForm.gonderenAdresId || !gonderiForm.aliciAdresId} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium disabled:opacity-50">{gonderiYukleniyor ? <><Loader2 size={16} className="inline animate-spin mr-2" />Oluşturuluyor...</> : 'Kargo Oluştur'}</button>
              </>
            )}
          </div>
          {gonderiSonuc && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-medium text-emerald-400">Kargo Oluşturuldu</h3>
              {Object.entries(gonderiSonuc).map(([k, v]) => (<div key={k} className="flex justify-between text-sm"><span className="text-gray-500">{k}</span><span className="text-white font-mono text-xs">{String(v)}</span></div>))}
              <button onClick={() => navigator.clipboard.writeText(gonderiSonuc.shipmentTransactionId || '')} className="px-4 py-2 bg-white/5 border border-[#1a2332] rounded-xl text-sm text-gray-400 hover:text-white"><Copy size={14} className="inline mr-1" />Kopyala</button>
            </div>
          )}
        </div>
      )}

      {tab === 'takip' && (
        <div className="space-y-4">
          <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 flex gap-3">
            <input type="text" value={takipNo} onChange={e => setTakipNo(e.target.value)} className="flex-1 px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm" placeholder="Takip numarası girin" />
            <button onClick={sorgula} disabled={takipYukleniyor || !takipNo} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">{takipYukleniyor ? 'Sorgulanıyor...' : 'Sorgula'}</button>
          </div>
          {takipSonuc && <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6"><pre className="text-xs text-gray-400 overflow-x-auto">{JSON.stringify(takipSonuc, null, 2)}</pre></div>}
        </div>
      )}

      {tab === 'cuzdan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2"><Wallet size={16} />Cüzdan</h3>
            <div className="space-y-3">
              {cuzdanYukleniyor ? <p className="text-gray-500 text-sm">Yükleniyor...</p> : cuzdan ? (
                <div className="space-y-2 bg-[#080b12] rounded-xl p-4 border border-[#1a2332]">
                  {Object.entries(cuzdan).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="text-white font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 bg-[#080b12] rounded-xl p-4 border border-[#1a2332]">Bilgi alınamadı</p>
              )}
              <a href="https://app.kargomucuz.com" target="_blank" rel="noopener noreferrer" className="block w-full text-center px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">Bakiye Yükle</a>
            </div>
          </div>
          <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Gönderi Geçmişi</h3>
            {gonderiGecmisYukleniyor ? <p className="text-gray-500 text-sm">Yükleniyor...</p> : gonderiler.length === 0 ? <p className="text-gray-500 text-sm">Henüz gönderi yok</p> : (
              <div className="space-y-2 max-h-80 overflow-y-auto">{gonderiler.map((s: any, i: number) => (<div key={i} className="bg-[#080b12] border border-[#1a2332] rounded-lg p-3 text-xs"><p className="text-white truncate">{s.title || s._id}</p><p className="text-gray-500">{s.providerServiceCode}</p></div>))}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
