// Title: 2/25/23: Don't Nock It
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ZJvrVG4XJn4
// Source: https://tinyurl.com/26cd5u3t

// Normal sudoku rules apply. Twelve arrows: the digit in the circled cell
// equals the sum of the digits along the arm; digits may repeat along an
// arm (ruleset text). Ten of the twelve circles are themselves givens, so
// those arrows fix the sum of their (two-cell) arms directly.
// Arrow cells are transcribed from the payload's arrow.lines entries, each
// already ordered circle-cell first followed by the arm cells in path order.

return [
  new Shape('9x9'),

  new Given('R1C6', 9),
  new Given('R2C6', 4),
  new Given('R3C6', 7),
  new Given('R4C2', 2),
  new Given('R4C3', 5),
  new Given('R6C7', 8),
  new Given('R6C8', 6),
  new Given('R7C4', 9),
  new Given('R8C4', 3),
  new Given('R9C4', 7),

  new Arrow('R4C2', 'R3C3', 'R2C4'),
  new Arrow('R2C6', 'R3C7', 'R4C8'),
  new Arrow('R6C8', 'R7C7', 'R8C6'),
  new Arrow('R4C3', 'R3C4', 'R2C5'),
  new Arrow('R3C6', 'R4C7', 'R5C8'),
  new Arrow('R6C7', 'R7C6', 'R8C5'),
  new Arrow('R7C4', 'R6C3', 'R5C2'),
  new Arrow('R8C4', 'R7C3', 'R6C2'),
  new Arrow('R1C6', 'R2C7', 'R3C8'),
  new Arrow('R9C4', 'R8C3', 'R7C2'),
  new Arrow('R4C1', 'R3C2'),
  new Arrow('R6C9', 'R7C8'),
];
