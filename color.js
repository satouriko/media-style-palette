import * as convert from '@csstools/convert-colors'

export class Color {
  _rgb

  static fromRgb (r, g, b) {
    const color = new Color()
    color._rgb = [r, g, b]
    return color
  }

  static fromHsl (h, s, l) {
    const color = new Color()
    const hsl = [h, s * 100, l * 100]
    const rgb = convert.hsl2rgb(hsl[0], hsl[1], hsl[2])
    color._rgb = rgb.map(c => c / 100 * 255)
    return color
  }

  static fromHex (hex) {
    const color = new Color()
    const rgb = convert.hex2rgb(hex)
    color._rgb = rgb.map(c => c / 100 * 255)
    return color
  }

  get rgb () {
    return this._rgb
  }

  get hsl () {
    const rgb = this._rgb.map(c => c / 255 * 100)
    const hsl = convert.rgb2hsl(rgb[0], rgb[1], rgb[2])
    return [hsl[0], hsl[1] / 100, hsl[2] / 100]
  }

  get hex () {
    const rgb = this._rgb.map(c => c / 255 * 100)
    return convert.rgb2hex(rgb[0], rgb[1], rgb[2])
  }

  toString () {
    return this.hex
  }
}
