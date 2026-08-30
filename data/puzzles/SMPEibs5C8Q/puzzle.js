// Title: Odd Sudoku
// Author: Rishi Puri
// Video: https://www.youtube.com/watch?v=SMPEibs5C8Q
// Source: https://cracking-the-cryptic.web.app/sudoku/BDLMh4HTqr
//
// The source publishes no rules text; the video description names the
// puzzle "Rishi Puri's Odd Sudoku" (matching this source URL) and states
// no further rules. Normal sudoku (default rows/cols/boxes) plus the 24
// grey-circle cells, each restricted to an odd digit via a multi-value
// Given ({1,3,5,7,9}) -- the classic grey-circle parity marker; only
// circles are drawn (no grey squares), so the mark shape alone fixes
// parity as odd (grey circles: R1C3, R1C6, R1C9, R2C4, R2C7, R3C1, R3C5,
// R3C8, R4C2, R4C6, R4C9, R5C3, R5C7, R6C1, R6C4, R6C8, R7C2, R7C5, R7C9,
// R8C3, R8C6, R9C1, R9C4, R9C7 -- from the raw payload's underlays).

const oddCells = [
  'R1C3', 'R1C6', 'R1C9',
  'R2C4', 'R2C7',
  'R3C1', 'R3C5', 'R3C8',
  'R4C2', 'R4C6', 'R4C9',
  'R5C3', 'R5C7',
  'R6C1', 'R6C4', 'R6C8',
  'R7C2', 'R7C5', 'R7C9',
  'R8C3', 'R8C6',
  'R9C1', 'R9C4', 'R9C7',
];

const oddGivens = oddCells.map(c => new Given(c, 1, 3, 5, 7, 9));

return [
  new Shape('9x9'),

  new Given('R2C2', 7),
  new Given('R2C5', 4),
  new Given('R2C8', 6),
  new Given('R3C3', 5),
  new Given('R3C7', 2),
  new Given('R4C1', 1),
  new Given('R4C4', 7),
  new Given('R5C2', 9),
  new Given('R5C8', 3),
  new Given('R6C6', 3),
  new Given('R6C9', 2),
  new Given('R7C3', 4),
  new Given('R7C7', 3),
  new Given('R8C2', 8),
  new Given('R8C5', 6),
  new Given('R8C8', 9),

  ...oddGivens,
];
