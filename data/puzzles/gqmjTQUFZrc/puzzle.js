// Title: Quadrants
// Author: ZeroUltra
// Video: https://www.youtube.com/watch?v=gqmjTQUFZrc
// Source: https://app.crackingthecryptic.com/sudoku/qd8Bg6QqQP

// Normal sudoku (standard 3x3 boxes). Digits on an arrow sum to the digit in
// its attached (white) circle. A filled grey circle contains an odd digit --
// encoded as a candidate-restricted Given per iss-constraints catalog (there
// is no Odd/Even class).
//
// Arrow cell lists are bulb cell first, then arm cells, transcribed from the
// drawn arrow paths (bulb circle, then the kinked line's cell-by-cell run).

const arrows = [
  ['R8C8', 'R8C7', 'R7C6'],
  ['R9C8', 'R9C7', 'R9C6'],
  ['R5C8', 'R4C8', 'R5C7', 'R5C6'],
  ['R5C9', 'R4C9', 'R3C9'],
  ['R8C9', 'R7C9', 'R6C9', 'R6C8', 'R7C8', 'R7C7'],
  ['R2C7', 'R3C8', 'R4C7'],
  ['R6C7', 'R6C6', 'R5C5'],
  ['R1C9', 'R1C8', 'R1C7'],
  ['R3C7', 'R2C8', 'R2C9'],
  ['R2C6', 'R1C6', 'R1C5', 'R1C4'],
  ['R1C2', 'R1C3', 'R2C3'],
  ['R2C4', 'R2C3', 'R2C2', 'R2C1'],
  ['R3C3', 'R4C4', 'R5C4'],
  ['R4C5', 'R3C6'],
  ['R7C1', 'R6C1', 'R6C2'],
  ['R3C2', 'R3C1', 'R4C1'],
];

return [
  new Shape('9x9'),
  ...arrows.map((cells) => new Arrow(...cells)),
  // Filled grey circle (underlays[0], R9C9): odd digit.
  new Given('R9C9', 1, 3, 5, 7, 9),
];
