// Title: Tetro Trick
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=OkDyZvHDoiA
// Source: https://app.crackingthecryptic.com/webapp/R8fnf423Jd

// Normal sudoku rules apply. Cells a knight's move apart cannot repeat a
// digit. Along the thermometer digits strictly increase from the bulb end.
// The blue tetrominoes contain the same 4 digits.

// Givens.
const givens = [
  new Given('R1C3', 4),
  new Given('R1C9', 7),
  new Given('R2C5', 5),
  new Given('R2C7', 1),
  new Given('R3C4', 2),
  new Given('R4C3', 5),
  new Given('R4C4', 4),
  new Given('R5C9', 3),
  new Given('R8C9', 8),
];

// Thermometer: bulb at R9C6, increasing through the corner turn at R6C6
// to R6C9.
const thermo = new Thermo(
  'R9C6', 'R8C6', 'R7C6', 'R6C6', 'R6C7', 'R6C8', 'R6C9');

// Blue tetrominoes: one horizontal shape in row 5, one vertical shape in
// column 5. Each shape's 4 cells already share a row or column, so sudoku
// already makes them distinct within the shape; SameValues(2, ...) then
// ties the two 4-cell sets to hold the same set of digits, which is what
// "contain the same 4 digits" requires between the two shapes.
const blueTetrominoA = ['R5C1', 'R5C2', 'R5C3', 'R5C4'];
const blueTetrominoB = ['R6C5', 'R7C5', 'R8C5', 'R9C5'];
const sameTetroDigits = new SameValues(2, ...blueTetrominoA, ...blueTetrominoB);

return [
  new Shape('9x9'),
  ...givens,
  new AntiKnight(),
  thermo,
  sameTetroDigits,
];
