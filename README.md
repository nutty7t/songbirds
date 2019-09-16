# Songbirds

> You are a songbird, and you are trying to attract another songbird. In order
> to do that, you must use your aural skills to sing back the melodies that you
> hear using an interactive virtual piano.

## Design

The idea I had was to create a Simon-like game with two modes:

- *EASY:* All of the notes in the melody are highlighted when they are played.

- *HARD:* Only the first note in the melody is highlighted.

Unfortunately, I procrastinated until the last day and never got around to
actually highlighting notes on the piano. Way too much time was spent writing
the procedural music generator. In the end, we ended up with just one
unanticipated game mode:

- *IMPOSSIBRU!:* None of the notes in the melody are highlighted.

To keep in the spirit of a game jam, I have decided not to finish the game. So
if you're intending to attract any songbirds, I have the following advice for you:

1. Be someone with perfect pitch.
2. Don't be someone without perfect pitch.

## Music Generation

The music generator attempts to compose homophonic 17th-century SATB chorales.
They probably don't sound half bad to most people, but it would probably make
Bach want to murder every kitten that he finds.† Here's the basic idea of
the implementation:

1. Take a chord progression graph, like the following  (from Kostka and Payne's
   [Tonal Harmony][tonal-harmony]), and convert it into a Markov chain. Assign
   each edge in the graph an arbitrary probability. OK, maybe it's somewhat
   empirical. Some chords obviously have stronger tendencies to transition to
   one chord versus another (i.e. `V -> i` vs. `V -> VI`). These intuitions are
   encoded in the probabilities.

![minor_diagram](https://user-images.githubusercontent.com/40926021/64931983-c9d7d980-d7f0-11e9-8984-939513258c51.PNG)

2. Generate a chord progression by walking the Markov chain. I discarded all
   chord progressions that didn't end on a tonic chord, but I wish that I would
   have discarded those that didn't end in a cadence.

3. Generate a melody (soprano line) from the chord progression by randomly
   selecting notes in the chord that are within a perfect fourth of the
   previous note. This results in a relatively smooth, stepwise melody.

4. Embellish the melody with ornamentation. This is done by iterating over the
   melody with a sliding window of length 2. The following control flow graph
   decides how to embellish the melody depending on the interval between the
   two notes in each iteration. To make it a little bit easier, only unaccented
   non-chord tones are added to the melody (so no suspensions or retardations).

```
                    +--------+     +---------------+
                +-> | Unison | +-> | Neighbor Tone |
                |   +--------+     +---------------+     +--------------+
                |                                    +-> | Anticipation |
 +------------+ |   +--------+                       |   +--------------+
 | Embellish? | +-> | Second | +---------------------+
 +------------+ |   +--------+                       |   +-------------+
                |                                    +-> | Escape Tone |
                |   +-------+      +--------------+      +-------------+
                +-> | Third | +--> | Passing Tone |
                    +-------+      +--------------+
```

5. Generate the harmony lines (alto, tenor, bass). This part was done lazily.
   No voice leading. No counterpoint. I don't think that I could have fit that
   in the 13 KB limit. I also think that it would be a pain to do without
   modeling four-part writing as a [constraint satisfaction problem][csp]. So
   the bass just gets the root, the tenor just gets the third, and the alto
   just gets the fifth.

6. Playback. I tuned the frequencies relative to A4 = 432 Hz. ( ͡° ͜ʖ ͡°)

One issue that I found with this generator with respect to melodic dictation is
that voice crossing is possible between the alto, tenor, and soprano lines.
This can make the soprano line indistinguishable from the other voices. This
issue was resolved (?) by significantly reducing the gain on the alto, tenor,
and bass parts.

[tonal-harmony]: https://www.mheducation.com/highered/product/tonal-harmony-kostka-payne/M9781259447099.html
[csp]: https://en.wikipedia.org/wiki/Constraint_satisfaction_problem

† There's a running musical joke that says, "Every time you write a parallel
octave [or fifths], Bach kills a kitten."

## Development

``` sh
# Start webpack development server on port 4000 with hot-reloading. 🔥
make serve

# If you intend to hide the development server behind some sort of reverse
# proxy or layered network architecture (NGINX, K8s Ingress, etc.) that exposes
# a port that is not 4000, then the HMR socket will fail to connect. You will
# need to explicitly specify the proxy origin. E.g.
make serve PROXY_ORIGIN=https://songbirds.nutty.dev:80
```

The code is potato, btw.

## Build

``` sh
# Build, minify, and zip everything up for submission!
# Output: build/submission.zip
make build
```
