import { pbkdf2Async } from '@noble/hashes/pbkdf2'
import { sha256 } from '@noble/hashes/sha256'
import { gcm } from '@noble/ciphers/aes'
import { getRandomValues } from 'expo-crypto'
// Format: "TKBK2"(5) + salt(16) + iv(12) + AES-GCM(JSON). Kunci = PBKDF2-SHA256(kunci-aplikasi + sandi opsional).
const MAGIC = 'TKBK2', APPK = 'tokolokal::app-bound-key::v2'
const key = (pw: string, salt: Uint8Array) => pbkdf2Async(sha256, APPK + pw, salt, { c: 150000, dkLen: 32 })
export async function encryptBackup(entries: Record<string, string>, pw: string): Promise<Uint8Array> {
  const salt = getRandomValues(new Uint8Array(16)), iv = getRandomValues(new Uint8Array(12))
  const ct = gcm(await key(pw, salt), iv).encrypt(new TextEncoder().encode(JSON.stringify({ v: 2, at: Date.now(), entries })))
  const out = new Uint8Array(33 + ct.length)
  out.set(new TextEncoder().encode(MAGIC), 0); out.set(salt, 5); out.set(iv, 21); out.set(ct, 33)
  return out
}
export async function decryptBackup(u: Uint8Array, pw: string): Promise<Record<string, string>> {
  if (u.length < 50 || new TextDecoder().decode(u.slice(0, 5)) !== MAGIC) throw new Error('Bukan file cadangan TokoLokal')
  try {
    const pt = gcm(await key(pw, u.slice(5, 21)), u.slice(21, 33)).decrypt(u.slice(33))
    return JSON.parse(new TextDecoder().decode(pt)).entries
  } catch { throw new Error('Kata sandi salah atau file rusak') }
}
