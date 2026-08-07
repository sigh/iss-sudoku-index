// Title: Drafting Strategy
// Author: Sudoku Joker
// Video: https://www.youtube.com/watch?v=tgt5Gs9dBNA
// Source: https://sudokupad.app/qbx29s7dud
//
// Normal sudoku rules. No cell may be double the value of any orthogonally
// adjacent cell (checked both directions, once per edge below).
//
// Green rooms: R9C3/R8C3, R6C5/R6C4, R7C7/R6C7, R2C3/R2C4 are drawn as two
// orthogonally-adjacent pairs each (from the underlay fills); digits in each
// pair sum to 10.
// Purple rooms (R4C7, R9C7, R6C1): a purple room's digit is smaller than
// every orthogonally adjacent digit.
// Same-colour rooms may not repeat a digit: one AllDifferent per colour
// (purple, red, green), over every room of that colour on the grid.
//
// Omitted: the house-traversal path (Entrance R9C5 to Antechamber R1C5), the
// region-sum-line that path forms, and the footstep mechanic tied to it --
// the drawn doorway graph between rooms does not pin a unique Hamiltonian
// path by itself.

const graph = cellGraph('9x9');

const PURPLE = ['R4C7', 'R9C7', 'R6C1'];
const RED = ['R9C6', 'R7C6', 'R3C3'];
const GREEN_PAIRS = [
  ['R9C3', 'R8C3'],
  ['R6C5', 'R6C4'],
  ['R7C7', 'R6C7'],
  ['R2C3', 'R2C4'],
];
const GREEN = GREEN_PAIRS.flat();

// No cell doubles an orthogonal neighbour's value, in either direction.
// Two shifted templates (right-neighbour, down-neighbour) cover every edge
// exactly once; Replicate stamps each onto every cell with that neighbour.
const noDoubleKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const rightTargets = graph.cells().filter(c => graph.step(c, 0, 1));
const downTargets = graph.cells().filter(c => graph.step(c, 1, 0));
const noDoubles = [
  graph.makeReplicate(
    new Pair(noDoubleKey, 'NoDouble', 'R1C1', 'R1C2'), rightTargets),
  graph.makeReplicate(
    new Pair(noDoubleKey, 'NoDouble', 'R1C1', 'R2C1'), downTargets),
];

// A purple room's digit is smaller than every orthogonally adjacent digit.
const purpleSmaller = PURPLE.flatMap(
  cell => graph.neighbours(cell).map(n => new GreaterThan(n, cell)));

const greenSums = GREEN_PAIRS.map(([a, b]) => new Sum(10, a, b));

return [
  new Shape('9x9'),
  new Given('R1C3', 4),
  new Given('R1C4', 6),
  ...noDoubles,
  ...purpleSmaller,
  ...greenSums,
  new AllDifferent(...PURPLE),
  new AllDifferent(...RED),
  new AllDifferent(...GREEN),
];
