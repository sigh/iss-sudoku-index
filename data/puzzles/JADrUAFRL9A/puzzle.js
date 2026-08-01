// Title: Teenage Love
// Author: Blobz
// Video: https://www.youtube.com/watch?v=JADrUAFRL9A
// Source: https://app.crackingthecryptic.com/f92ld5yxt0

// Standard Sudoku with the four given digits. Adjacent digits on each pink line
// are distinct and sum to 13 or 14. Each outlined cage is distinct and totals
// either 13 or 14. The arrow's circle equals its arm sum; arm digits may repeat.
const pairSumKey = Pair.fnToKey((a, b) => a !== b && (a + b === 13 || a + b === 14), 9);

// Pink line paths transcribed from the drawn lines.
const lines = [
  ['R9C5', 'R8C4', 'R7C3', 'R6C2', 'R5C1', 'R4C1', 'R3C2'],
  ['R3C2', 'R2C3', 'R2C4', 'R3C5', 'R2C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R4C9', 'R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
];

// Outlined cage cell sets transcribed from the source.
const cages = [
  ['R1C1', 'R2C1', 'R2C2', 'R3C1'], ['R1C3', 'R1C4'], ['R1C5', 'R1C6'], ['R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7'], ['R4C8', 'R5C8'], ['R6C9', 'R7C8', 'R7C9'], ['R8C9', 'R9C8', 'R9C9'],
  ['R9C6', 'R9C7'], ['R7C5', 'R8C5'], ['R8C3', 'R9C2', 'R9C3'], ['R8C1', 'R9C1'], ['R7C1', 'R7C2', 'R8C2'],
  ['R6C5', 'R6C6'], ['R5C4', 'R6C4'], ['R4C5', 'R4C6', 'R5C5', 'R5C6'], ['R4C2', 'R5C2'],
];

return [
  new Shape('9x9'),
  new Given('R4C3', 1), new Given('R4C4', 4), new Given('R8C7', 1), new Given('R8C8', 3),
  ...lines.map(cells => new Pair(pairSumKey, 'sum 13 or 14', ...cells)),
  ...cages.map(cells => new Or([new Cage(13, ...cells), new Cage(14, ...cells)])),
  new Arrow('R3C9', 'R4C8', 'R4C7', 'R5C6'),
];
