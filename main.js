import './style.css'

// ===== Localization =====
const LOCALE_MODULES = import.meta.glob('./locales/*.json', { eager: true, import: 'default' })

const LANGUAGES = Object.entries(LOCALE_MODULES)
  .map(([path, data]) => ({
    id: path.replace('./locales/', '').replace(/\.json$/, ''),
    label: data.name || path,
    data,
  }))
  .sort((a, b) => (a.id === 'en' ? -1 : b.id === 'en' ? 1 : a.id.localeCompare(b.id)))

const FALLBACK_LOCALE = LANGUAGES.find(l => l.id === 'en')?.data || {}
const DEFAULT_LANGUAGE = 'en'

let language = DEFAULT_LANGUAGE
let locale = FALLBACK_LOCALE

function t(key, vars) {
  const value = locale?.ui?.[key] ?? FALLBACK_LOCALE?.ui?.[key] ?? key
  if (!vars) return value
  return Object.entries(vars).reduce((str, [k, v]) => str.replaceAll(`{${k}}`, v), value)
}

function countryName(name) {
  return locale?.countries?.[name] ?? name
}

function capitalName(name) {
  return locale?.capitals?.[name] ?? name
}

function countryCode(country) {
  return /flagcdn\.com\/w320\/([a-z]{2})\.png/.exec(country?.flag || '')?.[1] || null
}

const WORLD_MAP_URL = './world.svg'
const WORLD_FOCUS_URL = './focus.json'
let worldMapPromise = null
let worldFocusPromise = null

function loadWorldMap() {
  if (!worldMapPromise) {
    worldMapPromise = fetch(WORLD_MAP_URL)
      .then(res => res.text())
      .then(text => new DOMParser().parseFromString(text, 'image/svg+xml').documentElement)
      .catch(() => null)
  }
  return worldMapPromise
}

function loadWorldFocus() {
  if (!worldFocusPromise) {
    worldFocusPromise = fetch(WORLD_FOCUS_URL)
      .then(res => res.json())
      .catch(() => null)
  }
  return worldFocusPromise
}

function preloadImage(url) {
  if (!url) return
  const img = new Image()
  img.decoding = 'async'
  img.src = url
}

function preloadQuestionImages(questions) {
  questions.forEach(q => {
    if (q.mode === 'map') {
      loadWorldMap()
      loadWorldFocus()
    } else if (q.mode === 'flag') {
      preloadImage(q.country.flag)
    }
  })
}

function modeLabel(mode) {
  return t(`mode.${mode.id}`)
}

function modeShort(mode) {
  return t(`mode.${mode.id}.short`)
}

function positionLabel(position) {
  return t(`position.${position.id}`)
}


const THEMES = [
  { id: 'tokyonight', label: 'Tokyo Night', dark: 'tokyonight', light: 'tokyonight-day' },
  { id: 'nord', label: 'Nord', dark: 'nord', light: 'nord-light' },
  { id: 'dark', label: 'Dark', dark: 'dark', light: 'light' },
  { id: 'amoled', label: 'AMOLED', dark: 'amoled', light: 'amoled-light' },
  { id: 'catppuccin', label: 'Catppuccin', dark: 'mocha', light: 'latte' },
  { id: 'blackmetal', label: 'Black Metal', dark: 'blackmetal', light: 'blackmetal-light' },
]

