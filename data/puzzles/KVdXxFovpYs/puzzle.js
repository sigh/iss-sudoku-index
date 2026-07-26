// Title: Tetrafolium
// Author: Myxo
// Video: https://www.youtube.com/watch?v=KVdXxFovpYs
// Source: https://sudokupad.app/mss23tnw9u

// Sudoku: standard row/column/box all-different (Shape's default).
//
// Killer: four corner 2x2 cages sum to 20 with all digits distinct (Cage).
// Three further 3-cell cages give only the total's parity ("odd" in the
// source, no numeric total), each drawn without the "unique" flag the corner
// cages carry -- encoded as an NFA over the running sum mod 2, since Cage
// and Sum both require an exact target total.
//
// Thermo: four 5-cell thermometers, strictly increasing from the bulb (the
// filled-circle end in the source).
//
// German Whispers: eight 3-cell segments (two adjacent-cell differences of
// at least five each); Whisper's difference argument defaults to 5 when
// omitted, matching this rule.
//
// The source draws each thermometer and the two whisper segments touching
// its ends as one continuous stroke (a "petal"), but the rules give thermo
// and whisper cells different semantics, so they are encoded as separate
// constraints below rather than one combined line.

const cornerCages = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
].map((cells) => new Cage(20, ...cells));

// Odd-sum-only cages: NFA state is the running sum mod 2; accept iff the
// final parity is 1 (odd). No distinctness is implied for these three.
const oddParityNFA = NFA.encodeSpec({
  startState: 0,
  transition: (sum, v) => (sum + v) % 2,
  accept: (sum) => sum === 1,
}, 9);
const parityCages = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R4C1', 'R5C1', 'R6C1'],
].map((cells) => new NFA(oddParityNFA, 'odd sum', ...cells));

const thermos = [
  ['R2C4', 'R3C4', 'R4C5', 'R3C6', 'R2C6'],
  ['R6C8', 'R6C7', 'R5C7', 'R5C8', 'R4C8'],
  ['R4C2', 'R4C3', 'R5C3', 'R5C2', 'R6C2'],
  ['R8C6', 'R9C6', 'R9C5', 'R9C4', 'R8C4'],
].map((cells) => new Thermo(...cells));

const whispers = [
  ['R1C2', 'R1C3', 'R2C4'],
  ['R2C6', 'R1C7', 'R1C8'],
  ['R6C8', 'R7C9', 'R8C9'],
  ['R2C9', 'R3C9', 'R4C8'],
  ['R4C2', 'R3C1', 'R2C1'],
  ['R8C1', 'R7C1', 'R6C2'],
  ['R9C8', 'R9C7', 'R8C6'],
  ['R8C4', 'R9C3', 'R9C2'],
].map((cells) => new Whisper(...cells));

return [
  new Shape('9x9'),
  ...cornerCages,
  ...parityCages,
  ...thermos,
  ...whispers,
];
