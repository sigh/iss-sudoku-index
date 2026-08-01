// Title: A Puzzle in Two Parts
// Author: jsmirob
// Video: https://www.youtube.com/watch?v=yb9ISvJerII
// Source: https://app.crackingthecryptic.com/9r7g4h0cqz

// Normal Sudoku rules; digits do not repeat on the marked rising diagonal.
// The drawn killer cages have distinct digits and sum to their displayed totals;
// two drawn cages have no displayed total, so they impose distinctness only.
// Cage cell lists are transcribed from the drawn cage boundaries.
const totalCages = [
  [9, 'R1C1', 'R1C2', 'R2C1'],
  [16, 'R5C6', 'R6C5', 'R6C6'],
  [9, 'R1C8', 'R1C9', 'R2C8'],
  [9, 'R8C1', 'R8C2', 'R9C1'],
  [17, 'R4C4', 'R4C5', 'R5C4'],
  [9, 'R8C8', 'R8C9', 'R9C8'],
  [8, 'R6C4', 'R7C4'],
  [8, 'R4C6', 'R4C7'],
  [34, 'R1C6', 'R1C7', 'R2C4', 'R2C5', 'R2C6', 'R3C6'],
  [11, 'R3C8', 'R4C8'],
];

const noTotalCages = [
  ['R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R9C6', 'R9C7'],
  ['R1C3', 'R1C4', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R4C1'],
];

return [
  new Shape('9x9'),
  new Diagonal(1), // Marked rising diagonal, R9C1-R1C9.
  ...totalCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new AllDifferent(...cells)),
];