const FONTS = [
  { id: 'inter', label: 'Inter', family: "'Inter', system-ui, sans-serif" },
  { id: 'jetbrains', label: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
  { id: 'iosevka', label: 'Iosevka', family: "'Iosevka', monospace" },
  { id: 'firacode', label: 'Fira Code', family: "'Fira Code', monospace" },
  { id: 'ibmplexmono', label: 'IBM Plex Mono', family: "'IBM Plex Mono', monospace" },
  { id: 'sourcecodepro', label: 'Source Code Pro', family: "'Source Code Pro', monospace" },
  { id: 'robotomono', label: 'Roboto Mono', family: "'Roboto Mono', monospace" },
]

const CMDLINE_POSITIONS = [
  { id: 'center', label: 'Center' },
  { id: 'top', label: 'Top' },
  { id: 'bottom', label: 'Bottom' },
]

const QUIZ_MODES = [
  { id: 'flag', label: 'Flag → Country', short: 'Flag' },
  { id: 'country', label: 'Country → Flag', short: 'Country' },
  { id: 'capital', label: 'Capital → Country', short: 'Capital' },
  { id: 'map', label: 'Map → Country', short: 'Map' },
  { id: 'mixed', label: 'Mixed', short: 'Mixed' },
]

const MIXED_PROMPT_MODES = ['flag', 'country', 'capital', 'map']

const WELCOME_ASCII = [
  "-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----",
  "           . _..::__:  ,-\"-\"._        |7       ,     _,.__",
  "   _.___ _ _<_>`!(._`.`-.    /         _._     `_ ,_/  '  '-._.---.-.__",
  ">.{     \" \" `-==,',._\\{  \\  / {)      / _ \">_,-' `                mt-2_",
  "  \\_.:--.       `._ )`^-. \"'       , [_/(                       __,/-'",
  " '\"'     \\         \"    _L        oD_,--'                )     /. (|",
  "          |           ,'          _)_.\\\\._<> 6              _,' /  '",
  "          `.         /           [_/_'` `\"(                <'}  )",
  "           \\\\    .-. )           /   `-'\"..' `:.#          _)  '",
  "    `        \\  (  `(           /         `:\\  > \\  ,-^.  /' '",
  "              `._,   \"\"         |           \\`'   \\|   ?_)  {\\",
  "                 `=.---.        `._._       ,'     \"`  |' ,- '.",
  "                   |    `-._         |     /          `:`<_|h--._",
  "                   (        >        .     | ,          `=.__.`-'\\",
  "                    `.     /         |     |{|              ,-.,\\     .",
  "                     |   ,'           \\   / `'            ,\"     \\",
  "                     |  /              |_'                |  __  /",
  "                     | |                                  '-'  `-'   \\.",
  "                     |/                                         \"    /",
  "                     \\.                                             '",
  "                      ,/            ______._.--._ _..---.---------._",
  "     ,-----\"-..?----_/ )      __,-'\"             \"                  (",
  "-.._(                  `-----'                                       `-",
  "-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----",
].join("\n")

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

let countries = []
let quizQuestions = []
let missedQuestions = []
let currentIndex = 0
let score = 0
let points = 0
let currentStreak = 0
let bestStreak = 0
let bestStreakAtStart = 0
let streakRecordCelebrated = false
let answered = false
let lastSelected = null
let quizStartTime = 0
let timerId = null
let timeLeft = 0
let timerPaused = false

const app = document.querySelector('#app')

// ===== Theme management =====
const DEFAULT_THEME = 'tokyonight'
let themeVariant = 'dark'
let currentThemeId = DEFAULT_THEME

function getTheme(themeId) {
  return THEMES.find(t => t.id === themeId) || THEMES[0]
}

function resolveThemeVariant(theme, variant) {
  const wantsLight = variant === 'light' && Boolean(theme.light)
  return { variant: wantsLight ? 'light' : 'dark', cssId: wantsLight ? theme.light : theme.dark }
}

function applyTheme(themeId, variant = themeVariant, persist = true) {
  const theme = getTheme(themeId)
  const resolved = resolveThemeVariant(theme, variant)
  themeVariant = resolved.variant
  currentThemeId = theme.id
  document.documentElement.setAttribute('data-theme', resolved.cssId)
  document.documentElement.setAttribute('data-variant', resolved.variant)
  if (persist) {
    localStorage.setItem('flag-quiz-theme', theme.id)
    localStorage.setItem('flag-quiz-theme-variant', resolved.variant)
  }
  syncVariantToggle()
  const select = document.getElementById('themeSelect')
  if (select) select.value = theme.id
  return theme
}

function loadTheme() {
  const stored = localStorage.getItem('flag-quiz-theme')
  if (THEMES.some(t => t.id === stored)) return stored
  const legacy = THEMES.find(t => t.dark === stored || t.light === stored)
  return legacy ? legacy.id : DEFAULT_THEME
}

function applyStoredTheme() {
  const stored = localStorage.getItem('flag-quiz-theme')
  let variant = localStorage.getItem('flag-quiz-theme-variant') === 'light' ? 'light' : 'dark'
  if (THEMES.some(t => t.id === stored)) return applyTheme(stored, variant)
  const legacy = THEMES.find(t => t.dark === stored || t.light === stored)
  if (!legacy) return applyTheme(DEFAULT_THEME, variant)
  if (stored === legacy.light) variant = 'light'
  return applyTheme(legacy.id, variant)
}

function toggleThemeVariant() {
  const theme = getTheme(currentThemeId)
  if (!theme.light) return
  applyTheme(theme.id, themeVariant === 'light' ? 'dark' : 'light')
}

function syncVariantToggle() {
  const btn = document.querySelector('#variantToggle')
  if (!btn) return
  const theme = getTheme(currentThemeId)
  btn.disabled = !theme.light
  btn.setAttribute('aria-pressed', String(themeVariant === 'light'))
  btn.title = !theme.light ? t('theme.noLight') : themeVariant === 'light' ? t('theme.toDark') : t('theme.toLight')
  btn.setAttribute('aria-label', btn.title)
}

// ===== Font management =====
function applyFont(fontId) {
  const font = FONTS.find(f => f.id === fontId) || FONTS[0]
  document.documentElement.style.setProperty('--font-family', font.family)
  localStorage.setItem('flag-quiz-font', fontId)
}

function loadFont() {
  return localStorage.getItem('flag-quiz-font') || 'iosevka'
}

// ===== Corner padding management =====
const DEFAULT_CORNER_PADDING = 32
const MIN_CORNER_PADDING = 0
const MAX_CORNER_PADDING = 48

function applyCornerPadding(px) {
  document.documentElement.style.setProperty('--corner-padding', `${px}px`)
  localStorage.setItem('flag-quiz-corner-padding', String(px))
}

function loadCornerPadding() {
  const stored = localStorage.getItem('flag-quiz-corner-padding')
  const parsed = stored === null ? NaN : parseInt(stored, 10)
  if (!Number.isFinite(parsed)) return DEFAULT_CORNER_PADDING
  return Math.min(MAX_CORNER_PADDING, Math.max(MIN_CORNER_PADDING, parsed))
}

// ===== Corner radius management =====
const DEFAULT_CORNER_RADIUS = 0
const MIN_CORNER_RADIUS = 0
const MAX_CORNER_RADIUS = 48

function applyCornerRadius(px) {
  document.documentElement.style.setProperty('--corner-radius', `${px}px`)
  localStorage.setItem('flag-quiz-corner-radius', String(px))
}

function loadCornerRadius() {
  const stored = localStorage.getItem('flag-quiz-corner-radius')
  const parsed = stored === null ? NaN : parseInt(stored, 10)
  if (!Number.isFinite(parsed)) return DEFAULT_CORNER_RADIUS
  return Math.min(MAX_CORNER_RADIUS, Math.max(MIN_CORNER_RADIUS, parsed))
}

// ===== Questions per quiz management =====
const DEFAULT_QUESTIONS_PER_QUIZ = 20
const MIN_QUESTIONS_PER_QUIZ = 5
const MAX_QUESTIONS_PER_QUIZ = 50

let questionsPerQuiz = DEFAULT_QUESTIONS_PER_QUIZ

function clampQuestionsPerQuiz(value) {
  const parsed = parseInt(value, 10)
  if (!Number.isFinite(parsed)) return DEFAULT_QUESTIONS_PER_QUIZ
  return Math.min(MAX_QUESTIONS_PER_QUIZ, Math.max(MIN_QUESTIONS_PER_QUIZ, parsed))
}

function applyQuestionsPerQuiz(value) {
  const count = clampQuestionsPerQuiz(value)
  questionsPerQuiz = count
  localStorage.setItem('flag-quiz-questions-per-quiz', String(count))
  return count
}

function loadQuestionsPerQuiz() {
  const stored = localStorage.getItem('flag-quiz-questions-per-quiz')
  if (stored === null) return DEFAULT_QUESTIONS_PER_QUIZ
  return clampQuestionsPerQuiz(stored)
}

// ===== Answer options count management =====
const DEFAULT_OPTIONS_COUNT = 5
const MIN_OPTIONS_COUNT = 2
const MAX_OPTIONS_COUNT = LETTERS.length

let optionsCount = DEFAULT_OPTIONS_COUNT

function clampOptionsCount(value) {
  const parsed = parseInt(value, 10)
  if (!Number.isFinite(parsed)) return DEFAULT_OPTIONS_COUNT
  return Math.min(MAX_OPTIONS_COUNT, Math.max(MIN_OPTIONS_COUNT, parsed))
}

function applyOptionsCount(value) {
  const count = clampOptionsCount(value)
  optionsCount = count
  localStorage.setItem('flag-quiz-options-count', String(count))
  return count
}

function loadOptionsCount() {
  const stored = localStorage.getItem('flag-quiz-options-count')
  if (stored === null) return DEFAULT_OPTIONS_COUNT
  return clampOptionsCount(stored)
}

// ===== Streak management =====
function loadBestStreak() {
  const stored = localStorage.getItem('flag-quiz-best-streak')
  const parsed = parseInt(stored, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function saveBestStreak(value) {
  bestStreak = Math.max(0, value)
  localStorage.setItem('flag-quiz-best-streak', String(bestStreak))
  return bestStreak
}

function recordCorrectStreak() {
  currentStreak++
  if (currentStreak > bestStreak) saveBestStreak(currentStreak)
  if (!streakRecordCelebrated && currentStreak > bestStreakAtStart) {
    streakRecordCelebrated = true
    return true
  }
  return false
}

function resetStreak() {
  currentStreak = 0
}

// ===== Quiz mode management =====
const DEFAULT_QUIZ_MODE = 'flag'

let quizMode = DEFAULT_QUIZ_MODE

function syncModeButtons() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    const active = btn.dataset.mode === quizMode
    btn.classList.toggle('active', active)
    btn.setAttribute('aria-pressed', String(active))
  })
}

function applyQuizMode(modeId) {
  const mode = QUIZ_MODES.find(m => m.id === modeId) || QUIZ_MODES[0]
  quizMode = mode.id
  localStorage.setItem('flag-quiz-mode', mode.id)
  syncModeButtons()
  return mode
}

function loadQuizMode() {
  const stored = localStorage.getItem('flag-quiz-mode')
  return QUIZ_MODES.some(m => m.id === stored) ? stored : DEFAULT_QUIZ_MODE
}

// ===== Language management =====
function applyLanguage(langId) {
  const found = LANGUAGES.find(l => l.id === langId) || LANGUAGES.find(l => l.id === DEFAULT_LANGUAGE) || LANGUAGES[0]
  language = found.id
  locale = found.data
  localStorage.setItem('flag-quiz-language', found.id)
  document.querySelector('#cmdlineInput')?.setAttribute('aria-label', t('cmdline.aria'))
  localizeThemeGallery()
  return found
}

function detectLanguage() {
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of preferred.filter(Boolean)) {
    const base = tag.toLowerCase().split('-')[0]
    const match = LANGUAGES.find(l => l.id.toLowerCase() === base)
    if (match) return match.id
  }
  return DEFAULT_LANGUAGE
}

function loadLanguage() {
  const stored = localStorage.getItem('flag-quiz-language')
  if (LANGUAGES.some(l => l.id === stored)) return stored
  return detectLanguage()
}

// ===== Timer management =====
const DEFAULT_TIMER_ENABLED = false
const DEFAULT_TIMER_SECONDS = 15
const MIN_TIMER_SECONDS = 5
const MAX_TIMER_SECONDS = 60
const SCORE_BASE = 100
const SCORE_TIME_BONUS = 10

let timerEnabled = DEFAULT_TIMER_ENABLED
let timerSeconds = DEFAULT_TIMER_SECONDS

function applyTimerEnabled(enabled) {
  timerEnabled = enabled === true || enabled === 'true' || enabled === 'on'
  localStorage.setItem('flag-quiz-timer-enabled', String(timerEnabled))
  return timerEnabled
}

function loadTimerEnabled() {
  const stored = localStorage.getItem('flag-quiz-timer-enabled')
  return stored === null ? DEFAULT_TIMER_ENABLED : stored === 'true'
}

function clampTimerSeconds(value) {
  const parsed = parseInt(value, 10)
  if (!Number.isFinite(parsed)) return DEFAULT_TIMER_SECONDS
  return Math.min(MAX_TIMER_SECONDS, Math.max(MIN_TIMER_SECONDS, parsed))
}

function applyTimerSeconds(value) {
  const seconds = clampTimerSeconds(value)
  timerSeconds = seconds
  localStorage.setItem('flag-quiz-timer-seconds', String(seconds))
  return seconds
}

function loadTimerSeconds() {
  const stored = localStorage.getItem('flag-quiz-timer-seconds')
  if (stored === null) return DEFAULT_TIMER_SECONDS
  return clampTimerSeconds(stored)
}

