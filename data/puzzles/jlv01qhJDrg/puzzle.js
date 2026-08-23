// Title: Horseshoes and Handgrenades
// Author: Memeristor
// Video: https://www.youtube.com/watch?v=jlv01qhJDrg
// Source: https://app.crackingthecryptic.com/sudoku/GPf6JTG4G6

// Normal sudoku rules apply (standard 3x3 boxes, default). Along purple
// lines, digits form a consecutive, non-repeating set in any order (Renban).
// Along thermometers, digits increase from the bulb (Thermo). Cells joined
// by an X sum to 10 (X); the rules state not every X is marked, so unmarked
// adjacent pairs are left unconstrained.

const renbanLines = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R2C4', 'R2C5', 'R3C4', 'R3C5'],
  ['R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
  ['R7C5', 'R7C6', 'R8C5', 'R8C6'],
  ['R4C7', 'R4C8', 'R5C7', 'R5C8'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R6C8', 'R6C9'],
  ['R4C9', 'R5C9'],
  ['R3C2', 'R4C2'],
  ['R6C1', 'R7C1'],
  ['R5C6', 'R6C5'],
];

// Thermometers: bulb cell listed first (bulb marked by a filled circle
// underlay in the source at R2C3 and R9C5).
const thermos = [
  ['R2C3', 'R1C4', 'R1C5'],
  ['R9C5', 'R9C6', 'R8C7'],
];

const xPairs = [
  ['R1C6', 'R2C6'],
  ['R1C3', 'R2C3'],
  ['R4C3', 'R4C4'],
  ['R6C4', 'R7C4'],
  ['R7C1', 'R7C2'],
  ['R8C4', 'R9C4'],
  ['R8C7', 'R9C7'],
  ['R6C6', 'R6C7'],
  ['R3C6', 'R4C6'],
  ['R3C8', 'R3C9'],
];

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...xPairs.map(cells => new X(...cells)),
];
