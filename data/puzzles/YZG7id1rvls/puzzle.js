// Title: Aurora
// Author: shye
// Video: https://www.youtube.com/watch?v=YZG7id1rvls
// Source: https://app.crackingthecryptic.com/sudoku/DRrGhPpjRn

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Both main diagonals contain
// 1-9 once each (Diagonal). Each of the 8 outside badges gives the sum of
// the digits along its indicated diagonal ray, and digits may repeat there
// (LittleKiller). Grey lines are palindromes (Palindrome). A blue line and a
// grey line in the payload have no waypoints and render nothing; they are
// styling only and are not encoded.

const geometry = cellGeometry(9);

// Four givens, transcribed from cells[row][col].value in the payload.
const givens = [
  new Given('R2C5', 3),
  new Given('R5C2', 4),
  new Given('R5C8', 5),
  new Given('R8C5', 6),
];

// Both marked main diagonals, transcribed from the two blue full-grid lines
// (R1C1-R9C9 and R9C1-R1C9).
const diagonals = [
  new Diagonal(-1),
  new Diagonal(1),
];

// Eight little-killer diagonal-sum clues. Each drawn arrow was uniquely
// paired to its outside badge total by nearest spatial distance.
// LittleKiller.fromCells derives the canonical corner from the explicit cell
// list, walking the drawn arrow's diagonal starting at the cell nearest the
// badge.
const littleKillers = [
  [11, ['R3C1', 'R2C2', 'R1C3']],
  [35, ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9']],
  [30, ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6']],
  [11, ['R9C2', 'R8C1']],
  [22, ['R9C3', 'R8C2', 'R7C1']],
  [23, ['R9C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C1']],
  [12, ['R7C9', 'R8C8', 'R9C7']],
  [30, ['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

// Four grey palindrome lines. Each pair sharing a crossing cell (R4C4 for
// the first two, R6C6 for the last two) shares no edge in the drawn stroke
// data, so per the geometry convention these are independent lines crossing
// at a single cell, not one merged stroke -- each gets its own Palindrome.
const palindromes = [
  ['R4C2', 'R4C3', 'R4C4', 'R4C5', 'R3C6', 'R2C6', 'R1C6'],
  ['R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C3', 'R6C2', 'R6C1'],
  ['R9C4', 'R8C4', 'R7C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R8C6', 'R7C6', 'R6C6', 'R5C6', 'R4C7', 'R4C8', 'R4C9'],
].map(cells => new Palindrome(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...diagonals,
  ...littleKillers,
  ...palindromes,
];
