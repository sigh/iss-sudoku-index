// Title: Pointer Arrow Sudoku
// Author: Piatato
// Video: https://www.youtube.com/watch?v=02hZHNSbzsI
// Source: https://sudokupad.app/f93bjjsyai
//
// Normal sudoku: every row, column, and box holds 1-9 once (default 9x9
// Shape; the payload's 9 regions are the ordinary boxes).
//
// Pointer Arrows (8 of them): digits along an arrow sum to the bulb's digit
// (Arrow). Additionally, the arrow tip's own digit is a distance: counting
// onward from the tip along the heading its final polyline segment already
// travels, the cell that many steps away must hold the bulb's digit
// (ValueIndexing(bulb, tip, ...onwardCells): value-cell bulb holds X;
// control-cell tip's value k selects the k-th listed onward cell, which must
// also hold X). The onward-cell lists below run from the tip's edge of the
// board and stop there, so a tip digit that would point off-board is simply
// outside ValueIndexing's control-cell mask -- no separate bound needed.
// Arm/tip/onward cells transcribed from the puzzle's own drawn arrow/bulb
// geometry (bulb centers and arrow waypoints), each onward list running from
// the tip along its final polyline segment's heading until the board edge.

const arrows = [
  // bulb, arm cells in drawn order (last = tip), onward cells past the tip
  { bulb: 'R4C9', arm: ['R3C9', 'R2C8', 'R2C7', 'R3C6'], onward: ['R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1'] },
  { bulb: 'R3C2', arm: ['R2C3', 'R2C4', 'R3C5'], onward: ['R4C6', 'R5C7', 'R6C8', 'R7C9'] },
  { bulb: 'R4C2', arm: ['R5C1', 'R6C2', 'R5C3', 'R4C4'], onward: ['R3C5', 'R2C6', 'R1C7'] },
  { bulb: 'R2C6', arm: ['R1C5', 'R1C4'], onward: ['R1C3', 'R1C2', 'R1C1'] },
  { bulb: 'R7C4', arm: ['R7C5', 'R6C6'], onward: ['R5C7', 'R4C8', 'R3C9'] },
  { bulb: 'R9C6', arm: ['R8C5', 'R7C6'], onward: ['R6C7', 'R5C8', 'R4C9'] },
  { bulb: 'R8C1', arm: ['R8C2', 'R7C2'], onward: ['R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2'] },
  { bulb: 'R9C9', arm: ['R8C9', 'R7C8'], onward: ['R6C7', 'R5C6', 'R4C5', 'R3C4', 'R2C3', 'R1C2'] },
];

return [
  new Shape('9x9'),

  ...arrows.map(({ bulb, arm }) => new Arrow(bulb, ...arm)),

  ...arrows.map(({ bulb, arm, onward }) =>
    new ValueIndexing(bulb, arm[arm.length - 1], ...onward)),
];
