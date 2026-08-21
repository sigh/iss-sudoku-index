// Title: July 2, 2022: 00005
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=glCWGqNR2U0
// Source: http://tinyurl.com/musyx5e4

// Rules: normal sudoku rules do not apply. Each row, column and 3x3 region
// holds the digits 1-5 once each, plus four blank cells (nine cells total).
// Blank cells may never share an edge (orthogonal adjacency, board-wide, not
// scoped to a row/column/box). Digits inside a cage may not repeat, though a
// cage may hold multiple blanks, and the cage's digits sum to its printed
// total.
//
// Nothing is omitted.
//
// Modelling: rows/columns/boxes are not a latin square (each unit repeats the
// "digit" 0 four times), so the grid uses the Raw type with an explicit 0-5
// alphabet, 0 standing for "blank" (a cell holding no digit). Every unit rule
// is stated by hand: `ContainExact('1_2_3_4_5_0_0_0_0', ...)` pins a unit to
// exactly one each of 1-5 and four 0s, which is exactly "1-5 plus four
// blanks".
//
// A cage's total is `Sum(total, ...cells)`: blank cells hold no digit, so
// they contribute nothing and 0 already reads that way arithmetically. The
// "digits may not repeat, but blanks may" clause is not plain AllDifferent
// (0 must be allowed to repeat) -- it is coded as one Pair per unordered cell
// pair inside the cage, each forbidding equal nonzero values while leaving
// equal zeros alone. The board-wide "blanks never touch" rule is the same
// per-pair predicate applied to every orthogonal grid edge instead.

const shape = new Shape('9x9', '0-5', 'Raw');
const graph = cellGraph(shape);

// True unless both cells are the same nonzero value: this is "no repeated
// digit, but blanks (0) are exempt" for a cage, and "not both blank" for an
// edge once combined with the b===0 case below -- see the two uses.
const noSharedDigit = Pair.fnToKey((a, b) => !(a !== 0 && a === b), shape);
const notBothBlank = Pair.fnToKey((a, b) => !(a === 0 && b === 0), shape);

// All 27 units (9 rows, 9 columns, 9 boxes) hold 1-5 once each plus four 0s.
// A Raw grid has no default boxes -- graph.box(n)/boxes() is empty by design
// on this grid type -- so the nine standard 3x3 blocks are built explicitly
// from their top-left corners.
const boxTopLefts = [1, 4, 7].flatMap((r) => [1, 4, 7].map((c) => [r, c]));
const boxes = boxTopLefts.map(
  ([r, c]) => graph.block(makeCellId(r, c), 3, 3));
const unitRules = [...graph.rows(), ...graph.columns(), ...boxes].map(
  (cells) => new ContainExact('1_2_3_4_5_0_0_0_0', ...cells));

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
  { cells: ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'], total: 1 },
  { cells: ['R8C6', 'R8C7'], total: 9 },
  { cells: ['R2C3', 'R2C4'], total: 9 },
  { cells: ['R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C2'], total: 3 },
  { cells: ['R1C8', 'R2C7', 'R2C8', 'R2C9', 'R3C8'], total: 2 },
  { cells: ['R6C3', 'R6C4', 'R7C4'], total: 4 },
  { cells: ['R3C4', 'R4C3', 'R4C4'], total: 3 },
  { cells: ['R3C6', 'R4C6', 'R4C7'], total: 2 },
  { cells: ['R6C6', 'R6C7', 'R7C6'], total: 5 },
  { cells: ['R3C2', 'R4C2'], total: 5 },
  { cells: ['R6C8', 'R7C8'], total: 4 },
  { cells: ['R8C9', 'R9C8', 'R9C9'], total: 6 },
  { cells: ['R1C1', 'R1C2', 'R2C1'], total: 8 },
  { cells: ['R4C1', 'R5C1'], total: 6 },
  { cells: ['R1C4', 'R1C5'], total: 6 },
  { cells: ['R9C5', 'R9C6'], total: 8 },
  { cells: ['R5C9', 'R6C9'], total: 5 },
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
  ...unitRules,
  ...blankAdjacency,
  ...cageSums,
  ...cageNoRepeat,
];
