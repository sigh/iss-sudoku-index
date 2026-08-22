// Title: Whispers Of A Killer
// Author: Secret Santa
// Video: https://www.youtube.com/watch?v=LTjueKv4m3E
// Source: https://app.crackingthecryptic.com/sudoku/GR4hQnTnhP

// Normal sudoku rules. Green lines are whispers: adjacent cells must differ
// by at least 5 (Whisper). Cages sum to the small total in the top-left cell
// (Cage, which also enforces the cage's own cells are distinct). No givens.
// One `lines` entry in the source carries only styling (no waypoints) and
// renders nothing; it is omitted.

const cages = [
  [18, 'R1C1', 'R2C1', 'R3C1'],
  [13, 'R4C1', 'R5C1'],
  [9, 'R1C4', 'R2C4', 'R3C4'],
  [14, 'R1C7', 'R1C8'],
  [13, 'R2C9', 'R3C9'],
  [10, 'R6C7', 'R6C8', 'R6C9'],
  [12, 'R6C2', 'R6C3'],
  [15, 'R7C4', 'R8C4'],
  [11, 'R9C5', 'R9C6'],
  [20, 'R9C7', 'R9C8', 'R9C9'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

const whispers = [
  ['R9C1', 'R8C2', 'R7C2', 'R7C3', 'R8C3'],
  ['R6C4', 'R5C5', 'R4C5', 'R4C6', 'R5C6'],
  ['R3C6', 'R3C7', 'R4C7'],
  ['R2C7', 'R3C8'],
  ['R1C5', 'R1C6', 'R2C6'],
  ['R4C8', 'R4C9', 'R5C9'],
].map((cells) => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
];
