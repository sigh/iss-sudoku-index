// Title: Sandwich Ninesweeper
// Author: Albin Bernhardsson
// Video: https://www.youtube.com/watch?v=EsWnGT_UVTU
// Source: https://app.crackingthecryptic.com/sudoku/NqFn42m976
//
// Normal sudoku rules apply (default row/column/box all-different).
//
// Outside clues are Sandwich sums: the sum of the digits strictly between the
// 1 and the 9 in that row/column. Nine such clues are drawn (3 rows, 6
// columns); the remaining rows/columns carry no sandwich clue.
//
// Four cells are highlighted (yellow-green fill). Each highlighted cell's
// own digit equals the number of 9s among its up-to-8 king-move (orthogonal +
// diagonal) neighbours. "All possible highlighted cells are given" is an
// exhaustiveness clause: every cell where the digit equals its king-move
// 9-count would have to be highlighted, so every non-highlighted cell must
// NOT satisfy that relation.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Sandwich clues, by the full row/column of cells they cover. Values and
// lanes: the 9 outside-clue badges drawn around the grid.
const sandwiches = [
  Sandwich.fromCells(21, graph.row(2), geometry),
  Sandwich.fromCells(33, graph.row(6), geometry),
  Sandwich.fromCells(18, graph.row(9), geometry),
  Sandwich.fromCells(7, graph.column(2), geometry),
  Sandwich.fromCells(20, graph.column(3), geometry),
  Sandwich.fromCells(4, graph.column(4), geometry),
  Sandwich.fromCells(11, graph.column(6), geometry),
  Sandwich.fromCells(22, graph.column(7), geometry),
  Sandwich.fromCells(5, graph.column(8), geometry),
];

// Highlighted (ninesweeper) cells: the 4 yellow-green filled cells drawn on
// the grid.
const highlightedCells = ['R3C2', 'R4C3', 'R6C7', 'R7C8'];

// NFA: first symbol is the highlighted cell's own digit (the target count to
// match); each following symbol is one king-move neighbour, incrementing a
// clamped counter whenever it reads a 9. Accept iff the final count equals
// the recorded target. Clamping the counter at target+1 keeps the state
// space small (at most 9 targets x 10 counter values) -- once the count
// exceeds the target the branch can only ever reject.
const ninesweeperSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = value === 9 ? 1 : 0;
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);

const ninesweepers = highlightedCells.map(
  cell => new NFA(
    ninesweeperSpec, 'ninesweeper', cell, ...graph.kingNeighbours(cell)));

// Negation of the same machine, applied to every cell that is not
// highlighted: its digit must differ from its own king-move 9-count.
const ninesweeperNegSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = value === 9 ? 1 : 0;
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count !== target,
}, 9);

const nonHighlightedCells = graph.cells().filter(
  cell => !highlightedCells.includes(cell));
const ninesweeperNegatives = nonHighlightedCells.map(
  cell => new NFA(
    ninesweeperNegSpec, 'not-ninesweeper', cell, ...graph.kingNeighbours(cell)));

return [
  new Shape('9x9'),
  ...sandwiches,
  ...ninesweepers,
  ...ninesweeperNegatives,
];
