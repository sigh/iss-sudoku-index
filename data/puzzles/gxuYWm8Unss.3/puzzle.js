// Title: Oct. 22, 2023: Botez Gambit
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=gxuYWm8Unss
// Source: https://tinyurl.com/4fsapphy

// Normal Sudoku rules apply. A chess-queen move may not connect two 5s; normal
// Sudoku already handles ranks and files, so these pairs cover both diagonal slopes.
const graph = cellGraph('9x9');
const noTwoFives = Pair.fnToKey((a, b) => a !== 5 || b !== 5, 9);
const antiQueen = [1, -1].flatMap((deltaColumn) =>
  Array.from({ length: 8 }, (_, index) => {
    const distance = index + 1;
    const startColumn = deltaColumn === 1 ? 1 : distance + 1;
    const firstColumn = deltaColumn === 1 ? 1 : distance + 1;
    const lastColumn = deltaColumn === 1 ? 9 - distance : 9;
    const origin = makeCellId(1, startColumn);
    const partner = makeCellId(1 + distance, startColumn + deltaColumn * distance);
    const targets = [];
    for (let row = 1; row <= 9 - distance; row++) {
      for (let column = firstColumn; column <= lastColumn; column++) {
        targets.push(makeCellId(row, column));
      }
    }
    // lint-ok: bare-replicate-constructor -- each template origin depends on its slope.
    return new Replicate(
      [new Pair(noTwoFives, 'anti-queen 5s', origin, partner)],
      Replicate.encodeTargetCells(targets, origin, graph), origin,
    );
  }));

return [
  new Shape('9x9'),
  // Givens transcribed from the source grid.
  new Given('R1C1', 1), new Given('R1C3', 2), new Given('R1C7', 3),
  new Given('R2C2', 3), new Given('R2C4', 1), new Given('R2C8', 2),
  new Given('R3C1', 4), new Given('R3C3', 5), new Given('R3C9', 1),
  new Given('R4C5', 3), new Given('R4C8', 1),
  new Given('R5C4', 4), new Given('R5C6', 5),
  new Given('R6C2', 9), new Given('R6C5', 6),
  new Given('R7C1', 9), new Given('R7C7', 8), new Given('R7C9', 7),
  new Given('R8C2', 8), new Given('R8C6', 7), new Given('R8C8', 6),
  new Given('R9C3', 7), new Given('R9C7', 5), new Given('R9C9', 4),
  // Every distance and diagonal slope is replicated over its in-grid starting cells.
  ...antiQueen,
];
