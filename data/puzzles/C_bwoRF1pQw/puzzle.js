// Title: Nine Lines
// Author: Buttons
// Video: https://www.youtube.com/watch?v=C_bwoRF1pQw
// Source: https://sudokupad.app/opx74hsg2p

// In each box, the local row-major cell position (1-9) is forbidden as a
// digit. The colored lines restrict their cells to the stated digit classes.
const digits = Array.from({length: 9}, (_, i) => i + 1);
const boxPositionRestrictions = Array.from({length: 9}, (_, row) =>
  Array.from({length: 9}, (_, col) => {
    const forbidden = 3 * (row % 3) + (col % 3) + 1;
    const cell = makeCellId(row + 1, col + 1);
    return new Given(cell, ...digits.filter(value => value !== forbidden));
  })).flat();

const digitClassLines = [
  [['R2C2', 'R1C3', 'R2C4'], [2, 3, 5, 7]],       // Prime.
  [['R1C2', 'R2C3', 'R3C4'], [4, 6, 8, 9]],       // Composite.
  [['R7C7', 'R8C7', 'R9C7', 'R9C6'], [6, 7, 8, 9]], // Greater than 5.
  [['R8C2', 'R8C3', 'R7C3'], [1, 2, 3, 4]],       // Less than 5.
  [['R4C3', 'R5C4', 'R6C5', 'R7C6'], [1, 3, 5, 7, 9]], // Odd.
  [['R1C7', 'R1C8', 'R2C9'], [2, 4, 6, 8]],       // Even.
  [['R7C8', 'R7C9'], [1, 4, 9]],                   // Square.
  [['R1C1', 'R2C1'], [1, 3, 6]],                   // Triangular.
];
const lineRestrictions = digitClassLines.flatMap(([cells, values]) =>
  cells.map(cell => new Given(cell, ...values)));

return [
  new Shape('9x9'),
  new Given('R3C3', 5),
  new Given('R4C7', 2),
  new Given('R5C3', 3),
  new Given('R5C5', 7),
  new AntiKnight(),
  ...boxPositionRestrictions,
  ...lineRestrictions,
  new SameValues(2, 'R6C6', 'R7C7'),
];
