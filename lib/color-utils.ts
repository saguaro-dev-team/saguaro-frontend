import colorsMap from './colors-map.json'

export const getColorValue = (colorName: string): string => {
  const lower = colorName.toLowerCase().trim()
  return (colorsMap as Record<string, string>)[lower] || lower
}