// ===== Command line position management =====
const DEFAULT_CMDLINE_POSITION = 'center'

function applyCmdlinePosition(positionId) {
  const position = CMDLINE_POSITIONS.find(p => p.id === positionId) || CMDLINE_POSITIONS[0]
  cmdline.dataset.position = position.id
  localStorage.setItem('flag-quiz-cmdline-position', position.id)
}

function loadCmdlinePosition() {
  const stored = localStorage.getItem('flag-quiz-cmdline-position')
  return CMDLINE_POSITIONS.some(p => p.id === stored) ? stored : DEFAULT_CMDLINE_POSITION
}

// ===== Shuffle utility =====
function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// ===== Build quiz questions =====
function buildQuestion(country, mode = quizMode) {
  const wrongs = shuffle(countries.filter(c => c.country !== country.country)).slice(0, optionsCount - 1)
  const options = shuffle([country, ...wrongs])
  let resolvedMode = mode === 'mixed' ? MIXED_PROMPT_MODES[Math.floor(Math.random() * MIXED_PROMPT_MODES.length)] : mode
  if (resolvedMode === 'map' && !countryCode(country)) resolvedMode = 'flag'
  return { country, options, mode: resolvedMode }
}

function buildQuiz() {
  const pool = quizMode === 'map' ? countries.filter(c => countryCode(c)) : countries
  const shuffled = shuffle(pool)
  const selected = shuffled.slice(0, Math.min(questionsPerQuiz, shuffled.length))
  return selected.map(country => buildQuestion(country))
}

// ===== Number input max guard =====
function guardNumberInputs(scope = document) {
  scope.querySelectorAll('.number-input').forEach(input => {
    if (input.dataset.maxGuarded === 'true') return
    input.dataset.maxGuarded = 'true'
    input.addEventListener('input', () => {
      if (input.value === '') return
      const max = Number(input.max)
      const value = Number(input.value)
      if (Number.isFinite(max) && Number.isFinite(value) && value > max) {
        input.value = String(max)
      }
    })
  })
}

