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
  { id: 'tokyonight', label: 'Tokyo Night' },
  { id: 'nord', label: 'Nord' },
  { id: 'dark', label: 'Dark' },
  { id: 'amoled', label: 'AMOLED' },
  { id: 'mocha', label: 'Catppuccin Mocha' },
  { id: 'frappe', label: 'Catppuccin Frappé' },
  { id: 'latte', label: 'Catppuccin Latte' },
  { id: 'macchiato', label: 'Catppuccin Macchiato' },
  { id: 'blackmetal', label: 'Black Metal' },
]

const FONTS = [
  { id: 'inter', label: 'Inter', family: "'Inter', system-ui, sans-serif" },
  { id: 'jetbrains', label: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
  { id: 'iosevka', label: 'Iosevka', family: "'Iosevka', monospace" },
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
  { id: 'mixed', label: 'Mixed', short: 'Mixed' },
]

const MIXED_PROMPT_MODES = ['flag', 'country', 'capital']

const WELCOME_ASCII = `█████ ██     ███   ████     ███  █   █ ███ █████
██    ██    █   █ █        █   █ █   █  █     █ 
████  ██    █████ █  ██    █   █ █   █  █    █  
██    ██    █   █ █   █    █  ██ █   █  █   █   
██    █████ █   █  ███      ████  ███  ███ █████`

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

let countries = []
let quizQuestions = []
let currentIndex = 0
let score = 0
let points = 0
let answered = false
let lastSelected = null
let quizStartTime = 0
let timerId = null
let timeLeft = 0
let timerPaused = false

const app = document.querySelector('#app')

// ===== Theme management =====
function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId)
  localStorage.setItem('flag-quiz-theme', themeId)
}

