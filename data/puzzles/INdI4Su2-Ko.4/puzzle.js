// Title: 28 Jun, 2022: Killer 007
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=INdI4Su2-Ko
// Source: https://tinyurl.com/3r53kmt2

// Rules: each row, column and 3x3 region holds the digits 1-7 once each,
// plus two blank cells (nine cells total). Blank cells may never share an
// edge (orthogonal adjacency, board-wide, not scoped to a row/column/box).
// Numbers in a cage must add up to the given total. Unlike sibling puzzles
// in the same source video, the rules text here states only the cage total
// -- it never says a cage's digits must not repeat -- so no distinctness is
// encoded within a cage; a cage may hold a repeated digit or more than one
// blank.
//
// No givens are present in the payload.

// Modelling: rows/columns/boxes are not a latin square (each unit repeats
// the "digit" 0 twice), so the grid uses the Raw type with an explicit 0-7
// alphabet, 0 standing for "blank" (a cell holding no digit).
const shape = new Shape('9x9', '0-7', 'Raw');
const graph = cellGraph(shape);

// "Blank cells must not share an edge": true unless both cells are blank.
const notBothBlank = Pair.fnToKey((a, b) => !(a === 0 && b === 0), shape);

// All 27 units (9 rows, 9 columns, 9 boxes) hold 1-7 once each plus two 0s.
// A Raw grid has no default boxes -- graph.box(n)/boxes() is empty by design
// on this grid type -- so the nine standard 3x3 blocks are built explicitly
// from their top-left corners.
const boxTopLefts = [1, 4, 7].flatMap((r) => [1, 4, 7].map((c) => [r, c]));
const boxes = boxTopLefts.map(
  ([r, c]) => graph.block(makeCellId(r, c), 3, 3));
const unitRules = [...graph.rows(), ...graph.columns(), ...boxes].map(
  (cells) => new ContainExact('1_2_3_4_5_6_7_0_0', ...cells));

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

// Cages, read from the drawn cage outlines and printed totals. A blank
// cell holds 0 so it contributes nothing to a cage's sum.
const cages = [
  { cells: ['R1C4', 'R1C5'], total: 9 },
  { cells: ['R1C6', 'R1C7', 'R1C8'], total: 4 },
  { cells: ['R1C9', 'R2C9'], total: 5 },
  { cells: ['R2C2', 'R2C3', 'R2C4'], total: 1 },
  { cells: ['R2C1', 'R3C1'], total: 4 },
  { cells: ['R4C1', 'R5C1', 'R6C1'], total: 3 },
  { cells: ['R8C1', 'R9C1'], total: 8 },
  { cells: ['R9C2', 'R9C3', 'R9C4'], total: 7 },
  { cells: ['R9C5', 'R9C6'], total: 7 },
  { cells: ['R8C6', 'R8C7', 'R8C8'], total: 2 },
  { cells: ['R7C9', 'R8C9'], total: 3 },
  { cells: ['R4C9', 'R5C9', 'R6C9'], total: 17 },
  { cells: ['R3C5', 'R4C5'], total: 13 },
  { cells: ['R6C5', 'R7C5'], total: 2 },
  { cells: ['R5C4', 'R5C5', 'R5C6'], total: 16 },
  { cells: ['R5C3', 'R6C3', 'R7C3'], total: 4 },
  { cells: ['R3C7', 'R4C7', 'R5C7'], total: 3 },
];
const cageSums = cages.map(({ cells, total }) => new Sum(total, ...cells));

return [
  shape,
  ...unitRules,
  ...blankAdjacency,
  ...cageSums,
];
