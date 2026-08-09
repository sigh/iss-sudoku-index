// Title: The Wings Of Pentagon
// Author: Niverio
// Video: https://www.youtube.com/watch?v=oLaXCAeinzA
// Source: https://app.crackingthecryptic.com/sudoku/9mgQ9LgnDj

// Normal sudoku rules (default rows/cols/boxes). Killer cages: digits sum to
// the cage total and cannot repeat within a cage.

// Cage totals and cells transcribed from the drawn `cages` array.
const cages = [
  [13, 'R3C1', 'R2C1'],
  [15, 'R1C2', 'R2C2', 'R3C2'],
  [23, 'R3C3', 'R2C3', 'R1C3', 'R1C4'],
  [12, 'R1C6', 'R1C7', 'R1C8'],
  [15, 'R2C7', 'R2C8', 'R2C9'],
  [11, 'R3C7', 'R3C8', 'R3C9'],
  [16, 'R5C7', 'R6C7', 'R6C6'],
  [15, 'R5C3', 'R6C3', 'R6C4'],
  [8, 'R6C5', 'R7C5'],
  [19, 'R7C1', 'R8C1', 'R8C2'],
  [30, 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C4'],
  [20, 'R9C6', 'R9C7', 'R8C7', 'R7C7', 'R7C8'],
  [14, 'R8C8', 'R8C9', 'R7C9'],
];

return [
  new Shape('9x9'),
  new Given('R2C5', 6),
  new Given('R5C1', 4),
  new Given('R5C9', 2),
  new Given('R9C2', 1),
  new Given('R9C8', 6),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
