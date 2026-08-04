// Title: Pair Up Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=5i7-TPXuGBA
// Source: https://tinyurl.com/bjwd4s39

// Normal sudoku rules apply. R1C1..R9C9 (the main diagonal) are given 1..9.
// A cell carrying a drawn arrow holds digit N; counting N cells from that
// cell in the arrow's drawn direction reaches a cell whose digit is 10-N
// ("the sum of the Nth digit in the direction of the arrow and that digit N
// is always 10"). Only the 15 drawn arrows carry this rule -- "not all
// possible arrows are given" says the same relation is not implied at every
// other cell. Where the arrow sits close enough to the grid edge that some N
// would have no Nth cell in that direction, the rule (stated to always hold)
// cannot be satisfied by that N, so the arrow cell's candidates are
// restricted to the N that do reach an on-grid cell.

const givens = [];
for (let i = 1; i <= 9; i++) givens.push(new Given(makeCellId(i, i), i));

// Arrow cells and directions, transcribed from the drawn down / right / up /
// left arrow glyphs.
const DIRS = { D: [1, 0], R: [0, 1], U: [-1, 0], L: [0, -1] };
const arrows = [
  ['R1C1', 'D'], ['R3C3', 'D'], ['R7C1', 'D'], ['R7C4', 'D'],
  ['R1C2', 'R'], ['R2C2', 'R'], ['R2C3', 'R'], ['R4C4', 'R'],
  ['R5C1', 'R'], ['R6C2', 'R'], ['R1C7', 'R'],
  ['R5C6', 'U'], ['R5C9', 'U'], ['R8C6', 'U'],
  ['R9C5', 'L'],
];

const arrowConstraints = arrows.flatMap(([cellId, dir]) => {
  const [dr, dc] = DIRS[dir];
  const { row, col } = parseCellId(cellId);

  // How many cells remain on-grid in this direction from the arrow cell.
  let maxN = 0;
  while (maxN < 9) {
    const r = row + dr * (maxN + 1), c = col + dc * (maxN + 1);
    if (r < 1 || r > 9 || c < 1 || c > 9) break;
    maxN++;
  }

  // Restrict the arrow cell to values whose Nth cell actually exists.
  const domain = new Given(
    cellId, ...Array.from({ length: maxN }, (_, i) => i + 1));

  // For each reachable N, "arrow cell = N" implies "Nth cell = 10-N".
  const pairs = [];
  for (let n = 1; n <= maxN; n++) {
    const target = makeCellId(row + dr * n, col + dc * n);
    const key = Pair.fnToKey((a, b) => a !== n || b === 10 - n, 9);
    pairs.push(new Pair(key, `arrow N=${n} @ ${cellId}`, cellId, target));
  }

  return [domain, ...pairs];
});

return [
  new Shape('9x9'),
  ...givens,
  ...arrowConstraints,
];
