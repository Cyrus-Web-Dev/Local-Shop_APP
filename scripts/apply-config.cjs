// Jalankan sekali: node scripts/apply-config.cjs
const fs = require('fs')
const rd = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d)
const app = rd('app.json', { expo: {} }), e = app.expo
e.icon = './assets/icon.png'
e.android = { ...e.android, package: e.android?.package || 'id.tokolokal.app', adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#141F2B' } }
e.web = { ...e.web, favicon: './assets/favicon.png' }
const plug = (e.plugins || []).filter(p => (Array.isArray(p) ? p[0] : p) !== 'expo-image-picker')
plug.push(['expo-image-picker', { photosPermission: 'TokoLokal memakai foto untuk gambar produk.', cameraPermission: 'TokoLokal memakai kamera untuk memotret produk.' }])
e.plugins = plug
fs.writeFileSync('app.json', JSON.stringify(app, null, 2))
const eas = rd('eas.json', { cli: { version: '>= 16.0.0' }, build: {} })
eas.build = eas.build || {}
eas.build.preview = { ...eas.build.preview, distribution: 'internal', android: { ...eas.build.preview?.android, buildType: 'apk' } }
eas.build.production = eas.build.production || {}
fs.writeFileSync('eas.json', JSON.stringify(eas, null, 2))
console.log('OK: app.json & eas.json diperbarui (preview = APK, ikon terpasang)')
