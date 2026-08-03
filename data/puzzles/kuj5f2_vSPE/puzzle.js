// Title: Nabner In the Nebula v2
// Author: gdc
// Video: https://www.youtube.com/watch?v=kuj5f2_vSPE
// Source: https://app.crackingthecryptic.com/sudoku/NTdGT2L7Fj

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Every golden line
// is a Nabner line: no repeated digit, and no two digits anywhere on the line
// (any pair, not just line-adjacent ones) are consecutive. Three outside clues
// give X-Sums: the sum of the first X digits read from the clue's direction
// along that row/column, where X is the digit closest to the clue (X itself
// counts toward the sum). Each X-Sum also forms its own hidden Nabner line, at
// least X cells long, starting at the cell closest to the clue -- read along
// the same row/column the X-Sum reads, since that is the only direction the
// rule text ties it to and no drawn art shows an alternate path for it.
// Fog-lifting is solving UI, not a final-grid rule, and is not encoded.

const shape = new Shape('9x9');

// The 10 drawn golden Nabner lines, transcribed from the puzzle's drawn line
// paths (colour #F7D038).
const nabnerLines = [
  ['R2C1', 'R3C2', 'R4C3', 'R4C4'],
  ['R1C5', 'R2C6', 'R3C7', 'R2C8'],
  ['R2C9', 'R3C9', 'R4C9', 'R4C8'],
  ['R3C4', 'R4C5', 'R5C5', 'R4C6'],
  ['R5C9', 'R5C8', 'R6C8', 'R5C7'],
  ['R7C5', 'R6C6', 'R6C7'],
  ['R3C1', 'R4C1', 'R4C2', 'R5C2'],
  ['R6C4', 'R6C3', 'R7C4', 'R8C5'],
  ['R8C6', 'R8C7', 'R7C8', 'R8C8'],
  ['R8C3', 'R8C2', 'R9C2', 'R9C1'],
];

// Nabner is an all-pairs relation, not just line-adjacent, so PairX (every
// pair) is required rather than the adjacency built into Whisper/Renban-style
// line classes.
const notConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const nabnerConstraints = nabnerLines.flatMap(cells => [
  new AllDifferent(...cells),
  new PairX(notConsecutiveKey, 'Nabner', ...cells),
]);

// The three outside X-Sum clues (overlays), each cell list ordered from the
// clue toward the grid.
const outsideXSums = [
  { value: 19, cells: ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'] }, // top, C5
  { value: 19, cells: ['R3C9', 'R3C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1'] }, // right, R3
  { value: 19, cells: ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'] }, // left, R2
];

const geometry = cellGeometry('9x9');
const xSumConstraints = outsideXSums.map(({ value, cells }) =>
  XSum.fromCells(value, cells, geometry));

// Hidden Nabner segment implied by each X-Sum: the first X cells along that
// row/column (X = the digit in the cell closest to the clue, itself
// included) carry no repeat and no two-anywhere-consecutive values. X is not
// known in advance, so an NFA reads the line, latches the first digit as the
// target segment length, then enforces the pairwise-Nabner check only while
// still within that many cells; once the segment closes, the remaining cells
// of the row/column are unconstrained by this rule (they still get the
// ordinary row/column all-different from Shape).
function hiddenNabnerPrefix(cells) {
  const forbidMaskFor = value =>
    (1 << value) | (value > 1 ? 1 << (value - 1) : 0) |
    (value < 9 ? 1 << (value + 1) : 0);
  const spec = {
    startState: { target: null, seen: 0, forbid: 0 },
    transition: ({ target, seen, forbid }, value) => {
      if (target === null) {
        // First cell: its own value sets the segment length and is itself
        // the first member of the Nabner set.
        return { target: value, seen: 1, forbid: forbidMaskFor(value) };
      }
      if (seen >= target) return { target, seen, forbid }; // segment closed
      if ((forbid >> value) & 1) return undefined; // repeat or consecutive
      return { target, seen: seen + 1, forbid: forbid | forbidMaskFor(value) };
    },
    accept: () => true,
    maxDepth: 9,
  };
  const encodedNFA = NFA.encodeSpec(spec, 9);
  return new NFA(encodedNFA, 'Hidden X-Sum Nabner prefix', ...cells);
}

const hiddenNabnerConstraints = outsideXSums.map(({ cells }) =>
  hiddenNabnerPrefix(cells));

return [
  shape,
  ...nabnerConstraints,
  ...xSumConstraints,
  ...hiddenNabnerConstraints,
];
