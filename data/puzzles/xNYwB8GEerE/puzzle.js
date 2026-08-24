// Title: Gordian Knot
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=xNYwB8GEerE
// Source: https://app.crackingthecryptic.com/sudoku/rb7G2grJmN

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Both marked main diagonals
// must contain 1-9 once each. Cages sum to their printed total with no
// repeated digit inside a cage. Outside diagonal-sum clues give the total
// of the indicated diagonal ray, where digits may repeat except where
// row/column/box all-different already applies to a stretch of it.
// No givens are present in the payload.

const geometry = cellGeometry(9);

// Both marked main diagonals (payload `lines` #0 and #1), each 1-9 once.
const diagonals = [
  new Diagonal(1),
  new Diagonal(-1),
];

// Killer cages, transcribed from payload `cages` entries 0-6 (entry 7 is a
// cell-less metadata stub, not a drawn cage).
const cages = [
  [33, ['R1C9', 'R2C9', 'R2C8', 'R2C7', 'R3C7']],
  [13, ['R3C8', 'R4C8', 'R4C7']],
  [12, ['R3C6', 'R3C5', 'R4C5']],
  [28, ['R4C6', 'R5C6', 'R5C5', 'R5C4', 'R6C4']],
  [13, ['R6C5', 'R7C5', 'R7C4']],
  [13, ['R6C3', 'R6C2', 'R7C2']],
  [32, ['R7C3', 'R8C3', 'R8C2', 'R8C1', 'R9C1']],
].map(([total, cells]) => new Cage(total, ...cells));

// Outside diagonal-sum ("little killer") clues. LittleKiller.fromCells
// derives the canonical corner from the explicit cell list, walking the
// drawn arrow's diagonal starting at the cell nearest the outside badge.
const littleKillers = [
  [47, ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1']],
  [34, ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1']],
  [32, ['R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2']],
  [36, ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...diagonals,
  ...cages,
  ...littleKillers,
];
