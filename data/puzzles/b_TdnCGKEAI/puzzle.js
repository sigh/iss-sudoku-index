// Title: Foggy Ninefield
// Author: Albin Bernhardsson
// Video: https://www.youtube.com/watch?v=b_TdnCGKEAI
// Source: https://app.crackingthecryptic.com/sudoku/gphj7LF93b

// Standard 9x9 sudoku (rows, columns, 3x3 boxes). Fog/reveal is solving UI,
// not encoded. Killer cages: distinct digits summing to the shown total.
// "All cells which correctly show the number of adjacent nines (including
// diagonally) are marked with circles" is a two-way rule: a circled cell's
// digit equals the count of 9s among its up-to-8 king-move neighbours, and
// every uncircled cell's digit does NOT equal that count.

const graph = cellGraph('9x9');

// Killer cages, drawn total in the uppermost-leftmost cell.
const cages = [
  [39, 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8', 'R2C7', 'R3C9'],
  [45, 'R2C2', 'R3C2', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R3C5', 'R2C5', 'R2C6'],
  [15, 'R4C7', 'R4C8', 'R4C9'],
  [28, 'R5C7', 'R6C7', 'R7C7', 'R7C8', 'R6C8', 'R7C9'],
  [12, 'R6C6', 'R6C5', 'R7C5', 'R8C5'],
  [7, 'R7C6', 'R8C7', 'R8C6'],
  [22, 'R8C9', 'R8C8', 'R9C8', 'R9C7', 'R9C6'],
  [23, 'R7C4', 'R8C4', 'R8C3'],
  [14, 'R7C1', 'R7C2', 'R7C3'],
  [13, 'R8C2', 'R9C2', 'R9C3'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

// Circled cells (drawn as single-cell white circle underlays).
const circled = ['R2C4', 'R4C6', 'R1C8', 'R9C1', 'R8C9'];
const circledSet = new Set(circled);
const uncircled = graph.cells().filter(cell => !circledSet.has(cell));

// Per-cell NFA: reads the cell's own digit first (sets `target`), then each
// king-move neighbour's digit, counting how many equal 9. Both machines clamp
// the running count once it passes the target, since it can then never come
// back down to equal it -- this bounds compiled state independent of how many
// neighbours a cell has. `equalMachine` accepts iff the final count equals
// the cell's digit (circled cells); `notEqualMachine` accepts iff it does not
// (every other cell).
const equalMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 }; // the cell's own digit
    const next = count + (value === 9 ? 1 : 0);
    // Already too many nines seen: can never equal the target again -- reject.
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);
const notEqualMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    if (count === null) return { target, count: null }; // already settled not-equal
    const next = count + (value === 9 ? 1 : 0);
    // Already too many nines seen: can never equal the target again, so this
    // cell is already guaranteed not-equal -- absorb the rest without tracking.
    return { target, count: next > target ? null : next };
  },
  accept: ({ target, count }) => target !== null && count !== target,
}, 9);

const circleCounts = [
  ...circled.map(cell =>
    new NFA(equalMachine, 'nine-count-eq', cell, ...graph.kingNeighbours(cell))),
  ...uncircled.map(cell =>
    new NFA(notEqualMachine, 'nine-count-neq', cell, ...graph.kingNeighbours(cell))),
];

return [
  new Shape('9x9'),
  ...cages,
  ...circleCounts,
];
