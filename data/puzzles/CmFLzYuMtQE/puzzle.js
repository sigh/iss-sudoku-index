// Title: PreY
// Author: Fry
// Video: https://www.youtube.com/watch?v=CmFLzYuMtQE
// Source: https://app.crackingthecryptic.com/sudoku/8BjhtTPtHM

// Normal sudoku rules apply (default row/column/box AllDifferent). Both long
// diagonals are drawn in the same colour, so both are "marked": Diagonal(-1)
// is the main diagonal (R1C1-R9C9), Diagonal(1) is the anti-diagonal
// (R1C9-R9C1); each holds no repeated digit. Cells joined by a drawn "X" mark
// sum to 10.
//
// Every marked-diagonal cell points orthogonally outward, in each of the four
// directions, at a distance equal to its own digit; a ray is stopped, and
// points at nothing that far, if it would cross another marked-diagonal cell
// before reaching that distance (the rules text's own worked example on
// R4C4). Every cell holding a 5 must be pointed at by at least one such ray.
//
// The set of (source cell, direction, required digit) triples that could
// point at a given target cell is pure geometry of the two fixed diagonals,
// so it is computed below from the diagonals' own cell lists rather than
// hand-enumerated.

const N = 9;
const mainDiagonal = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => makeCellId(i, i));
const antiDiagonal = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => makeCellId(i, N + 1 - i));
const diagonalCellSet = new Set([...mainDiagonal, ...antiDiagonal]);

const inBounds = (r, c) => r >= 1 && r <= N && c >= 1 && c <= N;
const isDiagonalRC = (r, c) => diagonalCellSet.has(makeCellId(r, c));
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right

// pointers[targetCellId] = every [sourceCellId, requiredValue] whose ray
// (source's own digit == requiredValue) would reach targetCellId unblocked.
const pointers = {};
for (const sourceId of diagonalCellSet) {
  const { row: r, col: c } = parseCellId(sourceId);
  for (const [dr, dc] of DIRECTIONS) {
    for (let v = 1; v <= 9; v++) {
      const tr = r + dr * v, tc = c + dc * v;
      if (!inBounds(tr, tc)) continue;
      let blocked = false;
      for (let d = 1; d < v; d++) {
        if (isDiagonalRC(r + dr * d, c + dc * d)) { blocked = true; break; }
      }
      if (blocked) continue;
      const targetId = makeCellId(tr, tc);
      (pointers[targetId] ||= []).push([sourceId, v]);
    }
  }
}

const NOT_FIVE = [1, 2, 3, 4, 6, 7, 8, 9];
const graph = cellGraph('9x9');

// Every cell either isn't 5, or one of the sources that could point at it
// (per the geometry above) actually holds the digit that makes it do so. A
// cell with no possible pointer at all (only R5C5, the diagonals' shared
// centre: no other cell shares both its row and column with a diagonal cell)
// can simply never be a 5.
const everyFiveIsPointedAt = graph.cells().map(cellId => {
  const candidates = pointers[cellId] || [];
  if (candidates.length === 0) return new Given(cellId, ...NOT_FIVE);
  return new Or([
    new Given(cellId, ...NOT_FIVE),
    ...candidates.map(([source, v]) => new Given(source, v)),
  ]);
});

// Drawn "X" marks: each is one orthogonally-adjacent pair summing to 10.
const xPairs = [
  ['R2C3', 'R2C4'], ['R1C8', 'R1C9'], ['R2C8', 'R2C9'], ['R3C7', 'R3C8'],
  ['R7C8', 'R7C9'], ['R8C9', 'R9C9'], ['R9C7', 'R9C8'], ['R7C3', 'R7C4'],
  ['R5C2', 'R6C2'], ['R5C3', 'R5C4'], ['R6C4', 'R6C5'], ['R3C5', 'R4C5'],
  ['R4C6', 'R5C6'],
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...everyFiveIsPointedAt,
];
