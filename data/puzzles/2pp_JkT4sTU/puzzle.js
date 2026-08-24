// Title: Spider Solitaire Sudoku
// Author: Trevor Tao
// Video: https://www.youtube.com/watch?v=2pp_JkT4sTU
// Source: https://app.crackingthecryptic.com/sudoku/qNDr3fhnBJ

// Normal Sudoku rules apply (default Shape gives row/column/box all-different).
//
// "In each column, any cage of N>=2 cells must contain a run of N consecutive
// digits sorted in descending order, starting from the top." Read top to
// bottom, each cage cell is exactly one less than the cell above it, so this
// is a chain of "descend by exactly 1" relations along each cage (top to
// bottom order matches the cage's cell order in the payload).
//
// "Negative constraint: 8 cannot be immediately above 7 unless both cells are
// in the same cage" generalises to every digit: no column-adjacent pair may
// descend by exactly 1 unless that pair is one of the cage-internal edges
// above. That set of exempt edges is computed from `cages` below rather than
// hand-listed, so it can't drift from the positive constraint.

const shape = new Shape('9x9');

const givens = [
  new Given('R1C2', 4),
  new Given('R1C4', 5),
  new Given('R2C2', 1),
];

// Cages: contiguous vertical (same-column) runs, top to bottom, as drawn.
// (One further metadata entry with no cells is not a real cage.)
const cages = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R3C2', 'R4C2', 'R5C2'],
  ['R6C2', 'R7C2'],
  ['R2C4', 'R3C4'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R1C6', 'R2C6', 'R3C6'],
  ['R4C6', 'R5C6'],
  ['R6C6', 'R7C6'],
  ['R8C6', 'R9C6'],
  ['R1C7', 'R2C7'],
  ['R1C8', 'R2C8', 'R3C8', 'R4C8'],
  ['R5C8', 'R6C8', 'R7C8'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R4C9', 'R5C9'],
];

const descendKey = Pair.fnToKey((a, b) => a - b === 1, shape);
const noDescendKey = Pair.fnToKey((a, b) => a - b !== 1, shape);

const cageRuns = cages.map(
  cells => new Pair(descendKey, 'cage descending run', ...cells));

// Every column-adjacent pair not internal to one of the cages above is
// subject to the negative constraint instead.
const internalEdges = new Set();
for (const cells of cages) {
  for (let i = 0; i + 1 < cells.length; i++) {
    internalEdges.add(`${cells[i]}|${cells[i + 1]}`);
  }
}

const negatives = [];
for (let c = 1; c <= 9; c++) {
  for (let r = 1; r <= 8; r++) {
    const top = makeCellId(r, c);
    const bottom = makeCellId(r + 1, c);
    if (internalEdges.has(`${top}|${bottom}`)) continue;
    negatives.push(new Pair(noDescendKey, 'no forced descent', top, bottom));
  }
}

return [shape, ...givens, ...cageRuns, ...negatives];
