// Title: The Unexpected Ones
// Author: gdc
// Video: https://www.youtube.com/watch?v=P0Ma52D_p-I
// Source: https://app.crackingthecryptic.com/sudoku/Nd8d86DJLF

// Rules: Normal sudoku rules apply. Digits along an arrow sum to the digit in
// that arrow's circle. A purple Renban line contains a set of consecutive
// digits in any order.
// No givens. Regions are the standard nine 3x3 boxes (drawn `regions` match).
// One circle (R7C7) anchors two separate arrows, drawn as two payload
// entries; each arm sums to it independently.

return [
  new Shape('9x9'),

  // Arrows: Arrow(circle, ...armCells). Circle cell first, per class docs.
  // R7C7's circle is shared by two independent arrows (raw arrows #0/#1).
  new Arrow('R7C7', 'R8C6', 'R8C5'),
  new Arrow('R7C7', 'R7C8', 'R6C7', 'R5C6'),
  new Arrow('R7C3', 'R7C2', 'R6C3', 'R5C4'),
  new Arrow('R2C5', 'R2C4', 'R3C3', 'R4C2'),
  new Arrow('R3C5', 'R4C6', 'R3C7', 'R2C7'),

  // Purple Renban lines (raw `lines`, colour #D23BE7): each line's digits
  // form a consecutive, non-repeating set in any order.
  new Renban('R8C1', 'R8C2', 'R8C3', 'R9C4', 'R9C5', 'R9C6'),
  new Renban('R8C4', 'R7C5'),
  new Renban('R5C7', 'R4C7', 'R5C8', 'R4C8', 'R4C9'),
  new Renban('R5C1', 'R6C2', 'R5C2', 'R5C3'),
  new Renban('R3C4', 'R4C4', 'R5C5'),
  new Renban('R8C8', 'R9C9', 'R8C9'),
  new Renban('R1C6', 'R2C6', 'R1C7'),
  new Renban('R3C1', 'R3C2', 'R2C1', 'R1C2'),
];
