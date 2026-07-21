// Title: Knight Box
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=qgZojJmRr3g
// Source: https://sudokupad.app/yao1biwcxx

// Normal Sudoku rules apply. Orthogonal neighbours are non-consecutive.
// Knight-move pairs within the same 3x3 box contain coprime digits.
const graph = cellGraph('9x9');
const coprime = Pair.fnToKey((a, b) => {
  const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
  return gcd(a, b) === 1;
}, 9);

// These four downward offsets generate every undirected knight edge once.
const knightOffsets = [[1, -2], [1, 2], [2, -1], [2, 1]];
const knightPairsInBoxes = graph.cells().flatMap(cell => {
  const {row, col} = parseCellId(cell);
  return knightOffsets.flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other) return [];
    const target = parseCellId(other);
    const sameBox = Math.floor((row - 1) / 3) === Math.floor((target.row - 1) / 3)
      && Math.floor((col - 1) / 3) === Math.floor((target.col - 1) / 3);
    return sameBox ? [new Pair(coprime, 'coprime knight pair', cell, other)] : [];
  });
});

return [
  new Given('R2C5', 9),
  new Given('R4C3', 1),
  new Given('R4C5', 4),
  new Given('R4C7', 8),
  new Given('R5C2', 2),
  new Given('R5C8', 1),
  new AntiConsecutive(),
  ...knightPairsInBoxes,
];
