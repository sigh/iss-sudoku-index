// Title: 7/24/23: Fish Slapping Dance
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=JrBPy-kJ7dg
// Source: https://tinyurl.com/2rj75xnj

// Normal sudoku (default row/column/box all-different) plus:
// - Killer: 16 two-cell cages, no repeat within a cage, digits sum to the
//   given total.
// - German Whispers: two 16-cell lines; adjacent cells on a line must differ
//   by at least 5 (Whisper's default difference is 5, matching "German
//   Whisper" terminology).

// Killer cages: [cells, sum], transcribed from the drawn cage outlines/totals.
const cages = [
  [['R1C1', 'R1C2'], 7],
  [['R1C3', 'R2C3'], 9],
  [['R2C4', 'R2C5'], 8],
  [['R2C6', 'R3C6'], 10],
  [['R3C7', 'R3C8'], 10],
  [['R3C9', 'R4C9'], 9],
  [['R4C6', 'R5C6'], 13],
  [['R4C7', 'R4C8'], 8],
  [['R5C4', 'R6C4'], 7],
  [['R6C1', 'R7C1'], 11],
  [['R6C2', 'R6C3'], 11],
  [['R7C2', 'R7C3'], 10],
  [['R7C4', 'R8C4'], 10],
  [['R8C5', 'R8C6'], 12],
  [['R8C7', 'R9C7'], 11],
  [['R9C8', 'R9C9'], 13],
];

// German Whisper lines, transcribed from the two drawn green lines.
const whisperLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C6',
    'R3C7', 'R3C8', 'R3C9', 'R4C9', 'R4C8', 'R4C7', 'R4C6', 'R5C6'],
  ['R9C9', 'R9C8', 'R9C7', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R7C4',
    'R7C3', 'R7C2', 'R7C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R5C4'],
];

return [
  new Shape('9x9'),
  ...cages.map(([cells, sum]) => new Cage(sum, ...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
];
