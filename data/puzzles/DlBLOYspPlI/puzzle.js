// Title: illuminati
// Author: Sumanta (ANU)
// Video: https://www.youtube.com/watch?v=DlBLOYspPlI
// Source: https://sudokupad.app/wlt063c4m7

// Normal sudoku rules apply.
//
// Green cells are the centre cell of each 3x3 box (illuminati cells). Each
// green cell's own digit may not repeat anywhere along the 4 orthogonal and
// 4 diagonal directions from it; orthogonal repeats are already forbidden by
// ordinary row/column all-different, so only the two diagonals through each
// green cell need an explicit constraint below.
//
// The nine green cells also form an (extended) magic square: read in box
// order they form an abstract 3x3 layout whose rows are grid rows 2/5/8,
// whose columns are grid columns 2/5/8, and whose diagonals are the grid's
// own main and anti diagonals -- all nine cells distinct, with every
// row/column/diagonal of that layout summing to the same total.
//
// Kropki dots are positive-only ("not all possible dots are given"): white
// = consecutive, black = 1:2 ratio.
//
// Purple lines are Renban (consecutive digits, any order).
//
// Killer cages sum to the printed total, cells all-different.

// Green shading -- the centre cell of each box.
const GREEN_CELLS = [
  'R2C2', 'R2C5', 'R2C8',
  'R5C2', 'R5C5', 'R5C8',
  'R8C2', 'R8C5', 'R8C8',
];

// Illuminati: pair each green cell with every other cell on either of its
// two diagonals and forbid equality (a 2-cell AllDifferent is a plain
// not-equal). Diagonal membership is derived arithmetically (r-c or r+c
// matches the green cell's), not hand-enumerated.
const illuminatiConstraints = [];
for (const g of GREEN_CELLS) {
  const { row: gr, col: gc } = parseCellId(g);
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      if (r === gr && c === gc) continue;
      if (r - c === gr - gc || r + c === gr + gc) {
        illuminatiConstraints.push(new AllDifferent(g, makeCellId(r, c)));
      }
    }
  }
}

// Magic square abstract 3x3 lines (see header note on why these coincide
// with real grid rows/columns/diagonals).
const magicLines = [
  ['R2C2', 'R2C5', 'R2C8'],
  ['R5C2', 'R5C5', 'R5C8'],
  ['R8C2', 'R8C5', 'R8C8'],
  ['R2C2', 'R5C2', 'R8C2'],
  ['R2C5', 'R5C5', 'R8C5'],
  ['R2C8', 'R5C8', 'R8C8'],
  ['R2C2', 'R5C5', 'R8C8'],
  ['R2C8', 'R5C5', 'R8C2'],
];

return [
  new Shape('9x9'),

  ...illuminatiConstraints,

  new AllDifferent(...GREEN_CELLS),
  new EqualSum(...magicLines),

  // Kropki white dots (consecutive, implicit difference 1).
  new WhiteDot('R9C4', 'R9C5'),
  new WhiteDot('R4C1', 'R5C1'),
  new WhiteDot('R1C4', 'R1C3'),
  new WhiteDot('R1C7', 'R1C8'),

  // Kropki black dots (1:2 ratio, implicit ratio 2).
  new BlackDot('R4C4', 'R4C5'),
  new BlackDot('R5C4', 'R4C4'),
  new BlackDot('R6C9', 'R5C9'),
  new BlackDot('R7C1', 'R6C1'),

  // Renban lines (drawn purple, 3 cells each).
  new Renban('R6C6', 'R7C7', 'R8C8'),
  new Renban('R4C6', 'R3C7', 'R2C8'),

  // Killer cages.
  new Cage(20, 'R5C6', 'R6C5', 'R6C6'),
  new Cage(21, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(9, 'R3C4', 'R4C3', 'R4C4'),
];
