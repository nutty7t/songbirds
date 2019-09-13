enum PitchClass {
  C = 0,
  Cs,
  D,
  Ds,
  E,
  F,
  Fs,
  G,
  Gs,
  A,
  As,
  B
}

enum Mode {
  Major = 0,
  Minor
}

enum MajorChord {
  I = 0,
  ii,
  iii,
  IV,
  V,
  vi,
  vii // diminished
}

enum MinorChord {
  i = 0,
  ii, // diminished
  III,
  iv,
  V,
  VI,
  VII,
  vii // diminished
}

enum Quality {
  Major = 0,
  Minor,
  Diminished
}

interface Note {
  midiNumber: number
  pitchClass: PitchClass
  frequency: number /* Hz */
}

function reducer (notes: Record<number, Note>, midiNumber: number): Record<number, Note> {
  // Let's tune the songbirds to 432 Hz for kicks and giggles.
  // Will this make them sound more romantic?
  const A4 = 432

  const pitchClass = PitchClass.C + (midiNumber % 12)
  const frequency = A4 * Math.pow(2, (midiNumber - 69) / 12)
  return Object.assign(notes, { [midiNumber]: { midiNumber, pitchClass, frequency } })
}

const midiNumbers: Array<number> = Array.from({ length: 128 }, (_, key) => key)
const notes: Record<number, Note> = midiNumbers.reduce(reducer, {})

function generateChordProgression(mode: Mode, n: number): Array<number> {
  // These stochastic matrices are generated from the chord diagrams
  // in the Tonal Harmony (Kostka, Payne) textbook and assigning arbitrary
  // probabilities to each edge in the graph.
  const stochasticMatrices = {
    [Mode.Major]: [
      /*           I     ii    iii   IV    V     vi    vii°
      /* I    */  [0.00, 0.10, 0.01, 0.20, 0.60, 0.04, 0.05],
      /* ii   */  [0.00, 0.00, 0.00, 0.00, 0.75, 0.00, 0.25],
      /* iii  */  [0.00, 0.00, 0.00, 0.60, 0.00, 0.40, 0.00],
      /* IV   */  [0.20, 0.20, 0.00, 0.00, 0.40, 0.00, 0.20],
      /* V    */  [0.80, 0.00, 0.00, 0.00, 0.00, 0.20, 0.00],
      /* VI   */  [0.00, 0.50, 0.00, 0.50, 0.00, 0.00, 0.00],
      /* vii° */  [1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]
    ],
    [Mode.Minor]: [
      /*           i     ii°   III   iv    V     VI    VII   vii°
      /* i    */  [0.00, 0.20, 0.01, 0.20, 0.40, 0.09, 0.05, 0.05],
      /* ii°  */  [0.00, 0.00, 0.00, 0.00, 0.90, 0.00, 0.10, 0.00],
      /* III  */  [0.00, 0.20, 0.00, 0.40, 0.00, 0.40, 0.00, 0.00],
      /* iv   */  [0.20, 0.15, 0.00, 0.00, 0.50, 0.00, 0.00, 0.15],
      /* V    */  [0.80, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.20],
      /* VI   */  [0.00, 0.60, 0.00, 0.40, 0.00, 0.00, 0.00, 0.00],
      /* VII  */  [0.00, 0.00, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00],
      /* vii° */  [1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]
    ]
  }

  let currentChord: number = 0
  let chordProgression: Array<number> = [currentChord]
  let matrix = stochasticMatrices[mode]

  // Step through the Markov chain.
  for (let c = 1; c < n; c++) {
    const selection = Math.random()
    let probabilityBound = 0.00
    for (let nc = 0; nc < matrix[currentChord].length; nc++) {
      probabilityBound += matrix[currentChord][nc]
      if (selection < probabilityBound) {
        chordProgression.push(nc)
        currentChord = nc
        break
      }
    }
  }

  return chordProgression
}

const majorChords: any = {
  [MajorChord.I]: {
    interval: 0,
    quality: Quality.Major
  },
  [MajorChord.ii]: {
    interval: 2,
    quality: Quality.Minor
  },
  [MajorChord.iii]: {
    interval: 4,
    quality: Quality.Minor
  },
  [MajorChord.IV]: {
    interval: 5,
    quality: Quality.Major
  },
  [MajorChord.V]: {
    interval: 7,
    quality: Quality.Major
  },
  [MajorChord.vi]: {
    interval: 9,
    quality: Quality.Minor
  },
  [MajorChord.vii]: {
    interval: 11,
    quality: Quality.Diminished
  }
}

const minorChords: any = {
  [MinorChord.i]: {
    interval: 0,
    quality: Quality.Minor
  },
  [MinorChord.ii]: {
    interval: 2,
    quality: Quality.Diminished
  },
  [MinorChord.III]: {
    interval: 3,
    quality: Quality.Major
  },
  [MinorChord.iv]: {
    interval: 5,
    quality: Quality.Minor
  },
  [MinorChord.V]: {
    interval: 7,
    quality: Quality.Major
  },
  [MinorChord.VI]: {
    interval: 8,
    quality: Quality.Major
  },
  [MinorChord.VII]: {
    interval: 10,
    quality: Quality.Major
  },
  [MinorChord.vii]: {
    interval: 11,
    quality: Quality.Diminished
  }
}

