import React, { useMemo, useState } from 'react'
import { View, ScrollView, TextInput, useWindowDimensions, Pressable, Image } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Print from 'expo-print'
import { useApp } from '../store'
import { rp, receipt, unitPrice, daysLeft } from '../format'
import { Btn, Card, Chip, Field, Sheet, T, Toast, useTheme, useToast, mono } from '../ui'
import type { Line, Sale } from '../types'
export default function Kasir() {
  const { products, cfg, checkout } = useApp(), t = useTheme(), wide = useWindowDimensions().width >= 800
  const [q, setQ] = useState(''), [cat, setCat] = useState(''), [cart, setCart] = useState<Line[]>([]), [paid, setPaid] = useState(''), [rc, setRc] = useState<Sale | null>(null), [toast, say] = useToast()
  const cats = useMemo(() => [...new Set(products.map(p => p.cat).filter(Boolean))].sort(), [products])
  const list = products.filter(p => (!cat || p.cat === cat) && p.name.toLowerCase().includes(q.toLowerCase()))
  const rows = cart.flatMap(c => { const p = products.find(x => x.id === c.id); return p ? [{ ...c, p }] : [] })
  const total = rows.reduce((a, r) => a + r.q * unitPrice(r.p, r.q), 0), pay = Number(paid) || 0
  const add = (id: string, d: number) => setCart(cs => {
    const p = products.find(x => x.id === id)!, c = cs.find(x => x.id === id), n = (c?.q ?? 0) + d
    if (d > 0 && (daysLeft(p.expiry) ?? 1) < 0) { say('Produk sudah kedaluwarsa'); return cs }
    if (d > 0 && p.track && n > p.stock) { say('Stok tidak cukup'); return cs }
    return n <= 0 ? cs.filter(x => x.id !== id) : c ? cs.map(x => (x.id === id ? { ...x, q: n } : x)) : [...cs, { id, q: n }]
  })
  const doPay = async () => { try { const s = await checkout(cart, pay); setCart([]); setPaid(''); setRc(s) } catch (e) { say((e as Error).message) } }
  const txt = rc ? receipt(rc, cfg) : ''
  return <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110, flexDirection: wide ? 'row' : 'column', gap: 14, alignItems: 'flex-start' }}>
      <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%' }}>
        <T serif s={26} style={{ marginBottom: 10 }}>Kasir</T>
        <TextInput value={q} onChangeText={setQ} placeholder="Cari produk / scan barcode…" onSubmitEditing={() => { const b = products.find(x => x.barcode && x.barcode === q.trim()); if (b) { add(b.id, 1); setQ('') } }} placeholderTextColor={t.mute} style={{ borderWidth: 1, borderColor: t.line, borderRadius: 6, padding: 10, color: t.ink, backgroundColor: t.card }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}><Chip title="Semua" on={!cat} onPress={() => setCat('')} />{cats.map(c => <Chip key={c} title={c} on={cat === c} onPress={() => setCat(c)} />)}</View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {list.map(p => <Pressable key={p.id} disabled={p.track && p.stock <= 0} onPress={() => add(p.id, 1)} style={{ width: 140, padding: 10, borderWidth: 1, borderColor: t.line, borderRadius: 6, backgroundColor: t.card, opacity: p.track && p.stock <= 0 ? 0.4 : 1 }}>
            {p.photo ? <Image source={{ uri: p.photo }} style={{ width: '100%', height: 70, borderRadius: 4, marginBottom: 6 }} /> : null}<T bold>{p.name}</T><T num>{rp(unitPrice(p, 1))}{p.unit ? ' /' + p.unit : ''}</T>
            <T s={12} mute style={(daysLeft(p.expiry) ?? 1) < 0 ? { color: t.bad } : undefined}>{(daysLeft(p.expiry) ?? 1) < 0 ? 'KEDALUWARSA' : p.track ? 'Stok ' + p.stock : 'Tanpa stok'}</T></Pressable>)}
          {!list.length && <T mute>Belum ada produk. Tambahkan di menu Produk.</T>}
        </View></View>
      <Card style={{ width: wide ? 340 : '100%' }}>
        <T serif s={18}>Keranjang</T>
        {!rows.length && <T mute style={{ paddingVertical: 12 }}>Kosong</T>}
        {rows.map(r => <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 }}>
          <View style={{ flex: 1 }}><T>{r.p.name}</T><T s={12} mute num>{rp(unitPrice(r.p, r.q))}{unitPrice(r.p, r.q) !== r.p.price ? ' (grosir/diskon)' : ''}</T></View>
          <Btn ghost title="−" onPress={() => add(r.id, -1)} style={{ minHeight: 38, paddingHorizontal: 12 }} /><T bold num>{r.q}</T><Btn ghost title="+" onPress={() => add(r.id, 1)} style={{ minHeight: 38, paddingHorizontal: 12 }} /></View>)}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: t.line, paddingTop: 10, marginTop: 6 }}><T>Total</T><T bold s={24} num>{rp(total)}</T></View>
        <Field label="Uang diterima" value={paid} onChangeText={setPaid} keyboardType="numeric" placeholder="0" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 }}>
          <Btn ghost title="Uang pas" onPress={() => setPaid(String(total))} />{[10000, 20000, 50000, 100000].map(n => <Btn key={n} ghost title={n / 1000 + 'rb'} onPress={() => setPaid(String(n))} />)}</View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T>Kembalian</T><T bold num>{rp(Math.max(0, pay - total))}</T></View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}><Btn title="Bayar" disabled={!rows.length} onPress={doPay} style={{ flex: 1 }} /><Btn ghost title="Kosongkan" onPress={() => setCart([])} /></View>
      </Card>
    </ScrollView>
    <Toast msg={toast} />
    {rc && <Sheet onClose={() => setRc(null)}><T serif s={20}>Struk</T>
      <View style={{ backgroundColor: t.bg, padding: 10, borderRadius: 6, marginVertical: 10 }}><T style={{ fontFamily: mono, fontSize: 13 }}>{txt}</T></View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Btn title="Salin (WhatsApp)" onPress={() => { Clipboard.setStringAsync(txt); say('Struk disalin') }} />
        <Btn ghost title="Cetak" onPress={() => Print.printAsync({ html: `<pre style="font:12px monospace;width:58mm">${txt.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>` })} />
        <Btn ghost title="Tutup" onPress={() => setRc(null)} /></View></Sheet>}
  </View>
}