function loadTheme() {
  return localStorage.getItem('flag-quiz-theme') || 'tokyonight'
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
const DEFAULT_CORNER_RADIUS = 16
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

// ===== Quiz mode management =====
const DEFAULT_QUIZ_MODE = 'flag'

let quizMode = DEFAULT_QUIZ_MODE

function applyQuizMode(modeId) {
  const mode = QUIZ_MODES.find(m => m.id === modeId) || QUIZ_MODES[0]
  quizMode = mode.id
  localStorage.setItem('flag-quiz-mode', mode.id)
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
function buildQuiz() {
  const shuffled = shuffle(countries)
  const selected = shuffled.slice(0, Math.min(questionsPerQuiz, shuffled.length))
  return selected.map(country => {
    const wrongs = shuffle(countries.filter(c => c.country !== country.country)).slice(0, optionsCount - 1)
    const options = shuffle([country, ...wrongs])
    const mode = quizMode === 'mixed' ? MIXED_PROMPT_MODES[Math.floor(Math.random() * MIXED_PROMPT_MODES.length)] : quizMode
    return { country, options, mode }
  })
}

// ===== Settings modal =====
function renderSettingsModal() {
  return `
    <div class="modal-overlay" id="settingsModal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">${t('settings.title')}</span>
          <button class="modal-close" id="settingsClose" aria-label="${t('settings.close')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="setting-row">
          <label class="setting-label" for="languageSelect">${t('settings.language')}</label>
          <select class="select" id="languageSelect">
            ${LANGUAGES.map(l => `<option value="${l.id}" ${l.id === loadLanguage() ? 'selected' : ''}>${l.label}</option>`).join('')}
          </select>
        </div>
        <div class="setting-row">
          <label class="setting-label" for="fontSelect">${t('settings.font')}</label>
          <select class="select" id="fontSelect">
            ${FONTS.map(f => `<option value="${f.id}" ${f.id === loadFont() ? 'selected' : ''}>${f.label}</option>`).join('')}
          </select>
        </div>
        <div class="setting-row">
          <label class="setting-label" for="themeSelect">${t('settings.theme')}</label>
          <select class="select" id="themeSelect">
            ${THEMES.map(th => `<option value="${th.id}" ${th.id === loadTheme() ? 'selected' : ''}>${th.label}</option>`).join('')}
          </select>
        </div>
        <div class="setting-row">
          <label class="setting-label" for="cmdlineSelect">${t('settings.commandLine')}</label>
          <select class="select" id="cmdlineSelect">
            ${CMDLINE_POSITIONS.map(p => `<option value="${p.id}" ${p.id === loadCmdlinePosition() ? 'selected' : ''}>${positionLabel(p)}</option>`).join('')}
          </select>
        </div>
        <div class="setting-row">
          <label class="setting-label" for="questionsInput">${t('settings.questions')} <span class="setting-value" id="questionsValue">${loadQuestionsPerQuiz()}</span> <span class="setting-note">${t('settings.refresh')}</span></label>
          <input class="range" type="range" id="questionsInput" min="${MIN_QUESTIONS_PER_QUIZ}" max="${MAX_QUESTIONS_PER_QUIZ}" step="1" value="${loadQuestionsPerQuiz()}" />
        </div>
        <div class="setting-row">
          <label class="setting-label" for="optionsInput">${t('settings.options')} <span class="setting-value" id="optionsValue">${loadOptionsCount()}</span> <span class="setting-note">${t('settings.refresh')}</span></label>
          <input class="range" type="range" id="optionsInput" min="${MIN_OPTIONS_COUNT}" max="${MAX_OPTIONS_COUNT}" step="1" value="${loadOptionsCount()}" />
        </div>
        <div class="setting-row">
          <label class="setting-label" for="paddingInput">${t('settings.corner')} <span id="paddingValue">${loadCornerPadding()}px</span></label>
          <input class="range" type="range" id="paddingInput" min="${MIN_CORNER_PADDING}" max="${MAX_CORNER_PADDING}" step="1" value="${loadCornerPadding()}" />
        </div>
        <div class="setting-row">
          <label class="setting-label" for="radiusInput">${t('settings.radius')}</label>
          <input class="number-input" type="number" id="radiusInput" min="${MIN_CORNER_RADIUS}" max="${MAX_CORNER_RADIUS}" step="1" value="${loadCornerRadius()}" />
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
  document.getElementById('fontSelect').addEventListener('change', (e) => applyFont(e.target.value))
  document.getElementById('cmdlineSelect').addEventListener('change', (e) => applyCmdlinePosition(e.target.value))
  document.getElementById('languageSelect').addEventListener('change', (e) => {
    applyLanguage(e.target.value)
    closeSettings()
    rerender()
  })
  document.getElementById('questionsInput').addEventListener('input', (e) => {
    const count = applyQuestionsPerQuiz(e.target.value)
    document.getElementById('questionsValue').textContent = `${count}`
  })
  document.getElementById('optionsInput').addEventListener('input', (e) => {
    const count = applyOptionsCount(e.target.value)
    document.getElementById('optionsValue').textContent = `${count}`
  })
  document.getElementById('paddingInput').addEventListener('input', (e) => {
    const px = parseInt(e.target.value, 10)
    applyCornerPadding(px)
    document.getElementById('paddingValue').textContent = `${px}px`
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
  localStorage.removeItem('flag-quiz-font')
  localStorage.removeItem('flag-quiz-corner-padding')
  localStorage.removeItem('flag-quiz-corner-radius')
  localStorage.removeItem('flag-quiz-cmdline-position')
  localStorage.removeItem('flag-quiz-questions-per-quiz')
  localStorage.removeItem('flag-quiz-options-count')
  localStorage.removeItem('flag-quiz-mode')
  localStorage.removeItem('flag-quiz-timer-enabled')
  localStorage.removeItem('flag-quiz-timer-seconds')
  localStorage.removeItem('flag-quiz-language')
  applyTheme(loadTheme())
  applyFont(loadFont())
  applyCornerPadding(loadCornerPadding())
  applyCornerRadius(loadCornerRadius())
  applyCmdlinePosition(loadCmdlinePosition())
  applyQuestionsPerQuiz(loadQuestionsPerQuiz())
  applyOptionsCount(loadOptionsCount())
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
    case 'mode': {
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
const COMMAND_NAMES = ['answer', 'cmdline', 'color', 'colorscheme', 'corner', 'font', 'lang', 'language', 'mode', 'options', 'questions', 'radius', 'reset', 'theme', 'time']
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
  } else if (name === 'mode') {
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

  const digit = /^[1-9]$/.test(e.key) ? parseInt(e.key, 10) : (e.key === '0' ? 10 : 0)
  if (!answered && digit > 0) {
    const btns = document.querySelectorAll('.answer-btn')
    if (btns[digit - 1]) {
      e.preventDefault()
      handleAnswer(btns[digit - 1])
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
        <div class="mode-switch" role="tablist" aria-label="${t('mode.aria')}">
          ${QUIZ_MODES.map(m => `
            <button class="mode-btn${m.id === quizMode ? ' active' : ''}" data-mode="${m.id}" role="tab" aria-selected="${m.id === quizMode}" title="${modeLabel(m)}">${modeShort(m)}</button>
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
  document.querySelector('#settingsBtn')?.addEventListener('click', openSettings)
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
  if (document.querySelector('#playBtn')) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      const active = btn.dataset.mode === modeId
      btn.classList.toggle('active', active)
      btn.setAttribute('aria-selected', String(active))
    })
    return
  }
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
  document.querySelectorAll('.answer-btn').forEach(b => {
    b.disabled = true
    if (b.dataset.country === q.country.country) b.classList.add('correct')
  })
  updateScoreBar()
  revealNext()
}

