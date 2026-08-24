// Title: Engagement Present
// Author: Jessica Shaham
// Video: https://www.youtube.com/watch?v=ZL_qvM_DZ7Q
// Source: https://app.crackingthecryptic.com/sudoku/Mjb9NHH8PG?setting-hidecolours=0

// Normal sudoku rules apply. "Cages show their sums" -- eight killer cages
// (digits inside a cage do not repeat), transcribed from the payload's
// `cages` array; the single-cell R6C7 cage is real, not a stub.
//
// "X/V join cells that sum to 10 (X) or 5 (V) - all possible Xs and Vs are
// given" is an exhaustive-mark rule, so StrictXV also forbids the X/V
// relation on every adjacent pair without a drawn mark.
//
// The payload's 22-cell red underlay is a decoration the player can toggle
// via the source's alternate `setting-hidecolours` link, so it carries no
// rule and is omitted (Decoration Is Not A Rule).

const cages = [
  [3, 'R2C2', 'R2C3'],
  [15, 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'],
  [7, 'R6C2', 'R6C3'],
  [14, 'R3C4', 'R4C4', 'R5C4'],
  [18, 'R4C6', 'R4C7', 'R4C8'],
  [1, 'R6C7'],
  [20, 'R5C6', 'R6C6', 'R7C6'],
  [19, 'R8C6', 'R8C7', 'R8C8'],
];

// Edge provenance: text overlays "V" drawn on the shared cell edge.
const vPairs = [
  ['R1C4', 'R2C4'],
  ['R1C5', 'R1C6'],
  ['R4C4', 'R4C5'],
  ['R3C1', 'R4C1'],
  ['R6C2', 'R7C2'],
  ['R6C3', 'R7C3'],
  ['R8C9', 'R9C9'],
];

// Edge provenance: text overlays "X" drawn on the shared cell edge.
const xPairs = [
  ['R8C8', 'R8C9'],
  ['R8C6', 'R8C7'],
  ['R6C8', 'R7C8'],
  ['R5C8', 'R5C9'],
  ['R2C9', 'R3C9'],
  ['R3C6', 'R4C6'],
  ['R3C5', 'R4C5'],
  ['R1C5', 'R2C5'],
  ['R5C5', 'R6C5'],
  ['R7C5', 'R8C5'],
  ['R6C3', 'R6C4'],
  ['R7C3', 'R7C4'],
  ['R7C1', 'R7C2'],
  ['R8C2', 'R9C2'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...vPairs.map(cells => new V(...cells)),
  ...xPairs.map(cells => new X(...cells)),
  new StrictXV(),
];
