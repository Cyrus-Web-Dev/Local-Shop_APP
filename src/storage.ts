import * as SQLite from 'expo-sqlite'
// Semua data HANYA di SQLite perangkat. Tabel kv(k,v): v = JSON string.
let p: Promise<SQLite.SQLiteDatabase> | null = null
const db = () => (p ??= SQLite.openDatabaseAsync('tokolokal.db').then(async d => {
  await d.execAsync('CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT NOT NULL)'); return d }))
export async function kvAll(): Promise<Record<string, string>> {
  const rows = await (await db()).getAllAsync<{ k: string; v: string }>('SELECT k,v FROM kv')
  return Object.fromEntries(rows.map(r => [r.k, r.v]))
}
export async function kvSetMany(e: Record<string, string>) {   // atomik
  const d = await db()
  await d.withTransactionAsync(async () => { for (const [k, v] of Object.entries(e)) await d.runAsync('INSERT OR REPLACE INTO kv(k,v) VALUES(?,?)', k, v) })
}
export async function kvReplaceAll(e: Record<string, string>) {
  const d = await db()
  await d.withTransactionAsync(async () => { await d.runAsync('DELETE FROM kv'); for (const [k, v] of Object.entries(e)) await d.runAsync('INSERT INTO kv(k,v) VALUES(?,?)', k, v) })
}
export const kvClear = () => kvReplaceAll({})
