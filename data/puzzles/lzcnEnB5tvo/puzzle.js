// Title: Mushroom Dance
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=lzcnEnB5tvo
// Source: https://sudokupad.app/4pmysqeian

// Normal sudoku, no givens. Eight region sum lines: the 3x3 box borders
// divide each line into segments, and every segment along one line must sum
// to the same total N (N may differ line to line).

const lines = [
  ['R4C1', 'R3C2', 'R2C2', 'R1C3', 'R1C4'],
  ['R4C4', 'R3C5', 'R2C5', 'R1C6', 'R1C7'],
  ['R4C7', 'R3C8', 'R2C8'],
  ['R3C9', 'R4C9', 'R5C8', 'R5C7', 'R6C6'],
  ['R9C6', 'R9C7', 'R8C8', 'R7C8', 'R6C7'],
  ['R9C3', 'R9C4', 'R8C5', 'R7C5', 'R6C4'],
  ['R7C1', 'R6C2', 'R6C3', 'R7C3', 'R8C2'],
  ['R3C7', 'R2C7', 'R2C6'],
];

const constraints = [new Shape('9x9')];
for (const line of lines) {
  constraints.push(new RegionSumLine(...line));
}

return constraints;