// ===== Settings modal =====
function renderSettingsModal() {
  return `
    <div class="modal-overlay" id="settingsModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
        <div class="modal-header">
          <span class="modal-title" id="settingsTitle">${t('settings.title')}</span>
          <button class="modal-close" id="settingsClose" aria-label="${t('settings.close')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="setting-category">${t('settings.category.general')}</div>
        <div class="setting-group">
          <div class="setting-row">
            <label class="setting-label" for="languageSelect">${t('settings.language')}</label>
            <select class="select" id="languageSelect">
              ${LANGUAGES.map(l => `<option value="${l.id}" ${l.id === loadLanguage() ? 'selected' : ''}>${l.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="setting-category">${t('settings.category.appearance')}</div>
        <div class="setting-group">
          <div class="setting-row">
            <label class="setting-label" for="fontSelect">${t('settings.font')}</label>
            <select class="select" id="fontSelect">
              ${FONTS.map(f => `<option value="${f.id}" ${f.id === loadFont() ? 'selected' : ''}>${f.label}</option>`).join('')}
            </select>
          </div>
          <div class="setting-row">
            <label class="setting-label" for="themeSelect">${t('settings.theme')}</label>
            <div class="setting-control">
              <select class="select" id="themeSelect">
                ${THEMES.map(th => `<option value="${th.id}" ${th.id === loadTheme() ? 'selected' : ''}>${th.label}</option>`).join('')}
              </select>
              <button class="browse-themes-btn" type="button" id="browseThemesBtn" aria-label="${t('settings.browseThemes')}" title="${t('settings.browseThemes')}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              </button>
            </div>
          </div>
          <div class="setting-row">
            <label class="setting-label" for="radiusInput">${t('settings.radius')}</label>
            <input class="number-input" type="number" id="radiusInput" min="${MIN_CORNER_RADIUS}" max="${MAX_CORNER_RADIUS}" step="1" value="${loadCornerRadius()}" />
          </div>
          <div class="setting-row">
            <label class="setting-label" for="paddingInput">${t('settings.corner')}</label>
            <input class="number-input" type="number" id="paddingInput" min="${MIN_CORNER_PADDING}" max="${MAX_CORNER_PADDING}" step="1" value="${loadCornerPadding()}" />
          </div>
        </div>
        <div class="setting-category">${t('settings.category.gameplay')}</div>
        <div class="setting-group">
          <div class="setting-row">
            <label class="setting-label" for="questionsInput">${t('settings.questions')} <span class="setting-note">${t('settings.refresh')}</span></label>
            <input class="number-input" type="number" id="questionsInput" min="${MIN_QUESTIONS_PER_QUIZ}" max="${MAX_QUESTIONS_PER_QUIZ}" step="1" value="${loadQuestionsPerQuiz()}" />
          </div>
          <div class="setting-row">
            <label class="setting-label" for="optionsInput">${t('settings.options')} <span class="setting-note">${t('settings.refresh')}</span></label>
            <input class="number-input" type="number" id="optionsInput" min="${MIN_OPTIONS_COUNT}" max="${MAX_OPTIONS_COUNT}" step="1" value="${loadOptionsCount()}" />
          </div>
        </div>
        <div class="setting-category">${t('settings.category.interface')}</div>
        <div class="setting-group">
          <div class="setting-row">
            <label class="setting-label" for="cmdlineSelect">${t('settings.commandLine')}</label>
            <select class="select" id="cmdlineSelect">
              ${CMDLINE_POSITIONS.map(p => `<option value="${p.id}" ${p.id === loadCmdlinePosition() ? 'selected' : ''}>${positionLabel(p)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    </div>
  `
}

let lastFocusedBeforeModal = null

function openSettings() {
  const modal = document.getElementById('settingsModal')
  lastFocusedBeforeModal = document.activeElement
  timerPaused = timerId !== null
  stopTimer()
  modal.classList.add('open')
  document.getElementById('settingsClose').addEventListener('click', closeSettings)
  modal.addEventListener('click', (e) => { if (e.target === modal) closeSettings() })
  document.getElementById('themeSelect').addEventListener('change', (e) => applyTheme(e.target.value))
  document.getElementById('browseThemesBtn').addEventListener('click', () => openThemeGallery())
  document.getElementById('fontSelect').addEventListener('change', (e) => applyFont(e.target.value))
  document.getElementById('cmdlineSelect').addEventListener('change', (e) => applyCmdlinePosition(e.target.value))
  document.getElementById('languageSelect').addEventListener('change', (e) => {
    applyLanguage(e.target.value)
    closeSettings()
    rerender()
  })
  document.getElementById('questionsInput').addEventListener('input', (e) => {
    applyQuestionsPerQuiz(e.target.value)
  })
  document.getElementById('questionsInput').addEventListener('change', (e) => {
    e.target.value = loadQuestionsPerQuiz()
  })
  document.getElementById('optionsInput').addEventListener('input', (e) => {
    applyOptionsCount(e.target.value)
  })
  document.getElementById('optionsInput').addEventListener('change', (e) => {
    e.target.value = loadOptionsCount()
  })
  document.getElementById('paddingInput').addEventListener('input', (e) => {
    applyCornerPadding(e.target.value)
  })
  document.getElementById('paddingInput').addEventListener('change', (e) => {
    e.target.value = loadCornerPadding()
  })
  document.getElementById('radiusInput').addEventListener('input', (e) => {
    applyCornerRadius(e.target.value)
  })
  document.getElementById('radiusInput').addEventListener('change', (e) => {
    const px = loadCornerRadius()
    e.target.value = px
  })
  document.getElementById('settingsClose').focus()
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open')
  if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
    lastFocusedBeforeModal.focus()
  }
  lastFocusedBeforeModal = null
  if (timerPaused && timerEnabled && !answered && document.querySelector('#nextBtn')?.style.display === 'none') {
    startTimer(false)
  }
  timerPaused = false
}

function isSettingsOpen() {
  return document.getElementById('settingsModal')?.classList.contains('open') ?? false
}

function getModalFocusable(modal) {
  return Array.from(modal.querySelectorAll('button, select, input, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.disabled && el.offsetParent !== null)
}

// ===== Theme gallery =====
function themeCardVariantLabel(theme) {
  return theme.light ? t('theme.gallery.darkLight') : t('theme.gallery.darkOnly')
}

function renderThemeCard(theme, index) {
  const resolved = resolveThemeVariant(theme, themeVariant)
  return `
    <button class="theme-card" type="button" role="option" id="themeCard-${theme.id}" data-theme-id="${theme.id}"
      data-theme="${resolved.cssId}" data-variant="${resolved.variant}"
      aria-selected="false" style="--i:${index}">
      <span class="theme-card-preview" aria-hidden="true">
        <span class="tp-chrome"><span></span><span></span><span></span></span>
        <span class="tp-flag"></span>
        <span class="tp-row tp-correct"></span>
        <span class="tp-row"></span>
        <span class="tp-row"></span>
      </span>
      <span class="theme-card-meta">
        <span class="theme-card-name">${theme.label}</span>
        <span class="theme-card-variant">${themeCardVariantLabel(theme)}</span>
      </span>
      <span class="theme-card-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>
      </span>
    </button>`
}

const themeGallery = document.createElement('div')
themeGallery.id = 'themeGallery'
themeGallery.className = 'theme-gallery'
themeGallery.setAttribute('role', 'dialog')
themeGallery.setAttribute('aria-modal', 'true')
themeGallery.setAttribute('aria-label', t('theme.gallery.aria'))
themeGallery.innerHTML = `
  <div class="theme-gallery-head">
    <h2 class="theme-gallery-title" id="themeGalleryTitle">${t('theme.gallery.title')}</h2>
    <div class="theme-gallery-hint">
      <span><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> ${t('theme.gallery.browse')}</span>
      <span><kbd>↵</kbd> ${t('theme.gallery.apply')}</span>
      <span><kbd>esc</kbd> ${t('theme.gallery.cancel')}</span>
    </div>
    <button class="theme-gallery-close" type="button" aria-label="${t('settings.close')}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="theme-gallery-grid" id="themeGalleryGrid" role="listbox" tabindex="0" aria-labelledby="themeGalleryTitle">
    ${THEMES.map((theme, i) => renderThemeCard(theme, i)).join('')}
  </div>
`
document.body.appendChild(themeGallery)

const themeGrid = themeGallery.querySelector('#themeGalleryGrid')

function localizeThemeGallery() {
  themeGallery.setAttribute('aria-label', t('theme.gallery.aria'))
  themeGallery.querySelector('.theme-gallery-title').textContent = t('theme.gallery.title')
  themeGallery.querySelector('.theme-gallery-close').setAttribute('aria-label', t('settings.close'))
  const hints = themeGallery.querySelectorAll('.theme-gallery-hint span')
  hints[0].innerHTML = `<kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> ${t('theme.gallery.browse')}`
  hints[1].innerHTML = `<kbd>↵</kbd> ${t('theme.gallery.apply')}`
  hints[2].innerHTML = `<kbd>esc</kbd> ${t('theme.gallery.cancel')}`
}

let galleryOpen = false
let galleryIndex = 0
let galleryOrigin = null
let galleryTimerPaused = false
let galleryPreviousFocus = null

function themeCards() {
  return Array.from(themeGrid.querySelectorAll('.theme-card'))
}

function galleryColumns() {
  const cards = themeCards()
  if (cards.length < 2) return 1
  const top = cards[0].offsetTop
  let columns = 0
  while (columns < cards.length && cards[columns].offsetTop === top) columns++
  return Math.max(1, columns)
}

function selectGalleryTheme(index, preview = true) {
  const cards = themeCards()
  if (cards.length === 0) return
  galleryIndex = (index + cards.length) % cards.length
  cards.forEach((card, i) => {
    const selected = i === galleryIndex
    card.setAttribute('aria-selected', String(selected))
    card.tabIndex = selected ? 0 : -1
  })
  const card = cards[galleryIndex]
  card.scrollIntoView({ block: 'nearest' })
  themeGrid.setAttribute('aria-activedescendant', `themeCard-${card.dataset.themeId}`)
  if (preview) applyTheme(card.dataset.themeId, themeVariant, false)
}

function moveGallerySelection(delta) {
  selectGalleryTheme(galleryIndex + delta)
}

function handleGalleryKey(e) {
  const cols = galleryColumns()
  switch (e.key) {
    case 'Escape': e.preventDefault(); closeThemeGallery(false); return
    case 'Enter':
    case ' ': e.preventDefault(); closeThemeGallery(true); return
    case 'ArrowRight': e.preventDefault(); moveGallerySelection(1); return
    case 'ArrowLeft': e.preventDefault(); moveGallerySelection(-1); return
    case 'ArrowDown': e.preventDefault(); moveGallerySelection(cols); return
    case 'ArrowUp': e.preventDefault(); moveGallerySelection(-cols); return
    case 'Home': e.preventDefault(); selectGalleryTheme(0); return
    case 'End': e.preventDefault(); selectGalleryTheme(themeCards().length - 1); return
    case 'Tab': {
      e.preventDefault()
      const close = themeGallery.querySelector('.theme-gallery-close')
      if (document.activeElement === close) themeGrid.focus()
      else close.focus()
      return
    }
  }
}

function openThemeGallery() {
  if (galleryOpen) return
  galleryOpen = true
  localizeThemeGallery()
  galleryOrigin = { id: currentThemeId, variant: themeVariant }
  galleryPreviousFocus = document.activeElement
  galleryTimerPaused = timerId !== null
  stopTimer()
  themeGrid.innerHTML = THEMES.map((theme, i) => renderThemeCard(theme, i)).join('')
  themeGallery.classList.add('open')
  const start = THEMES.findIndex(theme => theme.id === currentThemeId)
  selectGalleryTheme(start === -1 ? 0 : start, false)
  themeGrid.focus()
}

function closeThemeGallery(commit) {
  if (!galleryOpen) return
  galleryOpen = false
  if (commit) {
    applyTheme(currentThemeId, themeVariant)
  } else if (galleryOrigin) {
    applyTheme(galleryOrigin.id, galleryOrigin.variant, false)
  }
  themeGallery.classList.remove('open')
  if (galleryPreviousFocus && document.contains(galleryPreviousFocus) && !galleryPreviousFocus.disabled) {
    galleryPreviousFocus.focus()
  }
  galleryPreviousFocus = null
  if (galleryTimerPaused && timerEnabled && !answered && !isSettingsOpen() && document.querySelector('#nextBtn')?.style.display === 'none') {
    startTimer(false)
  }
  galleryTimerPaused = false
}

function isThemeGalleryOpen() {
  return galleryOpen
}

themeGallery.querySelector('.theme-gallery-close').addEventListener('click', () => closeThemeGallery(false))
themeGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.theme-card')
  if (!card) return
  selectGalleryTheme(themeCards().indexOf(card), false)
  closeThemeGallery(true)
})

// ===== Vim-style command line =====
const normalizeName = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

const cmdline = document.createElement('div')
cmdline.id = 'cmdline'
cmdline.innerHTML = `
  <span class="cmdline-prompt" aria-hidden="true">:</span>
  <input class="cmdline-input" id="cmdlineInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${t('cmdline.aria')}" />
  <span class="cmdline-message" id="cmdlineMessage" role="status" aria-live="polite"></span>
`
document.body.appendChild(cmdline)

const cmdInput = cmdline.querySelector('#cmdlineInput')
const cmdMessage = cmdline.querySelector('#cmdlineMessage')
const cmdHistory = []
let cmdHistoryPos = -1
let cmdPreviousFocus = null
let cmdMessageTimer = null

function showCmdMessage(text, isError = false) {
  clearTimeout(cmdMessageTimer)
  cmdMessage.textContent = text
  cmdMessage.classList.toggle('error', isError)
  cmdline.classList.add('visible', 'has-message')
  cmdMessageTimer = setTimeout(() => {
    cmdMessage.textContent = ''
    cmdline.classList.remove('visible', 'has-message')
  }, 3000)
}

function openCommandLine() {
  clearTimeout(cmdMessageTimer)
  cmdMessage.textContent = ''
  cmdline.classList.remove('has-message')
  cmdPreviousFocus = document.activeElement
  cmdline.classList.add('visible', 'editing')
  cmdInput.value = ''
  cmdHistoryPos = -1
  cmdInput.focus()
}

function closeCommandLine() {
  clearCompletion()
  cmdline.classList.remove('editing')
  if (!cmdline.classList.contains('has-message')) cmdline.classList.remove('visible')
  cmdInput.value = ''
  cmdInput.blur()
  if (cmdPreviousFocus && document.contains(cmdPreviousFocus) && !cmdPreviousFocus.disabled) {
    cmdPreviousFocus.focus()
  }
  cmdPreviousFocus = null
}

function findByName(list, query) {
  const q = normalizeName(query)
  if (!q) return null
  return list.find(item => normalizeName(item.id) === q || normalizeName(item.label) === q) || null
}

function resetApp() {
  localStorage.removeItem('flag-quiz-theme')
  localStorage.removeItem('flag-quiz-theme-variant')
  localStorage.removeItem('flag-quiz-font')
  localStorage.removeItem('flag-quiz-corner-padding')
  localStorage.removeItem('flag-quiz-corner-radius')
  localStorage.removeItem('flag-quiz-cmdline-position')
  localStorage.removeItem('flag-quiz-questions-per-quiz')
  localStorage.removeItem('flag-quiz-options-count')
  localStorage.removeItem('flag-quiz-best-streak')
  localStorage.removeItem('flag-quiz-mode')
  localStorage.removeItem('flag-quiz-timer-enabled')
  localStorage.removeItem('flag-quiz-timer-seconds')
  localStorage.removeItem('flag-quiz-language')
  applyStoredTheme()
  applyFont(loadFont())
  applyCornerPadding(loadCornerPadding())
  applyCornerRadius(loadCornerRadius())
  applyCmdlinePosition(loadCmdlinePosition())
  applyQuestionsPerQuiz(loadQuestionsPerQuiz())
  applyOptionsCount(loadOptionsCount())
  saveBestStreak(loadBestStreak())
  applyQuizMode(loadQuizMode())
  applyTimerEnabled(loadTimerEnabled())
  applyTimerSeconds(loadTimerSeconds())
  applyLanguage(loadLanguage())
  showWelcome()
}

function runCommand(raw) {
  const [name = '', ...args] = raw.trim().split(/\s+/)
  const arg = args.join(' ')

  switch (name.toLowerCase()) {
    case 'answer':
    case 'a': {
      const buttons = Array.from(document.querySelectorAll('.answer-btn'))
      if (buttons.length === 0) return showCmdMessage(t('cmd.noQuestion'), true)
      if (answered) return showCmdMessage(t('cmd.alreadyAnswered'), true)
      const index = LETTERS.indexOf(arg.toUpperCase())
      if (arg.length !== 1 || index === -1 || !buttons[index]) {
        return showCmdMessage(t('cmd.invalidOption', { letters: LETTERS.slice(0, buttons.length).join(', ').toLowerCase() }), true)
      }
      handleAnswer(buttons[index])
      return
    }
    case 'reset':
      resetApp()
      return showCmdMessage(t('cmd.appReset'))
    case 'font': {
      const font = findByName(FONTS, arg)
      if (!font) return showCmdMessage(t('cmd.invalidFont'), true)
      applyFont(font.id)
      return showCmdMessage(t('cmd.font', { name: font.label }))
    }
    case 'theme':
    case 'color':
    case 'colorscheme': {
      const theme = findByName(THEMES, arg)
      if (!theme) return showCmdMessage(t('cmd.invalidTheme'), true)
      applyTheme(theme.id)
      return showCmdMessage(t('cmd.theme', { name: theme.label }))
    }
    case 'cmdline': {
      const position = findByName(CMDLINE_POSITIONS, arg)
      if (!position) return showCmdMessage(t('cmd.invalidPosition'), true)
      applyCmdlinePosition(position.id)
      return showCmdMessage(t('cmd.cmdline', { name: positionLabel(position) }))
    }
    case 'variant': {
      const value = arg.trim().toLowerCase()
      const theme = getTheme(loadTheme())
      if (value === 'toggle') {
        if (!theme.light) return showCmdMessage(t('theme.noLight'), true)
        toggleThemeVariant()
        return showCmdMessage(t('cmd.variant', { name: themeVariant === 'light' ? t('theme.light') : t('theme.dark') }))
      }
      if (value !== 'dark' && value !== 'light') return showCmdMessage(t('cmd.invalidVariant'), true)
      if (value === 'light' && !theme.light) return showCmdMessage(t('theme.noLight'), true)
      applyTheme(theme.id, value)
      return showCmdMessage(t('cmd.variant', { name: value === 'light' ? t('theme.light') : t('theme.dark') }))
    }
    case 'questions': {
      const count = parseInt(arg, 10)
      if (!Number.isFinite(count)) return showCmdMessage(t('cmd.invalidNumber'), true)
      if (count < MIN_QUESTIONS_PER_QUIZ || count > MAX_QUESTIONS_PER_QUIZ) {
        return showCmdMessage(t('cmd.numberBetween', { min: MIN_QUESTIONS_PER_QUIZ, max: MAX_QUESTIONS_PER_QUIZ }), true)
      }
      applyQuestionsPerQuiz(count)
      return showCmdMessage(t('cmd.questions', { count }))
    }
    case 'corner': {
      const px = parseInt(arg, 10)
      if (!Number.isFinite(px)) return showCmdMessage(t('cmd.invalidNumber'), true)
      if (px < MIN_CORNER_PADDING || px > MAX_CORNER_PADDING) return showCmdMessage(t('cmd.numberBetween', { min: MIN_CORNER_PADDING, max: MAX_CORNER_PADDING }), true)
      applyCornerPadding(px)
      return showCmdMessage(t('cmd.corner', { px }))
    }
    case 'radius': {
      const px = parseInt(arg, 10)
      if (!Number.isFinite(px)) return showCmdMessage(t('cmd.invalidNumber'), true)
      if (px < MIN_CORNER_RADIUS || px > MAX_CORNER_RADIUS) return showCmdMessage(t('cmd.numberBetween', { min: MIN_CORNER_RADIUS, max: MAX_CORNER_RADIUS }), true)
      applyCornerRadius(px)
      return showCmdMessage(t('cmd.radius', { px }))
    }
    case 'options': {
      const count = parseInt(arg, 10)
      if (!Number.isFinite(count)) return showCmdMessage(t('cmd.invalidNumber'), true)
      if (count < MIN_OPTIONS_COUNT || count > MAX_OPTIONS_COUNT) {
        return showCmdMessage(t('cmd.numberBetween', { min: MIN_OPTIONS_COUNT, max: MAX_OPTIONS_COUNT }), true)
      }
      applyOptionsCount(count)
      return showCmdMessage(t('cmd.options', { count }))
    }
    case 'mode':
    case 'gamemode': {
      const mode = findByName(QUIZ_MODES, arg)
      if (!mode) return showCmdMessage(t('cmd.invalidMode', { modes: QUIZ_MODES.map(m => m.id).join(', ') }), true)
      applyQuizMode(mode.id)
      return showCmdMessage(t('cmd.mode', { name: modeLabel(mode) }))
    }
    case 'lang':
    case 'language': {
      const lang = LANGUAGES.find(l => normalizeName(l.id) === normalizeName(arg) || normalizeName(l.label) === normalizeName(arg))
      if (!lang) return showCmdMessage(t('cmd.invalidLang'), true)
      applyLanguage(lang.id)
      rerender()
      return showCmdMessage(t('cmd.lang', { name: lang.label }))
    }
    case 'time': {
      const value = arg.trim().toLowerCase()
      if (['off', 'false', 'no', '0'].includes(value)) {
        setTimerEnabled(false)
        return showCmdMessage(t('cmd.timeOff'))
      }
      if (['on', 'true', 'yes'].includes(value)) {
        setTimerEnabled(true)
        return showCmdMessage(t('cmd.timeOn', { seconds: timerSeconds }))
      }
      const seconds = parseInt(value, 10)
      if (!Number.isFinite(seconds)) return showCmdMessage(t('cmd.timeUse', { min: MIN_TIMER_SECONDS, max: MAX_TIMER_SECONDS }), true)
      if (seconds < MIN_TIMER_SECONDS || seconds > MAX_TIMER_SECONDS) {
        return showCmdMessage(t('cmd.numberBetween', { min: MIN_TIMER_SECONDS, max: MAX_TIMER_SECONDS }), true)
      }
      applyTimerSeconds(seconds)
      setTimerEnabled(true)
      return showCmdMessage(t('cmd.seconds', { seconds }))
    }
    case '':
      return
    default:
      return showCmdMessage(t('cmd.unknown', { name }), true)
  }
}

// ===== Tab completion =====
const COMMAND_NAMES = ['answer', 'cmdline', 'color', 'colorscheme', 'corner', 'font', 'gamemode', 'lang', 'language', 'mode', 'options', 'questions', 'radius', 'reset', 'theme', 'time', 'variant']
let completion = null

function getCompletionItems(text) {
  const spaceIndex = text.search(/\s/)
  if (spaceIndex === -1) {
    const q = text.toLowerCase()
    return {
      base: '',
      items: COMMAND_NAMES.filter(c => c.startsWith(q)).map(c => ({ value: c, label: c, insert: c + (c === 'reset' ? '' : ' ') })),
    }
  }

  const name = text.slice(0, spaceIndex).toLowerCase()
  const base = text.slice(0, spaceIndex) + ' '
  const typed = normalizeName(text.slice(spaceIndex).trim())
  let options = []

  if (name === 'font') {
    options = FONTS
      .filter(o => normalizeName(o.id).startsWith(typed) || normalizeName(o.label).startsWith(typed))
      .map(o => ({ value: o.id, label: o.label, insert: o.id }))
  } else if (name === 'theme' || name === 'color' || name === 'colorscheme') {
    options = THEMES
      .filter(o => normalizeName(o.id).startsWith(typed) || normalizeName(o.label).startsWith(typed))
      .map(o => ({ value: o.id, label: o.label, insert: o.id }))
  } else if (name === 'cmdline') {
    options = CMDLINE_POSITIONS
      .filter(o => normalizeName(o.id).startsWith(typed) || normalizeName(o.label).startsWith(typed))
      .map(o => ({ value: o.id, label: positionLabel(o), insert: o.id }))
  } else if (name === 'mode' || name === 'gamemode') {
    options = QUIZ_MODES
      .filter(o => normalizeName(o.id).startsWith(typed) || normalizeName(o.label).startsWith(typed))
      .map(o => ({ value: o.id, label: modeLabel(o), insert: o.id }))
  } else if (name === 'lang' || name === 'language') {
    options = LANGUAGES
      .filter(o => normalizeName(o.id).startsWith(typed) || normalizeName(o.label).startsWith(typed))
      .map(o => ({ value: o.id, label: o.label, insert: o.id }))
  } else if (name === 'time') {
    options = ['off']
      .filter(o => o.startsWith(typed))
      .map(o => ({ value: o, label: o, insert: o }))
  } else if (name === 'variant') {
    options = ['dark', 'light', 'toggle']
      .filter(o => o.startsWith(typed))
      .map(o => ({ value: o, label: o, insert: o }))
  } else if (name === 'answer' || name === 'a') {
    const count = document.querySelectorAll('.answer-btn').length
    options = LETTERS.slice(0, count)
      .map(l => l.toLowerCase())
      .filter(l => l.startsWith(typed))
      .map(l => ({ value: l, label: l, insert: l }))
  }
  return { base, items: options }
}

function renderCompletionMenu() {
  let menu = cmdline.querySelector('#cmdlineMenu')
  if (!completion || completion.items.length < 2) {
    menu?.remove()
    return
  }
  if (!menu) {
    menu = document.createElement('ul')
    menu.id = 'cmdlineMenu'
    menu.className = 'cmdline-menu'
    menu.setAttribute('role', 'listbox')
    cmdline.appendChild(menu)
  }
  menu.innerHTML = completion.items.map((item, i) => `
    <li class="cmdline-menu-item${i === completion.index ? ' selected' : ''}" role="option" aria-selected="${i === completion.index}">
      <span>${item.value}</span>${item.label !== item.value ? `<span class="cmdline-menu-hint">${item.label}</span>` : ''}
    </li>
  `).join('')
  menu.querySelector('.selected')?.scrollIntoView({ block: 'nearest' })
}

function clearCompletion() {
  completion = null
  renderCompletionMenu()
}

function handleTab(backwards) {
  if (!completion) {
    const { base, items } = getCompletionItems(cmdInput.value)
    if (items.length === 0) return
    completion = { base, items, index: backwards ? items.length - 1 : 0 }
  } else {
    const n = completion.items.length
    completion.index = (completion.index + (backwards ? -1 : 1) + n) % n
  }
  cmdInput.value = completion.base + completion.items[completion.index].insert
  if (completion.items.length === 1) {
    completion = null
  }
  renderCompletionMenu()
}

cmdInput.addEventListener('input', clearCompletion)

cmdInput.addEventListener('keydown', (e) => {
  if (e.isComposing || e.keyCode === 229) return
  e.stopPropagation()

  if (e.key === 'Tab') {
    e.preventDefault()
    handleTab(e.shiftKey)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeCommandLine()
  } else if (e.key === 'Backspace' && cmdInput.value === '') {
    e.preventDefault()
    closeCommandLine()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const value = cmdInput.value
    if (!value.trim()) {
      closeCommandLine()
      return
    }
    cmdHistory.push(value)
    closeCommandLine()
    runCommand(value)
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
    if (cmdHistory.length === 0) return
    if (e.key === 'ArrowUp') {
      cmdHistoryPos = cmdHistoryPos === -1 ? cmdHistory.length - 1 : Math.max(0, cmdHistoryPos - 1)
    } else {
      cmdHistoryPos = cmdHistoryPos === -1 ? -1 : cmdHistoryPos + 1
      if (cmdHistoryPos >= cmdHistory.length) cmdHistoryPos = -1
    }
    cmdInput.value = cmdHistoryPos === -1 ? '' : cmdHistory[cmdHistoryPos]
  }
})

// ===== Global keyboard controls =====
document.addEventListener('keydown', (e) => {
  if (isThemeGalleryOpen()) {
    handleGalleryKey(e)
    return
  }

  const modal = document.getElementById('settingsModal')

  if (isSettingsOpen()) {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeSettings()
      return
    }
    if (e.key === 'Tab') {
      const focusable = getModalFocusable(modal)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    return
  }

  const activeTag = document.activeElement?.tagName
  if (activeTag === 'INPUT' || activeTag === 'SELECT' || activeTag === 'TEXTAREA') return

  if (e.key === ':' || (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'p')) {
    e.preventDefault()
    openCommandLine()
    return
  }

  if (e.key === 's' || e.key === 'S') {
    e.preventDefault()
    openSettings()
    return
  }

  if (e.key === 't' || e.key === 'T') {
    e.preventDefault()
    openThemeGallery()
    return
  }

  const digit = /^[1-9]$/.test(e.key) ? parseInt(e.key, 10) : (e.key === '0' ? 10 : 0)
  if (!answered && digit > 0) {
    const btns = document.querySelectorAll('.answer-btn')
    if (btns[digit - 1]) {
      e.preventDefault()
      handleAnswer(btns[digit - 1])
    }
    return
  }

  const letterIndex = /^[a-hA-H]$/.test(e.key) ? LETTERS.indexOf(e.key.toUpperCase()) : -1
  if (!answered && letterIndex !== -1) {
    const btns = document.querySelectorAll('.answer-btn')
    if (btns[letterIndex]) {
      e.preventDefault()
      handleAnswer(btns[letterIndex])
    }
    return
  }

  if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.activeElement?.classList.contains('answer-btn')) {
    e.preventDefault()
    const btns = Array.from(document.querySelectorAll('.answer-btn'))
    const idx = btns.indexOf(document.activeElement)
    const next = e.key === 'ArrowDown' ? btns[(idx + 1) % btns.length] : btns[(idx - 1 + btns.length) % btns.length]
    next.focus()
    return
  }

  if (e.key === 'Enter' && activeTag !== 'BUTTON') {
    const nextBtn = document.querySelector('#nextBtn')
    const restartBtn = document.querySelector('#restartBtn')
    if (nextBtn && nextBtn.style.display !== 'none') {
      e.preventDefault()
      handleNext()
    } else if (restartBtn) {
      e.preventDefault()
      startQuiz()
    }
  }
})

// ===== Render header =====
function renderHeader() {
  return `
    <div class="header">
      <a class="logo" href="${import.meta.env.BASE_URL}">${t('app.logo')}</a>
      <div class="controls">
        <div class="mode-switch" role="group" aria-label="${t('mode.aria')}">
          ${QUIZ_MODES.map(m => `
            <button class="mode-btn${m.id === quizMode ? ' active' : ''}" data-mode="${m.id}" aria-pressed="${m.id === quizMode}" title="${modeLabel(m)}">${modeShort(m)}</button>
          `).join('')}
        </div>
        <div class="timer-control">
          <button class="timer-btn${timerEnabled ? ' active' : ''}" id="timerToggle" aria-pressed="${timerEnabled}" aria-haspopup="true" title="${t('quiz.timerTitle')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
            <span>${t('quiz.timed')}</span>
          </button>
          <div class="timer-popover" role="group" aria-label="${t('quiz.timerTitle')}">
            <label class="timer-popover-label" for="timerSecondsInput">${t('quiz.secondsPerQuestion')}</label>
            <input class="number-input" type="number" id="timerSecondsInput" min="${MIN_TIMER_SECONDS}" max="${MAX_TIMER_SECONDS}" step="1" value="${timerSeconds}" />
          </div>
        </div>
        <button class="variant-btn" id="variantToggle" aria-pressed="${themeVariant === 'light'}" title="${t('theme.toLight')}">
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        </button>
        <button class="settings-btn" id="settingsBtn" aria-label="${t('settings.title')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>
    ${renderSettingsModal()}
  `
}

function bindHeaderControls() {
  guardNumberInputs()
  document.querySelector('#settingsBtn')?.addEventListener('click', openSettings)
  document.querySelector('#variantToggle')?.addEventListener('click', toggleThemeVariant)
  syncVariantToggle()
  document.querySelector('#timerToggle')?.addEventListener('click', toggleTimer)
  document.querySelector('#timerSecondsInput')?.addEventListener('input', (e) => {
    applyTimerSeconds(e.target.value)
  })
  document.querySelector('#timerSecondsInput')?.addEventListener('change', (e) => {
    const seconds = applyTimerSeconds(e.target.value)
    e.target.value = seconds
  })
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode))
  })
}

