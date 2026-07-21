// Title: Counting Constraints
// Author: Erin Toler
// Video: https://www.youtube.com/watch?v=yXuWkPnncBI
// Source: https://sudokupad.app/erin-toler/counting-constraints

// Every cell on a drawn constraint counts toward the global counting rule.
// The drawn clue sets are disjoint, as stated in the rules.
const germanWhispers = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1'],
];

const dutchWhispers = [
  ['R3C2', 'R4C2', 'R5C2'],
  ['R8C3', 'R7C3', 'R7C4', 'R7C5'],
];

const nabnerLines = [
  ['R1C2', 'R1C3', 'R2C3', 'R3C3'],
  ['R3C8', 'R3C9'],
  ['R9C4', 'R9C5'],
];

const renbanLines = [
  ['R7C8', 'R7C9', 'R6C9', 'R5C9'],
  ['R2C7', 'R2C6', 'R1C5', 'R1C4'],
  ['R8C7', 'R8C8'],
  ['R5C5', 'R6C5'],
  ['R3C6', 'R4C6'],
];

const countingCircles = ['R9C1', 'R4C3', 'R2C2', 'R5C4', 'R3C5'];
const oddCircles = ['R4C4'];
const blackDots = [['R5C3', 'R6C3']];

const allConstraintCells = [
  ...germanWhispers.flat(),
  ...dutchWhispers.flat(),
  ...nabnerLines.flat(),
  ...renbanLines.flat(),
  ...countingCircles,
  ...oddCircles,
  ...blackDots.flat(),
];

// Nabner relates every pair of cells on a line, not just adjacent cells.
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

return [
  new Shape('9x9'),

  ...germanWhispers.map((cells) => new Whisper(5, ...cells)),
  ...dutchWhispers.map((cells) => new Whisper(4, ...cells)),
  ...nabnerLines.map((cells) => new PairX(nabnerKey, 'Nabner', ...cells)),
  ...renbanLines.map((cells) => new Renban(...cells)),
  new CountingCircles(...countingCircles),
  ...oddCircles.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),
  ...blackDots.map((cells) => new BlackDot(...cells)),

  new CountingCircles(...allConstraintCells),
];