function spellChord (key: PitchClass, mode: Mode, chord: MajorChord | MinorChord): Array<PitchClass> {
  const { interval, quality } = (mode === Mode.Major)
    ? majorChords[chord]
    : minorChords[chord]

  // Root of the chord.
  const root: PitchClass = (key + interval) % 12
  const spelling: Array<PitchClass> = [root]

  switch (quality) {
    case Quality.Major:
      spelling.push((root + 4) % 12) // Major Third
      spelling.push((root + 7) % 12) // Perfect Fifth
      break
    case Quality.Minor:
      spelling.push((root + 3) % 12) // Minor Third
      spelling.push((root + 7) % 12) // Perfect Fifth
      break
    case Quality.Diminished:
      spelling.push((root + 3) % 12) // Minor Third
      spelling.push((root + 6) % 12) // Diminished Fifth
      break
  }

  return spelling
}

function isSopranoRange ({ midiNumber }: Note): boolean {
  // C4 -> G5: the graphical piano is two octaves (C4 -> C6).
  return midiNumber >= 60 && midiNumber <= 79
}

function isAltoRange ({ midiNumber }: Note): boolean {
  // G3 -> D5
  return midiNumber >= 55 && midiNumber <= 74
}

function isTenorRange ({ midiNumber }: Note): boolean {
  // C3 -> G4
  return midiNumber >= 48 && midiNumber <= 67
}

function isBassRange ({ midiNumber }: Note): boolean {
  // E2 -> C4
  return midiNumber >= 40 && midiNumber <= 60
}

function isInChord (chord: Array<number>) {
  return function ({ pitchClass }: Note): boolean {
    return chord.includes(pitchClass)
  }
}

function isInKey (key: PitchClass, mode: Mode) {
  return function ({ pitchClass }: Note): boolean {
    const chords = (mode === Mode.Major)
      ? majorChords
      : minorChords
    const scale = Object
      .values(chords)
      .map(c => (c as any).interval)
      .map(i => (key + i) % 12)
    return scale.includes(pitchClass)
  }
}

function pickRandomNote (notes: Array<Note>): Note {
  const randomIndex = Math.floor(Math.random() * notes.length)
  return notes[randomIndex]
}

function generateMelody (key: PitchClass, mode: Mode, chordProgression: Array<number>): Array<Note | Array<Note>> {
  // Generate the first note of the melody.
  const firstChord = spellChord(key, mode, chordProgression.pop())
  const firstNoteCandidates = Object.values(notes)
    .filter(isSopranoRange)
    .filter(isInChord(firstChord))
  const firstNote = pickRandomNote(firstNoteCandidates)
  const melody = [firstNote]
  const lastNote = firstNote

  // Generate the rest of the notes (one per chord).
  while (chordProgression.length > 0) {
    const nextChord = chordProgression.pop()
    const candidates = Object.values(notes)
      .filter(isSopranoRange)
      .filter(isInChord(spellChord(key, mode, nextChord)))
      .filter((note: Note) => {
        // No leaps greater than a perfect fourth.
        return Math.abs(note.midiNumber - lastNote.midiNumber) <= 5
      })
    melody.push(pickRandomNote(candidates))
  }

  // Embellish the melody with non-chord tones.
  const embellishedMelody: Array<Note | Array<Note>> = []
  const slidingMelody = melody
    .slice(0, -1)
    .map((note, index) => {
      return [
        note,
        melody.slice(1)[index]
      ]
    })

  // --------------------------
  //  Ornamentation Flow Chart
  // --------------------------
  //
  // For the sake of time, we're only going to consider the addition of
  // unaccented non-chord tones (so no suspensions or retardations T.T).
  // Forgive the spaghetti! I procrastinated on this too long... there's
  // only a few hours left!
  //
  //                    +--------+     +---------------+
  //                +-> | Unison | +-> | Neighbor Tone |
  //                |   +--------+     +---------------+     +--------------+
  //                |                                    +-> | Anticipation |
  // +------------+ |   +--------+                       |   +--------------+
  // | Embellish? | +-> | Second | +---------------------+
  // +------------+ |   +--------+                       |   +-------------+
  //                |                                    +-> | Escape Tone |
  //                |   +-------+      +--------------+      +-------------+
  //                +-> | Third | +--> | Passing Tone |
  //                    +-------+      +--------------+
  //
  slidingMelody.forEach(([curr, next]) => {
    const testNote = isInKey(key, mode)
    const currStepUp = testNote(notes[curr.midiNumber + 1])
      ? notes[curr.midiNumber + 1]
      : notes[curr.midiNumber + 2]
    const currStepDown = testNote(notes[curr.midiNumber - 1])
      ? notes[curr.midiNumber - 1]
      : notes[curr.midiNumber - 2]

    if (Math.random() >= 0.5) {
      const interval = Math.abs(curr.midiNumber - next.midiNumber)
      // Perfect Unison
      if (interval === 0) {
        // Do we want to go up or down?
        if (Math.random() >= 0.5) {
          embellishedMelody.push([curr, currStepUp])
        } else {
          embellishedMelody.push([curr, currStepDown])
        }
      // (Minor | Major) Second
      } else if (interval === 1 || interval === 2) {
        if (Math.random() >= 0.5) {
          embellishedMelody.push([curr, currStepUp])
        } else {
          embellishedMelody.push([curr, currStepDown])
        }
      // (Minor | Major) Third
      } else if (interval === 3 || interval === 4) {
        // Passing Tone
        if (next.midiNumber - curr.midiNumber > 0) {
          embellishedMelody.push([curr, currStepUp])
        } else {
          embellishedMelody.push([curr, currStepDown])
        }
      } else {
        // We can't embellish this interval.
        embellishedMelody.push(curr)
      }
    } else {
      // Don't embellish the current note.
      embellishedMelody.push(curr)
    }
  })
  embellishedMelody.push(melody[melody.length - 1])

  return embellishedMelody
}

console.log(generateMelody(PitchClass.C, Mode.Major, generateChordProgression(Mode.Major, 7)))

