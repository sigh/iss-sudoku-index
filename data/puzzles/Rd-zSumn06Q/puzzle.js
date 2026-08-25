// Title: When Pac-Man Played Chess
// Author: TheNovice
// Video: https://www.youtube.com/watch?v=Rd-zSumn06Q
// Source: https://app.crackingthecryptic.com/webapp/GbRtL4nmHQ

// Normal sudoku rules apply, with the default 9 standard 3x3 boxes.
// The grid is a torus: each row and column wraps around (R1C1 is
// orthogonally adjacent to R1C9 and to R9C1), and knight/king moves wrap the
// same way on both axes independently.
//   - No two cells a toroidal knight's move apart may hold the same digit
//     when that digit is odd.
//   - No two cells a toroidal king's move apart may hold the same digit when
//     that digit is even.
// The coloured underlay cells are decorative ("The coloured cells can be
// ignored") and add no constraint.

const givens = [
  ['R1C4', 3], ['R1C5', 1], ['R1C6', 9],
  ['R2C3', 3], ['R2C7', 7],
  ['R3C2', 6], ['R3C8', 9],
  ['R4C1', 8], ['R4C4', 4], ['R4C7', 6],
  ['R5C1', 9], ['R5C6', 1],
  ['R6C1', 2], ['R6C4', 8], ['R6C7', 9],
  ['R7C2', 7], ['R7C8', 6],
  ['R8C3', 8], ['R8C7', 1],
  ['R9C4', 6], ['R9C5', 7], ['R9C6', 8],
]; // The 22 printed givens, transcribed from the puzzle grid (1-indexed cells).

const N = 9;
const mod = (x, n) => ((x % n) + n) % n;
const step = (index, dr, dc) => {
  const r = Math.floor(index / N), c = index % N;
  return mod(r + dr, N) * N + mod(c + dc, N);
};

// One representative offset per undirected pair: the other half of each
// knight/king move set is just these negated, which would re-list the same
// pair from the far cell.
const KNIGHT_OFFSETS = [[1, 2], [1, -2], [2, 1], [2, -1]];
const KING_OFFSETS = [[0, 1], [1, -1], [1, 0], [1, 1]];

// A fixed toroidal offset is a permutation of the 81 cells; it decomposes
// into disjoint cycles (here: nine 9-cycles per offset). Listing one cycle's
// cells in order and closing the loop (repeating the start) makes every
// step-apart pair in that cycle a consecutive pair in the list -- the same
// closed-loop convention as a wrapped line constraint -- so one Pair per
// cycle covers the whole offset instead of one Pair per edge.
function offsetCycles(dr, dc) {
  const seen = new Array(N * N).fill(false);
  const cycles = [];
  for (let start = 0; start < N * N; start++) {
    if (seen[start]) continue;
    const cycle = [start];
    seen[start] = true;
    for (let cur = step(start, dr, dc); cur !== start; cur = step(cur, dr, dc)) {
      seen[cur] = true;
      cycle.push(cur);
    }
    cycles.push(cycle);
  }
  return cycles;
}

function cyclesToCells(cycles) {
  return cycles.map(cycle => {
    const cells = cycle.map(i => makeCellId(Math.floor(i / N) + 1, (i % N) + 1));
    return [...cells, cells[0]]; // close the loop
  });
}

// Same digit forbidden only when odd (knight) / even (king); different
// digits, or a same digit of the other parity, are unrestricted.
const knightKey = Pair.fnToKey((a, b) => !(a === b && a % 2 === 1), 9);
const kingKey = Pair.fnToKey((a, b) => !(a === b && a % 2 === 0), 9);

const knightConstraints = KNIGHT_OFFSETS.flatMap(([dr, dc]) =>
  cyclesToCells(offsetCycles(dr, dc)).map(
    cells => new Pair(knightKey, 'Toroidal odd-knight', ...cells)));
const evenParityConstraints = KING_OFFSETS.flatMap(([dr, dc]) =>
  cyclesToCells(offsetCycles(dr, dc)).map(
    cells => new Pair(kingKey, 'Toroidal even-king', ...cells)));

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...knightConstraints,
  ...evenParityConstraints,
];
