// Title: This Sudoku Leaves Us Stunned
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=3FMNh-_FNlk
// Source: https://cracking-the-cryptic.web.app/sudoku/bqmqD4gF9q

// Normal sudoku rules apply: Shape('9x9') gives the row/column/box
// all-different constraints, matching the payload's standard 3x3 box regions.
// Anti-king: cells a chess king's move apart (including diagonal neighbours)
// cannot repeat a digit -> AntiKing().
// Eleven cells each carry a two-digit clue printed in their corner; a clue's
// total is the sum of the digits in every cell a chess knight's move away
// from that clued cell, with repeats allowed in the sum -> one Sum() per
// clue over its knight-move neighbours.

// Clued cells and their printed totals, transcribed from the source
// payload's overlay geometry (each clue's drawn position rounds to the
// single cell it labels).
const clues = [
  ['R1C1', 15],
  ['R1C9', 10],
  ['R9C1', 13],
  ['R9C9', 15],
  ['R3C5', 33],
  ['R5C1', 34],
  ['R5C3', 41],
  ['R5C5', 60],
  ['R5C7', 43],
  ['R5C9', 26],
  ['R7C5', 36],
];

// Chess knight offsets, used to compute every cell a knight's move away from
// a given cell, clipped to the 9x9 board (a clue near an edge has fewer than
// eight knight neighbours).
const KNIGHT_OFFSETS = [
  [1, 2], [1, -2], [-1, 2], [-1, -2],
  [2, 1], [2, -1], [-2, 1], [-2, -1],
];

function knightCells(cellId) {
  const { row, col } = parseCellId(cellId);
  const out = [];
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const r = row + dr, c = col + dc;
    if (r >= 1 && r <= 9 && c >= 1 && c <= 9) out.push(makeCellId(r, c));
  }
  return out;
}

const knightSums = clues.map(
  ([cell, total]) => new Sum(total, ...knightCells(cell)));

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  new AntiKing(),
  ...knightSums,
];
