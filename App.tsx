import React, { useState } from 'react'
import { Pressable, View, useWindowDimensions } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Provider, useApp } from './src/store'
import { T, useTheme, serif } from './src/ui'
import Kasir from './src/screens/Kasir'
import Produk from './src/screens/Produk'
import Laporan from './src/screens/Laporan'
import Setelan from './src/screens/Setelan'
const TABS = [['Kasir', '🧾', Kasir], ['Produk', '📦', Produk], ['Laporan', '📊', Laporan], ['Setelan', '⚙️', Setelan]] as const
function Shell() {
  const { ready } = useApp(), t = useTheme(), wide = useWindowDimensions().width >= 800, [i, setI] = useState(0), Screen = TABS[i][2]
  const nav = <View style={wide ? { width: 190, backgroundColor: '#141F2B', padding: 12, gap: 4 } : { flexDirection: 'row', backgroundColor: '#141F2B', padding: 4 }}>
    {wide && <T serif bold s={22} style={{ color: '#c99a3b', padding: 10, fontFamily: serif }}>TokoLokal</T>}
    {TABS.map(([n, ic], k) => <Pressable key={n} onPress={() => setI(k)} accessibilityRole="tab" style={{ flex: wide ? undefined : 1, padding: 12, borderRadius: 6, alignItems: wide ? 'flex-start' : 'center', backgroundColor: i === k ? '#c99a3b33' : 'transparent' }}>
      <T s={wide ? 15 : 12} style={{ color: i === k ? '#dbb968' : '#c1cedb' }}>{ic} {n}</T></Pressable>)}</View>
  return <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, flexDirection: wide ? 'row' : 'column' }}>
    {wide && nav}<View style={{ flex: 1 }}>{ready ? <Screen /> : <T mute style={{ padding: 20 }}>Memuat…</T>}</View>{!wide && nav}</SafeAreaView>
}
export default function App() { return <SafeAreaProvider><StatusBar style="auto" /><Provider><Shell /></Provider></SafeAreaProvider> }
