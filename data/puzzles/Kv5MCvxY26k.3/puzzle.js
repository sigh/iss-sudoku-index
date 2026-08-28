// Title: Purple Haze
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Kv5MCvxY26k
// Source: https://tinyurl.com/57pnyyhm

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's regions).
// Each purple line must contain a non-repeating set of consecutive digits, in
// any order: Renban. Twelve lines are drawn, all the same colour, each a
// 3- or 4-cell open path (payload `line` array).

const purpleLines = [
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R4C7', 'R3C7', 'R3C6'],
  ['R4C3', 'R4C4', 'R3C4'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  ['R7C3', 'R6C3', 'R6C4'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R7C6', 'R6C6', 'R6C7'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
];

return [
  new Shape('9x9'),

  new Given('R1C4', 1), new Given('R1C6', 2),
  new Given('R2C2', 5), new Given('R2C8', 7),
  new Given('R4C1', 3), new Given('R4C9', 4),
  new Given('R5C5', 9),
  new Given('R6C1', 5), new Given('R6C9', 6),
  new Given('R8C2', 3), new Given('R8C8', 5),
  new Given('R9C4', 7), new Given('R9C6', 8),

  ...purpleLines.map((cells) => new Renban(...cells)),
];
