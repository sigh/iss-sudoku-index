// Title: August 6, 2021: Shhhh!
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=i3JiNbn1t_Q
// Source: https://tinyurl.com/m9d5tn4

// Normal sudoku rules apply. Along green lines, digits differ from their
// neighbours by at least 5. The green marking is drawn as 21 separate line
// entries (some sharing an endpoint with another entry); each is encoded as
// its own Whisper(5), which is faithful either way since Whisper only
// constrains adjacent pairs within a given cell path.
// Cell paths transcribed from the drawn whisper-line entries.
const whiskerPaths = [
  ['R3C7', 'R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8'],
  ['R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1', 'R7C2'],
  ['R7C2', 'R6C2'],
  ['R3C7', 'R3C6'],
  ['R3C8', 'R4C8'],
  ['R6C2', 'R6C1', 'R5C1', 'R5C2'],
  ['R5C2', 'R5C3'],
  ['R4C8', 'R4C9', 'R5C9', 'R5C8', 'R5C7'],
  ['R5C7', 'R6C7'],
  ['R5C3', 'R4C3'],
  ['R4C3', 'R4C4'],
  ['R6C7', 'R6C6'],
  ['R6C6', 'R6C5'],
  ['R4C4', 'R4C5'],
  ['R4C5', 'R3C5'],
  ['R6C5', 'R7C5'],
  ['R7C3', 'R7C4'],
  ['R3C6', 'R2C6'],
  ['R7C4', 'R8C4'],
  ['R7C5', 'R8C5', 'R9C6'],
  ['R3C5', 'R2C5', 'R1C4'],
];

return [
  new Shape('9x9'),

  // Givens (drawn as pencilled digits in the grid).
  new Given('R1C1', 1),
  new Given('R2C4', 2),
  new Given('R3C2', 3),
  new Given('R4C1', 4),
  new Given('R5C5', 5),
  new Given('R6C9', 6),
  new Given('R7C8', 7),
  new Given('R8C6', 8),
  new Given('R9C9', 9),

  ...whiskerPaths.map((path) => new Whisper(5, ...path)),
];
