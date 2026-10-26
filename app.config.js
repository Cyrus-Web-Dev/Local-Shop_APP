// Menggabungkan pengaturan ikon/izin ke app.json Anda secara OTOMATIS saat build
// (app.json Anda, termasuk extra.eas.projectId dari `eas build:configure`, tetap dipakai apa adanya).
module.exports = ({ config }) => ({
  ...config,
  name: config.name || 'TokoLokal',
  slug: config.slug || 'tokolokal',
  icon: './assets/icon.png',
  android: {
    ...config.android,
    package: config.android?.package || 'id.tokolokal.app',
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#141F2B' },
  },
  ios: { ...config.ios, bundleIdentifier: config.ios?.bundleIdentifier || 'id.tokolokal.app', supportsTablet: true },
  web: { ...config.web, favicon: './assets/favicon.png' },
  plugins: [
    ...(config.plugins || []).filter(p => (Array.isArray(p) ? p[0] : p) !== 'expo-image-picker'),
    ['expo-image-picker', { photosPermission: 'TokoLokal memakai foto untuk gambar produk.', cameraPermission: 'TokoLokal memakai kamera untuk memotret produk.' }],
  ],
})
