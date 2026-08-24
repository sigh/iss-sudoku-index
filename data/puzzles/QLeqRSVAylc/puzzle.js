// Title: Have a Cracking New Year!
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=QLeqRSVAylc
// Source: https://app.crackingthecryptic.com/sudoku/mRDtGNFGPq

// Standard Sudoku rows/columns/boxes (regions array is the ordinary nine
// boxes). No given digits.
//
// Arrows: sum of the arm digits equals the digit in the circled cell,
// repeats allowed on the arm (Arrow's semantics match this exactly).
// Two circled cells (R7C2, R7C3, R8C6) each anchor two arrows sharing that
// one circle; each is encoded as two separate Arrow constraints with the
// same control cell.
//
// Thermometers: strictly increasing from the bulb. One bulb (R1C4) forks
// into two arms (drawn as two line entries sharing the same start point);
// encoded as two Thermo constraints sharing that bulb cell.
//
// Cages (no printed total) and the outside-grid diagonal markers: each
// cage's cells sum to 20 or 21, or their product is 20 or 21 (rules text).
// The outside diagonals carry the same sum-or-product rule and explicitly
// allow repeats. Cage cells are each confined to a single row or column, so
// all-different is already implied by standard Sudoku -- no extra
// AllDifferent is added. No native class expresses "sum or product equals
// one of two targets", so this is encoded as a saturating-counter NFA that
// tracks the running sum and running product (each clamped to a sink once
// past 21, since both only increase) and accepts if either lands on 20 or
// 21. The same NFA generator is reused for every cage and every diagonal.

function sumOrProductNFA(cellCount) {
  return NFA.encodeSpec({
    startState: { sum: 0, prod: 1 },
    transition: ({ sum, prod }, value) => ({
      // 22 is a saturating sink: both sum and product only increase as
      // cells are consumed, so once either exceeds 21 it can never return
      // to 20 or 21 and is collapsed to one dead state.
      sum: Math.min(sum + value, 22),
      prod: Math.min(prod * value, 22),
    }),
    accept: ({ sum, prod }) => sum === 20 || sum === 21 || prod === 20 || prod === 21,
  }, 9);
}

function sumOrProduct(name, cells) {
  return new NFA(sumOrProductNFA(cells.length), name, ...cells);
}

const cages = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R4C3', 'R4C4', 'R4C5'],
  ['R5C7', 'R5C8'],
  ['R5C9', 'R6C9', 'R7C9'],
  ['R5C2', 'R5C3'],
  ['R6C5', 'R6C6', 'R6C7'],
];

const diagonals = [
  ['R3C1', 'R2C2', 'R1C3'],
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
  ['R3C9', 'R2C8', 'R1C7'],
  ['R4C9', 'R3C8', 'R2C7', 'R1C6'],
  ['R9C3', 'R8C2', 'R7C1'],
  ['R9C7', 'R8C8', 'R7C9'],
];

const cageConstraints = cages.map(
  (cells, i) => sumOrProduct(`cage ${i}`, cells));
const diagonalConstraints = diagonals.map(
  (cells, i) => sumOrProduct(`diagonal ${i}`, cells));

const thermos = [
  new Thermo('R3C3', 'R3C2', 'R2C2', 'R2C3', 'R1C3', 'R1C2'),
  // Forked bulb at R1C4: two separate increasing arms from the same cell.
  new Thermo('R1C4', 'R1C5', 'R2C5'),
  new Thermo('R1C4', 'R2C4', 'R3C4', 'R3C5'),
  new Thermo('R2C6', 'R2C7', 'R3C7', 'R3C6', 'R4C6', 'R4C7'),
  new Thermo('R4C9', 'R3C9', 'R2C9'),
];

const arrows = [
  new Arrow('R7C2', 'R6C2', 'R6C1'),
  new Arrow('R7C2', 'R7C1', 'R8C1', 'R8C2'),
  new Arrow('R7C3', 'R6C3', 'R6C4', 'R7C4'),
  new Arrow('R7C3', 'R8C3', 'R8C4'),
  new Arrow('R8C6', 'R7C6', 'R7C5'),
  new Arrow('R8C6', 'R8C5', 'R9C5', 'R9C6'),
  new Arrow('R9C8', 'R8C8', 'R7C8'),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...arrows,
  ...cageConstraints,
  ...diagonalConstraints,
];
