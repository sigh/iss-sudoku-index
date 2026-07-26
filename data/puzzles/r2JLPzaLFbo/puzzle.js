// Title: Ambiguous Arrows Sudoku
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=r2JLPzaLFbo
// Source: https://sudokupad.app/6zpysyrai2

// Normal sudoku rules apply. Each drawn line (no bulb/circle is drawn on any
// of them) must contain a digit equal to half the sum of the digits on that
// line. Equivalently: total = 2 * one of the line's own digits, i.e. that
// digit equals the sum of the line's remaining digits -- an Arrow whose bulb
// may be any one of the line's cells rather than a fixed, drawn one. Digits
// may repeat on a line (none of these lines lie within a single row, column,
// or box, and Arrow permits repeats on its arm).
// Line cell paths transcribed from the puzzle's drawn line geometry.
const lines = [
  ['R2C4', 'R1C4', 'R1C5', 'R1C6'],
  ['R2C6', 'R2C5', 'R3C4', 'R4C4'],
  ['R4C3', 'R5C4', 'R6C4', 'R7C4'],
  ['R4C7', 'R5C6', 'R6C6', 'R7C6'],
  ['R6C3', 'R5C3', 'R4C2', 'R4C1'],
  ['R6C8', 'R5C7', 'R4C8', 'R4C9'],
  ['R7C7', 'R8C6', 'R9C6'],
  ['R2C3', 'R1C3', 'R1C2', 'R2C1'],
  ['R1C9', 'R1C8', 'R2C7', 'R3C8'],
  ['R6C2', 'R7C1', 'R8C1', 'R9C1'],
  ['R6C1', 'R7C2', 'R8C2'],
  ['R9C7', 'R8C8', 'R9C9'],
  ['R3C5', 'R3C6', 'R4C6'],
  ['R3C1', 'R2C2', 'R3C3'],
];

// Each line becomes an Or over one Arrow per rotation of its cell list: the
// bulb (the cell forced to equal the sum of the rest) can be any cell on the
// line, with the remaining cells forming the arm.
const ambiguousArrows = lines.map(cells => {
  const group = [];
  for (let i = 0; i < cells.length; i++) {
    const rotated = [...cells.slice(i), ...cells.slice(0, i)];
    group.push(new Arrow(...rotated));
  }
  return new Or(group);
});

return [
  new Shape('9x9'),
  ...ambiguousArrows,
];
