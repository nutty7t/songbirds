import { generateSong, Note, Voice } from './music'

const songbirds: any = {
  [Voice.Soprano]: new AudioContext(),
  [Voice.Alto]: new AudioContext(),
  [Voice.Tenor]: new AudioContext(),
  [Voice.Bass]: new AudioContext()
}

function playNote (voice: string, note: Note) {
  const context = songbirds[voice]
  const oscillator = context.createOscillator()
  const volume = context.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.value = note.frequency
  volume.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 2)
  volume.gain.value = (voice === '0') ? 1.0 : 0.5
  oscillator.connect(volume)
  volume.connect(context.destination)
  oscillator.start(0)
}

const timeouts: any = []
export function playSong (song: any) {
  for (var i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }
  try {
    Object.keys(Voice).forEach(voice => {
      song[voice].forEach((note: Note | Array<Note>, index: number) => {
        if ((note as Array<Note>).length === 2) {
          timeouts.push(setTimeout(() => {
            playNote(voice, (note as Array<Note>)[0])
          }, index * 1000))
          // Non-Chord Tone :D
          timeouts.push(setTimeout(() => {
            playNote(voice, (note as Array<Note>)[1])
          }, index * 1000 + 500))
        } else {
          timeouts.push(setTimeout(() => {
            playNote(voice, note as Note)
          }, index * 1000))
        }
      })
    })
  } catch (error) {}
}
