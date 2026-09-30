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

function openSettings() {
  const modal = document.getElementById('settingsModal')
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
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open')
}

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
