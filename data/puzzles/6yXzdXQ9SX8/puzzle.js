// Title: Caged by a Secret Killer
// Author: PhoenixAki
// Video: https://www.youtube.com/watch?v=6yXzdXQ9SX8
// Source: https://app.crackingthecryptic.com/9J4n47mffJ

// Rules encoded here, in full:
//   Normal sudoku rules apply. Cells in cages sum to the total in the top left
//   corner. Cage totals are given as letters, whose value must be deduced. Each
//   of the 4 letters has a unique sum. Digits cannot repeat along the positive
//   and negative diagonals. Cells connected by a green line differ by at least
//   5. Cells connected by a white dot are consecutive. Inequality signs (> or ^)
//   'point' to the smaller of 2 digits.
// Nothing is omitted.

// Drawn cages, grouped by the letter printed in each cage's corner. Every cage
// is a two-cell domino around the border of the grid.
const CAGES = [
  ['A', [['R2C1', 'R3C1'], ['R4C1', 'R5C1'], ['R6C1', 'R7C1']]],
  ['C', [['R1C2', 'R1C3'], ['R1C4', 'R1C5'], ['R1C6', 'R1C7'], ['R1C8', 'R1C9']]],
  ['G', [['R3C9', 'R4C9'], ['R5C9', 'R6C9'], ['R7C9', 'R8C9']]],
  ['E', [['R9C1', 'R9C2'], ['R9C3', 'R9C4'], ['R9C5', 'R9C6'], ['R9C7', 'R9C8']]],
];

// Drawn green lines: each covers exactly one pair of orthogonally adjacent cells.
const GREEN_LINES = [
  ['R8C2', 'R8C3'], ['R7C2', 'R7C3'], ['R3C7', 'R3C8'], ['R2C7', 'R2C8'],
  ['R4C1', 'R5C1'], ['R5C9', 'R6C9'],
];

// Drawn white dots, on the border between the two cells named.
const WHITE_DOTS = [['R9C5', 'R9C6'], ['R1C4', 'R1C5']];

// Drawn inequality signs, listed larger cell first. The two '>' signs sit on a
// vertical border and point rightwards (R1C2|R1C3 and R9C7|R9C8); the '^' sits
// on a horizontal border and points upwards (R2C4|R3C4), so its smaller cell is
// the upper one.
const INEQUALITIES = [['R1C2', 'R1C3'], ['R9C7', 'R9C8'], ['R3C4', 'R2C4']];

const GIVENS = [['R2C9', 6], ['R5C5', 5], ['R8C1', 4]];

// A two-cell cage of distinct digits totals 3..17, but ISS values stop at 16, so
// each letter's Var stores (total - CAGE_OFFSET), covering 1..15. The offset
// cancels out of the AllDifferent that keeps the four letters distinct, and the
// Sum below adds it back when tying a cage to its letter.
const CAGE_OFFSET = 2;

const shape = new Shape('9x9', 17 - CAGE_OFFSET);
const graph = cellGraph(shape);
const letters = new Var('L', 'Letter totals', CAGES.length);
const letterCell = (name) =>
  letters.cell(CAGES.findIndex(([letter]) => letter === name) + 1);

return [
  shape,
  // The widened value range carries the letter totals only; grid digits are 1-9.
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  letters,
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  new Diagonal(1),
  new Diagonal(-1),
  // Each cage's two cells share a row or a column, so the sudoku groups already
  // make them different digits; only the total is stated here.
  ...CAGES.flatMap(([letter, cages]) => cages.map(
    ([a, b]) => new Sum(CAGE_OFFSET, a, b, [letterCell(letter), -1]))),
  new AllDifferent(...letters.cells()),
  ...GREEN_LINES.map(pair => new Whisper(5, ...pair)),
  ...WHITE_DOTS.map(pair => new WhiteDot(...pair)),
  ...INEQUALITIES.map(pair => new GreaterThan(...pair)),
];
