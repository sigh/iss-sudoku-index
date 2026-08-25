// Title: Flower
// Author: Thomas Occhipinti
// Video: https://www.youtube.com/watch?v=DJyhcfMk9bM
// Source: https://app.crackingthecryptic.com/sudoku/MfTJQdmQ8p

// Standard 9x9 Sudoku: rows, columns, and boxes each hold 1-9 once. R5C5=9
// is given.
const shape = new Shape('9x9');

// Nine 4-cell killer cages, each drawn as a connected orthogonal path (cell
// order below follows that path). Cage digits do not repeat, and along the
// path, orthogonally-neighbouring digits are never consecutive -- both facts
// are stated of "their digits" in one clause ("Cages show the sum of their
// digits, which include no repeats, and no consecutive digits neighbouring
// each other"), so the non-consecutive reading is scoped to each cage's own
// path, not the whole grid.
const cages = [
  [14, ['R3C4', 'R2C4', 'R1C4', 'R1C5']],
  [17, ['R3C6', 'R2C6', 'R2C7', 'R2C8']],
  [30, ['R4C7', 'R4C8', 'R4C9', 'R5C9']],
  [14, ['R6C7', 'R6C8', 'R7C8', 'R8C8']],
  [17, ['R7C6', 'R8C6', 'R9C6', 'R9C5']],
  [22, ['R7C9', 'R8C9', 'R9C9', 'R9C8']],
  [19, ['R7C4', 'R8C4', 'R8C3', 'R8C2']],
  [15, ['R6C3', 'R6C2', 'R6C1', 'R5C1']],
  [15, ['R4C3', 'R4C2', 'R3C2', 'R2C2']],
];

const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, shape);

function isOrthogonalAdjacent(a, b) {
  const A = parseCellId(a);
  const B = parseCellId(b);
  return Math.abs(A.row - B.row) + Math.abs(A.col - B.col) === 1;
}

// Every consecutive pair in a cage's drawn path is orthogonally adjacent (no
// cage bends back on itself), so this covers exactly the path's neighbouring
// pairs.
const cageNonConsecutivePairs = cages.flatMap(([, cells]) =>
  cells.slice(1).flatMap((cell, i) => {
    const prev = cells[i];
    if (!isOrthogonalAdjacent(prev, cell)) {
      throw new Error(`cage cells not adjacent: ${prev} ${cell}`);
    }
    return [[prev, cell]];
  }));

// Knight's-move same-digit restriction, centred on the yellow central box
// (R4-R6, C4-C6): a digit in that box may not repeat a knight's move away,
// wherever the other cell is (the rule's object clause carries no box
// qualifier). Pairs are generated from every central-box cell to every
// knight-reachable cell on the grid, deduplicated.
const CENTRE_BOX = [];
for (let r = 4; r <= 6; r++) for (let c = 4; c <= 6; c++) CENTRE_BOX.push([r, c]);
const KNIGHT_OFFSETS = [
  [1, 2], [1, -2], [2, 1], [2, -1], [-1, 2], [-1, -2], [-2, 1], [-2, -1],
];
const centreKnightPairs = new Map();
for (const [r, c] of CENTRE_BOX) {
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 1 || nr > 9 || nc < 1 || nc > 9) continue;
    const a = makeCellId(r, c);
    const b = makeCellId(nr, nc);
    const key = [a, b].sort().join('-');
    centreKnightPairs.set(key, [a, b]);
  }
}

return [
  shape,
  new Given('R5C5', 9),
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
  ...cageNonConsecutivePairs.map(([a, b]) => new Pair(notConsecutive, 'not consecutive', a, b)),
  ...[...centreKnightPairs.values()].map(([a, b]) => new AllDifferent(a, b)),
];
