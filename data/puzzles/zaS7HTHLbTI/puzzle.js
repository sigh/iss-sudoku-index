// Title: Mountaineering
// Author: 99% Sneaky
// Video: https://www.youtube.com/watch?v=zaS7HTHLbTI
// Source: https://app.crackingthecryptic.com/sudoku/MbhjHdTD4D

// Normal sudoku rules apply (rows, columns, boxes). Digits may not repeat
// along the marked diagonal (Diagonal below). Cells that share the same
// relative position within their 3x3 box may not repeat a digit across
// boxes -- one AllDifferent per of the 9 within-box positions, each
// gathering that position's cell from all 9 boxes (boxPositionGroups
// below). Cages sum to the small clue in their top-left cell (Cage).

// Cages: cells and totals transcribed from the drawn cage outlines/totals.
const cages = [
  [23, 'R2C1', 'R3C1', 'R3C2'],
  [7, 'R5C4', 'R6C4', 'R6C5'],
  [24, 'R8C7', 'R9C7', 'R9C8'],
  [6, 'R4C8', 'R4C9'],
  [10, 'R4C2', 'R4C3'],
  [13, 'R1C8', 'R1C9'],
  [10, 'R1C5', 'R1C6'],
  [15, 'R7C5', 'R7C6'],
  [12, 'R7C2', 'R7C3'],
  [8, 'R8C4', 'R9C4'],
  [9, 'R5C1', 'R6C1'],
  [11, 'R8C1', 'R9C1'],
];

// One AllDifferent per within-box position (top-left, top-mid, ..., bottom-
// right): each group holds that position's cell from all 9 boxes.
const boxPositionGroups = [];
for (let br = 0; br < 3; br++) {
  for (let bc = 0; bc < 3; bc++) {
    const cells = [];
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        cells.push(makeCellId(boxRow * 3 + br + 1, boxCol * 3 + bc + 1));
      }
    }
    boxPositionGroups.push(new AllDifferent(...cells));
  }
}

return [
  new Shape('9x9'),

  new Given('R2C3', 2),
  new Given('R5C6', 6),
  new Given('R8C9', 4),

  // Main diagonal (R1C1-R9C9), drawn corner to corner: direction -1 is '\'.
  new Diagonal(-1),

  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),

  ...boxPositionGroups,
];
