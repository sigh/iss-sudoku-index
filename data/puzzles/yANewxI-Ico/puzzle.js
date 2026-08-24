// Title: Sudoku in Blue, Red and Yellow (Composition II)
// Author: Gooz
// Video: https://www.youtube.com/watch?v=yANewxI-Ico
// Source: https://app.crackingthecryptic.com/sudoku/Pt8t2qH7jG

// Normal sudoku (default row/column/box all-different). Six thermometers
// increase from the bulb (first cell listed). Five pairs of same-colour,
// same-shape regions (from the payload's colour underlays) are clones: each
// cell of one region is forced equal to its translated counterpart in the
// other region of the pair, via one SameValues(2, a, b) per corresponding
// cell -- SameValues over a whole region would only match value multisets,
// which is vacuous for two full boxes since both already hold 1-9.

const THERMOS = [
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R9C2', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2'],
  ['R7C3', 'R8C3', 'R9C3'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C7'],
];

// Clone pairs: [region A cells, region B cells], index-aligned by the stated
// translation (transcribed from the payload's colour underlays).
const CLONE_PAIRS = [
  // Yellow 3x3 blocks, translate +6 rows / +3 cols.
  [
    ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6'],
    ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ],
  // Yellow horizontal dominoes, translate -1 row / +6 cols.
  [['R6C1', 'R6C2'], ['R5C7', 'R5C8']],
  // Blue verticals of 3, translate +3 rows / -7 cols.
  [['R4C9', 'R5C9', 'R6C9'], ['R7C2', 'R8C2', 'R9C2']],
  // Blue verticals of 2, translate +3 rows / +1 col.
  [['R4C4', 'R5C4'], ['R7C5', 'R8C5']],
  // Red verticals of 3, translate +6 rows / -8 cols.
  [['R1C9', 'R2C9', 'R3C9'], ['R7C1', 'R8C1', 'R9C1']],
];

const clones = CLONE_PAIRS.flatMap(([a, b]) =>
  a.map((cell, i) => new SameValues(2, cell, b[i])));

return [
  new Shape('9x9'),
  ...THERMOS.map(cells => new Thermo(...cells)),
  ...clones,
];
