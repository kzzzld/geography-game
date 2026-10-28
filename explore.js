import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './explore.css'
import catalogue from './explore-spawns.json'
import { distanceKm, roundPoints, isPanorama } from './explore-math.js'

const API = (import.meta.env.VITE_EXPLORE_API_URL || 'https://api.panoramax.xyz/api').replace(/\/$/, '')
const BoundedTiles = L.TileLayer.extend({
  createTile(coords, done) {
    const tile = L.TileLayer.prototype.createTile.call(this, coords, done)
    tile.exploreTimeout = setTimeout(() => { tile.src = '' }, 15000)
    const clear = () => clearTimeout(tile.exploreTimeout)
    tile.addEventListener('load', clear, { once: true })
    tile.addEventListener('error', clear, { once: true })
    return tile
  },
  _removeTile(key) {
    clearTimeout(this._tiles[key]?.el.exploreTimeout)
    L.TileLayer.prototype._removeTile.call(this, key)
  },
})
const TILES = import.meta.env.VITE_EXPLORE_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

const ICONS = {
  prev: '<path d="m14 6-6 6 6 6"/>',
  next: '<path d="m10 6 6 6-6 6"/>',
  nearby: '<path d="m12 3 8 8-8 10-8-10Z"/><circle cx="12" cy="11" r="2"/>',
  spawn: '<path d="M3 11 12 3l9 8M5 10v11h14V10M9 21v-7h6v7"/>',
  map: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  collapse: '<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5"/>',
  street: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  flat: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
  exit: '<path d="M9 4H4v16h5m5-13 5 5-5 5M8 12h12"/>',
  guess: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  continue: '<path d="m9 5 7 7-7 7M4 12h12"/>',
  retry: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
}

