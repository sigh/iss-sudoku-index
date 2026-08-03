// Title: Favor
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=KlH18ihoZlI
// Source: https://tinyurl.com/uzj39kw7

// Normal sudoku rules apply. Digits in grey cells must be greater than
// orthogonally adjacent white (unshaded) cells. Several grey cells are
// orthogonally adjacent to other grey cells; the rule text scopes the
// inequality to white neighbours only, so no ordering is encoded between
// two adjacent grey cells.
//
// Each GreaterThan below groups one grey cell with its white orthogonal
// neighbours only (grey-grey edges are omitted per the rule's wording).
// GreaterThan(a, b, c, ...) enforces a > every later cell in its argument
// list that is grid-adjacent to it, so listing the grey cell first makes
// it the larger side of each pair; the white neighbours are never mutually
// adjacent to each other (they sit on opposite/perpendicular sides of the
// same grey cell), so no relation is created between them.
// Grey cells transcribed from the payload's `maximum` array.

return [
  new Shape('9x9'),

  new Given('R1C3', 8),
  new Given('R1C9', 3),
  new Given('R2C2', 5),
  new Given('R2C6', 4),
  new Given('R3C8', 7),
  new Given('R4C3', 2),
  new Given('R5C1', 6),
  new Given('R5C5', 9),
  new Given('R5C9', 5),
  new Given('R6C7', 3),
  new Given('R7C2', 7),
  new Given('R8C4', 4),
  new Given('R8C8', 5),
  new Given('R9C1', 2),
  new Given('R9C7', 8),

  new GreaterThan('R1C4', 'R1C3', 'R1C5'),
  new GreaterThan('R1C7', 'R2C7', 'R1C6'),
  new GreaterThan('R1C8', 'R1C9'),
  new GreaterThan('R2C3', 'R1C3', 'R2C2'),
  new GreaterThan('R2C4', 'R3C4', 'R2C5'),
  new GreaterThan('R2C8', 'R3C8', 'R2C7'),
  new GreaterThan('R2C9', 'R1C9'),
  new GreaterThan('R3C2', 'R2C2', 'R3C1'),
  new GreaterThan('R3C3', 'R4C3', 'R3C4'),
  new GreaterThan('R3C9', 'R4C9', 'R3C8'),
  new GreaterThan('R4C1', 'R3C1', 'R5C1'),
  new GreaterThan('R4C2', 'R5C2', 'R4C3'),
  new GreaterThan('R6C8', 'R5C8', 'R6C7'),
  new GreaterThan('R6C9', 'R5C9', 'R7C9'),
  new GreaterThan('R7C1', 'R6C1', 'R7C2'),
  new GreaterThan('R7C7', 'R6C7', 'R7C6'),
  new GreaterThan('R7C8', 'R8C8', 'R7C9'),
  new GreaterThan('R8C1', 'R9C1'),
  new GreaterThan('R8C2', 'R7C2', 'R8C3'),
  new GreaterThan('R8C6', 'R7C6', 'R8C5'),
  new GreaterThan('R8C7', 'R9C7', 'R8C8'),
  new GreaterThan('R9C2', 'R9C1'),
  new GreaterThan('R9C3', 'R8C3', 'R9C4'),
  new GreaterThan('R9C6', 'R9C5', 'R9C7'),
];
