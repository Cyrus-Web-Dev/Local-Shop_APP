import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
export async function saveBackup(name: string, bytes: Uint8Array) {
  const f = new File(Paths.cache, name)
  if (f.exists) f.delete()
  f.create(); f.write(bytes)
  await Sharing.shareAsync(f.uri, { mimeType: 'application/octet-stream', dialogTitle: 'Simpan cadangan TokoLokal' })
}
export async function pickBackup(): Promise<Uint8Array | null> {
  const r = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, type: '*/*' })
  if (r.canceled) return null
  return await new File(r.assets[0].uri).bytes()
}
