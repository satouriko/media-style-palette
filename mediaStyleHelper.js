import * as convert from '@csstools/convert-colors'
import { Color } from './color'

export function findBackgroundColor (palette) {
  const ids = []
  for (const sw in palette) {
    if (palette.hasOwnProperty(sw)) {
      ids.push(sw)
    }
  }
  ids.sort((a, b) => (palette[b].getPopulation() - palette[a].getPopulation()))
  if (!isBlackOrWhite(palette[ids[0]])) {
    return palette[ids[0]]
  }
  let highestNoneWhite
  for (const id of ids) {
    if (!isBlackOrWhite(palette[id])) {
      highestNoneWhite = id
      break
    }
  }
  if (!highestNoneWhite ||
    palette[ids[0]].getPopulation() > 2.5 * palette[highestNoneWhite].getPopulation()) {
    return palette[ids[0]]
  }
  return palette[highestNoneWhite]
}

export function isWhite (color) {
  return color.getHsl()[2] >= 0.9
}

export function isBlack (color) {
  return color.getHsl()[2] <= 0.08
}

export function isBlackOrWhite (color) {
  return isWhite(color) || isBlack(color)
}

export function selectForegroundColor (
  moreVibrant, vibrant,
  moreMuted, muted,
  dominant, mapSize
) {
  let candidate = selectVibrantCandidate(moreVibrant, vibrant, mapSize)
  if (!candidate) {
    candidate = selectMutedCandidate(moreMuted, muted, mapSize)
  }
  if (candidate) {
    if (candidate.getHex() === dominant.getHex()) {
      return candidate
    } else if (candidate.getPopulation() < dominant.getPopulation() * 0.01 &&
      dominant.getHsl()[1] > 0.19) {
      return dominant
    } else {
      return candidate
    }
  }
  return dominant
}

export function findForegroundColor (backgroundColor, palette, mapSize) {
  const ids = []
  for (const sw in palette) {
    if (palette.hasOwnProperty(sw)) {
      ids.push(sw)
    }
  }
  ids.sort((a, b) => (palette[b].getPopulation() - palette[a].getPopulation()))
  if (isColorLight(backgroundColor)) {
    return selectForegroundColor(
      palette.DarkVibrant, palette.Vibrant,
      palette.DarkMuted, palette.Muted,
      palette[ids[0]], mapSize
    )
  } else {
    return selectForegroundColor(
      palette.LightVibrant, palette.Vibrant,
      palette.LightMuted, palette.Muted,
      palette[ids[0]], mapSize
    )
  }
}

export function isColorLight (color) {
  const xyz = convert.hex2xyz(color.getHex())
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
  return color.getPopulation() > mapSize * 0.002
}

export function ensureColors (backgroundColor, foregroundColor) {
  const backY = convert.hex2xyz(backgroundColor.getHex())[1]
  const foreY = convert.hex2xyz(foregroundColor.getHex())[1]
  const contrast = convert.hex2contrast(backgroundColor.getHex(), foregroundColor.getHex())
  let backgroundLight =
    (backY > foreY && convert.hex2contrast(backgroundColor.getHex(), '#000') > 4.5) ||
    (backY < foreY && convert.hex2contrast(backgroundColor.getHex(), '#fff') <= 4.5)
  let primary, secondary
  let ok = false
  if (contrast > 4.5) {
    primary = foregroundColor.getHex()
    if (backgroundLight) {
      const hsl = convert.hex2hsl(primary)
      hsl[2] = hsl[2] + 20 <= 100 ? hsl[2] + 20 : 100
      secondary = convert.hsl2hex(hsl[0], hsl[1], hsl[2])
    } else {
      const hsl = convert.hex2hsl(primary)
      hsl[2] = hsl[2] - 10 >= 0 ? hsl[2] - 10 : 0
      secondary = convert.hsl2hex(hsl[0], hsl[1], hsl[2])
    }
    if (convert.hex2contrast(backgroundColor.getHex(), secondary) > 4.5) {
      ok = true
    }
  }
  if (!ok) {
    secondary = findContrastColor(foregroundColor, backgroundColor, !backgroundLight)
    if (backgroundLight) {
      const hsl = convert.hex2hsl(secondary)
      hsl[2] = hsl[2] - 20 >= 0 ? hsl[2] - 20 : 0
      primary = convert.hsl2hex(hsl[0], hsl[1], hsl[2])
    } else {
      const hsl = convert.hex2hsl(secondary)
      hsl[2] = hsl[2] + 10 <= 100 ? hsl[2] + 10 : 100
      primary = convert.hsl2hex(hsl[0], hsl[1], hsl[2])
    }
  }
  return {
    primaryColor: Color.fromHex(primary),
    secondaryColor: Color.fromHex(secondary),
    backgroundColor: Color.fromHex(backgroundColor.getHex())
  }
}

export function findContrastColor (foregroundColor, backgroundColor, light) {
  const hsl = convert.hex2hsl(foregroundColor.getHex())
  let low = light ? hsl[2] : 0
  let high = light ? 1 : hsl[2]
  let color = foregroundColor.getHex()
  for (let i = 0; i < 15 && high - low > 0.00001; i++) {
    const l = (low + high) / 2
    hsl[2] = l
    color = convert.hsl2hex(hsl[0], hsl[1], hsl[2])
    if (convert.hex2contrast(color, backgroundColor.getHex()) > 4.5) {
      if (light) {
        high = l
      } else {
        low = l
      }
    } else {
      if (light) {
        low = l
      } else {
        high = l
      }
    }
  }
  return color
}
