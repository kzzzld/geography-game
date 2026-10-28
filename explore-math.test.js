import test from 'node:test'
import assert from 'node:assert/strict'
import { distanceKm, roundPoints, isPanorama } from './explore-math.js'

test('great-circle distances include identical points and antimeridian crossings', () => {
  assert.equal(distanceKm([10, 20], [10, 20]), 0)
  assert.ok(Math.abs(distanceKm([179.9, 0], [-179.9, 0]) - 22.239) < .001)
  assert.ok(Math.abs(distanceKm([0, 0], [180, 0]) - 20015.087) < .001)
})

test('scoring preserves the 25 metre bonus and exponential distance curve', () => {
  assert.equal(roundPoints(0), 5000)
  assert.equal(roundPoints(.025), 5000)
  assert.equal(roundPoints(2000), 1839)
  assert.equal(roundPoints(10000), 34)
  assert.ok(roundPoints(2001) < roundPoints(2000))
})

test('only valid panoramic SD imagery is accepted', () => {
  const photo = { geometry: { type: 'Point', coordinates: [0, 0] }, properties: { 'pers:interior_orientation': { field_of_view: 360 } }, assets: { sd: { href: 'https://example.org/photo.jpg' } } }
  assert.ok(isPanorama(photo))
  assert.equal(isPanorama({ ...photo, assets: {} }), false)
  assert.equal(isPanorama({ ...photo, properties: {} }), false)
  assert.equal(isPanorama({ ...photo, geometry: { type: 'Point', coordinates: [NaN, 0] } }), false)
})
