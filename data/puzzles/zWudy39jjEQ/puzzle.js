// Title: Supersquish Dominoes
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=zWudy39jjEQ
// Source: https://sudokupad.app/dgpf3zkpjp

// Use digits 1-9 with row, column, and the five coloured 3x3 boxes all different.
// X marks sum to 10 and black dots mark 1:2 ratios; unmarked pairs are unrestricted.
const boxes = [
  // The five coloured 3x3 boxes drawn on the grid.
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R1C3', 'R1C4', 'R1C5', 'R2C3', 'R2C4', 'R2C5', 'R3C3', 'R3C4', 'R3C5'],
  ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  ['R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3'],
  ['R3C3', 'R3C4', 'R3C5', 'R4C3', 'R4C4', 'R4C5', 'R5C3', 'R5C4', 'R5C5'],
];

return [
  new Shape('5x5', 9),
  new NoBoxes(),
  ...boxes.map(cells => new AllDifferent(...cells)),
  // X marks transcribed from the drawn dominoes.
  new X('R1C1', 'R1C2'),
  new X('R2C1', 'R2C2'),
  new X('R4C4', 'R4C5'),
  new X('R5C2', 'R5C3'),
  new X('R2C4', 'R3C4'),
  // Black dots transcribed from the drawn dominoes.
  new BlackDot('R1C4', 'R1C5'),
  new BlackDot('R2C4', 'R2C5'),
  new BlackDot('R4C1', 'R4C2'),
  new BlackDot('R2C2', 'R3C2'),
  new BlackDot('R5C3', 'R5C4'),
];
