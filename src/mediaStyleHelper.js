import * as convert from '@csstools/convert-colors'
import { Color } from './color'

export function getSortedPaletteKeys (palette) {
  const ids = Object.keys(palette)
  ids.sort((a, b) => {
    if (palette[a] === null && palette[b] === null) {
      return 0
    } else if (palette[a] === null) {
      return palette[b].getPopulation()
    } else if (palette[b] === null) {
      return palette[a].getPopulation()
    }
    return palette[b].getPopulation() - palette[a].getPopulation()
  })
  return ids
}

export function findBackgroundColor (palette) {
  const ids = getSortedPaletteKeys(palette)
  if (palette[ids[0]] === null) {
    return '#fff'
  }
  if (!isBlackOrWhite(palette[ids[0]].getHsl())) {
    return palette[ids[0]].getHex()
  }
  let highestNoneWhite
  for (const id of ids) {
    if (palette[id] && !isBlackOrWhite(palette[id].getHsl())) {
      highestNoneWhite = id
      break
    }
  }
  if (!highestNoneWhite ||
    palette[ids[0]].getPopulation() > 2.5 * palette[highestNoneWhite].getPopulation()) {
    return palette[ids[0]].getHex()
  }
  return palette[highestNoneWhite].getHex()
}

export function isWhite (hsl) {
  return hsl[2] >= 0.9
}

export function isBlack (hsl) {
  return hsl[2] <= 0.08
}

export function isBlackOrWhite (hsl) {
  return isWhite(hsl) || isBlack(hsl)
}

export function selectForegroundColor (
  moreVibrant, vibrant,
  moreMuted, muted,
  dominant, fallback, mapSize
) {
  let candidate = selectVibrantCandidate(moreVibrant, vibrant, mapSize)
  if (!candidate) {
    candidate = selectMutedCandidate(moreMuted, muted, mapSize)
  }
  if (candidate) {
    if (candidate.getHex() === dominant.getHex()) {
      return candidate.getHex()
    } else if (candidate.getPopulation() < dominant.getPopulation() * 0.01 &&
      dominant.getHsl()[1] > 0.19) {
      return dominant.getHex()
    } else {
      return candidate.getHex()
    }
  } else if (hasEnoughPopulation(dominant, mapSize)) {
    return dominant.getHex()
  }
  return fallback
}

export function findForegroundColor (backgroundColor, palette, mapSize) {
  const ids = getSortedPaletteKeys(palette)
  if (isColorLight(backgroundColor)) {
    return selectForegroundColor(
      palette.DarkVibrant, palette.Vibrant,
      palette.DarkMuted, palette.Muted,
      palette[ids[0]], '#000', mapSize
    )
  } else {
    return selectForegroundColor(
      palette.LightVibrant, palette.Vibrant,
      palette.LightMuted, palette.Muted,
      palette[ids[0]], '#fff', mapSize
    )
  }
}

export function isColorLight (color) {
  const xyz = convert.hex2xyz(color)
  return xyz[1] > 50
}

export function selectVibrantCandidate (first, second, mapSize) {
  const firstValid = hasEnoughPopulation(first, mapSize)
  const secondValid = hasEnoughPopulation(second, mapSize)
  if (firstValid && secondValid) {
    if (first.getPopulation() > second.getPopulation()) {
      return first
    }
    return second
  } else if (firstValid) {
    return first
  } else if (secondValid) {
    return second
  }
  return null
}

export function selectMutedCandidate (first, second, mapSize) {
  const firstValid = hasEnoughPopulation(first, mapSize)
  const secondValid = hasEnoughPopulation(second, mapSize)
  if (firstValid && secondValid) {
    const firstSaturation = first.getHsl()[1]
    const secondSaturation = second.getHsl()[1]
    const populationFraction = first.getPopulation() / second.getPopulation()
    if (firstSaturation * populationFraction > secondSaturation) {
      return first
    }
    return second
  } else if (firstValid) {
    return first
  } else if (secondValid) {
    return second
  }
  return null
}

export function hasEnoughPopulation (color, mapSize) {
  return color && color.getPopulation() > mapSize * 0.002
}

export function ensureColors (backgroundColor, foregroundColor) {
  const backY = convert.hex2xyz(backgroundColor)[1]
  const foreY = convert.hex2xyz(foregroundColor)[1]
  const contrast = convert.hex2contrast(backgroundColor, foregroundColor)
  let backgroundLight =
    (backY > foreY && convert.hex2contrast(backgroundColor, '#000') > 4.5) ||
    (backY < foreY && convert.hex2contrast(backgroundColor, '#fff') <= 4.5)
  let primary, secondary
  let ok = false
  if (contrast > 4.5) {
    primary = foregroundColor
    if (backgroundLight) {
      const lab = convert.hex2lab(primary)
      lab[0] = lab[0] + 20 <= 100 ? lab[0] + 20 : 100
      secondary = lab2hex(lab[0], lab[1], lab[2])
    } else {
      const lab = convert.hex2lab(primary)
      lab[0] = lab[0] - 10 >= 0 ? lab[0] - 10 : 0
      secondary = lab2hex(lab[0], lab[1], lab[2])
    }
    if (convert.hex2contrast(backgroundColor, secondary) > 4.5) {
      ok = true
    }
  }
  if (!ok) {
    secondary = backgroundLight
      ? findContrastColor(foregroundColor, backgroundColor)
      : findContrastColorAgainstDark(foregroundColor, backgroundColor)
    if (backgroundLight) {
      const lab = convert.hex2lab(secondary)
      lab[0] = lab[0] - 20 > 0 ? lab[0] - 20 : 0
      primary = lab2hex(lab[0], lab[1], lab[2])
    } else {
      const lab = convert.hex2lab(secondary)
      lab[0] = lab[0] + 10 < 100 ? lab[0] + 10 : 100
      primary = lab2hex(lab[0], lab[1], lab[2])
    }
  }
  return {
    primaryColor: Color.fromHex(primary),
    secondaryColor: Color.fromHex(secondary),
    backgroundColor: Color.fromHex(backgroundColor)
  }
}

export function lab2hex (l, a, b) {
  let rgb = convert.lab2rgb(l, a, b)
  for (let i = 0; i < 3; i++) {
    if (rgb[i] < 0) {
      rgb[i] = 0
    }
    if (rgb[i] > 100) {
      rgb[i] = 100
    }
  }
  return convert.rgb2hex(rgb[0], rgb[1], rgb[2])
}

export function findContrastColor (foregroundColor, backgroundColor) {
  const lab = convert.hex2lab(foregroundColor)
  let low = 0
  let high = lab[0]
  let color = foregroundColor
  for (let i = 0; i < 15 && high - low > 0.00001; i++) {
    const l = (low + high) / 2
    lab[0] = l
    color = lab2hex(lab[0], lab[1], lab[2])
    if (convert.hex2contrast(color, backgroundColor) > 4.5) {
      low = l
    } else {
      high = l
    }
  }
  return color
}

export function findContrastColorAgainstDark (foregroundColor, backgroundColor) {
  const hsl = convert.hex2hsl(foregroundColor)
  let low = hsl[2]
  let high = 100
  let color = foregroundColor
  for (let i = 0; i < 15 && high - low > 0.00001; i++) {
    const l = (low + high) / 2
    hsl[2] = l
    color = convert.hsl2hex(hsl[0], hsl[1], hsl[2])
    if (convert.hex2contrast(color, backgroundColor) > 4.5) {
      high = l
    } else {
      low = l
    }
  }
  return color
}
