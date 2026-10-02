import './style.css'

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

const LETTERS = ['A', 'B', 'C', 'D', 'E']
const QUESTIONS_PER_QUIZ = 10
const OPTIONS_COUNT = 5

let countries = []
let quizQuestions = []
let currentIndex = 0
let score = 0
let answered = false

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
  return localStorage.getItem('flag-quiz-font') || 'inter'
}

// ===== Corner padding management =====
const DEFAULT_CORNER_PADDING = 20

function applyCornerPadding(px) {
  document.documentElement.style.setProperty('--corner-padding', `${px}px`)
  localStorage.setItem('flag-quiz-corner-padding', String(px))
}

function loadCornerPadding() {
  const stored = localStorage.getItem('flag-quiz-corner-padding')
  const parsed = stored === null ? NaN : parseInt(stored, 10)
  return Number.isFinite(parsed) ? parsed : DEFAULT_CORNER_PADDING
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
  const selected = shuffled.slice(0, Math.min(QUESTIONS_PER_QUIZ, shuffled.length))
  return selected.map(country => {
    const wrongs = shuffle(countries.filter(c => c.country !== country.country)).slice(0, OPTIONS_COUNT - 1)
    const options = shuffle([country, ...wrongs])
    return { country, options }
  })
}

// ===== Settings modal =====
function renderSettingsModal() {
  return `
    <div class="modal-overlay" id="settingsModal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">Settings</span>
          <button class="modal-close" id="settingsClose" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="setting-row">
          <label class="setting-label" for="fontSelect">Font</label>
          <select class="select" id="fontSelect">
            ${FONTS.map(f => `<option value="${f.id}" ${f.id === loadFont() ? 'selected' : ''}>${f.label}</option>`).join('')}
          </select>
        </div>
        <div class="setting-row">
          <label class="setting-label" for="themeSelect">Theme</label>
          <select class="select" id="themeSelect">
            ${THEMES.map(t => `<option value="${t.id}" ${t.id === loadTheme() ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select>
        </div>
        <div class="setting-row">
          <label class="setting-label" for="paddingInput">Corner padding <span id="paddingValue">${loadCornerPadding()}px</span></label>
          <input class="range" type="range" id="paddingInput" min="0" max="32" step="1" value="${loadCornerPadding()}" />
        </div>
      </div>
    </div>
  `
}

let lastFocusedBeforeModal = null

function openSettings() {
  const modal = document.getElementById('settingsModal')
  lastFocusedBeforeModal = document.activeElement
  modal.classList.add('open')
  document.getElementById('settingsClose').addEventListener('click', closeSettings)
  modal.addEventListener('click', (e) => { if (e.target === modal) closeSettings() })
  document.getElementById('themeSelect').addEventListener('change', (e) => applyTheme(e.target.value))
  document.getElementById('fontSelect').addEventListener('change', (e) => applyFont(e.target.value))
  document.getElementById('paddingInput').addEventListener('input', (e) => {
    const px = parseInt(e.target.value, 10)
    applyCornerPadding(px)
    document.getElementById('paddingValue').textContent = `${px}px`
  })
  document.getElementById('settingsClose').focus()
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open')
  if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
    lastFocusedBeforeModal.focus()
  }
  lastFocusedBeforeModal = null
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
  <input class="cmdline-input" id="cmdlineInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command line" />
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
  applyTheme(loadTheme())
  applyFont(loadFont())
  applyCornerPadding(loadCornerPadding())
  startQuiz()
}

function runCommand(raw) {
  const [name = '', ...args] = raw.trim().split(/\s+/)
  const arg = args.join(' ')

  switch (name.toLowerCase()) {
    case 'answer':
    case 'a': {
      const buttons = Array.from(document.querySelectorAll('.answer-btn'))
      if (buttons.length === 0) return showCmdMessage('No active question', true)
      if (answered) return showCmdMessage('Question already answered', true)
      const index = LETTERS.indexOf(arg.toUpperCase())
      if (arg.length !== 1 || index === -1 || !buttons[index]) {
        return showCmdMessage(`Invalid option: use ${LETTERS.slice(0, buttons.length).join(', ').toLowerCase()}`, true)
      }
      handleAnswer(buttons[index])
      return
    }
    case 'reset':
      resetApp()
      return showCmdMessage('App reset')
    case 'font': {
      const font = findByName(FONTS, arg)
      if (!font) return showCmdMessage('Invalid font', true)
      applyFont(font.id)
      return showCmdMessage(`Font: ${font.label}`)
    }
    case 'theme': {
      const theme = findByName(THEMES, arg)
      if (!theme) return showCmdMessage('Invalid theme', true)
      applyTheme(theme.id)
      return showCmdMessage(`Theme: ${theme.label}`)
    }
    case '':
      return
    default:
      return showCmdMessage(`Unknown command: ${name}`, true)
  }
}

// ===== Tab completion =====
const COMMAND_NAMES = ['answer', 'font', 'reset', 'theme']
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

  if (name === 'font' || name === 'theme') {
    const list = name === 'font' ? FONTS : THEMES
    options = list
      .filter(o => normalizeName(o.id).startsWith(typed) || normalizeName(o.label).startsWith(typed))
      .map(o => ({ value: o.id, label: o.label, insert: o.id }))
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
    if (value.trim()) cmdHistory.push(value)
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

  if (e.key === ':') {
    e.preventDefault()
    openCommandLine()
    return
  }

  if (e.key === 's' || e.key === 'S') {
    e.preventDefault()
    openSettings()
    return
  }

  if (!answered && /^[1-5]$/.test(e.key)) {
    const idx = parseInt(e.key, 10) - 1
    const btns = document.querySelectorAll('.answer-btn')
    if (btns[idx]) {
      e.preventDefault()
      handleAnswer(btns[idx])
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
      <div class="logo">Flag Quiz</div>
      <button class="settings-btn" id="settingsBtn" aria-label="Settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
    ${renderSettingsModal()}
  `
}

// ===== Render question =====
function renderQuestion() {
  const q = quizQuestions[currentIndex]
  answered = false

  app.innerHTML = `
    ${renderHeader()}
    <div class="score-bar">
      <span class="score-text">Question ${currentIndex + 1} / ${quizQuestions.length}</span>
      <span><span class="score-value">${score}</span><span class="score-divider"> / </span><span class="score-text">${currentIndex}</span></span>
    </div>
    <div class="quiz-card">
      <div class="flag-wrap">
        <img class="flag-img" src="${q.country.flag}" alt="Flag" />
      </div>
      <div class="answers" id="answers">
        ${q.options.map((opt, i) => `
          <button class="answer-btn" data-country="${opt.country}">
            <span class="letter">${LETTERS[i]}</span>
            <span>${opt.country}</span>
          </button>
        `).join('')}
      </div>
      <button class="next-btn" id="nextBtn" style="display:none">Next</button>
    </div>
  `

  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(btn))
  })
  document.querySelector('#nextBtn').addEventListener('click', handleNext)
  document.querySelector('#settingsBtn').addEventListener('click', openSettings)
  document.querySelector('.answer-btn')?.focus()
}

