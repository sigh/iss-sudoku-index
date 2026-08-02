// Title: Santis
// Author: ICHTUES & Florian Wortmann
// Video: https://www.youtube.com/watch?v=Cf7yhcC8MDc
// Source: https://app.crackingthecryptic.com/sudoku/g2DNj8FHm2

// Normal sudoku rules apply. Digits do not repeat on the marked rising
// diagonal. Each drawn killer cage has distinct digits summing to its shown
// total. Cage cell lists are transcribed from the drawn cage boundaries.
const cages = [
  [15, 'R4C3', 'R4C4', 'R4C5', 'R5C3', 'R6C3'],
  [16, 'R5C6', 'R6C6', 'R7C4', 'R7C5', 'R7C6'],
  [15, 'R7C1', 'R8C1'],
  [15, 'R9C2', 'R9C3'],
  [15, 'R8C5', 'R9C5'],
  [16, 'R5C1', 'R5C2'],
  [5, 'R9C8', 'R9C9'],
  [5, 'R1C1', 'R2C1'],
  [10, 'R2C2', 'R3C2'],
  [10, 'R8C7', 'R8C8'],
  [10, 'R2C7', 'R3C7', 'R3C8'],
  [14, 'R4C7', 'R4C8', 'R5C7'],
  [16, 'R2C6', 'R3C5', 'R3C6'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
