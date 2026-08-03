// Title: Gauntlet
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=dmeXfOr9rBI
// Source: https://app.crackingthecryptic.com/sudoku/HjmmTp4M6t

// Normal sudoku rules apply (rows/cols/3x3 boxes, no repeats). Cages show
// their sums, digits cannot repeat within a cage. Digits on an arrow sum to
// the two-digit number in its connected pill, read left to right; those
// digits may repeat. A digit in a cell with a shaded square must be even.

// Killer cages: sum + 3 cells, transcribed from `cages[]` in the source.
const cages = [
  [6, 'R1C1', 'R2C1', 'R3C1'],
  [18, 'R1C7', 'R1C8', 'R2C7'],
  [14, 'R2C9', 'R3C8', 'R3C9'],
  [18, 'R3C5', 'R3C6', 'R4C5'],
  [14, 'R4C7', 'R5C6', 'R5C7'],
  [19, 'R5C3', 'R5C4', 'R6C3'],
  [14, 'R6C5', 'R7C4', 'R7C5'],
  [6, 'R7C9', 'R8C9', 'R9C9'],
];

// Each arrow's drawn wayPoints start at an off-centre point on the pill's
// boundary rather than at a true additional cell; that point snaps to the
// pill's own units cell (R9C2 / R7C2), which is a pill digit, not a summed
// arm cell. The arm begins at the next cell along the diagonal. Pill cells
// are listed tens-then-units (left to right), matching `PillArrow`'s
// pill-cells-first, then-arm-cells argument order.
const pillArrows = [
  ['R9C1', 'R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R7C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...pillArrows.map(cells => new PillArrow(2, ...cells)),
  // Shaded square (underlay, R3C3): digit must be even.
  new Given('R3C3', 2, 4, 6, 8),
];
