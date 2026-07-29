// Title: Murder on the Zipline Express
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=zQIpm_oFY0E
// Source: https://app.crackingthecryptic.com/4qt4n1bnz3

// Standard Sudoku rules apply. Killer-cage digits do not repeat and sum to
// the printed total. On each zipper line, symmetric pairs have the same sum,
// equal to the central digit because every drawn line has odd length.

const cages = [
  [12, 'R1C1', 'R1C2', 'R2C1'],
  [18, 'R1C8', 'R1C9', 'R2C9'],
  [14, 'R8C1', 'R9C1', 'R9C2'],
  [16, 'R8C9', 'R9C8', 'R9C9'],
  [18, 'R2C3', 'R3C2', 'R3C3'],
  [15, 'R2C7', 'R3C7', 'R3C8'],
  [16, 'R7C2', 'R7C3', 'R8C3'],
  [12, 'R7C7', 'R7C8', 'R8C7'],
  [10, 'R3C4', 'R4C3', 'R4C4'],
  [12, 'R4C5', 'R5C5', 'R6C5'],
  [12, 'R1C5', 'R2C5'],
  [5, 'R8C5', 'R9C5'],
  [7, 'R5C1', 'R5C2'],
  [10, 'R5C8', 'R5C9'],
  [12, 'R6C3', 'R6C4', 'R7C4'],
  [14, 'R6C6', 'R6C7', 'R7C6'],
  [14, 'R3C6', 'R4C6', 'R4C7'],
];

const zippers = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R6C3', 'R7C3', 'R7C4'],
  ['R7C6', 'R7C7', 'R6C7'],
  ['R4C7', 'R3C7', 'R3C6'],
  ['R3C4', 'R3C3', 'R4C3'],
];

return [
  new Shape('9x9'),
  // Cage cells and totals transcribed from the source outlines and labels.
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  // Ordered cell paths transcribed from the eight source zipper lines.
  ...zippers.map(cells => new Zipper(...cells)),
];
