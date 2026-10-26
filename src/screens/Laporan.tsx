import React, { useMemo, useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useApp } from '../store'
import { rp, fmtDate, daysLeft } from '../format'
import { Card, Chip, T, useTheme } from '../ui'
export default function Laporan() {
  const { sales, products } = useApp(), t = useTheme(), [range, setRange] = useState(7)
  const d = useMemo(() => {
    const f = new Date(); f.setHours(0, 0, 0, 0); f.setDate(f.getDate() - range + 1)
    const ss = sales.filter(s => s.t >= f.getTime()), days: Record<string, { l: number; v: number }> = {}
    for (let i = 0; i < range; i++) { const x = new Date(f); x.setDate(x.getDate() + i); days[x.toDateString()] = { l: x.getDate(), v: 0 } }
    ss.forEach(s => { const k = new Date(s.t).toDateString(); if (days[k]) days[k].v += s.total })
    const top: Record<string, number> = {}; ss.forEach(s => s.items.forEach(i => { top[i.n] = (top[i.n] ?? 0) + i.q }))
    return { n: ss.length, omzet: ss.reduce((a, s) => a + s.total, 0), laba: ss.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.p - i.c) * i.q, 0), 0),
      days: Object.values(days), top: Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5) }
  }, [sales, range])
  const mx = Math.max(1, ...d.days.map(x => x.v))
  return <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
    <T serif s={26}>Laporan</T>
    <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>{[[1, 'Hari ini'], [7, '7 hari'], [30, '30 hari']].map(([v, l]) => <Chip key={v} title={String(l)} on={range === v} onPress={() => setRange(Number(v))} />)}</View>
    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>{[['Omzet', rp(d.omzet)], ['Laba kotor', rp(d.laba)], ['Transaksi', String(d.n)]].map(([a, b]) => <Card key={a} style={{ flex: 1, minWidth: 140 }}><T s={12} mute>{a}</T><T bold s={19} num>{b}</T></Card>)}</View>
    <Card style={{ flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 2 }}>{d.days.map((x, i) => <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
      <View style={{ width: '100%', backgroundColor: '#c99a3b', borderTopLeftRadius: 3, borderTopRightRadius: 3, height: Math.max(2, (x.v / mx) * 100) }} />{d.days.length <= 14 && <T s={10} mute>{x.l}</T>}</View>)}</Card>
    <Card><T serif s={18}>Perlu perhatian</T>
      {products.filter(p => p.track && p.stock <= p.min).map(p => <T key={'l' + p.id} style={{ marginTop: 4, color: t.bad }}>Stok menipis: {p.name} ({p.stock})</T>)}
      {products.filter(p => (daysLeft(p.expiry) ?? 99) <= 30).map(p => <T key={'e' + p.id} style={{ marginTop: 4, color: t.bad }}>{(daysLeft(p.expiry) ?? 0) < 0 ? 'Kedaluwarsa' : 'Segera kedaluwarsa (' + daysLeft(p.expiry) + ' hari)'}: {p.name}</T>)}
      {!products.some(p => (p.track && p.stock <= p.min) || (daysLeft(p.expiry) ?? 99) <= 30) && <T mute>Semua aman.</T>}</Card>
    <Card><T serif s={18}>Terlaris</T>{!d.top.length && <T mute>Belum ada data.</T>}{d.top.map(([n, v]) => <View key={n} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}><T>{n}</T><T bold num>{v}</T></View>)}</Card>
    <Card><T serif s={18}>Riwayat terakhir</T>{sales.slice(0, 20).map(s => <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderColor: t.line, marginTop: 6 }}><T s={13} mute>{fmtDate(s.t)}</T><T num>{rp(s.total)}</T></View>)}</Card>
  </ScrollView>
}
