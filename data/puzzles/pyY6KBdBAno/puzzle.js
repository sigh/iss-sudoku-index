// Title: Aerial View
// Author: Tundra Lava
// Video: https://www.youtube.com/watch?v=pyY6KBdBAno
// Source: https://app.crackingthecryptic.com/sudoku/HmH3fqrPr9

// Standard sudoku rows/columns/boxes (default 3x3 boxes from Shape).
// Arrows: circle-cell digit equals the sum of the rest of the arrow's cells.
// Palindrome lines: read the same in both directions.
// Ratio dots: one cell's value is exactly double (label "2") or triple
// (label "3") the other. Ratio-2 dots use the built-in BlackDot (Kropki
// black dot); ratio-3 dots use a custom Pair since no built-in class
// covers a 1:3 ratio.
// Grey cells: each is larger than every orthogonal neighbour it has. The
// puzzle draws a "greater than" chevron for every orthogonal neighbour of
// each grey cell (verified against the raw waypoint geometry), so this is
// encoded directly with GreaterThan(greyCell, ...allNeighbours).

const ratio3Key = Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, 9);

return [
  new Shape('9x9'),

  // Arrows (circle cell listed first).
  new Arrow('R6C8', 'R5C8', 'R4C8', 'R3C8', 'R3C7', 'R2C7'),
  new Arrow('R4C2', 'R5C2', 'R6C2', 'R7C2', 'R7C3', 'R8C3'),
  new Arrow('R2C2', 'R1C2', 'R1C1', 'R2C1'),
  new Arrow('R9C7', 'R8C8', 'R8C9'),

  // Palindrome lines.
  new Palindrome('R3C1', 'R3C2', 'R3C3', 'R4C4', 'R5C4', 'R6C4'),
  new Palindrome('R4C6', 'R5C6', 'R6C6', 'R7C7', 'R7C8', 'R7C9'),

  // Ratio-2 dots (labelled "2").
  new BlackDot('R3C1', 'R4C1'),
  new BlackDot('R8C9', 'R9C9'),

  // Ratio-3 dots (labelled "3").
  new Pair(ratio3Key, 'ratio 3', 'R9C6', 'R9C7'),
  new Pair(ratio3Key, 'ratio 3', 'R9C5', 'R9C6'),
  new Pair(ratio3Key, 'ratio 3', 'R6C9', 'R7C9'),
  new Pair(ratio3Key, 'ratio 3', 'R1C5', 'R1C6'),
  new Pair(ratio3Key, 'ratio 3', 'R2C4', 'R3C4'),
  new Pair(ratio3Key, 'ratio 3', 'R1C3', 'R2C3'),

  // Grey cells, each greater than all of its orthogonal neighbours.
  new GreaterThan('R1C7', 'R1C6', 'R1C8', 'R2C7'),
  new GreaterThan('R2C5', 'R1C5', 'R3C5', 'R2C4', 'R2C6'),
  new GreaterThan('R8C5', 'R7C5', 'R9C5', 'R8C4', 'R8C6'),
  new GreaterThan('R9C3', 'R8C3', 'R9C2', 'R9C4'),
];
