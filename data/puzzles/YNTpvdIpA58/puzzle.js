// Title: Caves can hide secrets
// Author: cornishjohn
// Video: https://www.youtube.com/watch?v=YNTpvdIpA58
// Source: https://sudokupad.app/f75ku3v4p7

// Normal sudoku rules apply (default row/column/box all-different).

// Arrows: digits along an arrow sum to the digit in that arrow's circle
// (bulb cell first, then the arm cells in order).
return [
  new Shape('9x9'),

  new Arrow('R1C7', 'R2C7', 'R2C6', 'R2C5'),
  new Arrow('R2C3', 'R2C4', 'R3C5', 'R3C6'),
  new Arrow('R3C4', 'R4C4', 'R4C3', 'R4C2', 'R5C2'),
  new Arrow('R4C5', 'R4C6', 'R3C7'),
  new Arrow('R4C9', 'R3C9', 'R2C9', 'R1C9'),
  new Arrow('R7C8', 'R6C7'),
  new Arrow('R9C8', 'R9C7', 'R8C6'),
  new Arrow('R6C5', 'R7C5', 'R7C4'),
  new Arrow('R5C3', 'R6C2', 'R7C1', 'R8C1'),
  new Arrow('R4C8', 'R5C7', 'R6C6'),

  // Cave/shading rule omitted in full. ISS's connectivity
  // primitive (ConnectedValues) only proves a single named region; the
  // rule's load-bearing clause ("each unshaded connected group contains
  // digits 1..N where N is the group's size, and every group touches the
  // grid border") is a per-component size/distinctness predicate over an
  // unknown, multi-component partition, which is not expressible. Adding
  // only the "shaded cells form one connected area, circles unshaded"
  // fragment on an unlinked auxiliary Var layer would not constrain any
  // grid digit and would only inflate the search with many
  // shading-only alternate "solutions", so it is left out entirely
  // rather than shipped as a shell.

];
