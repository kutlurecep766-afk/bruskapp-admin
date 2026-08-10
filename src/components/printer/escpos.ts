const ESC = 0x1b
const GS = 0x1d

const tr = (s: string): string =>
  (s || '')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C')

function append(out: number[], text: string) {
  for (const ch of tr(text)) out.push(ch.charCodeAt(0))
}

function lines(out: number[], texts: string[]) {
  for (const t of texts) {
    append(out, t)
    out.push(0x0a)
  }
}

export function buildTestReceipt(shopName = 'BRUSKAPP'): Uint8Array {
  const out: number[] = []
  out.push(ESC, 0x40) // init

  lines(out, ['' ])
  out.push(ESC, 0x61, 0x01) // center
  out.push(ESC, 0x21, 0x30) // double height+width
  lines(out, [shopName])
  out.push(ESC, 0x21, 0x00)
  lines(out, ['TEST FISI'])
  lines(out, ['------------------------------'])
  out.push(ESC, 0x61, 0x00) // left
  lines(out, ['Yazici baglantiniz basarili.'])
  lines(out, ['Bu fis, yazicinin duzgun'])
  lines(out, ['calistigini dogrular.'])
  lines(out, [''])
  lines(out, ['Bruskapp QR Menu'])
  out.push(ESC, 0x61, 0x01)
  lines(out, ['------------------------------'])
  out.push(ESC, 0x21, 0x10)
  lines(out, ['TEST BASARILI'])
  out.push(ESC, 0x21, 0x00)
  lines(out, [''])
  out.push(ESC, 0x61, 0x00)
  append(out, new Date().toLocaleString('tr-TR'))
  out.push(0x0a)
  lines(out, [''])
  out.push(GS, 0x56, 0x00) // cut
  return new Uint8Array(out)
}

export function buildOrderReceipt(
  order: any,
  shopName = 'BRUSKAPP',
  shopAddress?: string,
): Uint8Array {
  const out: number[] = []
  out.push(ESC, 0x40)

  lines(out, [''])
  out.push(ESC, 0x61, 0x01)
  out.push(ESC, 0x21, 0x30)
  lines(out, [shopName])
  out.push(ESC, 0x21, 0x00)
  if (shopAddress) {
    lines(out, [shopAddress])
  }
  lines(out, ['------------------------------'])

  out.push(ESC, 0x61, 0x00)
  const platform = order.platform || 'Masa'
  lines(out, [
    `#${order.id} - ${platform}`,
  ])
  lines(out, [`Masa: ${order.tableNumber || '-'}`])
  lines(out, [`Musteri: ${order.customerName || '-'}`])
  if (order.customerContact) lines(out, [`Tel: ${order.customerContact}`])
  if (order.customerAddress) lines(out, [`Adres: ${order.customerAddress}`])
  if (order.customerPhone) lines(out, [`Tel: ${order.customerPhone}`])
  append(out, `Tarih: ${new Date(order.createdAt || Date.now()).toLocaleString('tr-TR')}`)
  out.push(0x0a)
  lines(out, ['------------------------------'])

  out.push(ESC, 0x21, 0x10)
  append(out, 'Urun'.padEnd(22) + 'Adet'.padEnd(6) + 'Tutar')
  out.push(0x0a)
  out.push(ESC, 0x21, 0x00)
  lines(out, ['------------------------------'])

  for (const p of order.products || []) {
    const name = String(p.name || '').substring(0, 20)
    const qty = String(p.quantity ?? 1)
    const price = ((p.price || 0) * (p.quantity ?? 1)).toFixed(2)
    append(out, name.padEnd(22) + qty.padEnd(6) + price)
    out.push(0x0a)
    if (p.note) {
      out.push(ESC, 0x21, 0x01)
      append(out, '  Not: ' + String(p.note).substring(0, 40))
      out.push(0x0a)
      out.push(ESC, 0x21, 0x00)
    }
  }

  lines(out, ['------------------------------'])
  out.push(ESC, 0x61, 0x01)
  out.push(ESC, 0x21, 0x10)
  append(out, `TOPLAM: ${(order.totalAmount || 0).toFixed(2)} TL`)
  out.push(0x0a)
  out.push(ESC, 0x21, 0x00)
  lines(out, [''])
  lines(out, [order.note ? `Genel Not: ${String(order.note).substring(0, 60)}` : ''])
  lines(out, [''])
  lines(out, [order.platform === 'Garson Çağrı' ? 'GARSON CAGRI' : 'SIPARIS'])
  lines(out, [''])
  out.push(GS, 0x56, 0x00)
  return new Uint8Array(out)
}
