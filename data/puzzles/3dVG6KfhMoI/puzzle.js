// Title: Little Killer Arrow Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=3dVG6KfhMoI
// Source: https://app.crackingthecryptic.com/sudoku/dt3bPmdffN

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). The digits on an arrow add up
// to the digit in the corresponding circle. A clue outside the grid gives
// the sum of the digits along the indicated diagonal; digits may repeat on
// that diagonal (LittleKiller's own semantics -- no extra all-different is
// imposed beyond what row/column/box already force on any stretch of the
// diagonal that shares one). No given digits.

const geometry = cellGeometry(9);

// Nine arrows, bulb cell first then arm cells (sum of arm = bulb digit).
// Cell lists transcribed from the payload's arrow waypoints (grey arrows,
// color #CFCFCF), each hand-verified against the raw [row,col] coordinates.
const arrows = [
  ['R1C2', 'R2C1', 'R3C1'],
  ['R1C3', 'R2C4', 'R3C4'],
  ['R1C7', 'R2C6'],
  ['R1C8', 'R2C9', 'R3C9'],
  ['R7C8', 'R6C9', 'R5C9'],
  ['R9C8', 'R8C9', 'R7C9'],
  ['R9C7', 'R8C6', 'R7C5'],
  ['R9C3', 'R8C4'],
  ['R9C2', 'R8C1', 'R7C1'],
].map(cells => new Arrow(...cells));

// Seven outside diagonal-sum (Little Killer) clues, black off-grid arrows
// (color #000000). Each cell list runs from the grid-edge cell the arrow
// enters to the opposite edge, transcribed from the payload's arrow
// waypoints and direction; LittleKiller.fromCells derives the canonical
// corner from the explicit cell list rather than guessing it from the badge
// position.
const littleKillers = [
  [21, ['R1C6', 'R2C7', 'R3C8', 'R4C9']],
  [10, ['R1C8', 'R2C9']],
  [13, ['R9C3', 'R8C2', 'R7C1']],
  [18, ['R9C4', 'R8C3', 'R7C2', 'R6C1']],
  [30, ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6']],
  [15, ['R3C1', 'R2C2', 'R1C3']],
  [29, ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...arrows,
  ...littleKillers,
];
