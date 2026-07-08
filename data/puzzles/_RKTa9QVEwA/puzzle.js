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

// Marked cells as [row, col], 0-indexed. Each constrains its own column.
const MARKS = [
  [6, 4], [6, 1], [6, 7], [3, 5], [0, 4],
  [1, 3], [2, 6], [3, 2], [4, 3],
];

const cid = (r, c) => makeCellId(r + 1, c + 1);
const column = (c) => Array.from({ length: 9 }, (_, r) => cid(r, c));

const constraints = [];

// Given digit from the puzzle: marked cell R4C6 = 1.
constraints.push(new Given('R4C6', 1));

// The nine marked cells are a permutation of 1-9.
constraints.push(new AllDifferent(...MARKS.map(([r, c]) => cid(r, c))));

// Self-referential modular rule.
// N=1 (Modular(1) always true) and N=9 (whole-column permutation always
// distinct mod 9) impose nothing, so skip them; keep N=2..8.
for (const [r, c] of MARKS) {
  const m = cid(r, c);
  const col = column(c);
  for (let N = 2; N <= 8; N++) {
    const notN = [];
    for (let v = 1; v <= 9; v++) if (v !== N) notN.push(v);
    constraints.push(new Or([
      new Given(m, ...notN),          // marked cell != N ...
      new Modular(N, ...col),         // ... or column is a Modular(N) line
    ]));
  }
}

return constraints;
