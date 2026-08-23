// Title: Sep 10, 2021: Odd-Even-Big-Small Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=RdXoLFAwWMY
// Source: https://app.crackingthecryptic.com/sudoku/LLFnFB9TNG
//
// Normal 8x8 sudoku: rows, columns, and boxes contain 1-8 once each. An 8x8
// Shape's default box tiling is 2 rows x 4 cols, matching the payload's
// regions, so no explicit region constraint is needed.
//
// Twelve outside-grid bilingual text symbols each name a category -- odd
// (1,3,5,7), even (2,4,6,8), big (5,6,7,8), small (1,2,3,4) -- and the rule
// states the first two digits seen in that row/column (from the symbol's
// side, reading inward) both belong to the named category. Each of the two
// named cells gets its own digit-set restriction (each lane names two cells:
// the two nearest the symbol's side, reading into the grid).

const oddCells = ['R1C1', 'R2C1', 'R8C8', 'R8C7'];
const evenCells = ['R1C7', 'R2C7', 'R1C8', 'R3C8', 'R3C7', 'R8C1', 'R7C1'];
const bigCells = ['R1C8', 'R2C8', 'R8C2', 'R7C2', 'R6C1', 'R6C2', 'R8C1'];
const smallCells = ['R8C8', 'R7C8', 'R1C1', 'R1C2'];

return [
  new Shape('8x8'),

  new Given('R1C3', 1),
  new Given('R1C6', 4),
  new Given('R3C1', 5),
  new Given('R3C8', 8),
  new Given('R4C2', 8),
  new Given('R4C5', 6),
  new Given('R5C4', 8),
  new Given('R5C7', 7),
  new Given('R6C1', 6),
  new Given('R6C8', 2),
  new Given('R8C3', 7),
  new Given('R8C6', 3),

  // Odd-category cells: top C1 (R1C1,R2C1), right R8 (R8C8,R8C7).
  ...oddCells.map((c) => new Given(c, 1, 3, 5, 7)),
  // Even-category cells: top C7 (R1C7,R2C7), right R1 (R1C8,R1C7),
  // right R3 (R3C8,R3C7), bottom C1 (R8C1,R7C1).
  ...evenCells.map((c) => new Given(c, 2, 4, 6, 8)),
  // Big-category cells: top C8 (R1C8,R2C8), bottom C2 (R8C2,R7C2),
  // left R6 (R6C1,R6C2), left R8 (R8C1,R8C2).
  ...bigCells.map((c) => new Given(c, 5, 6, 7, 8)),
  // Small-category cells: bottom C8 (R8C8,R7C8), left R1 (R1C1,R1C2).
  ...smallCells.map((c) => new Given(c, 1, 2, 3, 4)),
];