function switchMode(modeId) {
  if (modeId === quizMode) return
  applyQuizMode(modeId)
  if (document.querySelector('#playBtn')) return
  startQuiz()
}

function toggleTimer() {
  setTimerEnabled(!timerEnabled)
}

function setTimerEnabled(enabled) {
  applyTimerEnabled(enabled)
  syncTimerToggle()
  if (enabled) {
    updateScoreBar()
    if (!answered && !isSettingsOpen() && document.querySelector('.answer-btn')) startTimer()
  } else {
    stopTimer()
    updateScoreBar()
  }
}

function syncTimerToggle() {
  const btn = document.querySelector('#timerToggle')
  if (!btn) return
  btn.classList.toggle('active', timerEnabled)
  btn.setAttribute('aria-pressed', String(timerEnabled))
}

// ===== Timer =====
function updateTimerDisplay() {
  const el = document.querySelector('#scoreTimer')
  if (!el) return
  el.textContent = `${timeLeft}`
  el.classList.toggle('low', timeLeft <= 5)
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

function startTimer(reset = true) {
  stopTimer()
  if (reset) timeLeft = timerSeconds
  updateTimerDisplay()
  timerId = setInterval(() => {
    timeLeft--
    updateTimerDisplay()
    if (timeLeft <= 0) {
      stopTimer()
      handleTimeout()
    }
  }, 1000)
}

function handleTimeout() {
  if (answered) return
  answered = true
  lastSelected = null
  const q = quizQuestions[currentIndex]
  missedQuestions.push(q)
  resetStreak()
  document.querySelectorAll('.answer-btn').forEach(b => {
    b.disabled = true
    if (b.dataset.country === q.country.country) b.classList.add('correct')
  })
  updateScoreBar()
  revealNext()
}

function streakBadge() {
  const empty = currentStreak === 0 ? ' empty' : ''
  const hot = currentStreak >= 3 ? ' hot' : ''
  return `<span class="score-streak${empty}${hot}" id="scoreStreak" title="${t('quiz.streakTitle')}" aria-label="${t('quiz.streakTitle')}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
    <span class="score-streak-value">${currentStreak}</span>
  </span>`
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function animateStreak(isRecord) {
  const el = document.querySelector('#scoreStreak')
  if (!el || prefersReducedMotion()) return
  el.classList.remove('bump', 'record')
  void el.offsetWidth
  el.classList.add('bump')
  if (isRecord) {
    el.classList.add('record')
    flashStreakBurst(el)
  }
  setTimeout(() => el.classList.remove('bump', 'record'), 900)
}

function flashStreakBurst(el) {
  const rect = el.getBoundingClientRect()
  const burst = document.createElement('div')
  burst.className = 'streak-burst'
  burst.style.left = `${rect.left + rect.width / 2}px`
  burst.style.top = `${rect.top + rect.height / 2}px`
  const colors = ['var(--primary)', 'var(--accent)', 'var(--error)']
  for (let i = 0; i < 16; i++) {
    const particle = document.createElement('span')
    particle.className = 'streak-particle'
    const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.4
    const dist = 26 + Math.random() * 36
    particle.style.setProperty('--tx', `${Math.cos(angle) * dist}px`)
    particle.style.setProperty('--ty', `${Math.sin(angle) * dist}px`)
    particle.style.background = colors[i % colors.length]
    particle.style.animationDelay = `${Math.random() * 80}ms`
    burst.appendChild(particle)
  }
  document.body.appendChild(burst)
  setTimeout(() => burst.remove(), 1000)
}

function updateScoreBar() {
  const scoreBar = document.querySelector('.score-bar')
  if (!scoreBar) return
  scoreBar.innerHTML = `
    <span class="score-text">${t('quiz.questionOf', { current: currentIndex + 1, total: quizQuestions.length })}</span>
    ${timerEnabled ? `<span class="score-timer${timeLeft <= 5 ? ' low' : ''}" id="scoreTimer" role="timer">${timeLeft}</span>` : ''}
    ${streakBadge()}
    <span><span class="score-value">${score}</span><span class="score-divider"> / </span><span class="score-text">${currentIndex + (answered ? 1 : 0)}</span></span>
  `
}

function revealNext() {
  const nextBtn = document.querySelector('#nextBtn')
  nextBtn.style.display = 'inline-block'
  nextBtn.textContent = currentIndex + 1 < quizQuestions.length ? t('quiz.next') : t('quiz.seeResults')
  if (!isSettingsOpen()) nextBtn.focus()
}

// ===== Render question =====
const WORLD_VIEWBOX = { width: 1010, height: 666 }
const WORLD_MIN_EXTENT = { width: 3, height: 2 }

function zoomViewBox(bbox) {
  const ratio = WORLD_VIEWBOX.width / WORLD_VIEWBOX.height
  let width = Math.max(bbox.width * 2.2, WORLD_MIN_EXTENT.width)
  let height = Math.max(bbox.height * 2.2, WORLD_MIN_EXTENT.height)
  if (width / height > ratio) height = width / ratio
  else width = height * ratio
  const cx = bbox.x + bbox.width / 2
  const cy = bbox.y + bbox.height / 2
  return `${cx - width / 2} ${cy - height / 2} ${width} ${height}`
}

async function hydrateWorldMap() {
  const el = document.querySelector('.world-map')
  if (!el) return
  const code = el.dataset.code
  const [template, focus] = await Promise.all([loadWorldMap(), loadWorldFocus()])
  if (!el.isConnected) return
  if (!template) { el.classList.add('loaded'); return }

  const svg = template.cloneNode(true)
  svg.removeAttribute('aria-label')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  svg.classList.add('world-svg')
  svg.querySelectorAll('path').forEach(p => p.classList.add('world-country'))
  const target = svg.querySelector(`[id="${code}"]`)
  if (target) target.classList.add('world-target')
  el.replaceChildren(svg)

  const box = focus?.[code]
  if (box) {
    svg.setAttribute('viewBox', zoomViewBox({ x: box[0], y: box[1], width: box[2], height: box[3] }))
  } else if (target) {
    const bbox = target.getBBox()
    if (bbox.width > 0 && bbox.height > 0) svg.setAttribute('viewBox', zoomViewBox(bbox))
  }
  el.classList.add('loaded')
}

function renderQuestion() {
  const q = quizQuestions[currentIndex]
  answered = false

  const answerIsFlag = q.mode === 'country'
  let prompt
  let promptClass = ''

  if (q.mode === 'flag') {
    prompt = `<img class="flag-img" src="${q.country.flag}" alt="${t('quiz.flagAlt')}" />`
  } else if (q.mode === 'capital') {
    prompt = `<div class="prompt-hint">${t('quiz.capitalOf')}</div><div class="prompt-country">${capitalName(q.country.capital)}</div>`
    promptClass = ' country-prompt'
  } else if (q.mode === 'map') {
    prompt = `<div class="world-map" role="img" aria-label="${t('quiz.mapAlt')}" data-code="${countryCode(q.country)}"></div>`
    promptClass = ' map-prompt'
  } else {
    prompt = `<div class="prompt-country">${countryName(q.country.country)}</div>`
    promptClass = ' country-prompt'
  }

  const options = q.options.map((opt, i) => answerIsFlag
    ? `<button class="answer-btn flag-option" data-country="${opt.country}">
        <span class="letter">${LETTERS[i]}</span>
        <img class="answer-flag" src="${opt.flag}" alt="${countryName(opt.country)}" />
      </button>`
    : `<button class="answer-btn" data-country="${opt.country}">
        <span class="letter">${LETTERS[i]}</span>
        <span>${countryName(opt.country)}</span>
      </button>`
  ).join('')

  app.innerHTML = `
    ${renderHeader()}
    <div class="score-bar">
      <span class="score-text">${t('quiz.questionOf', { current: currentIndex + 1, total: quizQuestions.length })}</span>
      ${timerEnabled ? `<span class="score-timer" id="scoreTimer" role="timer">${timerSeconds}</span>` : ''}
      ${streakBadge()}
      <span><span class="score-value">${score}</span><span class="score-divider"> / </span><span class="score-text">${currentIndex}</span></span>
    </div>
    <div class="quiz-card">
      <div class="flag-wrap${promptClass}">
        ${prompt}
      </div>
      <div class="answers${answerIsFlag ? ' flags' : ''}" id="answers">
        ${options}
      </div>
      <button class="next-btn" id="nextBtn" style="display:none">${t('quiz.next')}</button>
    </div>
  `

  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(btn))
  })
  document.querySelector('#nextBtn').addEventListener('click', handleNext)
  bindHeaderControls()
  hydrateWorldMap()
  document.querySelector('.answer-btn')?.focus()
  if (timerEnabled) startTimer()
}

