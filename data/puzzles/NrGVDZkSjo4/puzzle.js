// Title: The Night Queen
// Author: Unknown
// Video: https://www.youtube.com/watch?v=NrGVDZkSjo4
// Source: https://cracking-the-cryptic.web.app/sudoku/6gP8rM3ThH

// Normal Sudoku rules apply (standard 3x3 boxes). A banner below the grid
// reads "Even digits = Queens; Odd digits = Knights.": two cells a chess
// queen's move apart cannot hold the same even digit, and two cells a chess
// knight's move apart cannot hold the same odd digit.

// Same-row and same-column pairs already can't repeat any digit under
// standard Sudoku, so the queen rule's only extra bite is on diagonals; walk
// every diagonal of both slopes and forbid a repeated even digit along it.
const noSameEven = PairX.fnToKey((a, b) => !(a === b && a % 2 === 0), 9);
function diagonal(row, col, rowStep, colStep) {
  const cells = [];
  while (row >= 1 && row <= 9 && col >= 1 && col <= 9) {
    cells.push(makeCellId(row, col));
    row += rowStep;
    col += colStep;
  }
  return cells;
}
const queenDiagonals = (() => {
  const diagonals = [];
  for (let startCol = 1; startCol <= 9; startCol++) {
    diagonals.push(diagonal(1, startCol, 1, 1));
    diagonals.push(diagonal(1, startCol, 1, -1));
  }
  for (let startRow = 2; startRow <= 9; startRow++) {
    diagonals.push(diagonal(startRow, 1, 1, 1));
    diagonals.push(diagonal(startRow, 9, 1, -1));
  }
  return diagonals.filter(cells => cells.length >= 2);
})();

// Knight's-move pairs, each forbidden a repeated odd digit. An L-shaped
// offset and its 180-degree opposite generate the same undirected pair, so
// only the four offsets with a positive row delta are needed to cover every
// pair once; each is replicated over every grid cell where it fits.
const noSameOdd = Pair.fnToKey((a, b) => !(a === b && a % 2 === 1), 9);
const graph = cellGraph('9x9');
const knightOffsets = [[1, 2], [1, -2], [2, 1], [2, -1]];
const knightPairs = knightOffsets.map(([dr, dc]) => {
  const originRow = dr < 0 ? 1 - dr : 1;
  const originCol = dc < 0 ? 1 - dc : 1;
  const origin = makeCellId(originRow, originCol);
  const partner = makeCellId(originRow + dr, originCol + dc);
  const targets = [];
  for (let row = 1; row <= 9; row++) {
    for (let col = 1; col <= 9; col++) {
      const r2 = row + dr, c2 = col + dc;
      if (r2 >= 1 && r2 <= 9 && c2 >= 1 && c2 <= 9) targets.push(makeCellId(row, col));
    }
  }
  return new Replicate(
    [new Pair(noSameOdd, 'anti-knight odd', origin, partner)],
    Replicate.encodeTargetCells(targets, origin, graph), origin,
  );
});

return [
  new Shape('9x9'),
  // Givens transcribed from the grid.
  new Given('R1C4', 9), new Given('R1C6', 4),
  new Given('R3C2', 2), new Given('R3C3', 4), new Given('R3C7', 6), new Given('R3C8', 1),
  new Given('R4C4', 1), new Given('R4C6', 3),
  new Given('R6C4', 7), new Given('R6C6', 5),
  new Given('R7C2', 4), new Given('R7C3', 2), new Given('R7C7', 3), new Given('R7C8', 6),
  new Given('R9C4', 3), new Given('R9C6', 1),
  ...queenDiagonals.map(cells => new PairX(noSameEven, 'anti-queen even', ...cells)),
  ...knightPairs,
];
