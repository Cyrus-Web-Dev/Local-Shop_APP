import React, { useState } from 'react'
import { View, ScrollView, Switch, Image, TextInput, Platform } from 'react-native'
import { useApp } from '../store'
import { rp, uid, blankProduct, daysLeft } from '../format'
import { pickPhoto } from '../photo'
import { Ask, AskCfg, Btn, Card, Chip, Field, Sheet, T, Toast, useTheme, useToast } from '../ui'
import type { Product } from '../types'
const UNITS = ['pcs', 'kg', 'porsi', 'pak', 'liter', 'box']
const nv = (n: number) => (n ? String(n) : '')
export default function Produk() {
  const { products, cfg, saveProduct, removeProduct } = useApp(), t = useTheme(), [toast, say] = useToast()
  const [f, setF] = useState<Product | null>(null), [tab, setTab] = useState(0), [q, setQ] = useState(''), [ask, setAsk] = useState<AskCfg | null>(null)
  const show = (k: string) => cfg.fields.includes(k)
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setF(x => (x ? { ...x, [k]: v } : x))
  const num = (k: keyof Product) => (s: string) => set(k, Number(s.replace(/[^0-9]/g, '') || 0) as never)
  const open = (p: Product) => { setF(p); setTab(0) }
  const save = async () => {
    if (!f) return
    if (!f.name.trim()) { setTab(0); return say('Nama produk wajib diisi') }
    if (f.expiry && daysLeft(f.expiry) === null) { setTab(1); return say('Format tanggal: 2026-12-31') }
    await saveProduct({ ...f, id: f.id || uid(), name: f.name.trim(), cat: f.cat.trim() }); setF(null)
  }
  const list = products.filter(p => [p.name, p.barcode, p.cat, p.shelf].join(' ').toLowerCase().includes(q.toLowerCase()))
  return <View style={{ flex: 1 }}><ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} keyboardShouldPersistTaps="handled">
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}><T serif s={26}>Produk</T><Btn title="+ Tambah" onPress={() => open(blankProduct())} /></View>
    <TextInput value={q} onChangeText={setQ} placeholder="Cari nama, barcode, kategori, rak…" placeholderTextColor={t.mute} style={{ borderWidth: 1, borderColor: t.line, borderRadius: 6, padding: 10, color: t.ink, backgroundColor: t.card, marginBottom: 10 }} />
    {list.map(p => { const d = daysLeft(p.expiry), low = p.track && p.stock <= p.min
      return <Card key={p.id} onPress={() => open({ ...blankProduct(), ...p })} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {p.photo ? <Image source={{ uri: p.photo }} style={{ width: 52, height: 52, borderRadius: 6 }} /> : <View style={{ width: 52, height: 52, borderRadius: 6, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}><T s={22}>📦</T></View>}
        <View style={{ flex: 1 }}><T bold>{p.name}</T><T s={12} mute>{[p.cat, p.unit, p.shelf && 'Rak ' + p.shelf, p.barcode].filter(Boolean).join(' · ') || 'Tanpa kategori'}</T>
          {(d !== null && d <= 30) || low ? <T s={12} style={{ color: t.bad }}>{[d !== null && d <= 30 && (d < 0 ? 'Kedaluwarsa' : `Exp ${d} hari`), low && 'Stok menipis'].filter(Boolean).join(' · ')}</T> : null}</View>
        <View style={{ alignItems: 'flex-end' }}><T num>{rp(p.price)}</T><T s={12} num mute>{p.track ? 'Stok ' + p.stock : 'Tanpa stok'}</T></View></Card> })}
    {!list.length && <T mute>{products.length ? 'Tidak ditemukan.' : 'Belum ada produk.'}</T>}</ScrollView>
    <Toast msg={toast} />
    {f && <Sheet onClose={() => setF(null)}><T serif s={20}>{f.id ? 'Ubah' : 'Tambah'} produk</T>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}><Chip title="1 · Info utama" on={tab === 0} onPress={() => setTab(0)} /><Chip title="2 · Stok & detail" on={tab === 1} onPress={() => setTab(1)} /></View>
      {tab === 0 ? <>
        <Field label="Nama produk / jasa *" value={f.name} onChangeText={s => set('name', s)} />
        {show('barcode') && <Field label="Barcode (scanner USB/Bluetooth mengetik otomatis)" value={f.barcode} onChangeText={s => set('barcode', s)} autoCapitalize="none" />}
        <Field label="Kategori" value={f.cat} onChangeText={s => set('cat', s)} />
        {show('unit') && <><Field label="Satuan" value={f.unit} onChangeText={s => set('unit', s)} autoCapitalize="none" /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>{UNITS.map(u => <Chip key={u} title={u} on={f.unit === u} onPress={() => set('unit', u)} />)}</View></>}
        {show('photo') && <View style={{ marginTop: 12 }}><T s={13} mute>Foto</T><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          {f.photo ? <Image source={{ uri: f.photo }} style={{ width: 72, height: 72, borderRadius: 6 }} /> : <View style={{ width: 72, height: 72, borderRadius: 6, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}><T s={26}>📷</T></View>}
          <View style={{ gap: 6 }}>{Platform.OS !== 'web' && <Btn ghost title="Ambil foto" onPress={async () => { const p = await pickPhoto(true); if (p) set('photo', p) }} />}
            <Btn ghost title="Pilih dari galeri/file" onPress={async () => { const p = await pickPhoto(false); if (p) set('photo', p) }} />{f.photo ? <Btn ghost danger title="Hapus foto" onPress={() => set('photo', '')} /> : null}</View></View></View>}
        <View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Field label="Harga modal" keyboardType="numeric" placeholder="0" value={nv(f.cost)} onChangeText={num('cost')} /></View><View style={{ flex: 1 }}><Field label="Harga jual *" keyboardType="numeric" placeholder="0" value={nv(f.price)} onChangeText={num('price')} /></View></View>
        {show('wholesale') && <View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Field label="Harga grosir" keyboardType="numeric" placeholder="0" value={nv(f.wholesale)} onChangeText={num('wholesale')} /></View><View style={{ flex: 1 }}><Field label="Berlaku mulai qty" keyboardType="numeric" placeholder="0" value={nv(f.wholesaleMin)} onChangeText={num('wholesaleMin')} /></View></View>}
        {show('disc') && <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}><View style={{ flex: 1 }}><Field label="Diskon (opsional)" keyboardType="numeric" placeholder="0" value={nv(f.disc)} onChangeText={num('disc')} /></View><Chip title="%" on={f.discType === '%'} onPress={() => set('discType', '%')} /><Chip title="Rp" on={f.discType === 'Rp'} onPress={() => set('discType', 'Rp')} /></View>}
      </> : <>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}><Switch value={f.track} onValueChange={v => set('track', v)} trackColor={{ false: t.line, true: '#c99a3b' }} thumbColor="#fff" /><T>Lacak stok (matikan untuk jasa/pesanan)</T></View>
        {f.track && <View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Field label="Stok" keyboardType="numeric" placeholder="0" value={nv(f.stock)} onChangeText={num('stock')} /></View><View style={{ flex: 1 }}><Field label="Batas stok menipis" keyboardType="numeric" placeholder="0" value={nv(f.min)} onChangeText={num('min')} /></View></View>}
        {show('shelf') && <Field label="Posisi rak / lokasi" value={f.shelf} onChangeText={s => set('shelf', s)} placeholder="mis. Rak A2" />}
        {show('expiry') && <Field label="Tgl kedaluwarsa (TTTT-BB-HH)" value={f.expiry} onChangeText={s => set('expiry', s.trim())} placeholder="2026-12-31" keyboardType="numbers-and-punctuation" />}
        {show('batch') && <Field label="Batch / No. seri" value={f.batch} onChangeText={s => set('batch', s)} />}
        {show('supplier') && <Field label="Supplier" value={f.supplier} onChangeText={s => set('supplier', s)} />}
        {show('note') && <Field label="Catatan / deskripsi" value={f.note} onChangeText={s => set('note', s)} multiline />}
        {!['shelf', 'expiry', 'batch', 'supplier', 'note'].some(show) && <T mute s={13} style={{ marginTop: 10 }}>Kolom lain bisa diaktifkan di Setelan → Kolom form produk.</T>}
      </>}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}><Btn title="Simpan" onPress={save} style={{ flex: 1 }} /><Btn ghost title="Batal" onPress={() => setF(null)} />
        {f.id ? <Btn ghost danger title="Hapus" onPress={() => { const id = f.id, n = f.name; setF(null); setAsk({ title: 'Hapus produk?', msg: n, ok: 'Hapus', danger: true, run: () => removeProduct(id) }) }} /> : null}</View></Sheet>}
    {ask && <Ask a={ask} onClose={() => setAsk(null)} />}
  </View>
}
