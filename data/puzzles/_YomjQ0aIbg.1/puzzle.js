// Title: July 31, 2021: Stroking My Ego
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=_YomjQ0aIbg
// Source: https://tinyurl.com/strokemyego

// Normal sudoku rules apply. Digits along each thermometer must increase
// from the bulb (first cell listed) to the tip (last cell listed).

const thermos = [
  ['R3C4', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R2C5'],
  ['R1C9', 'R2C9', 'R3C9', 'R2C8', 'R1C7', 'R2C7', 'R3C7'],
  ['R4C3', 'R5C3', 'R6C3', 'R5C2', 'R4C1', 'R5C1', 'R6C1'],
  ['R7C6', 'R8C6', 'R9C6', 'R8C5', 'R7C4', 'R8C4', 'R9C4'],
  ['R6C7', 'R5C7', 'R4C7', 'R4C8', 'R4C9', 'R5C9', 'R5C8'],
  ['R9C1', 'R8C1', 'R7C1', 'R7C2', 'R7C3', 'R8C3', 'R8C2'],
];

return [
  new Shape('9x9'),

  new Given('R2C2', 1),
  new Given('R5C5', 2),
  new Given('R7C7', 5),
  new Given('R8C8', 4),
  new Given('R9C9', 3),

  ...thermos.map((cells) => new Thermo(...cells)),
];
