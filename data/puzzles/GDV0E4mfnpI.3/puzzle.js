// Title: Come on and Sum
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=GDV0E4mfnpI
// Source: https://tinyurl.com/2f9hee3b

// Normal sudoku rules apply (rows, columns, boxes each 1-9 once).
// Rule: "A dot means the one of the connected digits is the sum of the
// other three. Not all dots are given." Each dot sits at a corner shared by
// four cells; for a marked quad, one of its four digits equals the sum of
// the other three. Undrawn corners carry no rule.

// Dot-marked quads: the drawn dots each sit at a corner shared by four
// cells, listed here as one canonical cell set per corner.
const dotQuads = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R3C5', 'R3C6', 'R4C5', 'R4C6'],
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
  ['R3C7', 'R3C8', 'R4C7', 'R4C8'],
  ['R3C8', 'R3C9', 'R4C8', 'R4C9'],
  ['R6C1', 'R6C2', 'R7C1', 'R7C2'],
  ['R6C2', 'R6C3', 'R7C2', 'R7C3'],
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R6C4', 'R6C5', 'R7C4', 'R7C5'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
];

// One of the four cells equals the sum of the other three: try each cell as
// the lone segment against the other three as the second segment, and take
// any one candidate whose two segment sums agree.
const dotConstraints = dotQuads.map(cells => new Or(
  cells.map((target, i) => new EqualSum(
    [target], cells.filter((_, j) => j !== i)
  ))
));

return [
  new Shape('9x9'),
  new Given('R1C8', 4),
  new Given('R3C4', 7),
  new Given('R3C6', 4),
  new Given('R3C8', 2),
  new Given('R4C5', 2),
  new Given('R4C7', 4),
  new Given('R4C9', 8),
  new Given('R5C5', 7),
  new Given('R6C1', 1),
  new Given('R6C3', 8),
  new Given('R6C5', 9),
  new Given('R7C2', 1),
  new Given('R7C4', 2),
  new Given('R7C6', 7),
  new Given('R9C2', 7),
  ...dotConstraints,
];
