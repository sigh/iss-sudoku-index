// Title: The Eminen Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=dgxhCcc4oRw
// Source: https://cracking-the-cryptic.web.app/sudoku/6948F3hqt4

// Normal sudoku rules apply (standard 3x3 boxes). Every cage sums to its
// printed clue and its digits do not repeat. Here no cage or diagonal prints
// a number: each is labelled "m" or "n" instead, and the rules state every
// "m" clue shares one common (unknown) total and every "n" clue shares
// another (unknown, possibly equal) total. That is exactly what EqualSum
// expresses directly -- one call per label, over every "m"/"n"-tagged
// cage's and diagonal's cells as its own segment -- with no need to name the
// shared total. Diagonal outside-sum clues allow repeated digits (per the
// rules text), so they get no AllDifferent; cages additionally get
// AllDifferent for their own no-repeat rule.

const givens = [
  ['R3C1', 2],
  ['R4C3', 1],
  ['R6C3', 6],
  ['R9C6', 2],
];

// Cage cell groups, transcribed from the puzzle's cage geometry (0-indexed
// [row, col] pairs converted to R#C#), each tagged with its "m"/"n" label.
const cages = [
  { label: 'n', cells: ['R7C1', 'R8C1', 'R9C1'] },
  { label: 'm', cells: ['R8C3', 'R7C3', 'R7C4'] },
  { label: 'm', cells: ['R6C4', 'R6C5'] },
  { label: 'n', cells: ['R5C3', 'R5C4', 'R5C5'] },
  { label: 'm', cells: ['R4C6', 'R4C7', 'R5C7'] },
  { label: 'm', cells: ['R7C8', 'R8C8', 'R8C9'] },
  { label: 'm', cells: ['R3C9'] },
  { label: 'n', cells: ['R1C7', 'R2C7'] },
  { label: 'n', cells: ['R1C8', 'R2C8'] },
];

// Outside diagonal-sum clues, transcribed from the drawn off-grid diagonal
// rays paired with their nearest "m"/"n" text label; cells are listed walked
// from the grid edge inward.
const diagonals = [
  { label: 'm', cells: ['R1C1'] },
  { label: 'n', cells: ['R2C1', 'R1C2'] },
  { label: 'm', cells: ['R3C1', 'R2C2', 'R1C3'] },
  { label: 'n', cells: ['R4C1', 'R3C2', 'R2C3', 'R1C4'] },
  { label: 'm', cells: ['R8C1', 'R9C2'] },
  { label: 'm', cells: ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'] },
  { label: 'n', cells: ['R7C9', 'R8C8', 'R9C7'] },
];

const clues = [...cages, ...diagonals];
const segmentsFor = label => clues.filter(c => c.label === label).map(c => c.cells);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(({ cells }) => new AllDifferent(...cells)),
  new EqualSum(...segmentsFor('m')),
  new EqualSum(...segmentsFor('n')),
];
