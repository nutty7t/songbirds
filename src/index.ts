import { playSong } from './synth.ts'
import { drawPath } from './animation.ts'
import { generateSong, Note, Voice } from './music.ts'

// Game State
let hardDifficulty: boolean = null
let responding: boolean = false
let response = []
let sequence: any = []

function initialize () {
  // Keyboard outline.
  Array
    .from({ length: 24 }, (_, key) => key)
    .map(x => `#_${x + 60}`)
    .forEach((selector, index) => {
      setTimeout(() => {
        const key: HTMLElement = document.querySelector(selector)
        key.style.opacity = '1'
        drawPath(
          selector,
          { start: 0, end: 0 },
          { start: 0, end: 1 },
          200
        )
      }, 100 * index)
    })

  // Fill in black keys.
  const blackKeys = document.getElementById('Black').children
  for (let i = 0; i < blackKeys.length; i++) {
    setTimeout(() => {
      (blackKeys[i] as any).style.fill = 'black'
    }, 1000 + 200 * i)
  }

  const logoLetters = document.getElementById('Logo').children
  for (let i = 0; i < logoLetters.length; i++) {
    // Show Songbirds logo.
    setTimeout(() => {
      (logoLetters[i] as any).style.opacity = '1'
    }, 2000 + 100 * i)
    //  Hide Songbirds logo.
    setTimeout(() => {
      (logoLetters[i] as any).style.opacity = '0'
    }, 4000 + 50 * i)
  }

  // Show menu.
  setTimeout(() => {
    document.getElementById('Easy').style.opacity = '1'
    document.getElementById('Hard').style.opacity = '1'
    document.getElementById('Bird1').style.opacity = '1'
    document.getElementById('Bird2').style.opacity = '1'

    document.getElementById('Easy').addEventListener('click', () => { selectDifficulty('easy') })
    document.getElementById('Hard').addEventListener('click', () => { selectDifficulty('hard') })
  }, 4500)
}

function selectDifficulty (difficulty: string) {
  alert('MUAHAHAHAHAHA! There is actually only one difficulty mode: EXPERT. Only those with perfect pitch may attract the lovebirds! (Yeah... I procrastinated too long. Didn\'t have the time to highlight the notes when they are played.)')
  hardDifficulty = (difficulty === 'hard')
  document.getElementById('Easy').style.opacity = '0'
  document.getElementById('Hard').style.opacity = '0'
  setInterval(() => {
    document.getElementById('Easy').style.display = 'none'
    document.getElementById('Hard').style.display = 'none'
  }, 1000)

  // Add event listeners to keys
  const blackKeys = document.getElementById('Black').children
  for (let i = 0; i < blackKeys.length; i++) {
    blackKeys[i].addEventListener('click', handleKeyClick);
    (blackKeys[i] as any).style.transition = 'none'
  }
  const whiteKeys = document.getElementById('White').children
  for (let i = 0; i < whiteKeys.length; i++) {
    whiteKeys[i].addEventListener('click', handleKeyClick);
    (whiteKeys[i] as any).style.transition = 'none'
  }

  // Enter game loop.
  gameLoop()
}

function gameLoop () {
  const song: any = generateSong()
  sequence = song[0].flat().map((n: Note) => n.midiNumber)
  playSong(song)
  setTimeout(() => {
    alert('Your turn. Repeat what you heard.')
    responding = true
  }, 8000)
}

function handleKeyClick (event: any) {
  if (responding) {
    const note = event.target.dataset.name
    if (sequence[0] == note) {
      sequence.shift()
      if (sequence.length === 0) {
        alert('Yay! You are worthy of love.')
      }
    } else {
      alert('That wasn\'t quite right. You were unable to woo the lovebird...')
      location.reload()
    }
  }
}

initialize()
