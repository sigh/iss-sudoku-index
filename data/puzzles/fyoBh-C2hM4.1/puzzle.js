// Title: January 23, 2022: Eternity
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=fyoBh-C2hM4
// Source: https://tinyurl.com/4xdm6b2a

// Normal sudoku rules apply (standard 3x3 boxes) -- Shape('9x9') supplies
// rows/columns/boxes. Purple lines: digits form a non-repeating consecutive
// set, any order -> Renban(...cells). No other clue types (cages, arrows,
// quads) appear in the payload.

const givens = [
  new Given('R1C3', 8),
  new Given('R1C7', 4),
  new Given('R2C5', 4),
  new Given('R2C9', 3),
  new Given('R3C1', 4),
  new Given('R4C6', 5),
  new Given('R5C2', 4),
  new Given('R5C5', 9),
  new Given('R5C8', 6),
  new Given('R6C4', 2),
  new Given('R7C9', 6),
  new Given('R8C1', 7),
  new Given('R8C5', 6),
  new Given('R9C3', 6),
  new Given('R9C7', 2),
];

// Renban lines, as drawn (purple #CDB7F6, matching the rules text).
const renbanLines = [
  new Renban('R2C3', 'R2C4', 'R1C4', 'R1C5', 'R1C6'),
  new Renban('R1C7', 'R2C7', 'R2C8'),
  new Renban('R3C8', 'R4C8', 'R4C9', 'R5C9', 'R6C9'),
  new Renban('R7C9', 'R7C8', 'R7C7'),
  new Renban('R8C7', 'R8C6', 'R9C6', 'R9C5', 'R9C4'),
  new Renban('R9C3', 'R8C3', 'R8C2'),
  new Renban('R7C2', 'R6C2', 'R6C1', 'R5C1', 'R4C1'),
  new Renban('R3C1', 'R3C2', 'R3C3'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...renbanLines,
];
