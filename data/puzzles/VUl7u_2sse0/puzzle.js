// Title: Supersonic Slingshots
// Author: DubiousMobius
// Video: https://www.youtube.com/watch?v=VUl7u_2sse0
// Source: https://sudokupad.app/ix1pl0qk4b

// Standard sudoku (rows, columns, 3x3 boxes) on the real 9x9 grid, plus:
//
// Kropki: white-dot pairs are consecutive, black-dot pairs have one digit
// double the other.
//
// Toroidal grid + Supersonic Slingshots: the source draws a one-cell-wide
// duplicate frame around the real 9x9 grid ("clues outside the grid are
// duplicates of clues inside the grid") so a clue near an edge can be shown
// continuing past the border; the frame cells are not separately solved and
// contribute no new clue. Each slingshot's own cells (its "shaft") hold a
// multi-digit number that is the distance a copy of some other cell's digit
// travels forward along the shaft's row/column, wrapping at the border, away
// from the shaft's handle end. Because that travel wraps within the same
// (length-9) row or column, and ordinary sudoku forbids two cells of one
// row/column sharing a digit, the copy can only be consistent if it lands
// back on its own starting cell - i.e. the travelled distance is a multiple
// of 9. A decimal number is a multiple of 9 exactly when its digit sum is
// (since 10 == 1 mod 9, every place value contributes 1 mod 9): so each
// shaft's own encoded rule is "the shaft cells' digits sum to a multiple of
// 9", independent of the shaft's reading order, its handle end, or which
// cell receives the launched copy - none of those affect this arithmetic, so
// none are separately modelled.
//
// Shaft cells are read directly off the source's hand-drawn slingshot icons,
// each a straight run of 1-8 cells in one row or column; icons whose whole
// footprint lies in the duplicate frame (source row 1, row 11, col 1, or
// col 11) are the frame's echo of a real icon and are not separate
// slingshots.

const mod9Sum = NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => (state + value) % 9,
  accept: (state) => state === 0,
}, 9);

const slingshots = [
  ['R1C2'],
  ['R1C3', 'R2C3', 'R3C3'],
  ['R1C4', 'R2C4', 'R3C4'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C6'],
  ['R1C7', 'R2C7'],
  ['R1C8', 'R2C8'],
  ['R6C3', 'R7C3', 'R8C3', 'R9C3'],
  ['R8C4', 'R9C4'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R8C6', 'R9C6'],
  ['R3C8', 'R3C9'],
  ['R4C8', 'R4C9'],
  ['R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R8C8', 'R8C9'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R8C1', 'R8C2'],
  ['R2C1', 'R2C2'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8'],
  ['R6C1', 'R6C2'],
];

return [
  new Shape('9x9'),

  new BlackDot('R1C3', 'R2C3'),
  new BlackDot('R1C9', 'R2C9'),
  new BlackDot('R7C1', 'R7C2'),

  new WhiteDot('R5C1', 'R5C2'),
  new WhiteDot('R5C5', 'R5C6'),
  new WhiteDot('R7C9', 'R8C9'),

  ...slingshots.map(cells => new NFA(mod9Sum, 'Sling', ...cells)),
];
