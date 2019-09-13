import { playSong } from './synth.ts'
import './music.ts'

const wrapper = document.getElementById('wrapper')
const test = document.createElement('button')
test.addEventListener('click', playSong)
test.innerHTML = 'Play Song!'
test.style.fontSize = '5em'
test.style.width = '100%'
test.style.height = '80vh'
test.style.margin = '5vh 0'
wrapper.appendChild(test)
