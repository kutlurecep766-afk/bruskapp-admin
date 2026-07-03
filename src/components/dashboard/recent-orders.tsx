import { Card, CardHeader, CardContent } from '../ui/card'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../ui/table'
import { Badge } from '../ui/badge'

const orders = [
  { id: '#2401', customer: 'Ahmet Yılmaz', items: 'Kebap, Ayran', total: '₺340', status: 'success' as const, time: '2 dk' },
  { id: '#2400', customer: 'Zeynep Kaya', items: 'Lahmacun x2', total: '₺180', status: 'warning' as const, time: '15 dk' },
  { id: '#2399', customer: 'Mehmet Demir', items: 'Pizza, Kola', total: '₺420', status: 'success' as const, time: '28 dk' },
  { id: '#2398', customer: 'Ayşe Yıldız', items: 'Döner, Ayran', total: '₺260', status: 'info' as const, time: '45 dk' },
  { id: '#2397', customer: 'Ali Öztürk', items: 'İskender', total: '₺310', status: 'danger' as const, time: '1 sa' },
]

export default function RecentOrders() {
  return (
    <Card>
      <CardHeader><div className="flex items-center justify-between"><h3 className="text-white font-semibold">Son Siparişler</h3><button className="text-xs text-blue-400 hover:text-blue-300">Tümünü Gör</button></div></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Sipariş</TableHeaderCell>
              <TableHeaderCell>Müşteri</TableHeaderCell>
              <TableHeaderCell>Ürünler</TableHeaderCell>
              <TableHeaderCell>Tutar</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium text-white">{o.id}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell>{o.items}</TableCell>
                <TableCell>{o.total}</TableCell>
                <TableCell><Badge variant={o.status}>{o.status === 'success' ? 'Tamamlandı' : o.status === 'warning' ? 'Hazırlanıyor' : o.status === 'danger' ? 'İptal' : 'Bekliyor'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}