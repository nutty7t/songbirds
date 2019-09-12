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
  for (let c = 1; c < length; c++) {
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

function spellChord (key: PitchClass, mode: Mode, chord: MajorChord | MinorChord): Array<PitchClass> {
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

function generateMelody (key: PitchClass, chords: Array<number>) {
  // TODO implement function
}
