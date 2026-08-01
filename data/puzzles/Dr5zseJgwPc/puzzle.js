// Title: Egg's 2nd Rodeo
// Author: EggFriedCheese
// Video: https://www.youtube.com/watch?v=Dr5zseJgwPc
// Source: https://app.crackingthecryptic.com/BLQgQpFHNJ

// Normal sudoku. Killer cages have distinct digits summing to their displayed total;
// grey thermometers strictly increase from their circular bulbs.
const cages = [
  // Cages transcribed from the seven dashed cage outlines and their totals.
  [21, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  [16, 'R7C9', 'R8C9', 'R9C9'],
  [18, 'R1C1', 'R2C1', 'R3C1'],
  [19, 'R1C4', 'R1C5', 'R1C6'],
  [20, 'R9C4', 'R9C5', 'R9C6'],
  [16, 'R4C9', 'R5C8', 'R5C9'],
  [11, 'R5C1', 'R5C2', 'R6C1'],
];

const thermos = [
  // Paths transcribed bulb-to-tip from the four grey lines and circles.
  ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R6C4'],
  ['R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R4C6'],
  ['R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1', 'R7C1'],
  ['R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9', 'R3C9'],
];

return [
  new Shape('9x9'),
  new Given('R5C5', 2),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...thermos.map((cells) => new Thermo(...cells)),
];
