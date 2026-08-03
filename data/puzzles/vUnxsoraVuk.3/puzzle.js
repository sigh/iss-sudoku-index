// Title: July 19, 23: SymSum Antiknight
// Author: clover!
// Video: https://www.youtube.com/watch?v=vUnxsoraVuk
// Source: https://tinyurl.com/bdeczdjw

// Rules:
// Normal sudoku rules apply.
// Antiknight: cells a knight's move apart do not share a digit.
// SymSum: cells related by 180 degree rotation about the grid centre
// (r,c) <-> (10-r, 10-c) sum to 10.

// R5C5 maps to itself under the 180 degree rotation, so the SymSum rule
// applied to it reads value + value = 10, forcing R5C5 = 5. That is a
// direct arithmetic consequence of the stated rule at its one fixed point,
// not a puzzle deduction, so it is encoded as a Given rather than left to
// a degenerate self-paired Pair.
const CENTER_GIVEN = new Given('R5C5', 5);

// Sum-to-10 relation used for every other SymSum pair.
const SUM_TO_10 = Pair.fnToKey((a, b) => a + b === 10, 9);

// One Pair per rotationally-opposite cell pair, deduped by comparing cell
// ids so each of the 40 pairs (all 81 cells except the R5C5 fixed point)
// is only emitted once.
const symSumPairs = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    const cell = makeCellId(row, col);
    const partner = makeCellId(10 - row, 10 - col);
    if (cell < partner) {
      symSumPairs.push(new Pair(SUM_TO_10, 'SymSum', cell, partner));
    }
  }
}

return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's grid array.
  new Given('R1C1', 2),
  new Given('R1C2', 3),
  new Given('R2C1', 1),
  new Given('R3C6', 1),
  new Given('R3C9', 4),
  new Given('R4C4', 2),
  new Given('R4C5', 4),
  new Given('R5C4', 3),
  new Given('R5C8', 2),
  new Given('R6C3', 9),
  new Given('R7C7', 4),
  new Given('R7C8', 5),
  new Given('R8C5', 7),
  new Given('R8C7', 3),
  new Given('R9C3', 4),

  new AntiKnight(),

  CENTER_GIVEN,
  ...symSumPairs,
];
