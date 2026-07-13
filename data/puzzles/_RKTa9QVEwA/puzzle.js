// Title: Coldulo
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=_RKTa9QVEwA
// Source: https://sudokupad.app/8spurrnmcc

// Normal sudoku. The nine marked cells (fixed positions) contain 1-9 once each.
// If a marked cell holds N, then in ITS column every vertical run of N
// consecutive cells has remainders 0..N-1 mod N (a complete residue system) --
// i.e. the column is a Modular(N) line. N is the digit in the marked cell, so
// the rule is self-referential: encode it as, for each candidate N,
//   (marked cell != N)  OR  Modular(N) over the whole column.
// Modular(N, col) means "every N consecutive cells differ mod N", which for a
// group of exactly N cells is exactly "remainders 0..N-1 in some order".

// Marked cells as [row, col], 1-indexed. Each constrains its own column.
const MARKS = [
  [7, 5], [7, 2], [7, 8], [4, 6], [1, 5],
  [2, 4], [3, 7], [4, 3], [5, 4],
];

const column = (c) => Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));

// Given digit from the puzzle: marked cell R4C6 = 1.
// The nine marked cells are a permutation of 1-9.
// Self-referential modular rule.
// N=1 (Modular(1) always true) and N=9 (whole-column permutation always
// distinct mod 9) impose nothing, so skip them; keep N=2..8.
return [
  new Shape('9x9'),
  new Given('R4C6', 1),
  new AllDifferent(...MARKS.map(([r, c]) => makeCellId(r, c))),
  ...MARKS.flatMap(([r, c]) => {
    const m = makeCellId(r, c);
    const col = column(c);
    return Array.from({ length: 7 }, (_, n) => {
      const N = n + 2; // N from 2 to 8
      const notN = Array.from({ length: 9 }, (_, v) => v + 1).filter(v => v !== N);
      return new Or([
        new Given(m, ...notN),          // marked cell != N ...
        new Modular(N, ...col),         // ... or column is a Modular(N) line
      ]);
    });
  }),
];
