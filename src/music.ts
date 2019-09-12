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

enum MajorScaleDegree {
  I = 1,
  ii,
  iii,
  IV,
  V,
  vi,
  vii // diminished
}

enum MinorScaleDegree {
  i = 1,
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
  const A4 = 432

  const pitchClass = PitchClass.C + (midiNumber % 12)
  const frequency = A4 * Math.pow(2, (midiNumber - 69) / 12)
  return Object.assign(notes, { [midiNumber]: { midiNumber, pitchClass, frequency } })
}

const midiNumbers: Array<number> = Array.from({ length: 128 }, (_, key) => key)
export const notes: Record<number, Note> = midiNumbers.reduce(reducer, {})