// ===== Handle answer selection =====
function handleAnswer(btn) {
  if (answered) return
  answered = true
  stopTimer()

  const q = quizQuestions[currentIndex]
  const selectedCountry = btn.dataset.country
  const isCorrect = selectedCountry === q.country.country
  lastSelected = selectedCountry

  let streakRecord = false
  if (isCorrect) {
    score++
    streakRecord = recordCorrectStreak()
    if (timerEnabled) points += SCORE_BASE + Math.max(0, timeLeft) * SCORE_TIME_BONUS
  } else {
    missedQuestions.push(q)
    resetStreak()
  }

  document.querySelectorAll('.answer-btn').forEach(b => {
    b.disabled = true
    if (b.dataset.country === q.country.country) {
      b.classList.add('correct')
    } else if (b === btn) {
      b.classList.add('wrong')
    }
  })

  updateScoreBar()
  if (isCorrect) animateStreak(streakRecord)
  revealNext()
}

// ===== Handle next =====
function handleNext() {
  stopTimer()
  currentIndex++
  lastSelected = null
  if (currentIndex < quizQuestions.length) {
    renderQuestion()
  } else {
    renderResult()
  }
}

// ===== Render result =====
function renderResult() {
  stopTimer()
  const total = quizQuestions.length
  const accuracy = total ? Math.round((score / total) * 100) : 0
  const elapsed = Math.max(0, Math.round((Date.now() - quizStartTime) / 1000))
  const timeStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  app.innerHTML = `
    ${renderHeader()}
    <div class="quiz-card result-card">
      <h2>${t('result.complete')}</h2>
      <p class="score-text">${t('result.youScored')}</p>
      <div class="final-score">${score} / ${total}</div>
      <p class="result-meta">${t('result.accuracy', { percent: accuracy })}</p>
      ${bestStreak > 0 ? `<p class="result-meta result-streak">${t('result.bestStreak', { count: bestStreak })}</p>` : ''}
      ${timerEnabled ? `<p class="result-meta">${t('result.points', { points, time: timeStr })}</p>` : ''}
      ${missedQuestions.length ? `<p class="result-meta result-missed">${t('result.missed', { count: missedQuestions.length })}</p>` : ''}
      <div class="result-actions">
        ${missedQuestions.length ? `<button class="restart-btn retry-btn" id="retryBtn">${t('result.retryMissed', { count: missedQuestions.length })}</button>` : ''}
        <button class="restart-btn" id="restartBtn">${t('result.playAgain')}</button>
      </div>
    </div>
  `
  document.querySelector('#retryBtn')?.addEventListener('click', retryMissed)
  document.querySelector('#restartBtn').addEventListener('click', startQuiz)
  bindHeaderControls()
}

