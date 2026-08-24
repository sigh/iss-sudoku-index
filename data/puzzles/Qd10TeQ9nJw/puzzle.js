// Title: Positive Ring
// Author: SudokuExplorer
// Video: https://www.youtube.com/watch?v=Qd10TeQ9nJw
// Source: https://app.crackingthecryptic.com/sudoku/tpttQ7GTm2

// No rules text is present anywhere locally (payload metadata and the video
// description carry none). This encodes only what the payload's own
// structural data states directly: a 9-region jigsaw partition (replacing
// the default 3x3 boxes) and 16 killer-style cages with printed totals.
//
// Every cage's cells already pairwise share a row, column or region, so
// Cage's built-in "no repeat" clause is redundant with the grid structure
// here regardless of whether the (unrecovered) rules state it -- it never
// narrows the puzzle beyond Sum.
//
// The payload also draws two underlay colours: gold on the four corner 2x2
// blocks (16 cells) and red on a 20-cell ring/plus pattern around the
// centre region. No rules prose gives this colouring semantics, so no
// constraint is added for it here.

const REGIONS = [
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2', 'R1C2', 'R1C3', 'R2C3', 'R3C3'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C4', 'R1C4', 'R1C5', 'R2C5'],
  ['R1C7', 'R2C7', 'R3C7', 'R3C8', 'R2C8', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C8', 'R5C9'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R8C2', 'R7C2', 'R7C3', 'R8C3', 'R9C3'],
  ['R7C7', 'R8C7', 'R9C7', 'R9C8', 'R8C8', 'R7C8', 'R7C9', 'R8C9', 'R9C9'],
  ['R6C9', 'R6C8', 'R6C7', 'R6C6', 'R7C6', 'R8C6', 'R9C6', 'R8C5', 'R9C5'],
  ['R7C4', 'R8C4', 'R9C4', 'R6C4', 'R6C3', 'R6C2', 'R6C1', 'R5C1', 'R5C2'],
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R5C3', 'R5C4', 'R5C6', 'R5C7'],
];

// [total, ...cells], transcribed from the payload's `cages` array.
const CAGES = [
  [7, 'R1C1', 'R1C2'],
  [21, 'R3C3', 'R3C4', 'R4C3'],
  [12, 'R1C5', 'R2C5'],
  [11, 'R8C2', 'R9C2'],
  [10, 'R2C1', 'R2C2'],
  [15, 'R1C8', 'R2C8'],
  [7, 'R1C9', 'R2C9'],
  [10, 'R5C8', 'R5C9'],
  [6, 'R5C1', 'R5C2'],
  [13, 'R8C5', 'R9C5'],
  [16, 'R3C6', 'R3C7', 'R4C7'],
  [19, 'R6C7', 'R7C6', 'R7C7'],
  [11, 'R6C3', 'R7C3', 'R7C4'],
  [10, 'R8C1', 'R9C1'],
  [15, 'R8C8', 'R8C9'],
  [9, 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...REGIONS.map(cells => new Jigsaw('9x9', ...cells)),

  ...CAGES.map(([total, ...cells]) => new Cage(total, ...cells)),
];
