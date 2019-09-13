import { playSong } from './synth.ts'
import { drawPath } from './animation.ts'
import './music.ts'

// States
// -------
//
// 1. Startup Animation
// 2. Difficulty Menu
// 3. Gameplay - Listen
// 4. Gameplay - Recall
// 5. Ending

function startAnimation () {
  // Keyboard outline
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

  // Fill in black keys
  const blackKeys = document.getElementById('Black').children
  for (let i = 0; i < blackKeys.length; i++) {
    setTimeout(() => {
      (blackKeys[i] as any).style.fill = 'black'
    }, 1000 + 200 * i)
  }
}

startAnimation()
