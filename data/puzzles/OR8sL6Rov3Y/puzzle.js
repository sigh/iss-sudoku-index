// Title: Killer Clones
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=OR8sL6Rov3Y
// Source: https://app.crackingthecryptic.com/sudoku/gHdNt6M4Ln

// Rules encoded:
// - Normal sudoku rules apply (default row/column/box all-different; the
//   payload's 9 regions are the standard 3x3 boxes, so no explicit Regions
//   constraint is needed).
// - In cages, digits sum to the clue and cannot repeat within a cage: Cage
//   (sum + all-different) is the literal reading, since the rule states both
//   the sum and the no-repeat clause explicitly.
// - Similarly coloured dominoes are clones of each other and must contain
//   the same digits in the same orientation. Each of the 4 colours marks two
//   adjacent-cell dominoes (from the payload's underlay fills); orientation
//   is fixed by each domino's own layout (top/bottom for a vertical domino,
//   left/right for a horizontal one), so "same orientation" is encoded as
//   position-matched cell equality (top=top & bottom=bottom, or left=left &
//   right=right) rather than a same-set-of-two-digits constraint, which
//   would also accept the swapped pairing.

const cages = [
  // Cage cell lists transcribed from the payload's drawn cage geometry.
  { sum: 17, cells: ['R1C1', 'R1C2', 'R2C1'] },
  { sum: 12, cells: ['R2C2', 'R2C3', 'R3C2', 'R3C3'] },
  { sum: 16, cells: ['R1C4', 'R1C5', 'R1C6', 'R2C5'] },
  { sum: 18, cells: ['R1C8', 'R1C9', 'R2C9'] },
  { sum: 16, cells: ['R4C9', 'R5C8', 'R5C9', 'R6C9'] },
  { sum: 18, cells: ['R8C9', 'R9C8', 'R9C9'] },
  { sum: 17, cells: ['R8C5', 'R9C4', 'R9C5', 'R9C6'] },
  { sum: 17, cells: ['R8C1', 'R9C1', 'R9C2'] },
  { sum: 17, cells: ['R4C1', 'R5C1', 'R5C2', 'R6C1'] },
  { sum: 15, cells: ['R3C4', 'R4C3', 'R4C4'] },
  { sum: 12, cells: ['R2C7', 'R2C8', 'R3C7', 'R3C8'] },
  { sum: 12, cells: ['R7C2', 'R7C3', 'R8C2', 'R8C3'] },
  { sum: 12, cells: ['R7C7', 'R7C8', 'R8C7', 'R8C8'] },
  { sum: 9, cells: ['R6C6', 'R6C7', 'R7C6'] },
  { sum: 21, cells: ['R3C6', 'R4C6', 'R4C7'] },
  { sum: 20, cells: ['R6C3', 'R6C4', 'R7C4'] },
  { sum: 31, cells: ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'] },
];

// Clone-domino pairs, transcribed from the payload's underlay fills (4
// same-coloured 1x1 fills per colour, forming two adjacent-cell dominoes
// each). Each entry pairs the two dominoes' cells in matching orientation
// order. SameValues(2, a, b) splits its two cells into two 1-cell sets and
// requires the sets to hold the same value, i.e. a === b -- the faithful
// reading of "same digits in the same orientation" for a matched cell pair
// (a same-set-of-two-digits reading over the whole domino would also accept
// the swapped, wrong-orientation pairing).
const clonePairs = [
  // light grey (#CFCFCF): vertical R1C1-R2C1 clones vertical R3C6-R4C6
  ['R1C1', 'R3C6'], ['R2C1', 'R4C6'],
  // yellow-green (#A3E048): vertical R7C3-R8C3 clones vertical R5C9-R6C9
  ['R7C3', 'R5C9'], ['R8C3', 'R6C9'],
  // red (#E6261F): horizontal R3C2-R3C3 clones horizontal R9C4-R9C5
  ['R3C2', 'R9C4'], ['R3C3', 'R9C5'],
  // deep sky blue (#34BBE6): horizontal R2C7-R2C8 clones horizontal R6C6-R6C7
  ['R2C7', 'R6C6'], ['R2C8', 'R6C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(c => new Cage(c.sum, ...c.cells)),
  ...clonePairs.map(([a, b]) => new SameValues(2, a, b)),
];
