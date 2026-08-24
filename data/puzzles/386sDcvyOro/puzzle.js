// Title: HBD RealShaggy
// Author: Glum Hippo
// Video: https://www.youtube.com/watch?v=386sDcvyOro
// Source: https://app.crackingthecryptic.com/sudoku/GBdTMfhnMF

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Cages show their sums and
// contain no repeated digits. Clues outside the grid show the sum of the
// digits along the indicated diagonal, out to the far corner; repeats are
// explicitly allowed along a diagonal.

const geometry = cellGeometry(9);

// Cages with a printed total, transcribed from the payload's `cages` array
// (cell order as drawn).
const cages = [
  [5, ['R2C4', 'R2C3']],
  [19, ['R2C2', 'R3C2', 'R4C2']],
  [19, ['R5C2', 'R6C2', 'R6C3', 'R6C4']],
  [5, ['R4C7', 'R4C6']],
  [19, ['R6C6', 'R6C7', 'R5C6']],
  [19, ['R7C8', 'R8C8', 'R8C6', 'R8C7']],
].map(([total, cells]) => new Cage(total, ...cells));

// Two further drawn cages (R4C8, R6C8) are single cells with no printed
// total. "No repeated digits" is trivially true for one cell, so they add no
// constraint beyond the default box/row/column all-different.

// Outside diagonal-sum ("little killer") clues. Each entry cell and
// direction were read from the arrow's own drawn waypoints/off-grid ray
// (payload `arrows`), matched to its circled total (payload `overlays`) by
// nearest position. LittleKiller.fromCells derives ISS's canonical corner
// from the explicit cell list, walking the drawn diagonal.
const littleKillers = [
  [19, ['R1C3', 'R2C2', 'R3C1']],
  [19, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
  [19, ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5']],
  [5, ['R6C1', 'R7C2', 'R8C3', 'R9C4']],
  [19, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']],
  [5, ['R1C8', 'R2C9']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...cages,
  ...littleKillers,
];
