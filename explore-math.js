export function distanceKm(a, b) {
  const rad = Math.PI / 180
  const lat = (b[1] - a[1]) * rad
  const lon = (b[0] - a[0]) * rad
  const h = Math.sin(lat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(lon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))))
}

export function roundPoints(distance) {
  return distance <= 0.025 ? 5000 : Math.round(5000 * Math.exp(-distance / 2000))
}

export function isPanorama(photo) {
  return photo?.properties?.['pers:interior_orientation']?.field_of_view === 360 &&
    photo?.geometry?.type === 'Point' && photo.geometry.coordinates?.length >= 2 &&
    photo.geometry.coordinates.slice(0, 2).every(Number.isFinite) && Math.abs(photo.geometry.coordinates[1]) <= 90 &&
    Boolean(photo.assets?.sd?.href)
}
