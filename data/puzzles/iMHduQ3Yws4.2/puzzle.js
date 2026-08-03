// Title: June 15, 2023: Pairity
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=iMHduQ3Yws4
// Source: https://tinyurl.com/bdeduuym

// Normal sudoku rules apply.
// Diagonal Consecutive Pairs: each white dot sits at the corner shared by a
// 2x2 block of cells (the payload's `circle` overlays, 0.3-sized white
// circles centred on that corner). Per the rules text, both diagonal pairs
// of cells around the dot -- not the two orthogonal pairs -- must be
// consecutive (differ by 1).

// The 2x2 cell block for each of the puzzle's 12 dots, transcribed from the
// fpuzzles `circle` array in payload order.
const dotBlocks = [
  ['R2C4', 'R2C5', 'R1C4', 'R1C5'],
  ['R3C2', 'R3C3', 'R2C2', 'R2C3'],
  ['R6C1', 'R6C2', 'R5C1', 'R5C2'],
  ['R8C3', 'R8C2', 'R7C3', 'R7C2'],
  ['R8C6', 'R8C5', 'R9C6', 'R9C5'],
  ['R8C7', 'R8C8', 'R7C7', 'R7C8'],
  ['R4C8', 'R4C9', 'R5C8', 'R5C9'],
  ['R2C8', 'R2C7', 'R3C8', 'R3C7'],
  ['R4C5', 'R4C4', 'R3C5', 'R3C4'],
  ['R6C4', 'R6C3', 'R5C4', 'R5C3'],
  ['R6C6', 'R6C5', 'R7C6', 'R7C5'],
  ['R5C6', 'R5C7', 'R4C6', 'R4C7'],
];

// Derive each dot's two diagonal pairs from row/col rather than trusting the
// block's array order: sort the four cells into the corners of the 2x2
// square, then pair (top-left, bottom-right) and (top-right, bottom-left).
function diagonalPairs(block) {
  const cells = block.map(id => ({ id, ...parseCellId(id) }));
  const rows = [...new Set(cells.map(c => c.row))].sort((a, b) => a - b);
  const cols = [...new Set(cells.map(c => c.col))].sort((a, b) => a - b);
  const cellAt = (row, col) =>
    cells.find(c => c.row === row && c.col === col).id;
  return [
    [cellAt(rows[0], cols[0]), cellAt(rows[1], cols[1])],
    [cellAt(rows[0], cols[1]), cellAt(rows[1], cols[0])],
  ];
}

const dotPairs = dotBlocks.flatMap(diagonalPairs);

// Consecutive relation shared by every dot pair (values differ by 1).
const consecutiveKey = Pair.fnToKey((a, b) => a === b + 1 || a === b - 1, 9);

return [
  new Shape('9x9'),

  new Given('R1C1', 3),
  new Given('R1C3', 7),
  new Given('R1C7', 1),
  new Given('R2C6', 9),
  new Given('R3C1', 5),
  new Given('R3C6', 1),
  new Given('R3C9', 3),
  new Given('R4C2', 7),
  new Given('R4C3', 3),
  new Given('R5C5', 5),
  new Given('R6C7', 7),
  new Given('R6C8', 3),
  new Given('R7C1', 7),
  new Given('R7C4', 9),
  new Given('R7C9', 5),
  new Given('R8C4', 1),
  new Given('R9C3', 9),
  new Given('R9C7', 3),
  new Given('R9C9', 7),

  ...dotPairs.map(([a, b]) => new Pair(consecutiveKey, '', a, b)),
];
