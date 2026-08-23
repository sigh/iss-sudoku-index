// Title: Near and Far
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=WxgEvD-UXDM
// Source: https://app.crackingthecryptic.com/sudoku/F4pq8732pq

// Normal sudoku rules apply (default 3x3 boxes; regions array matches the
// standard tiling). Purple lines (Renban): digits form a consecutive set with
// no repeats, in any order. Green lines (Whisper, difference >= 5): adjacent
// digits on the line differ by at least 5.

const givens = [
  new Given('R1C4', 1),
  new Given('R2C5', 2),
  new Given('R3C5', 3),
  new Given('R4C4', 4),
  new Given('R5C5', 5),
  new Given('R6C6', 6),
  new Given('R7C5', 7),
  new Given('R8C5', 8),
  new Given('R9C6', 9),
];

// Purple (consecutive-set) lines, transcribed from the drawn line waypoints.
const purpleLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
].map((cells) => new Renban(...cells));

// Green (big-difference) lines, transcribed from the drawn line waypoints.
const greenLines = [
  ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'],
  ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'],
].map((cells) => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...purpleLines,
  ...greenLines,
];
