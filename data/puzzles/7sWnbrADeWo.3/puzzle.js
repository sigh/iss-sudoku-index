// Title: Aug 23, 2021: Rossini Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=7sWnbrADeWo
// Source: https://tinyurl.com/5rbw6bbz

// Normal sudoku rules apply. Rossini: an arrow drawn outside the grid means
// the three digits nearest the arrow, in that row/column, strictly increase
// in the direction the arrow points. Only 15 of the 18 possible row/column
// ends carry an arrow (column 7 has both a top and bottom arrow, row 4 has
// both a left and a right arrow); an end with no arrow has no constraint.
// Each triple is encoded as a Thermo, whose bulb (first cell) is the
// smallest value, matching the cell nearest the arrow's tail (i.e. furthest
// along the arrow's direction of travel) -- provenance below is each arrow's
// drawn glyph and margin position.

const givens = [
  ['R1C9', 2],
  ['R2C8', 3],
  ['R3C3', 3],
  ['R3C7', 4],
  ['R4C4', 4],
  ['R5C5', 5],
  ['R6C6', 6],
  ['R7C3', 6],
  ['R7C7', 7],
  ['R8C2', 7],
  ['R9C1', 8],
];

// Each entry is a Thermo triple ordered from smallest (bulb) to largest,
// derived from an arrow glyph at a margin cell:
// R0C# / R10C# = top/bottom of column #; R#C0 / R#C10 = left/right of row #.
const rossiniTriples = [
  ['R3C1', 'R2C1', 'R1C1'], // R0C1 up-arrow: top of column 1, pointing up
  ['R1C2', 'R2C2', 'R3C2'], // R0C2 down-arrow: top of column 2, pointing down
  ['R1C3', 'R2C3', 'R3C3'], // R0C3 down-arrow: top of column 3, pointing down
  ['R3C5', 'R2C5', 'R1C5'], // R0C5 up-arrow: top of column 5, pointing up
  ['R3C7', 'R2C7', 'R1C7'], // R0C7 up-arrow: top of column 7, pointing up
  ['R7C6', 'R8C6', 'R9C6'], // R10C6 down-arrow: bottom of column 6, pointing down
  ['R7C7', 'R8C7', 'R9C7'], // R10C7 down-arrow: bottom of column 7, pointing down
  ['R7C8', 'R8C8', 'R9C8'], // R10C8 down-arrow: bottom of column 8, pointing down
  ['R9C9', 'R8C9', 'R7C9'], // R10C9 up-arrow: bottom of column 9, pointing up
  ['R4C3', 'R4C2', 'R4C1'], // R4C0 left-arrow: left of row 4, pointing left
  ['R5C1', 'R5C2', 'R5C3'], // R5C0 right-arrow: left of row 5, pointing right
  ['R8C1', 'R8C2', 'R8C3'], // R8C0 right-arrow: left of row 8, pointing right
  ['R9C3', 'R9C2', 'R9C1'], // R9C0 left-arrow: left of row 9, pointing left
  ['R2C9', 'R2C8', 'R2C7'], // R2C10 left-arrow: right of row 2, pointing left
  ['R4C7', 'R4C8', 'R4C9'], // R4C10 right-arrow: right of row 4, pointing right
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...rossiniTriples.map((cells) => new Thermo(...cells)),
];
