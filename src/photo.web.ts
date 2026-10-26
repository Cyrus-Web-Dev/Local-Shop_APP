export function pickPhoto(_camera = false): Promise<string | null> {
  return new Promise(res => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'
    i.onchange = () => {
      const f = i.files?.[0]; if (!f) return res(null)
      const im = new Image(), url = URL.createObjectURL(f)
      im.onload = () => {
        const S = 200, m = Math.min(im.width, im.height), c = document.createElement('canvas'); c.width = c.height = S
        c.getContext('2d')!.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, S, S)
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.6))
      }
      im.onerror = () => res(null); im.src = url
    }
    i.click()
  })
}
