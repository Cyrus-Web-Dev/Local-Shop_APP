# TokoLokal — Expo SDK 58 · React Native · TypeScript · Electron
Satu basis kode. Data 100% di perangkat (SQLite di HP, IndexedDB di Windows). Backup `.tkbk` terenkripsi.

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