function icon(key) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key]}</svg>`
}

export function mountExplore(root, { t, isLite, exit }) {
  let disposed = false, busy = false, photo, spawn, objectUrl, viewer, map, tiles, pin, guess
  let revealed = false, mapReady = false, flatOnly = false, renderVersion = 0, mapExpanded = false
  let rounds = [], candidates = [], used = new Set()
  const requests = new Set()
  const events = new AbortController()
  const iconButton = (key, attributes = '') => `<button data-action="${key}" title="${t(`explore.${key}`)}" aria-label="${t(`explore.${key}`)}" ${attributes}>${icon(key)}</button>`
  root.innerHTML = `<section class="explore">
    <h2>${t('mode.explore')}</h2><p data-instructions>${t('explore.instructions')}</p>
    <div class="explore-toolbar"><strong data-round></strong>
      ${['prev', 'next', 'nearby', 'spawn', 'flat', 'street', 'exit'].map(key => iconButton(key)).join('')}
    </div>
    <div class="explore-photo">
      <div class="explore-renderer"></div>
      <div class="explore-map-panel" hidden>
        <div class="explore-map" aria-label="${t('explore.map')}"></div>
        ${iconButton('map', 'class="explore-map-toggle" aria-expanded="false"')}
      </div>
    </div>
    <div class="explore-credit"></div>
    <p class="explore-status" role="status" aria-live="polite"></p>
    <div class="explore-toolbar">${iconButton('guess', 'disabled')}${iconButton('continue', 'hidden')}${iconButton('retry', 'hidden')}</div>
    <ol data-results></ol></section>`
  const el = selector => root.querySelector(selector)
  const button = key => el(`[data-action="${key}"]`)
  const status = message => { if (!disposed) el('.explore-status').textContent = message }
  function controls() {
    if (disposed) return
    for (const key of ['prev', 'next', 'nearby']) button(key).disabled = busy || revealed || !links(key).length
    button('spawn').disabled = busy || revealed || !photo || photo.id === spawn?.id
    button('guess').disabled = busy || revealed || !guess || !photo || !mapReady
    button('flat').hidden = isLite() || flatOnly
    button('street').hidden = isLite() || !flatOnly
    for (const key of ['flat', 'street']) button(key).disabled = busy || !photo
    el('[data-round]').textContent = t('explore.round', { round: Math.min(5, rounds.length + 1) })
  }
  function links(direction) {
    return (photo?.links || []).filter(link =>
      (direction === 'nearby' ? link.rel === 'related' : link.rel === direction) &&
      link.geometry?.type === 'Point' && distanceKm(photo.geometry.coordinates, link.geometry.coordinates) <= .1)
  }
  async function request(url, json = true) {
    if (disposed) throw new Error('Disposed')
    const controller = new AbortController()
    requests.add(controller)
    const timeout = setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch(url, { signal: controller.signal, credentials: 'omit' })
      if (!response.ok) throw new Error('Network')
      if (!json) return await response.blob()
      const data = await response.json()
      const base = response.url || url
      for (const link of data.links || []) if (link.href) link.href = new URL(link.href, base).href
      for (const asset of Object.values(data.assets || {})) if (asset.href) asset.href = new URL(asset.href, base).href
      return data
    } finally { clearTimeout(timeout); requests.delete(controller) }
  }
  function metadata(entry) {
    return request(`${API}/collections/${encodeURIComponent(entry.sequence)}/items/${encodeURIComponent(entry.id)}`)
  }
  async function renderer() {
    if (!photo || disposed) return
    const version = ++renderVersion
    viewer?.destroy(); viewer = null
    const host = el('.explore-renderer')
    host.replaceChildren()
    if (isLite() || flatOnly) {
      const scroller = document.createElement('div')
      scroller.className = 'explore-flat'
      const image = new Image()
      image.alt = t('explore.photo')
      image.src = objectUrl
      scroller.append(image); host.append(scroller)
    } else {
      try {
        const { createPanorama } = await import('./explore-panorama.js')
        if (disposed || version !== renderVersion || isLite()) return
        viewer = createPanorama(host, objectUrl, t)
        viewer.addEventListener('panorama-error', () => { status(t('explore.photoError')); button('flat').hidden = false })
      } catch { status(t('explore.photoError')); button('flat').hidden = false }
    }
    controls()
  }
  function attribution() {
    const host = el('.explore-credit')
    host.replaceChildren(document.createTextNode(`${(photo.providers || []).map(p => p.name).join(', ')} · `))
    for (const [label, href] of [['Panoramax', photo.links?.find(l => l.rel === 'via')?.href || 'https://panoramax.fr'], [photo.properties.license || t('explore.license'), photo.links?.find(l => l.rel === 'license')?.href]]) {
      if (!href || !/^https?:\/\//.test(href)) continue
      const a = document.createElement('a')
      a.textContent = label; a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'
      host.append(a, document.createTextNode(' · '))
    }
  }
  async function load(next, moving = false) {
    if (!isPanorama(next) || (moving && distanceKm(photo.geometry.coordinates, next.geometry.coordinates) > .1)) throw new Error('Invalid photo')
    const blob = await request(next.assets.sd.href, false)
    const url = URL.createObjectURL(blob)
    try {
      const image = new Image(); image.src = url
      await image.decode()
      if (disposed) return
      const oldUrl = objectUrl
      photo = next; objectUrl = url
      await renderer()
      if (oldUrl) URL.revokeObjectURL(oldUrl)
      attribution()
    } finally { if (disposed || objectUrl !== url) URL.revokeObjectURL(url) }
  }
  async function startRound() {
    busy = true; revealed = false; guess = null; mapReady = false
    map?.remove(); map = null; pin = null
    el('.explore-map-panel').hidden = true
    setMapExpanded(false)
    button('continue').hidden = true; button('retry').hidden = true
    controls(); status(t('explore.loading'))
    let success = false
    for (let attempt = 0; attempt < 3; attempt++) {
      const entry = candidates.pop()
      if (!entry) break
      if (used.has(entry.id)) continue
      used.add(entry.id)
      try {
        const next = await metadata(entry)
        await load(next)
        if (disposed) return
        spawn = next; success = true; break
      } catch { if (disposed) return }
    }
    busy = false
    if (success) { ensureMap(); status(t('explore.instructions')) }
    else { status(t('explore.loadError')); button('retry').hidden = false; photo = null }
    controls()
  }
  function setMapExpanded(expanded) {
    mapExpanded = expanded
    el('.explore-map-panel').classList.toggle('expanded', expanded)
    button('map').setAttribute('aria-expanded', String(expanded))
    button('map').innerHTML = icon(expanded ? 'collapse' : 'map')
    map?.invalidateSize({ pan: false })
    if (expanded && !guess && !revealed) map?.fitWorld({ animate: false })
  }
  function openMap() {
    setMapExpanded(!mapExpanded)
    if (!mapReady) tiles?.redraw()
  }
  function ensureMap() {
    const host = el('.explore-map')
    el('.explore-map-panel').hidden = false
    if (!map) {
      map = L.map(host, { zoomControl: false, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, attributionControl: true }).setView([0, 0], 0)
      L.control.zoom({ zoomInTitle: t('explore.zoomIn'), zoomOutTitle: t('explore.zoomOut') }).addTo(map)
      tiles = new BoundedTiles(TILES, { maxZoom: 19, attribution: import.meta.env.VITE_EXPLORE_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map)
      tiles.on('tileload', () => { mapReady = true; controls() })
      tiles.on('tileerror', () => { mapReady = false; status(t('explore.mapError')); controls() })
      map.on('click', event => {
        if (revealed || busy || !mapExpanded) return
        const { lat, lng } = event.latlng.wrap()
        guess = [lng, lat]
        if (pin) pin.setLatLng([lat, lng])
        else pin = L.circleMarker([lat, lng], { radius: 8, color: '#2068dd', fillOpacity: 1 }).addTo(map)
        controls()
      })
    }
    map.invalidateSize()
  }
  function submit() {
    if (busy || revealed || !guess || !photo || !mapReady) return
    revealed = true
    const distance = distanceKm(spawn.geometry.coordinates, guess)
    const points = roundPoints(distance)
    rounds.push({ distance, points })
    const target = [spawn.geometry.coordinates[1], spawn.geometry.coordinates[0]]
    const guessed = [guess[1], guess[0]]
    // Use the nearest wrapped longitude so antimeridian results fit on screen.
    target[1] = guessed[1] + ((target[1] - guessed[1] + 540) % 360 - 180)
    setMapExpanded(true)
    L.circleMarker(target, { radius: 8, color: '#c52d3c', fillOpacity: 1 }).addTo(map)
    L.polyline([guessed, target], { color: '#c52d3c' }).addTo(map)
    map.fitBounds(L.latLngBounds([guessed, target]), { padding: [30, 30], maxZoom: 15, animate: false })
    status(t('explore.result', { distance: distance.toFixed(2), points }))
    button('continue').hidden = false
    controls()
  }
  function finish() {
    viewer?.destroy(); viewer = null; renderVersion++
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = null; photo = null
    el('.explore-photo').hidden = true
    status(t('explore.total', { points: rounds.reduce((sum, r) => sum + r.points, 0) }))
    el('[data-results]').replaceChildren(...rounds.map(r => {
      const li = document.createElement('li')
      li.textContent = t('explore.result', { distance: r.distance.toFixed(2), points: r.points })
      return li
    }))
    button('continue').hidden = true
    button('retry').hidden = false
    button('retry').title = t('explore.again'); button('retry').setAttribute('aria-label', t('explore.again'))
    controls()
  }
  function replay() {
    if (rounds.length === 5) { rounds = []; used = new Set(); candidates = []; el('[data-results]').replaceChildren(); el('.explore-photo').hidden = false }
    if (!candidates.length) candidates = catalogue.filter(p => !used.has(p.id)).map(p => ({ p, order: Math.random() })).sort((a, b) => a.order - b.order).map(({ p }) => p)
    startRound()
  }
  root.addEventListener('click', async event => {
    const action = event.target.closest('[data-action]')?.dataset.action
    if (action === 'exit') return exit()
    if (action === 'map') return openMap()
    if (action === 'flat' || action === 'street') {
      if (busy || !photo || isLite()) return
      flatOnly = action === 'flat'
      return renderer()
    }
    if (action === 'guess') return submit()
    if (action === 'continue') return rounds.length === 5 ? finish() : startRound()
    if (action === 'retry') { if (!busy) replay(); return }
    if (busy || revealed || !photo) return
    if (action === 'spawn' || ['prev', 'next', 'nearby'].includes(action)) {
      busy = true; controls(); status(t('explore.loading'))
      try {
        const link = links(action)[0]
        const next = action === 'spawn' ? spawn : await request(link.href)
        if (!disposed) await load(next, action !== 'spawn')
        status(t('explore.instructions'))
      } catch { status(t('explore.moveError')) }
      finally { busy = false; controls() }
    }
  }, { signal: events.signal })
  replay()
  return {
    refresh() {
      for (const key of ['prev', 'next', 'nearby', 'spawn', 'map', 'flat', 'street', 'exit', 'guess', 'continue', 'retry']) {
        const label = t(`explore.${key === 'retry' && rounds.length === 5 ? 'again' : key}`)
        button(key).title = label
        button(key).setAttribute('aria-label', label)
      }
      el('h2').textContent = t('mode.explore')
      el('[data-instructions]').textContent = t('explore.instructions')
      renderer()
    },
    destroy() {
      disposed = true; renderVersion++; events.abort()
      for (const controller of requests) controller.abort()
      viewer?.destroy(); map?.remove()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      root.replaceChildren()
    },
  }
}
