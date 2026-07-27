// Title: Think you can break in?
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=aatBjicVMyI
// Source: https://sudokupad.app/cg5a3nnzp1

// Standard sudoku (rows, columns, boxes) plus AntiKnight, seven killer
// cages, and three German Whisper line segments. Fog/reveal state is
// solving UI, not a final-grid rule, and is not encoded. The payload's
// six total-less "foglight" cage stubs duplicate the geometry of six of
// the real cages below and mark fog-light UI positions, not a second
// constraint; they are not encoded.

// Cage cells and totals, read from the payload's `cages` array (entries
// with a numeric `value`).
const cages = [
  [6, 'R4C1', 'R4C2'],
  [11, 'R6C1', 'R6C2'],
  [12, 'R4C8', 'R4C9'],
  [15, 'R6C8', 'R6C9'],
  [8, 'R2C1', 'R2C2'],
  [5, 'R2C8', 'R2C9'],
  [10, 'R2C6', 'R3C6', 'R3C7'],
];

// Whisper line segments, read from the payload's `lines` array waypoints
// (green, thickness 10 => German Whisper per the rules text).
const whisperLines = [
  ['R4C4', 'R3C5', 'R4C6'],
  ['R5C7', 'R6C7'],
  ['R4C3', 'R5C3'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whisperLines.map(cells => new Whisper(...cells)),
];
