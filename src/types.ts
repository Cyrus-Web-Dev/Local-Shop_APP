export type Product = {
  id: string; name: string; cat: string; unit: string; barcode: string; photo: string
  cost: number; price: number; wholesale: number; wholesaleMin: number; disc: number; discType: '%' | 'Rp'
  track: boolean; stock: number; min: number; shelf: string; expiry: string; batch: string; supplier: string; note: string }
export type Item = { id: string; n: string; q: number; p: number; c: number }
export type Sale = { id: string; t: number; total: number; paid: number; items: Item[] }
export type Cfg = { name: string; addr: string; foot: string; lastBackup: number; fields: string[] }
export type Line = { id: string; q: number }
