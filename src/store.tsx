import React, { createContext, useContext, useEffect, useState } from 'react'
import { kvAll, kvSetMany } from './storage'
import { blankProduct, monthKey, uid, unitPrice, PRESETS } from './format'
import type { Cfg, Line, Product, Sale, Item } from './types'
const DEF: Cfg = { name: 'Toko Saya', addr: '', foot: 'Terima kasih sudah berbelanja!', lastBackup: 0, fields: PRESETS['Toko umum'] }
type Ctx = { ready: boolean; products: Product[]; sales: Sale[]; cfg: Cfg; reload(): Promise<void>
  saveProduct(p: Product): Promise<void>; removeProduct(id: string): Promise<void>
  checkout(cart: Line[], paid: number): Promise<Sale>; saveCfg(c: Cfg): Promise<void> }
const C = createContext<Ctx>(null as unknown as Ctx)
export const useApp = () => useContext(C)
export function Provider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false), [products, setProducts] = useState<Product[]>([]), [sales, setSales] = useState<Sale[]>([]), [cfg, setCfg] = useState<Cfg>(DEF)
  const reload = async () => {
    const all = await kvAll()
    setProducts((JSON.parse(all.products ?? '[]') as Product[]).map(p => ({ ...blankProduct(), ...p }))); setCfg({ ...DEF, ...JSON.parse(all.cfg ?? '{}') })
    setSales(Object.entries(all).filter(([k]) => k.startsWith('sales:')).flatMap(([, v]) => JSON.parse(v) as Sale[]).sort((a, b) => b.t - a.t))
    setReady(true)
  }
  useEffect(() => { reload() }, [])
  const saveProduct = async (p: Product) => {
    const np = products.some(x => x.id === p.id) ? products.map(x => (x.id === p.id ? p : x)) : [...products, p]
    await kvSetMany({ products: JSON.stringify(np) }); setProducts(np)
  }
  const removeProduct = async (id: string) => { const np = products.filter(x => x.id !== id); await kvSetMany({ products: JSON.stringify(np) }); setProducts(np) }
  const saveCfg = async (c: Cfg) => { await kvSetMany({ cfg: JSON.stringify(c) }); setCfg(c) }
  const checkout = async (cart: Line[], paid: number) => {
    const np = products.map(p => ({ ...p })), items: Item[] = []
    for (const c of cart) {
      const p = np.find(x => x.id === c.id); if (!p) continue
      if (p.track && p.stock < c.q) throw new Error(`Stok ${p.name} tidak cukup`)
      if (p.track) p.stock -= c.q
      items.push({ id: p.id, n: p.name, q: c.q, p: unitPrice(p, c.q), c: p.cost })
    }
    const total = items.reduce((a, i) => a + i.p * i.q, 0)
    if (!items.length) throw new Error('Keranjang kosong')
    if (paid < total) throw new Error('Uang diterima kurang')
    const sale: Sale = { id: uid(), t: Date.now(), total, paid, items }, key = monthKey(sale.t)
    const month = [sale, ...sales.filter(s => monthKey(s.t) === key)]
    await kvSetMany({ products: JSON.stringify(np), [key]: JSON.stringify(month) })   // atomik: stok + penjualan
    setProducts(np); setSales([sale, ...sales]); return sale
  }
  return <C.Provider value={{ ready, products, sales, cfg, reload, saveProduct, removeProduct, checkout, saveCfg }}>{children}</C.Provider>
}
