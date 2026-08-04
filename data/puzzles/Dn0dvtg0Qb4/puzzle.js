// Title: Converging Paths
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=Dn0dvtg0Qb4
// Source: https://app.crackingthecryptic.com/sudoku/Lj72FhPr9B
//
// Normal sudoku rules apply (standard 3x3 boxes).
// Digits along an arrow sum to the digit in its circle -> one Arrow(circle,
// ...arm) per arrow. Each purple line holds a non-repeating set of
// consecutive digits, any order -> Renban(...cells).
//
// Arrow and purple-line cells were read off the drawn geometry (bulb/shaft
// and line waypoints).
const arrows = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4'],
  ['R7C2', 'R7C3', 'R7C4', 'R7C5'],
  ['R2C9', 'R2C8', 'R3C8', 'R3C7'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8'],
];

const renbans = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R4C2', 'R4C1', 'R5C1', 'R6C1'],
  ['R7C3', 'R7C2', 'R8C2', 'R8C1'],
  ['R8C6', 'R8C7'],
  ['R8C8', 'R8C9'],
  ['R6C7', 'R6C6', 'R5C6', 'R5C5'],
  ['R4C5', 'R3C5'],
];

return [
  new Shape('9x9'),
  new Given('R2C5', 6),
  new Given('R8C4', 7),
  ...arrows.map(cells => new Arrow(...cells)),
  ...renbans.map(cells => new Renban(...cells)),
];
