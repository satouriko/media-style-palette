import * as Vibrant from 'node-vibrant'
import { ensureColors, findBackgroundColor, findForegroundColor } from './mediaStyleHelper'
import * as convert from '@csstools/convert-colors'

export class MediaStylePalette {
  imgSrc
  palette
  ref

  constructor (option) {
    this.use(option)
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = this.option.maxDimension
    this.canvas.height = this.option.maxDimension
  }

  use (option) {
    if (option !== null && option !== undefined && typeof option !== 'object') {
      throw new TypeError('option is not an object')
    }
    this.option = Object.assign({
      maxDimension: 150,
      direction: -90
    }, this.option, option)
    if (typeof this.option.maxDimension !== 'number') {
      throw new TypeError('maxDimension is not a number')
    }
    if (typeof this.option.direction !== 'number') {
      throw new TypeError('direction is not a number')
    }
    this.directionRad = -(this.option.direction + 90) * Math.PI / 180
    this.palette = null
    return this
  }

  from (ref) {
    if (!(ref instanceof HTMLImageElement)) {
      throw new TypeError('Input argument is not an HTMLImageElement')
    }
    if (this.imgSrc !== ref.src) {
      this.imgSrc = ref.src
      this.ref = ref
      this.palette = null
    }
    return this
  }

  async getPalette () {
    if (this.palette) {
      return this.palette
    }
    const x = Math.cos(this.directionRad)
    const y = -Math.sin(this.directionRad)
    this.ctx.drawImage(this.ref,
      x < 0 ? x * this.option.maxDimension : 0,
      y < 0 ? y * this.option.maxDimension : 0,
      (1 + Math.abs(x)) * this.option.maxDimension,
      (1 + Math.abs(y)) * this.option.maxDimension
    )
    const url = this.canvas.toDataURL()
    let palette = await Vibrant.from(url)
      .maxDimension(this.option.maxDimension)
      .getPalette()
    const backgroundColor = findBackgroundColor(palette)
    palette = await Vibrant.from(url)
      .addFilter((r, g, b) => {
        const hsl = convert.rgb2hsl(r, g, b)
        const bgHsl = convert.hex2hsl(backgroundColor.getHex())
        const diff = Math.abs(hsl[0] - bgHsl[0])
        return diff > 10 && diff < 350
      })
      .maxDimension(this.option.maxDimension)
      .getPalette()
    const foregroundColor = findForegroundColor(
      backgroundColor, palette, this.option.maxDimension * this.option.maxDimension
    )
    return ensureColors(backgroundColor, foregroundColor)
  }
}

export default MediaStylePalette
