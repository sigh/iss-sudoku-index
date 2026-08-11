// Title: Gossip Circle
// Author: Mormagli
// Video: https://www.youtube.com/watch?v=iu2t0z8wH7I
// Source: https://app.crackingthecryptic.com/sudoku/t378bRqqgR

// Normal sudoku rules apply (default Shape('9x9') row/column/box
// all-different). Digits joined by a green line must differ by at
// least 5: Whisper(5, ...) per drawn line, cells listed in path order.
// A closed loop repeats its first cell at the end so the wrap-around
// edge is bound too; an open path is left un-repeated so the edge it
// does not draw is left unconstrained. Digits separated by a drawn 'V'
// mark sum to 5: V(a, b) per mark. The rules state not all Vs are
// given, so unmarked adjacent pairs get no constraint either way.

const whispers = [
  // rows 2-3 cols 2-3, closed loop (all four edges of the block)
  new Whisper(5, 'R2C2', 'R2C3', 'R3C3', 'R3C2', 'R2C2'),
  // rows 2-3 cols 5-6, closed loop
  new Whisper(5, 'R2C5', 'R2C6', 'R3C6', 'R3C5', 'R2C5'),
  // rows 2-3 cols 8-9, open path (R3C9-R2C9 edge not drawn)
  new Whisper(5, 'R2C9', 'R2C8', 'R3C8', 'R3C9'),
  // rows 5-6 cols 8-9, open path (R6C9 not on the path)
  new Whisper(5, 'R5C9', 'R5C8', 'R6C8'),
  // rows 5-6 cols 5-6, closed loop
  new Whisper(5, 'R5C6', 'R6C6', 'R6C5', 'R5C5', 'R5C6'),
  // rows 5-6 cols 2-3, closed loop
  new Whisper(5, 'R5C3', 'R5C2', 'R6C2', 'R6C3', 'R5C3'),
  // rows 8-9 cols 2-3, open path (R9C3-R9C2 edge not drawn)
  new Whisper(5, 'R9C2', 'R8C2', 'R8C3', 'R9C3'),
  // rows 8-9 cols 5-6, open path (R9C6 not on the path)
  new Whisper(5, 'R8C6', 'R8C5', 'R9C5'),
];

const vs = [
  new V('R1C3', 'R1C4'),
  new V('R3C7', 'R4C7'),
  new V('R8C9', 'R9C9'),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...vs,
];
