export interface ReceiptItem {
  name: string
  price: number
  qty: number
  note?: string
}

export interface ReceiptData {
  businessName: string
  address: string
  phone: string
  orderId: number | string
  trackingCode?: string | null
  tableNumber?: number | null
  customerName?: string
  customerContact?: string
  customerAddress?: string
  payment: string
  dateLabel: string
  items: ReceiptItem[]
  total: number
}

function esc(s: any): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

export function parseNotePayment(note?: string): string {
  const m = /Ödeme: ([^|]+)/.exec(note || '')
  return m?.[1]?.trim() || ''
}

export function parseNoteAddress(note?: string): string {
  const m = /Adres: ([^|]+)/.exec(note || '')
  return m?.[1]?.trim() || ''
}

export function buildReceiptHtml(d: ReceiptData): string {
  const fmt = (n: number) => '₺' + (isFinite(n) ? n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00')
  const sep = '<div class="sep"></div>'
  const items = d.items.map(it => `
      <div class="item">
        <div class="item-top"><span>${esc(it.name)}</span><span>${fmt(it.price * it.qty)}</span></div>
        <div class="item-meta">${it.qty} x ${fmt(it.price)}${it.note ? ' &mdash; ' + esc(it.note) : ''}</div>
      </div>
    `).join('')

  const rows: string[] = []
  rows.push(`<div class="head">${esc(d.businessName)}</div>`)
  rows.push(`<div class="tag">${esc(d.payment === 'Garson Çağrı' ? 'GARSON ÇAĞRI' : 'BİLGİ FİŞİ')}</div>`)
  if (d.address) rows.push(`<div class="sub">${esc(d.address)}</div>`)
  if (d.phone) rows.push(`<div class="sub">Tel: ${esc(d.phone)}</div>`)
  rows.push(sep)
  rows.push(`<div class="kv"><span>Sipariş No</span><span>#${esc(d.orderId)}</span></div>`)
  if (d.trackingCode) rows.push(`<div class="kv"><span>Takip Kodu</span><span>${esc(d.trackingCode)}</span></div>`)
  rows.push(`<div class="kv"><span>Tarih</span><span>${esc(d.dateLabel)}</span></div>`)
  if (d.tableNumber) rows.push(`<div class="kv"><span>Masa</span><span>${esc(d.tableNumber)}</span></div>`)
  if (d.customerName) rows.push(`<div class="kv"><span>Müşteri</span><span>${esc(d.customerName)}</span></div>`)
  if (d.customerContact) rows.push(`<div class="kv"><span>Telefon</span><span>${esc(d.customerContact)}</span></div>`)
  if (d.customerAddress) rows.push(`<div class="kv"><span>Adres</span><span>${esc(d.customerAddress)}</span></div>`)
  rows.push(sep)
  rows.push('<div class="items">' + items + '</div>')
  rows.push(sep)
  rows.push(`<div class="total"><span>TOPLAM</span><span>${fmt(d.total)}</span></div>`)
  if (d.payment && d.payment !== 'Garson Çağrı') rows.push(`<div class="kv"><span>Ödeme</span><span>${esc(d.payment)}</span></div>`)
  rows.push(sep)
  rows.push('<div class="footer">Bizi tercih ettiğiniz için teşekkür ederiz!</div>')

  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(d.payment === 'Garson Çağrı' ? 'Garson Çağrı' : 'Bilgi Fişi')} #${esc(d.orderId)}</title><style>
    @page { size: 80mm auto; margin: 0; }
    body { margin: 0; padding: 20px 12px; background: #fff; color: #111; width: 300px; font-family: ui-monospace, 'Cascadia Mono', 'Segoe UI Mono', 'Courier New', monospace; }
    .head { text-align: center; font-size: 17px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
    .tag { text-align: center; font-size: 9px; letter-spacing: 2px; color: #666; margin: 3px 0 6px; }
    .sub { text-align: center; font-size: 11px; color: #333; margin-top: 2px; }
    .sep { border-top: 1px dashed #999; margin: 10px 0; }
    .kv { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; padding: 2px 0; }
    .item { padding: 3px 0; }
    .item-top { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; font-weight: 700; }
    .item-meta { font-size: 10px; color: #555; }
    .total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; padding-top: 2px; }
    .footer { text-align: center; font-size: 10px; color: #777; margin-top: 4px; }
  </style></head><body>${rows.join('')}</body></html>`
}

export function openReceiptPdf(d: ReceiptData) {
  const html = buildReceiptHtml(d)
  const w = window.open('', '_blank', 'width=420,height=700')
  if (!w) {
    alert('Lütfen pop-up engelleyicisini açın')
    return
  }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => { try { w.print() } catch {} }, 500)
}

let systemPrintFrame: HTMLIFrameElement | null = null

export function printReceiptSystem(d: ReceiptData) {
  const html = buildReceiptHtml(d)
  try {
    if (!systemPrintFrame) {
      systemPrintFrame = document.createElement('iframe')
      systemPrintFrame.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;'
      document.body.appendChild(systemPrintFrame)
    }
    const doc = systemPrintFrame.contentDocument
    if (doc) {
      doc.open()
      doc.write(html)
      doc.close()
    }
    setTimeout(() => {
      try {
        systemPrintFrame?.contentWindow?.focus()
        systemPrintFrame?.contentWindow?.print()
      } catch {}
    }, 300)
  } catch {}
}