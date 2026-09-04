// Title: REM Ban
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=2OtRmsowNlU
// Source: https://app.crackingthecryptic.com/sudoku/rgqbHDr9Mb

// 1-9 in every row and column; only rows and columns are named, so no boxes.
// No 3 in a corner cell or a spotlight cell (see SPOTLIGHT below). A purple
// line holds a non-repeating consecutive set, any order (Renban). Two cells
// diagonally adjacent through a shared grid corner-point hold identical
// digits exactly where a diagonal equals sign is drawn between them, and
// every such pair is drawn -- so every other diagonally adjacent pair must
// differ.

const graph = cellGraph('9x9');

const givens = [
  new Given('R1C2', 6),
  new Given('R6C9', 1),
  new Given('R8C9', 7),
];

// The four grid corners the rules call "corner cells".
const CORNER_CELLS = ['R1C1', 'R1C9', 'R9C1', 'R9C9'];

// The board shades every cell but a central diamond with a yellow
// background, one cell at a time; transcribed here so the unshaded
// "spotlight" cells the rules refer to are derived by complement rather
// than hand-listed.
const RING_CELLS = [
  'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3', 'R2C2', 'R1C2', 'R1C3', 'R1C4',
  'R2C4', 'R2C5', 'R1C5', 'R1C6', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R2C8', 'R1C8',
  'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R4C8', 'R5C8', 'R5C9', 'R6C9', 'R6C8', 'R7C8',
  'R7C7', 'R8C7', 'R8C8', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R8C6', 'R8C5',
  'R9C5', 'R9C4', 'R8C4', 'R8C3', 'R7C3', 'R7C2', 'R8C2', 'R9C2', 'R9C1', 'R8C1',
  'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R4C2', 'R5C2', 'R6C2', 'R9C3', 'R7C9', 'R1C7',
];
const ringSet = new Set(RING_CELLS);
const SPOTLIGHT_CELLS = graph.cells().filter(cell => !ringSet.has(cell));

const NOT_THREE = [1, 2, 4, 5, 6, 7, 8, 9];
const noThrees = [...CORNER_CELLS, ...SPOTLIGHT_CELLS].map(
  cell => new Given(cell, ...NOT_THREE));

// The twelve purple Renban lines, drawn on the board; the two diagonal
// equals-sign marks are handled separately below.
const renbans = [
  new Renban('R1C1', 'R2C1', 'R2C2', 'R3C2', 'R4C2', 'R4C1', 'R5C1', 'R6C1'), // line #0
  new Renban('R1C3', 'R2C3'), // line #1
  new Renban('R1C4', 'R2C4'), // line #2
  new Renban('R1C5', 'R2C6', 'R1C7'), // line #3
  new Renban('R4C7', 'R3C7', 'R2C7', 'R2C8', 'R3C8', 'R4C8'), // line #4
  new Renban('R2C5', 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R5C7', 'R5C8'), // line #5
  new Renban('R5C9', 'R6C8'), // line #6
  new Renban('R7C8', 'R8C8', 'R8C7', 'R7C7', 'R6C7'), // line #7
  new Renban('R5C2', 'R5C3', 'R5C4', 'R6C4', 'R6C5', 'R7C5', 'R8C5'), // line #8
  new Renban('R6C3', 'R6C2'), // line #9
  new Renban('R7C4', 'R7C3', 'R7C2'), // line #10
  new Renban('R7C1', 'R8C2', 'R8C3', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R9C7'), // line #11
];

// The two diagonal equals signs: each is drawn as two near-identical short
// strokes at one grid corner-point, the two strokes of an "=" glyph, naming
// the diagonally opposite cell pair there.
const EQUAL_DIAGONAL_PAIRS = [
  ['R3C4', 'R4C3'],
  ['R3C6', 'R4C5'],
];
const isEqualDiagonalPair = (a, b) => EQUAL_DIAGONAL_PAIRS.some(
  ([x, y]) => (x === a && y === b) || (x === b && y === a));

// Every diagonally adjacent cell pair on the board, both directions,
// generated from the grid rather than hand-enumerated; each pair is visited
// once by only stepping toward higher row indices.
const diagonalPairs = [];
for (const cell of graph.cells()) {
  for (const [dRow, dCol] of [[1, 1], [1, -1]]) {
    const other = graph.step(cell, dRow, dCol);
    if (other) diagonalPairs.push([cell, other]);
  }
}

// "All such possible signs are given": the two marked pairs are equal, and
// every other diagonally adjacent pair -- since it carries no mark -- must
// differ.
const diagonalConstraints = diagonalPairs.map(([a, b]) => isEqualDiagonalPair(a, b)
  ? new SameValues(2, a, b)
  : new AllDifferent(a, b));

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...givens,
  ...noThrees,
  ...renbans,
  ...diagonalConstraints,
];