// ===== Rerender current view (e.g. after language change) =====
function rerender() {
  if (document.querySelector('#playBtn')) return showWelcome()
  if (document.querySelector('#restartBtn')) return renderResult()
  if (!document.querySelector('.answer-btn')) return showWelcome()

  const wasAnswered = answered
  const selected = lastSelected
  renderQuestion()
  if (wasAnswered) {
    answered = true
    stopTimer()
    const q = quizQuestions[currentIndex]
    document.querySelectorAll('.answer-btn').forEach(b => {
      b.disabled = true
      if (b.dataset.country === q.country.country) b.classList.add('correct')
      else if (b.dataset.country === selected) b.classList.add('wrong')
    })
    updateScoreBar()
    revealNext()
  }
}

// ===== Welcome screen =====
function renderWelcome() {
  return `
    ${renderHeader()}
    <div class="quiz-card welcome-card">
      <a class="welcome-ascii-link" href="${import.meta.env.BASE_URL}" aria-label="${t('app.logo')}">
        <pre class="welcome-ascii" role="img" aria-label="${t('welcome.aria')}">${WELCOME_ASCII}</pre>
      </a>
      <p class="welcome-credit">Map (C) 1998 Matthew Thomas. Freely usable if this line is included.</p>
      <p class="welcome-text">${t('welcome.tagline')}</p>
      <p class="welcome-text welcome-hint">${t('welcome.hint')}</p>
      <button class="play-btn" id="playBtn">${t('welcome.play')}</button>
    </div>
  `
}

