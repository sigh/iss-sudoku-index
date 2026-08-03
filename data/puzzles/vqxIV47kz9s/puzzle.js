// Title: Soliloquy
// Author: zetamath
// Video: https://www.youtube.com/watch?v=vqxIV47kz9s
// Source: https://app.crackingthecryptic.com/sudoku/6JfjT3N6L2

// Normal sudoku, plus:
// - Green lines: adjacent digits differ by at least 5 (German Whisper).
// - Purple lines: a non-repeating set of consecutive digits, in any order
//   (Renban).
// - Arrows: digits along the arrow sum to the digit in the circle.
// - Thermometer: digits strictly increase from the bulb end.
// - Golden lines are 'nabner' lines: no two digits anywhere on the same
//   line can be consecutive. The rules state only this non-consecutive
//   clause (no separate no-repeat clause, unlike most nabner puzzles in
//   this corpus); every golden line below sits entirely inside one row,
//   column, or box, so ordinary sudoku all-different already forbids
//   repeats on each of them without any extra constraint.

const whispers = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R1C3', 'R2C3', 'R3C3'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R9C4', 'R9C3', 'R9C2'],
];

const renbans = [
  ['R9C9', 'R9C8', 'R9C7', 'R9C6'],
  ['R6C7', 'R7C7', 'R7C6', 'R7C5'],
];

// Raw payload lines #7 and #8 (R8C6-R8C5-R8C4 and R8C4-R9C5-R8C6) share the
// same colour/thickness and meet at exact cell-centre endpoints (R8C4 and
// R8C6), so they are one continuous golden line drawn as two strokes -- a
// closed loop over these 4 cells, not two separate 3-cell lines. Treating
// it as one line reaches every pair, including R8C5/R9C5, which two
// separate lines would miss.
const nabners = [
  ['R1C2', 'R2C2', 'R3C2'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R3C6', 'R3C5', 'R3C4'],
  ['R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R6C3', 'R7C3', 'R8C3'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R8C4', 'R8C5', 'R8C6', 'R9C5'],
];

// PairX applies the predicate to every pair of cells on the line, not just
// adjacent ones, which "no two digits anywhere on a nabner line" requires.
const notConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

// Thermometer bulb at R4C3 (underlay circle), increasing through R4C5.
const thermo = ['R4C3', 'R4C4', 'R4C5'];

// Arrows: circle cell first, then the arm cells that sum to it.
const arrows = [
  ['R2C7', 'R3C7', 'R4C7'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R2C9', 'R3C9', 'R4C9'],
  ['R6C2', 'R5C2', 'R4C2'],
];

return [
  new Shape('9x9'),

  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...renbans.map(cells => new Renban(...cells)),
  ...nabners.map(cells => new PairX(notConsecutiveKey, 'Nabner', ...cells)),
  new Thermo(...thermo),
  ...arrows.map(cells => new Arrow(...cells)),
];
