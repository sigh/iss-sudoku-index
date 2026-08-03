// Title: Momentary Bliss
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=fI46Yf_Zug8
// Source: https://tinyurl.com/2wam7vmw
//
// Normal sudoku rules apply. Digits in cages must sum to the small corner
// total (distinct digits within each cage). Cells with a grey square hold an
// even digit; cells with a grey circle hold an odd digit. There is no `Odd`/
// `Even` class, so each such cell is encoded as a multi-value Given
// restricting it to the allowed parity's candidates.

// Killer cages -- cells and totals transcribed from the `killercage` array.
const cages = [
  ['R1C1', 'R1C2', 6],
  ['R9C8', 'R9C9', 14],
  ['R2C2', 'R2C3', 12],
  ['R8C7', 'R8C8', 8],
  ['R1C9', 'R2C9', 14],
  ['R8C1', 'R9C1', 6],
  ['R7C2', 'R8C2', 7],
  ['R2C8', 'R3C8', 13],
  ['R3C3', 'R3C4', 15],
  ['R7C6', 'R7C7', 5],
  ['R6C3', 'R7C3', 13],
  ['R3C7', 'R4C7', 7],
  ['R5C4', 'R6C4', 14],
  ['R4C6', 'R5C6', 10],
  ['R6C5', 'R6C6', 8],
  ['R4C4', 'R4C5', 5],
].map(([a, b, total]) => new Cage(total, a, b));

// Odd cells (grey circle), transcribed from the `odd` array.
const oddCells = ['R1C1', 'R3C3', 'R2C8', 'R4C6', 'R6C4', 'R8C2', 'R7C7', 'R9C9'];
// Even cells (grey square), transcribed from the `even` array.
const evenCells = ['R2C2', 'R4C4', 'R8C8', 'R6C6', 'R7C3', 'R9C1', 'R3C7', 'R1C9'];

const oddGivens = oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9));
const evenGivens = evenCells.map((cell) => new Given(cell, 2, 4, 6, 8));

return [
  new Shape('9x9'),
  ...cages,
  ...oddGivens,
  ...evenGivens,
];
