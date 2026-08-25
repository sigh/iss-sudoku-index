// Title: Paintball Battle
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=11pjL7saUno
// Source: https://app.crackingthecryptic.com/sudoku/bJBBGfdLtf

// Normal sudoku rules apply (default 3x3 boxes, no givens). Cages sum to the
// printed total with no repeated digit inside the cage. A black dot between
// two cells means one digit is exactly double the other (ratio 1:2). The
// rules state not every 1:2-ratio pair in the grid is dotted, so only the
// four drawn dots are constrained; no negative/exhaustiveness rule is added.

// Cages, transcribed from the source puzzle's cage layout.
const cages = [
  new Cage(11, 'R6C1', 'R7C1', 'R8C1'),
  new Cage(10, 'R6C2', 'R7C2'),
  new Cage(10, 'R8C2', 'R9C1', 'R9C2'),
  new Cage(10, 'R5C3', 'R5C4'),
  new Cage(10, 'R4C4', 'R4C5'),
  new Cage(13, 'R2C3', 'R3C3', 'R4C3'),
  new Cage(8, 'R2C4', 'R3C4'),
  new Cage(12, 'R2C5', 'R3C5'),
  new Cage(10, 'R2C6', 'R3C6'),
  new Cage(16, 'R3C7', 'R3C8', 'R3C9'),
  new Cage(14, 'R5C8', 'R5C9'),
  new Cage(18, 'R7C4', 'R8C4', 'R8C5'),
  new Cage(16, 'R8C7', 'R8C8', 'R9C7', 'R9C8'),
];

// Black (ratio 1:2) dots, transcribed from the source puzzle's dot overlays.
const blackDots = [
  new BlackDot('R1C7', 'R1C8'),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R6C7', 'R6C8'),
  new BlackDot('R6C8', 'R6C9'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...blackDots,
];
