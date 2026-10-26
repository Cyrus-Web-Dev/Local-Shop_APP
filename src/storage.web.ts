// Versi web/Electron: IndexedDB (tersimpan di perangkat, bukan server).
let p: Promise<IDBDatabase> | null = null
const db = () => (p ??= new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open('tokolokal', 1)
  r.onupgradeneeded = () => r.result.createObjectStore('kv')
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error)
}))
export async function kvAll(): Promise<Record<string, string>> {
  const d = await db()
  return new Promise((res, rej) => {
    const t = d.transaction('kv'), s = t.objectStore('kv'), k = s.getAllKeys(), v = s.getAll()
    t.oncomplete = () => res(Object.fromEntries((k.result as string[]).map((x, i) => [x, v.result[i] as string])))
    t.onerror = () => rej(t.error)
  })
}
async function write(e: Record<string, string>, clear: boolean) {
  const d = await db()
  return new Promise<void>((res, rej) => {
    const t = d.transaction('kv', 'readwrite'), s = t.objectStore('kv')
    if (clear) s.clear()
    for (const [k, v] of Object.entries(e)) s.put(v, k)
    t.oncomplete = () => res(); t.onerror = () => rej(t.error)
  })
}
export const kvSetMany = (e: Record<string, string>) => write(e, false)
export const kvReplaceAll = (e: Record<string, string>) => write(e, true)
export const kvClear = () => write({}, true)
