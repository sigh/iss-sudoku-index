// Title: Make-Your-Own Mondrian
// Author: jneen
// Video: https://www.youtube.com/watch?v=1mANekEKiFA
// Source: https://app.crackingthecryptic.com/sudoku/NLjTNfqmbM

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Cages: digits sum to the printed total and cannot repeat within the cage.
// Four of the cages cover 9 cells each with total 45 -- forced to contain
// every digit 1-9 once, i.e. an extra all-different region offset from the
// standard boxes (the "Mondrian" overlapping-rectangles construction) --
// still encoded as plain Cage() since the rule (sum + no repeat) is the same.
// Small circles: cells on either side of a drawn circle are consecutive.
// The rules state not all such circles are drawn, so unmarked adjacent
// cells carry no consecutive/non-consecutive implication either way, and
// only the five drawn edges are constrained.

// Cage cell lists transcribed from the drawn cage outlines and totals; two
// stray metadata entries in the source payload carry no cells and are not
// real cages, so they are omitted here.
const cages = [
  [21, ['R3C1', 'R3C2', 'R4C2', 'R5C2']],
  [45, ['R3C3', 'R4C3', 'R5C3', 'R3C4', 'R4C4', 'R5C4', 'R5C5', 'R4C5', 'R3C5']],
  [45, ['R3C6', 'R4C6', 'R5C6', 'R5C7', 'R4C7', 'R3C7', 'R3C8', 'R4C8', 'R5C8']],
  [25, ['R2C3', 'R1C3', 'R1C4', 'R1C5']],
  [10, ['R2C6', 'R2C7']],
  [10, ['R2C8', 'R1C8']],
  [4, ['R2C9', 'R1C9']],
  [22, ['R4C9', 'R5C9', 'R6C9']],
  [9, ['R5C1', 'R6C1', 'R6C2']],
  [45, ['R6C3', 'R7C3', 'R8C3', 'R8C4', 'R7C4', 'R6C4', 'R6C5', 'R7C5', 'R8C5']],
  [45, ['R6C6', 'R7C6', 'R8C6', 'R8C7', 'R7C7', 'R6C7', 'R6C8', 'R7C8', 'R8C8']],
  [12, ['R8C1', 'R8C2']],
  [6, ['R9C1', 'R9C2']],
  [16, ['R9C4', 'R9C5', 'R9C6']],
  [6, ['R9C8', 'R9C9']],
];

// Small-circle consecutive edges, transcribed from the drawn edge-sized
// rounded marks resolved to the two cells each one sits between.
const consecutiveEdges = [
  ['R3C4', 'R3C5'],
  ['R4C7', 'R4C8'],
  ['R5C2', 'R5C3'],
  ['R7C5', 'R7C6'],
  ['R8C6', 'R8C7'],
];

return [
  new Shape('9x9'),

  ...cages.map(([sum, cells]) => new Cage(sum, ...cells)),

  ...consecutiveEdges.map(([a, b]) => new WhiteDot(a, b)),
];
