import React, { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useApp } from '../store'
import { kvAll, kvReplaceAll, kvClear } from '../storage'
import { encryptBackup, decryptBackup } from '../backup'
import { saveBackup, pickBackup } from '../files'
import { fmtDate, FIELDS, PRESETS } from '../format'
import { Ask, AskCfg, Btn, Card, Chip, Field, T, Toast, useToast } from '../ui'
export default function Setelan() {
  const { cfg, saveCfg, reload } = useApp(), [c, setC] = useState(cfg), [ask, setAsk] = useState<AskCfg | null>(null), [toast, say] = useToast(), [busy, setBusy] = useState(false)
  const tog = (k: string) => setC({ ...c, fields: c.fields.includes(k) ? c.fields.filter(x => x !== k) : [...c.fields, k] })
  const backup = (pw: string) => run(async () => {
    const all = await kvAll(); all.cfg = JSON.stringify({ ...cfg, lastBackup: Date.now() })
    await saveBackup(`tokolokal_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.tkbk`, await encryptBackup(all, pw))
    await saveCfg({ ...cfg, lastBackup: Date.now() }); say('Cadangan dibuat')
  })
  const run = async (f: () => Promise<void>) => { setBusy(true); try { await f() } catch (e) { say((e as Error).message) } setBusy(false) }
  const restore = async () => {
    const bytes = await pickBackup(); if (!bytes) return
    setAsk({ title: 'Kata sandi cadangan', msg: 'Kosongkan bila cadangan dibuat tanpa kata sandi.', input: { label: 'Kata sandi', secure: true }, ok: 'Buka',
      run: pw => run(async () => {
        const e = await decryptBackup(bytes, pw), np = (JSON.parse(e.products ?? '[]') as unknown[]).length
        setAsk({ title: 'Timpa data saat ini?', msg: `Cadangan berisi ${np} produk. Semua data di perangkat ini akan DIGANTI.`, ok: 'Pulihkan', danger: true,
          run: () => run(async () => { await kvReplaceAll(e); await reload(); say('Data dipulihkan') }) })
      }) })
  }
  return <View style={{ flex: 1 }}><ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110, maxWidth: 700 }}>
    <T serif s={26} style={{ marginBottom: 10 }}>Setelan</T>
    <Card><T serif s={18}>Profil toko</T><Field label="Nama toko" value={c.name} onChangeText={s => setC({ ...c, name: s })} /><Field label="Alamat / telepon" value={c.addr} onChangeText={s => setC({ ...c, addr: s })} /><Field label="Pesan di struk" value={c.foot} onChangeText={s => setC({ ...c, foot: s })} />
      <Btn title="Simpan" style={{ marginTop: 12, alignSelf: 'flex-start' }} onPress={async () => { await saveCfg(c); say('Tersimpan') }} /></Card>
    <Card><T serif s={18}>Kolom form produk</T><T mute s={13} style={{ marginVertical: 6 }}>Pilih jenis usaha, lalu sesuaikan. Kolom yang tidak dipakai disembunyikan agar form tetap ringkas.</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Object.keys(PRESETS).map(k => <Chip key={k} title={k} on={false} onPress={() => setC({ ...c, fields: PRESETS[k] })} />)}</View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>{FIELDS.map(([k, l]) => <Chip key={k} title={l} on={c.fields.includes(k)} onPress={() => tog(k)} />)}</View>
      <Btn title="Simpan" style={{ marginTop: 12, alignSelf: 'flex-start' }} onPress={async () => { await saveCfg(c); say('Tersimpan') }} /></Card>
    <Card><T serif s={18}>Cadangan data</T>
      <T mute style={{ marginVertical: 8 }}>Data hanya ada di perangkat ini. Cadangan terakhir: {cfg.lastBackup ? fmtDate(cfg.lastBackup) : 'belum pernah'}. File .tkbk terenkripsi dan hanya bisa dipulihkan lewat TokoLokal.</T>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Btn title={busy ? 'Memproses…' : 'Cadangkan data'} disabled={busy} onPress={() => setAsk({ title: 'Cadangkan data', msg: 'Kata sandi opsional. Tanpa sandi yang sama, file tidak bisa dipulihkan.', input: { label: 'Kata sandi (opsional)', secure: true }, ok: 'Buat cadangan', run: backup })} />
        <Btn ghost title="Pulihkan data" disabled={busy} onPress={restore} /></View></Card>
    <Card><Btn ghost danger title="Hapus semua data di perangkat ini" onPress={() => setAsk({ title: 'Hapus semua data?', msg: 'Buat cadangan dulu. Ketik HAPUS untuk melanjutkan.', input: { label: 'Ketik HAPUS' }, ok: 'Hapus', danger: true,
      run: async v => { if (v === 'HAPUS') { await kvClear(); await reload(); say('Data dihapus') } else say('Dibatalkan') } })} /></Card>
  </ScrollView><Toast msg={toast} />{ask && <Ask a={ask} onClose={() => setAsk(null)} />}</View>
}
