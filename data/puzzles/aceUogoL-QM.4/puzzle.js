// Title: June 5, 2022: Star Battle
// Author: clover!
// Video: https://www.youtube.com/watch?v=aceUogoL-QM
// Source: https://tinyurl.com/4fhtpvxh

// Rules encoded here, in full:
//  1. Normal sudoku: 1-9 once per row, column and 3x3 box (the default grid).
//  2. 8 and 9 must never touch themselves or each other, even diagonally: no
//     two cells a king's move apart may both hold a value from {8, 9}, in any
//     combination (8-8, 9-9, or 8-9). Enumerated below over every king-move
//     edge of the grid, each edge represented once.

const graph = cellGraph('9x9');

// Reject a king-adjacent pair only when both cells are in {8, 9}; every other
// combination (including one side being 8/9 and the other not) is allowed.
const noHighTouchKey = Pair.fnToKey(
  (a, b) => !((a === 8 || a === 9) && (b === 8 || b === 9)), 9);

// Every king-move edge is covered once by one of these 4 offsets (right,
// down, down-right, down-left); the other 4 king directions are the same
// edges walked from their other endpoint. One Replicate per offset stamps
// the same Pair template over every in-grid origin for that offset.
const KING_TEMPLATE_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const highNoTouch = KING_TEMPLATE_OFFSETS.map(([dr, dc]) => {
  const targets = graph.cells().filter(cell => graph.step(cell, dr, dc) !== null);
  const origin = targets[0];
  const template = graph.step(origin, dr, dc);
  return new Replicate(
    [new Pair(noHighTouchKey, 'high-digit-no-touch', origin, template)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

return [
  new Shape('9x9'),

  // Givens, from the payload grid.
  new Given('R1C1', 3), new Given('R1C4', 1), new Given('R1C6', 2), new Given('R1C9', 5),
  new Given('R2C1', 5), new Given('R2C9', 6),
  new Given('R3C2', 2), new Given('R3C4', 3), new Given('R3C6', 4), new Given('R3C8', 9),
  new Given('R4C4', 5), new Given('R4C6', 6),
  new Given('R6C1', 6), new Given('R6C3', 1), new Given('R6C7', 3), new Given('R6C9', 4),
  new Given('R9C1', 2), new Given('R9C4', 7), new Given('R9C6', 3), new Given('R9C9', 1),

  ...highNoTouch,
];