// ===== Handle answer selection =====
function handleAnswer(btn) {
  if (answered) return
  answered = true

  const q = quizQuestions[currentIndex]
  const selectedCountry = btn.dataset.country
  const isCorrect = selectedCountry === q.country.country

  if (isCorrect) score++

  document.querySelectorAll('.answer-btn').forEach(b => {
    b.disabled = true
    if (b.dataset.country === q.country.country) {
      b.classList.add('correct')
    } else if (b === btn) {
      b.classList.add('wrong')
    }
  })

  // Update score display
  const scoreBar = document.querySelector('.score-bar')
  scoreBar.innerHTML = `
    <span class="score-text">Question ${currentIndex + 1} / ${quizQuestions.length}</span>
    <span><span class="score-value">${score}</span><span class="score-divider"> / </span><span class="score-text">${currentIndex + 1}</span></span>
  `

  document.querySelector('#nextBtn').style.display = 'inline-block'
  document.querySelector('#nextBtn').textContent = currentIndex + 1 < quizQuestions.length ? 'Next' : 'See Results'
  document.querySelector('#nextBtn').focus()
}

// ===== Handle next =====
function handleNext() {
  currentIndex++
  if (currentIndex < quizQuestions.length) {
    renderQuestion()
  } else {
    renderResult()
  }
}

// ===== Render result =====
function renderResult() {
  app.innerHTML = `
    ${renderHeader()}
    <div class="quiz-card result-card">
      <h2>Quiz Complete!</h2>
      <p class="score-text">You scored</p>
      <div class="final-score">${score} / ${quizQuestions.length}</div>
      <button class="restart-btn" id="restartBtn">Play Again</button>
    </div>
  `
  document.querySelector('#restartBtn').addEventListener('click', startQuiz)
  document.querySelector('#settingsBtn').addEventListener('click', openSettings)
}

// ===== Start quiz =====
function startQuiz() {
  quizQuestions = buildQuiz()
  currentIndex = 0
  score = 0
  renderQuestion()
}

// ===== Init =====
async function init() {
  applyTheme(loadTheme())
  applyFont(loadFont())
  applyCornerPadding(loadCornerPadding())
  try {
    const res = await fetch('./data.json')
    countries = await res.json()
    startQuiz()
  } catch (err) {
    app.innerHTML = `<div class="quiz-card"><p>Failed to load quiz data.</p></div>`
  }
}

init()
