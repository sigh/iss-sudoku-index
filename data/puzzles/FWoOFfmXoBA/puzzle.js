// Title: Ancient Artifacts
// Author: Scojo
// Video: https://www.youtube.com/watch?v=FWoOFfmXoBA
// Source: https://app.crackingthecryptic.com/sudoku/jpGbTb7jBF

// Each of the nine grey lines is a Renban, a German Whisper (difference >= 5),
// or a Region Sum Line (equal box-segment sums), with its identity undeduced,
// so each line is encoded as a disjunction over the three readings. Fog is
// solving UI, not a final-grid rule, and is not encoded. Each grey dot means
// its two cells are either consecutive or in a 1:2 ratio (Kropki-style, but
// unified into one dot rather than white/black); dots are not exhaustive.

const lines = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C2', 'R3C3', 'R2C4', 'R1C3', 'R1C2'],
  ['R4C1', 'R5C1', 'R6C1', 'R5C2', 'R6C3', 'R5C3', 'R4C3', 'R3C4', 'R3C5', 'R2C5', 'R1C5', 'R1C4'],
  ['R6C2', 'R7C2', 'R8C2', 'R7C3'],
  ['R8C1', 'R9C1', 'R9C2', 'R8C3', 'R8C4', 'R9C3'],
  ['R1C8', 'R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C7', 'R3C7', 'R3C8'],
  ['R7C5', 'R6C6', 'R5C6', 'R4C6'],
  ['R9C4', 'R9C5', 'R8C5', 'R7C4', 'R6C4', 'R6C5'],
  ['R7C6', 'R6C7', 'R5C7', 'R5C8', 'R4C8', 'R4C9'],
  ['R8C6', 'R7C7', 'R8C8', 'R8C7', 'R9C6'],
];

const lineChoices = lines.map(cells => new Or([
  new Renban(...cells),
  new Whisper(5, ...cells),
  new RegionSumLine(...cells),
]));

// Consecutive-or-1:2-ratio dot, from the grey edge marks.
const dotEdges = [
  ['R3C8', 'R3C9'],
  ['R5C5', 'R5C6'],
  ['R6C6', 'R7C6'],
  ['R3C5', 'R4C5'],
  ['R7C3', 'R8C3'],
];
const dotKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1 || a === 2 * b || b === 2 * a,
  9);
const dots = dotEdges.map(([a, b]) => new Pair(dotKey, 'consecutive or 1:2 ratio', a, b));

return [
  new Shape('9x9'),
  new Given('R2C2', 2),
  ...lineChoices,
  ...dots,
];
