// Title: The X and The V Squared: Anniversary Edition
// Author: .proxz14
// Video: https://www.youtube.com/watch?v=01KC84S7FJ8
// Source: https://sudokupad.app/wy3lbsjgfi
//
// Normal sudoku rules apply. Digits along a line may repeat and must sum to
// the attached value (here, all six lines sum to 25). Digits separated by an
// X sum to 10, while digits separated by a V sum to 5. Cells separated by a
// chess knight's move cannot contain the same digit.

const sumLines = [
  ['R4C1', 'R5C1', 'R5C2', 'R5C3'],
  ['R8C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R6C3', 'R5C4', 'R4C5', 'R3C6', 'R4C7', 'R5C8'],
  ['R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'],
  ['R9C7', 'R8C7', 'R8C8', 'R7C8', 'R6C8'],
  ['R9C1', 'R8C1', 'R7C1', 'R7C2', 'R7C3'],
];
const LINE_SUM = 25;

const xClues = [
  ['R2C1', 'R2C2'],
  ['R5C5', 'R5C6'],
  ['R5C8', 'R5C9'],
  ['R6C1', 'R6C2'],
  ['R8C2', 'R9C2'],
  ['R2C4', 'R3C4'],
  ['R7C5', 'R7C6'],
  ['R1C4', 'R1C5'],
  ['R3C8', 'R3C9'],
];

const vClues = [
  ['R3C2', 'R3C3'],
  ['R4C1', 'R4C2'],
  ['R8C5', 'R8C6'],
];

const constraints = [new Shape('9x9'), new AntiKnight()];
const add = (...newConstraints) => constraints.push(...newConstraints);

for (const cells of sumLines) add(new Sum(LINE_SUM, ...cells));
for (const cells of xClues) add(new X(...cells));
for (const cells of vClues) add(new V(...cells));

return constraints;
