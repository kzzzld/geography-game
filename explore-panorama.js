import { Viewer } from '@photo-sphere-viewer/core'
import '@photo-sphere-viewer/core/index.css'

export function createPanorama(container, url, t) {
  const viewer = new Viewer({
    container, panorama: url, navbar: false, keyboard: false,
    loadingTxt: t('explore.loading'), moveInertia: false,
    lang: { loadError: t('explore.photoError'), webglError: t('explore.photoError') },
  })
  return viewer
}
