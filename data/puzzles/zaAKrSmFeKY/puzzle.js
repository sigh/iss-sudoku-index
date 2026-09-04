// Title: Secret Fillomino
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=zaAKrSmFeKY
// Source: https://sudokupad.app/4lmjpoxdxt

// Divide the grid into regions of orthogonally connected cells; each cell
// holds a number equal to the size of its own region, and every number 1-9
// must be present. Cells adjacent to each other -- including diagonally --
// cannot hold consecutive digits. Cells joined by a black dot hold digits in
// a 1:2 ratio (one double the other).
//
// No Sudoku layer here (digits repeat freely along rows/columns), so this is
// a Raw grid whose own digits double as Fillomino region sizes: a cell's
// value already reads as the rule's own "region size" clue, with no extra
// label overlay needed.
//
// The grid holds 45 cells and 1+2+...+9 = 45. So "every number 1-9 present"
// together with the 1-9 digit range forces exactly one region of each size
// 1-9: any repeated size, or a region above size 9, would leave some size
// unplaced while exceeding 45 cells. So each region-size class is asserted as
// a single connected region of exactly its own size.
const shape = new Shape('5x9', '1-9', 'Raw');
const graph = cellGraph(shape);

const regionSizes = Array.from({ length: 9 }, (_, i) => i + 1)
  .map(size => new ConnectedValues('', size, size));

// Anti-consecutive, orthogonal + diagonal. The built-in AntiConsecutive only
// forbids consecutive values on orthogonal pairs, so the diagonal pairs get
// their own Pair using the same predicate. Walking only the down-left and
// down-right step from every cell visits each diagonal pair exactly once.
const notConsecutiveKey = Pair.fnToKey((a, b) => a !== b + 1 && a !== b - 1, shape);
const diagonalPairs = [];
for (const cell of graph.cells()) {
  for (const [dr, dc] of [[1, 1], [1, -1]]) {
    const other = graph.step(cell, dr, dc);
    if (other !== null) {
      diagonalPairs.push(new Pair(notConsecutiveKey, '', cell, other));
    }
  }
}

// Black dots (drawn edge marks, resolved to the grid-cell pair each sits
// between): 1:2 ratio.
const blackDots = [
  new BlackDot('R1C6', 'R1C7'),
  new BlackDot('R2C8', 'R3C8'),
  new BlackDot('R2C1', 'R3C1'),
  new BlackDot('R3C4', 'R4C4'),
];

return [
  shape,
  new AntiConsecutive(),
  ...regionSizes,
  ...diagonalPairs,
  ...blackDots,
];
