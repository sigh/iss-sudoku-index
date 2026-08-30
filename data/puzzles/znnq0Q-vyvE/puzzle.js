// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=znnq0Q-vyvE
// Source: https://cracking-the-cryptic.web.app/sudoku/pqg8LG64Tn

// Divide the 8x8 grid into four areas, one per clue cell, so that every cell
// is orthogonally connected to its own area's clue cell. Each clue cell's
// numbers give the count of cells in its own area lying to the North (row
// above), East (column right), South (row below) and West (column left) of
// it -- counting every matching cell regardless of the other axis, so a cell
// diagonal to the clue (e.g. north-east of it) is counted once for North and
// once for East. A blank direction carries no clue and is unconstrained.
//
// The four region labels (1-4) are this encoding's own bookkeeping -- each
// area is really identified by its own anchor clue cell, not by a printed
// number -- assigned in reading order of the clue cells below.
//
// Reading the four numbers as counting mutually-exclusive quadrants (as if
// every non-anchor cell were North/South/East/West but never two at once)
// is ruled out by arithmetic: the four areas' minimum sizes would then sum
// to 73 cells against a 64-cell board. So directions must overlap on
// diagonal cells, as encoded here.

const shape = new Shape('8x8', '1-4', 'Raw');
const ALL_LABELS = [1, 2, 3, 4];

function cellsWhere(pred) {
  const cells = [];
  for (let r = 1; r <= 8; r++) {
    for (let c = 1; c <= 8; c++) {
      if (pred(r, c)) cells.push(makeCellId(r, c));
    }
  }
  return cells;
}

// Clue cell coordinates and directional counts read from the free-floating
// N/E/S/W numerals drawn around each clue cell.
const CLUES = [
  { cell: 'R2C2', label: 1, N: 2, E: 5, S: 3, W: 0 },
  { cell: 'R3C6', label: 2, N: 1, E: 2, W: 8 },        // South: unclued
  { cell: 'R6C3', label: 3, E: 22, S: 8, W: 9 },       // North: unclued
  { cell: 'R7C7', label: 4, N: 2, E: 3, S: 0, W: 4 },
];

const givens = CLUES.map(({ cell, label }) => new Given(cell, label));

// Every cell has exactly one label (Raw grid, one value per cell), so the
// four labels already partition the grid; requiring each label's cells to
// form one connected region is exactly "every cell connects to its area's
// clue cell".
const connectivity = ALL_LABELS.map(label => new ConnectedValues('', label));

function directionalCount(clue, direction, count) {
  if (count === undefined) return [];
  const { row: r0, col: c0 } = parseCellId(clue.cell);
  const pred = {
    N: (r, c) => r < r0,
    S: (r, c) => r > r0,
    E: (r, c) => c > c0,
    W: (r, c) => c < c0,
  }[direction];
  const cells = cellsWhere(pred);
  if (count === 0) {
    // ContainExact can only name counts by repeating a value, so it cannot
    // state "zero" directly. Exclude this label from every candidate cell
    // instead -- equivalent to "no cell here holds this label".
    const other = ALL_LABELS.filter(v => v !== clue.label);
    return cells.map(cell => new Given(cell, ...other));
  }
  return [new ContainExact(Array(count).fill(clue.label).join('_'), ...cells)];
}

const counts = CLUES.flatMap(
  clue => ['N', 'E', 'S', 'W'].flatMap(dir => directionalCount(clue, dir, clue[dir])));

return [shape, ...givens, ...connectivity, ...counts];
