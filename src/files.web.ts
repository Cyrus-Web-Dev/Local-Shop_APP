export async function saveBackup(name: string, bytes: Uint8Array) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([bytes as BlobPart])); a.download = name; a.click()
}
export function pickBackup(): Promise<Uint8Array | null> {
  return new Promise(res => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.tkbk'
    i.onchange = async () => { const f = i.files?.[0]; res(f ? new Uint8Array(await f.arrayBuffer()) : null) }
    i.click()
  })
}
