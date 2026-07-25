// Title: Whizzpers
// Author: aprice194
// Video: https://www.youtube.com/watch?v=3-Vjv_iJc0M
// Source: https://sudokupad.app/b8jgau28rd

// Normal sudoku rules apply. Adjacent digits on a green line must differ by
// at least 5 (German whisper lines). Digits in a cage sum to the value
// shown in its top left corner.
//
// The green lines are encoded as Whisper, one per drawn stroke; a couple of
// lines (e.g. the third one below) bend diagonally between cells rather than
// running edge-to-edge, but "adjacent" in the rule means consecutive along
// the drawn path, which is what Whisper enforces regardless of grid
// adjacency.

const whispers = [
  ['R5C6', 'R4C6', 'R4C5', 'R4C4'],
  ['R5C4', 'R6C4', 'R6C5', 'R6C6'],
  ['R9C3', 'R9C2', 'R9C1', 'R8C2', 'R7C3', 'R7C2'],
  ['R3C1', 'R2C1', 'R1C1', 'R2C2', 'R3C3', 'R2C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C8', 'R3C7', 'R3C8'],
  ['R7C9', 'R8C9', 'R9C9', 'R8C8', 'R7C7', 'R8C7'],
  ['R4C2', 'R5C1', 'R5C2', 'R5C3', 'R6C2'],
  ['R4C8', 'R5C9', 'R5C8', 'R5C7', 'R6C8'],
  ['R7C4', 'R7C5', 'R7C6', 'R8C6', 'R9C6', 'R9C5'],
  ['R3C6', 'R3C5', 'R3C4', 'R2C4', 'R1C4', 'R1C5'],
].map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),

  new Given('R4C7', 1),

  new Cage(11, 'R1C6', 'R2C6'),
  new Cage(10, 'R6C3', 'R6C4'),

  ...whispers,
];
