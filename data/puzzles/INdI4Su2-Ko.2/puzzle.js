// Title: June 30, 2022: 0006 Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=INdI4Su2-Ko
// Source: https://tinyurl.com/39c2574h

// Rules: each row, column and 3x3 region holds the digits 1-6 once each,
// plus three blank cells (nine cells total). Blank cells may never share an
// edge (orthogonal adjacency, board-wide, not scoped to a row/column/box).
// Digits inside a cage may not repeat, though a cage may hold multiple
// blanks, and the cage's digits sum to its printed total.
//
// Nothing is omitted.
//
// Modelling: rows/columns/boxes are not a latin square (each unit repeats
// the "digit" 0 three times), so the grid uses the Raw type with an
// explicit 0-6 alphabet, 0 standing for "blank" (a cell holding no digit).
// Every unit rule is stated by hand: `ContainExact('1_2_3_4_5_6_0_0_0', ...)`
// pins a unit to exactly one each of 1-6 and three 0s, which is exactly
// "1-6 plus three blanks".

const shape = new Shape('9x9', '0-6', 'Raw');
const graph = cellGraph(shape);

// True unless both cells are the same nonzero value: this is "no repeated
// digit, but blanks (0) are exempt" for a cage, and "not both blank" for an
// edge once combined with the b===0 case below -- see the two uses.
const noSharedDigit = Pair.fnToKey((a, b) => !(a !== 0 && a === b), shape);
const notBothBlank = Pair.fnToKey((a, b) => !(a === 0 && b === 0), shape);

// The two printed givens.
const givens = [
  new Given('R7C3', 3),
  new Given('R7C7', 1),
];

// All 27 units (9 rows, 9 columns, 9 boxes) hold 1-6 once each plus three 0s.
// A Raw grid has no default boxes -- graph.box(n)/boxes() is empty by design
// on this grid type -- so the nine standard 3x3 blocks are built explicitly
// from their top-left corners.
// lint-ok: manual-box-arithmetic
const boxTopLefts = [1, 4, 7].flatMap((r) => [1, 4, 7].map((c) => [r, c]));
const boxes = boxTopLefts.map(
  ([r, c]) => graph.block(makeCellId(r, c), 3, 3));
const unitRules = [...graph.rows(), ...graph.columns(), ...boxes].map(
  (cells) => new ContainExact('1_2_3_4_5_6_0_0_0', ...cells));

// Board-wide: no two orthogonally-adjacent cells may both be blank. Every
// edge is a shifted copy of one of two templates (a right-neighbour pair or
// a down-neighbour pair), so each direction is one Replicate over every cell
// that has such a neighbour, rather than 144 individual Pair constraints.
const rightTargets = graph.cells().filter((cell) => graph.step(cell, 0, 1));
const downTargets = graph.cells().filter((cell) => graph.step(cell, 1, 0));
const blankAdjacency = [
  graph.makeReplicate(
    new Pair(notBothBlank, 'no-adjacent-blanks', 'R1C1', 'R1C2'),
    rightTargets),
  graph.makeReplicate(
    new Pair(notBothBlank, 'no-adjacent-blanks', 'R1C1', 'R2C1'),
    downTargets),
];

// Cages, read from the drawn cage outlines and printed totals.
const cages = [
  { cells: ['R2C2', 'R2C3', 'R3C2'], total: 1 },
  { cells: ['R2C7', 'R2C8', 'R3C8'], total: 2 },
  { cells: ['R7C2', 'R8C2', 'R8C3'], total: 4 },
  { cells: ['R7C8', 'R8C7', 'R8C8'], total: 3 },
  { cells: ['R8C4', 'R8C5', 'R8C6'], total: 3 },
  { cells: ['R4C2', 'R5C2', 'R6C2'], total: 5 },
  { cells: ['R2C4', 'R2C5', 'R2C6'], total: 7 },
  { cells: ['R4C8', 'R5C8', 'R6C8'], total: 5 },
  { cells: ['R1C2', 'R1C3', 'R1C4'], total: 12 },
  { cells: ['R9C6', 'R9C7', 'R9C8'], total: 11 },
  { cells: ['R6C1', 'R7C1', 'R8C1'], total: 9 },
  { cells: ['R2C9', 'R3C9', 'R4C9'], total: 10 },
  { cells: ['R3C5', 'R4C5'], total: 5 },
];

// Every unordered pair of cells within each cage.
const cellPairs = (cells) => cells.flatMap(
  (a, i) => cells.slice(i + 1).map((b) => [a, b]));

const cageSums = cages.map(
  ({ cells, total }) => new Sum(total, ...cells));
const cageNoRepeat = cages.flatMap(
  ({ cells }) => cellPairs(cells).map(
    ([a, b]) => new Pair(noSharedDigit, 'cage-no-repeat', a, b)));

return [
  shape,
  ...givens,
  ...unitRules,
  ...blankAdjacency,
  ...cageSums,
  ...cageNoRepeat,
];