function updateScoreBar() {
  const scoreBar = document.querySelector('.score-bar')
  if (!scoreBar) return
  scoreBar.innerHTML = `
    <span class="score-text">${t('quiz.questionOf', { current: currentIndex + 1, total: quizQuestions.length })}</span>
    ${timerEnabled ? `<span class="score-timer${timeLeft <= 5 ? ' low' : ''}" id="scoreTimer" role="timer">${timeLeft}</span>` : ''}
    <span><span class="score-value">${score}</span><span class="score-divider"> / </span><span class="score-text">${currentIndex + 1}</span></span>
  `
}

function revealNext() {
  const nextBtn = document.querySelector('#nextBtn')
  nextBtn.style.display = 'inline-block'
  nextBtn.textContent = currentIndex + 1 < quizQuestions.length ? t('quiz.next') : t('quiz.seeResults')
  if (!isSettingsOpen()) nextBtn.focus()
}

// ===== Render question =====
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

  if (isCorrect) {
    score++
    if (timerEnabled) points += SCORE_BASE + Math.max(0, timeLeft) * SCORE_TIME_BONUS
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
      ${timerEnabled ? `<p class="result-meta">${t('result.points', { points, time: timeStr })}</p>` : ''}
      <button class="restart-btn" id="restartBtn">${t('result.playAgain')}</button>
    </div>
  `
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
      <pre class="welcome-ascii" role="img" aria-label="${t('welcome.aria')}">${WELCOME_ASCII}</pre>
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
function startQuiz() {
  stopTimer()
  quizQuestions = buildQuiz()
  currentIndex = 0
  score = 0
  points = 0
  lastSelected = null
  quizStartTime = Date.now()
  renderQuestion()
}

// ===== Init =====
async function init() {
  applyTheme(loadTheme())
  applyFont(loadFont())
  applyCornerPadding(loadCornerPadding())
  applyCornerRadius(loadCornerRadius())
  applyCmdlinePosition(loadCmdlinePosition())
  applyQuestionsPerQuiz(loadQuestionsPerQuiz())
  applyOptionsCount(loadOptionsCount())
  applyQuizMode(loadQuizMode())
  applyTimerEnabled(loadTimerEnabled())
  applyTimerSeconds(loadTimerSeconds())
  applyLanguage(loadLanguage())
  try {
    const res = await fetch('./data.json')
    countries = await res.json()
    showWelcome()
  } catch (err) {
    app.innerHTML = `<div class="quiz-card"><p>${t('error.loadFailed')}</p></div>`
  }
}

init()
