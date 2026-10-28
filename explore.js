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

export function mountExplore(root, { t, isLite, exit }) {
  let disposed = false, busy = false, photo, spawn, objectUrl, viewer, map, tiles, pin, guess
  let revealed = false, mapReady = false, flatOnly = false, renderVersion = 0
  let rounds = [], candidates = [], used = new Set()
  const requests = new Set()
  const events = new AbortController()
  root.innerHTML = `<section class="explore">
    <h2>${t('mode.explore')}</h2><p data-instructions>${t('explore.instructions')}</p>
    <div class="explore-toolbar"><strong data-round></strong>
      ${['prev', 'next', 'nearby', 'spawn', 'map', 'flat', 'exit'].map(key => `<button data-action="${key}">${t(`explore.${key}`)}</button>`).join('')}
    </div>
    <div class="explore-photo"><div class="explore-renderer"></div></div>
    <div class="explore-credit"></div><div class="explore-map" hidden aria-label="${t('explore.map')}"></div>
    <p class="explore-status" role="status" aria-live="polite"></p>
    <div class="explore-toolbar"><button data-action="guess" disabled>${t('explore.guess')}</button><button data-action="continue" hidden>${t('explore.continue')}</button><button data-action="retry" hidden>${t('explore.retry')}</button></div>
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
    el('.explore-map').hidden = true
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
    if (success) status(t('explore.instructions'))
    else { status(t('explore.loadError')); button('retry').hidden = false; photo = null }
    controls()
  }
  function openMap() {
    const host = el('.explore-map')
    host.hidden = !host.hidden
    if (host.hidden) return
    if (!map) {
      map = L.map(host, { zoomControl: false, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, attributionControl: true }).setView([0, 0], 1)
      L.control.zoom({ zoomInTitle: t('explore.zoomIn'), zoomOutTitle: t('explore.zoomOut') }).addTo(map)
      tiles = new BoundedTiles(TILES, { maxZoom: 19, attribution: import.meta.env.VITE_EXPLORE_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map)
      tiles.on('tileload', () => { mapReady = true; controls() })
      tiles.on('tileerror', () => { mapReady = false; status(t('explore.mapError')); controls() })
      map.on('click', event => {
        if (revealed || busy) return
        const { lat, lng } = event.latlng.wrap()
        guess = [lng, lat]
        if (pin) pin.setLatLng([lat, lng])
        else pin = L.circleMarker([lat, lng], { radius: 8, color: '#2068dd', fillOpacity: 1 }).addTo(map)
        controls()
      })
    }
    map.invalidateSize()
    if (!mapReady) tiles.redraw()
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
    el('.explore-map').hidden = false; map.invalidateSize()
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
    button('retry').hidden = false; button('retry').textContent = t('explore.again')
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
    if (action === 'flat') { flatOnly = true; return renderer() }
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
      for (const key of ['prev', 'next', 'nearby', 'spawn', 'map', 'flat', 'exit', 'guess', 'continue', 'retry']) {
        button(key).textContent = t(`explore.${key === 'retry' && rounds.length === 5 ? 'again' : key}`)
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
