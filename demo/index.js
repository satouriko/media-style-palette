import init, { print_canvas } from '../pkg/media_style_palette.js'

(async () => {
  await init()
  document.getElementById('artwork').addEventListener('change', (e) => {
    const files = e.target.files
    const imgEl = document.createElement('img')
    if (files && files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imgEl.src = e.target.result
      }
      imgEl.onload = (e) => {
        const canvasEl = document.createElement('canvas')
        canvasEl.width = 10
        canvasEl.height = 10
        const ctx = canvasEl.getContext('2d')
        ctx.drawImage(e.target, 0, 0, 10, 10)
        document.body.appendChild(canvasEl)
        print_canvas(canvasEl)
      }
      reader.readAsDataURL(files[0])
    }
  })
})()
