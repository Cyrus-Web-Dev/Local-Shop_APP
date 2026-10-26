import React, { useState } from 'react'
import { Modal, Platform, Pressable, Text, TextInput, TextInputProps, View, useColorScheme, ScrollView } from 'react-native'
export function useTheme() {
  const d = useColorScheme() === 'dark'
  return { d, bg: d ? '#0b141d' : '#f6f4ef', card: d ? '#141F2B' : '#ffffff', ink: d ? '#e8eef4' : '#141F2B', mute: d ? '#98aec3' : '#4c6d8a',
    line: d ? '#2c435c' : '#dfe6ec', seal: '#b07f27', bad: '#b3261e', btn: d ? '#c99a3b' : '#141F2B', btnTx: d ? '#141F2B' : '#f6f4ef' }
}
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' })
export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' })
export function T({ children, s, bold, mute, serif: sf, num, style }: { children: React.ReactNode; s?: number; bold?: boolean; mute?: boolean; serif?: boolean; num?: boolean; style?: object }) {
  const t = useTheme()
  return <Text style={[{ color: mute ? t.mute : t.ink, fontSize: s ?? 15, fontWeight: bold ? '700' : '400', fontFamily: sf ? serif : num ? mono : undefined }, style]}>{children}</Text>
}
export function Btn({ title, onPress, ghost, danger, disabled, style }: { title: string; onPress: () => void; ghost?: boolean; danger?: boolean; disabled?: boolean; style?: object }) {
  const t = useTheme()
  return <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" style={[{ paddingVertical: 11, paddingHorizontal: 14, borderRadius: 6, minHeight: 44, justifyContent: 'center', alignItems: 'center',
    opacity: disabled ? 0.4 : 1, backgroundColor: ghost ? 'transparent' : t.btn, borderWidth: ghost ? 1 : 0, borderColor: t.line }, style]}>
    <Text style={{ fontWeight: '600', color: ghost ? (danger ? t.bad : t.ink) : t.btnTx }}>{title}</Text></Pressable>
}
export function Card({ children, style, onPress }: { children: React.ReactNode; style?: object; onPress?: () => void }) {
  const t = useTheme(), st = [{ backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 6, padding: 14, marginBottom: 12 }, style]
  return onPress ? <Pressable onPress={onPress} style={st}>{children}</Pressable> : <View style={st}>{children}</View>
}
export function Field({ label, ...p }: TextInputProps & { label: string }) {
  const t = useTheme()
  return <View style={{ marginTop: 8 }}><T s={13} mute>{label}</T>
    <TextInput {...p} placeholderTextColor={t.mute} style={{ borderWidth: 1, borderColor: t.line, borderRadius: 6, padding: 10, marginTop: 3, color: t.ink, backgroundColor: t.card, fontSize: 15 }} /></View>
}
export const Chip = ({ title, on, onPress }: { title: string; on: boolean; onPress: () => void }) => {
  const t = useTheme()
  return <Pressable onPress={onPress} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: on ? t.seal : t.line, backgroundColor: on ? t.seal : 'transparent' }}>
    <Text style={{ color: on ? '#fff' : t.ink, fontSize: 13 }}>{title}</Text></Pressable>
}
export function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const t = useTheme()
  return <Modal transparent animationType="fade" onRequestClose={onClose}><Pressable onPress={onClose} style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 16 }}>
    <Pressable style={{ backgroundColor: t.card, borderRadius: 8, padding: 18, maxHeight: '90%', width: '100%', maxWidth: 460, alignSelf: 'center' }}><ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView></Pressable></Pressable></Modal>
}
// Dialog serbaguna (pengganti Alert/prompt yang tidak jalan di web): konfirmasi, atau dengan 1 kolom isian.
export type AskCfg = { title: string; msg?: string; input?: { label: string; secure?: boolean }; ok: string; danger?: boolean; run: (v: string) => void | Promise<void> }
export function Ask({ a, onClose }: { a: AskCfg; onClose: () => void }) {
  const [v, setV] = useState('')
  return <Sheet onClose={onClose}><T serif s={20}>{a.title}</T>{a.msg ? <T mute style={{ marginVertical: 8 }}>{a.msg}</T> : null}
    {a.input ? <Field label={a.input.label} value={v} onChangeText={setV} secureTextEntry={a.input.secure} autoCapitalize="none" /> : null}
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}><Btn title={a.ok} style={{ flex: 1 }} onPress={async () => { onClose(); await a.run(v) }} /><Btn ghost title="Batal" onPress={onClose} /></View></Sheet>
}
export function Toast({ msg }: { msg: string }) {
  return msg ? <View pointerEvents="none" style={{ position: 'absolute', bottom: 90, alignSelf: 'center', backgroundColor: '#141F2B', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6 }}><Text style={{ color: '#fff' }}>{msg}</Text></View> : null
}
export function useToast(): [string, (m: string) => void] {
  const [m, setM] = useState('')
  return [m, (x: string) => { setM(x); setTimeout(() => setM(''), 2400) }]
}
