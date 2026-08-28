// Title: Whose line is it anyways?
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=3jYcr9qCixQ
// Source: https://tinyurl.com/4vazre83

// Normal sudoku rules apply. Eight lines are drawn; each line is exactly one
// of Renban (consecutive digits, any order, no repeats), Whisper (adjacent
// digits differ by >= 5), or Palindrome (reads the same from either end) --
// which type each line is is left entirely to the solver, independently per
// line (the rules place no cap or minimum on how many lines use each type).
// Each line is encoded as an Or over its three readings; no bijection or
// count constraint ties the eight choices together, unlike puzzles that
// state "each type used exactly once".

// Cell paths, one per drawn line, transcribed from the puzzle's drawn lines.
const lines = [
  ['R5C4', 'R6C4', 'R5C5', 'R4C5', 'R5C6', 'R6C5', 'R6C6', 'R7C6', 'R6C7', 'R5C7', 'R4C7', 'R5C8', 'R6C8'],
  ['R7C4', 'R8C4', 'R8C5', 'R8C6'],
  ['R3C1', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R7C1'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R9C1', 'R8C2', 'R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R2C7', 'R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R4C7', 'R3C8'],
  ['R2C5', 'R3C4', 'R2C4', 'R3C5', 'R3C6'],
  ['R7C7', 'R8C7', 'R8C8', 'R7C8'],
];

const lineConstraints = lines.map(cells => new Or([
  new Renban(...cells),
  new Whisper(5, ...cells),
  new Palindrome(...cells),
]));

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R2C8', 6),
  new Given('R2C9', 9),
  new Given('R6C1', 8),
  new Given('R6C8', 4),
  ...lineConstraints,
];
