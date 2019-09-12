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

enum MajorScaleDegree {
  I = 0,
  ii,
  iii,
  IV,
  V,
  vi,
  vii // diminished
}

enum MinorScaleDegree {
  i = 0,
  ii, // diminished
  III,
  iv,
  V,
  VI,
  vii, // diminished
  VII
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
      /*           i     ii°   III   iv    V     VI    vii°  VII
      /* i    */  [0.00, 0.20, 0.01, 0.20, 0.40, 0.09, 0.05, 0.05],
      /* ii°  */  [0.00, 0.00, 0.00, 0.00, 0.90, 0.00, 0.00, 0.10],
      /* III  */  [0.00, 0.20, 0.00, 0.40, 0.00, 0.40, 0.00, 0.00],
      /* iv   */  [0.20, 0.15, 0.00, 0.00, 0.50, 0.00, 0.15, 0.00],
      /* V    */  [0.80, 0.00, 0.00, 0.00, 0.00, 0.00, 0.20, 0.00],
      /* VI   */  [0.00, 0.60, 0.00, 0.40, 0.00, 0.00, 0.00, 0.00],
      /* vii° */  [1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
      /* VII  */  [0.00, 0.00, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00]
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
