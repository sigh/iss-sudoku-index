// Title: Its a secret
// Author: Jaxar
// Video: https://www.youtube.com/watch?v=zkz5Qw2BWx4
// Source: https://sudokupad.app/3dtkgwg47h

// Normal 9x9 Sudoku. Every drawn line is a region sum line; the three paths
// also drawn orange are Dutch whispers with consecutive cells differing by 4+.
// Cage tables are transcribed from the outlined cage totals.
const cages = [
  [9, 'R2C3', 'R2C4', 'R2C5'],
  [9, 'R8C2', 'R8C3', 'R8C4'],
  [8, 'R5C7', 'R5C8', 'R6C7'],
  [10, 'R9C1', 'R9C2', 'R9C3', 'R9C4'],
  [7, 'R6C8', 'R7C8'],
  [27, 'R2C6', 'R2C7', 'R3C6', 'R3C7'],
  [13, 'R3C1', 'R4C1', 'R4C2'],
];

const regionSumLines = [
  ['R9C8', 'R9C7', 'R8C6', 'R7C5', 'R6C5', 'R5C6'],
  ['R6C1', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4', 'R9C5', 'R9C6'],
  ['R8C9', 'R8C8', 'R7C8', 'R6C8', 'R5C9', 'R4C8', 'R3C9', 'R2C8', 'R1C7'],
  ['R3C3', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C4', 'R4C5', 'R5C4', 'R6C4'],
];

// Orange paths, transcribed in their drawn waypoint order (including diagonals).
const orangeLines = regionSumLines.slice(1);

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...orangeLines.map(cells => new Whisper(4, ...cells)),
];
