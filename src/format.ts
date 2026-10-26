import type { Cfg, Product, Sale } from './types'
export const rp = (n: number) => 'Rp' + Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
export const monthKey = (t: number) => { const d = new Date(t); return `sales:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
export const fmtDate = (t: number) => new Date(t).toLocaleString('id-ID')
export function receipt(s: Sale, c: Cfg) {
  const L = [c.name, c.addr, fmtDate(s.t), '-'.repeat(32)]
  s.items.forEach(i => L.push(i.n, `  ${i.q} x ${rp(i.p)}  = ${rp(i.q * i.p)}`))
  L.push('-'.repeat(32), 'TOTAL   ' + rp(s.total), 'Bayar   ' + rp(s.paid), 'Kembali ' + rp(s.paid - s.total), '', c.foot)
  return L.join('\n')
}

export const blankProduct = (): Product => ({ id: '', name: '', cat: '', unit: '', barcode: '', photo: '', cost: 0, price: 0, wholesale: 0, wholesaleMin: 0, disc: 0, discType: '%',
  track: true, stock: 0, min: 0, shelf: '', expiry: '', batch: '', supplier: '', note: '' })
// Harga satuan efektif: grosir (bila qty >= minimum) lalu dikurangi diskon.
export function unitPrice(p: Product, q: number) {
  const base = p.wholesale > 0 && p.wholesaleMin > 0 && q >= p.wholesaleMin ? p.wholesale : p.price
  const off = p.disc > 0 ? (p.discType === '%' ? (base * p.disc) / 100 : p.disc) : 0
  return Math.max(0, Math.round(base - off))
}
export const daysLeft = (e?: string) => { if (!e) return null; const t = Date.parse(e + 'T23:59:59'); return isNaN(t) ? null : Math.floor((t - Date.now()) / 864e5) }
// Kolom opsional di form produk. Pemilik memilih sesuai jenis usaha (Setelan).
export const FIELDS: [string, string][] = [['barcode', 'Barcode'], ['unit', 'Satuan'], ['photo', 'Foto'], ['wholesale', 'Harga grosir'], ['disc', 'Diskon'],
  ['shelf', 'Posisi rak'], ['expiry', 'Tgl kedaluwarsa'], ['batch', 'Batch / No. seri'], ['supplier', 'Supplier'], ['note', 'Catatan']]
export const PRESETS: Record<string, string[]> = {
  'Toko umum': ['barcode', 'unit', 'photo', 'wholesale', 'shelf', 'expiry', 'supplier'],
  'Makanan & minuman': ['unit', 'photo', 'disc', 'expiry', 'note'],
  'Elektronik': ['barcode', 'photo', 'disc', 'batch', 'supplier', 'note'],
  'Fashion & lainnya': ['barcode', 'unit', 'photo', 'wholesale', 'disc', 'shelf', 'note'],
  'Jasa & laundry': ['unit', 'disc', 'note'],
  'Semua kolom': FIELDS.map(f => f[0]) }