function showWelcome() {
  stopTimer()
  app.innerHTML = renderWelcome()
  bindHeaderControls()
  document.querySelector('#playBtn').addEventListener('click', startQuiz)
  document.querySelector('#playBtn').focus()
}

// ===== Start quiz =====
function beginQuiz(questions) {
  stopTimer()
  quizQuestions = questions
  missedQuestions = []
  currentIndex = 0
  score = 0
  points = 0
  resetStreak()
  bestStreakAtStart = bestStreak
  streakRecordCelebrated = false
  lastSelected = null
  quizStartTime = Date.now()
  preloadQuestionImages(quizQuestions)
  renderQuestion()
}

function startQuiz() {
  beginQuiz(buildQuiz())
}

function retryMissed() {
  const questions = missedQuestions.map(q => buildQuestion(q.country, q.mode))
  if (questions.length === 0) return
  beginQuiz(questions)
}

// ===== Loading screen =====
const loader = document.querySelector('#loader')
const loaderStatus = document.querySelector('#loader-status')
const loaderNote = document.querySelector('#loader-note')
const loaderSkip = document.querySelector('#loader-skip')
let loaderSkipped = false

function setLoaderStatus(key, vars) {
  if (loaderStatus) loaderStatus.textContent = t(key, vars)
}

function hideLoader() {
  if (!loader || loader.classList.contains('hidden')) return
  loader.classList.add('hidden')
  setTimeout(() => loader.remove(), 400)
}

function loadFonts() {
  if (!document.fonts) return Promise.resolve()
  const faces = FONTS.flatMap(font => {
    const family = font.family.split(',')[0].trim()
    return [400, 500, 700].map(weight => document.fonts.load(`${weight} 1rem ${family}`))
  })
  return Promise.allSettled(faces).then(() => document.fonts.ready)
}

async function preloadOptional() {
  const assets = [
    loadFonts,
    loadWorldMap,
    loadWorldFocus,
  ]
  let done = 0
  await Promise.allSettled(assets.map(load =>
    Promise.resolve(load()).finally(() => {
      done += 1
      setLoaderStatus('loading.progress', { done, total: assets.length })
    })
  ))
}

// ===== Init =====
async function init() {
  applyStoredTheme()
  applyFont(loadFont())
  applyCornerPadding(loadCornerPadding())
  applyCornerRadius(loadCornerRadius())
  applyCmdlinePosition(loadCmdlinePosition())
  applyQuestionsPerQuiz(loadQuestionsPerQuiz())
  applyOptionsCount(loadOptionsCount())
  saveBestStreak(loadBestStreak())
  applyQuizMode(loadQuizMode())
  applyTimerEnabled(loadTimerEnabled())
  applyTimerSeconds(loadTimerSeconds())
  applyLanguage(loadLanguage())

  document.querySelector('#loader-ascii').textContent = WELCOME_ASCII
  loaderSkip.textContent = t('loading.skip')
  loaderNote.textContent = t('loading.skipNote')
  loader.setAttribute('aria-label', t('loading.aria'))
  loaderSkip.addEventListener('click', () => { loaderSkipped = true })
  setLoaderStatus('loading.title')

  const optional = preloadOptional()
  let loaded = true
  try {
    const res = await fetch('./data.json')
    countries = await res.json()
  } catch (err) {
    loaded = false
    app.innerHTML = `<div class="quiz-card"><p>${t('error.loadFailed')}</p></div>`
  }
  if (loaded) {
    if (!loaderSkipped) await optional
    showWelcome()
  }
  hideLoader()
}

init()
