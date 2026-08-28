// Title: Nov. 11, 2021: Out With A Foot
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=urhFM_KWTg0
// Source: https://tinyurl.com/38xwp4w3

// Normal sudoku rules apply. Along green lines, neighboring digits must
// differ by at least 5. Each Whisper below is one drawn line segment (the
// green lines form a branching shape, several segments sharing an endpoint
// cell with another); Whisper enforces the difference on every consecutive
// pair within its own cell list, so the shared-endpoint edges are all still
// covered once per segment.
const whispers = [
  ['R3C4', 'R3C5', 'R4C5', 'R5C5'],
  ['R3C5', 'R3C6', 'R4C6', 'R5C6'],
  ['R4C6', 'R4C7'],
  ['R4C7', 'R5C7'],
  ['R4C7', 'R4C8', 'R5C8'],
  ['R4C2', 'R3C2', 'R2C2', 'R2C3', 'R2C4', 'R3C4'],
  ['R3C4', 'R4C4'],
  ['R4C2', 'R5C2'],
  ['R5C2', 'R6C2'],
  ['R6C2', 'R7C3'],
  ['R7C3', 'R8C3', 'R9C3'],
  ['R5C8', 'R6C8', 'R7C7', 'R8C7'],
  ['R8C7', 'R9C7'],
  ['R6C3', 'R5C4'],
  ['R5C3', 'R6C4'],
].map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C4', 5),
  new Given('R1C7', 7),
  new Given('R4C1', 2),
  new Given('R4C4', 6),
  new Given('R4C7', 3),
  new Given('R7C1', 8),
  new Given('R7C4', 9),
  new Given('R7C8', 4),

  ...whispers,
];
