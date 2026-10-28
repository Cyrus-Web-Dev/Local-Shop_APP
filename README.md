# TokoLokal — Expo SDK 58 · React Native · TypeScript · Electron
Satu basis kode. Data 100% di perangkat (SQLite di HP, IndexedDB di Windows). Backup `.tkbk` terenkripsi.

> **⚠️ DISCLAIMER — KERANGKA MENTAH (APLIKASI TOKO)**
>
> **TokoLokal** (kasir, produk, laporan, cadangan data, opsi desktop) adalah **kerangka aplikasi pengembangan**, **bukan** sistem kasir/toko yang siap produksi atau siap dipakai langsung di usaha ritel.
>
> - Jalankan sesuai README (Expo / development build / Electron bila dipakai).
> - Sebaiknya diuji oleh pemilik toko, kasir, atau pihak yang paham operasional penjualan harian.
> - Kesesuaian fitur (stok, transaksi, laporan, backup) **bergantung kebutuhan dan evaluasi pengguna**.
> - Keamanan data lokal, cadangan, dan kelengkapan fitur **belum** diklaim cukup untuk pemakaian produksi jangka panjang.
>
> Saya sebagai developer hanya membuat **kerangka dasar**.  
> Sesuai atau tidak, aman atau belum — **penilaian dan tanggung jawab ada pada pengguna / klien**.

## Pasang
    npm install
    npx expo install --fix          # menyelaraskan versi paket dengan SDK 58
    npx expo-doctor && npm run typecheck

## HP (Android/iOS)
    npx expo start                  # SDK 58: Expo Go di store belum tentu sudah update -> pakai development build
    npx eas build -p android --profile preview      # APK uji;  -p ios untuk iPhone

## Windows (Electron)
    cd desktop && npm i -D electron electron-builder && cd ..
    npm run desktop:dev             # export web + buka jendela Electron
    npm run desktop:build           # installer .exe di desktop/dist

## Struktur
    src/storage.ts | storage.web.ts   SQLite (native) / IndexedDB (web & Electron)
    src/backup.ts                     AES-GCM + PBKDF2 (@noble, JS murni)
    src/files.ts | files.web.ts       simpan/pilih file cadangan
    src/store.tsx                     state + transaksi atomik (stok + penjualan)
