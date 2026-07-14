// Title: Star of Bethlehem
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=YqFiRxhodQA
// Source: https://sudokupad.app/4ecligavud

// Normal sudoku rules apply: standard rows, columns, and 3x3 boxes. No givens.

// Arrows: the digits along an arrow sum to the digit in its circle.
// Each entry is [circle, ...arm cells]. Sixteen arrows share eight circles
// (two arrows per circle), each with a distinct 2-cell arm.
const arrows = [
  ['R1C5', 'R2C4', 'R3C4'],
  ['R1C5', 'R2C6', 'R3C6'],
  ['R9C5', 'R8C4', 'R7C4'],
  ['R9C5', 'R8C6', 'R7C6'],
  ['R5C1', 'R4C2', 'R4C3'],
  ['R5C1', 'R6C2', 'R6C3'],
  ['R5C9', 'R4C8', 'R4C7'],
  ['R5C9', 'R6C8', 'R6C7'],
  ['R4C6', 'R5C7', 'R5C8'],
  ['R6C4', 'R5C3', 'R5C2'],
  ['R4C4', 'R3C5', 'R2C5'],
  ['R6C6', 'R7C6', 'R8C5'],
  ['R6C4', 'R7C3', 'R8C4'],
  ['R6C6', 'R7C7', 'R6C8'],
  ['R4C6', 'R3C7', 'R2C6'],
  ['R4C4', 'R3C3', 'R4C2'],
];

// Curved lines: neighbouring digits on a curved line must differ by at
// least 4. Each of the four lines is the anti-diagonal of one corner box.
const curvedLines = [
  ['R9C7', 'R8C8', 'R7C9'],
  ['R1C7', 'R2C8', 'R3C9'],
  ['R1C3', 'R2C2', 'R3C1'],
  ['R7C1', 'R8C2', 'R9C3'],
];

// Star-shaped line: digits on it must form a set of consecutive digits.
// The drawn star's outer tips reach the grid's centre cell's four
// orthogonal neighbours, and its inner vertices sit inside the centre
// cell itself -- arc-length occupancy over the drawn path gives these
// five cells a clean, near-even share of the curve's length (no
// meaningful occupancy anywhere else), unlike the corner lines above
// which sample only their 3 diagonal cells. Renban also requires the
// five digits to be non-repeating, which box 5's own all-different
// already guarantees for these cells.
const starLine = ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...curvedLines.map(cells => new Whisper(4, ...cells)),
  new Renban(...starLine),
];
