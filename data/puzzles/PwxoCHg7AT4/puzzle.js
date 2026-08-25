// Title: Diagonally Consecutive Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=PwxoCHg7AT4
// Source: https://sudokupad.app/Pf34pB3Rd8

// Normal sudoku rules apply (default rows/cols/boxes from Shape('9x9')).
// "All pairs of consecutive digits that are in the cells sharing a corner
// are marked with a grey line" is an exhaustiveness clause: every
// diagonally-adjacent (corner-sharing) cell pair either carries a grey line
// and holds consecutive digits, or carries no line and does not hold
// consecutive digits. The 4 drawn grey lines are the positive case; every
// other diagonal pair in the grid gets the negative case.

const graph = cellGraph('9x9');

const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

// Drawn grey lines (source: `lines`), each joining two diagonally-adjacent
// cells: the positive case, consecutive digits.
const diagonalConsecutive = [
  new Pair(consecutiveKey, 'diagonal consecutive', 'R2C3', 'R3C2'),
  new Pair(consecutiveKey, 'diagonal consecutive', 'R2C7', 'R3C8'),
  new Pair(consecutiveKey, 'diagonal consecutive', 'R7C2', 'R8C3'),
  new Pair(consecutiveKey, 'diagonal consecutive', 'R7C8', 'R8C7'),
];

// The top cell of each marked pair, split by which diagonal direction it
// marks (down-right vs down-left), so the negative case below can exclude
// exactly those from its own two templates.
const downRightMarkedStarts = new Set(['R2C7', 'R7C2']);
const downLeftMarkedStarts = new Set(['R2C3', 'R7C8']);

// Every other diagonal (corner-sharing) domino's top cell, derived from the
// grid geometry rather than hand-enumerated: down-right dominoes
// (cell, step(1,1)) and down-left dominoes (cell, step(1,-1)).
const downRightStarts = [];
const downLeftStarts = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    if (graph.step(cell, 1, 1) && !downRightMarkedStarts.has(cell)) {
      downRightStarts.push(cell);
    }
    if (graph.step(cell, 1, -1) && !downLeftMarkedStarts.has(cell)) {
      downLeftStarts.push(cell);
    }
  }
}

// Negative case: every unmarked diagonal domino must not hold consecutive
// digits. One Replicate per direction shifts a single-domino template onto
// every qualifying start cell. The down-right template's own origin is the
// grid's first cell, so graph.makeReplicate() applies directly.
const diagonalNotConsecutive = [
  graph.makeReplicate(
    [new Pair(notConsecutiveKey, 'diagonal not consecutive', 'R1C1', 'R2C2')],
    downRightStarts),
  // down-left needs a template whose second cell is up-left of the first
  // (R2C1 from R1C2), which cannot be re-based at R1C1 (there is no column
  // to its left), so it needs its own origin rather than
  // graph.makeReplicate()'s fixed grid-corner origin.
  // lint-ok: bare-replicate-constructor
  new Replicate(
    [new Pair(notConsecutiveKey, 'diagonal not consecutive', 'R1C2', 'R2C1')],
    Replicate.encodeTargetCells(downLeftStarts, 'R1C2', graph),
    'R1C2'),
];

return [
  new Shape('9x9'),

  new Given('R1C2', 6), new Given('R1C8', 3),
  new Given('R2C1', 2), new Given('R2C9', 8),
  new Given('R3C4', 4), new Given('R3C6', 7),
  new Given('R4C3', 2), new Given('R4C7', 9),
  new Given('R5C5', 5),
  new Given('R6C3', 5), new Given('R6C7', 1),
  new Given('R7C4', 1), new Given('R7C6', 4),
  new Given('R8C1', 5), new Given('R8C9', 9),
  new Given('R9C2', 7), new Given('R9C8', 2),

  ...diagonalConsecutive,
  ...diagonalNotConsecutive,
];
