// Title: The 'Not So Simple' Miracle!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=mRtzcjaCntQ
// Source: https://sudokupad.app/kvqrdqgrr2

// Normal sudoku rules apply (standard 3x3 boxes; no non-standard regions).
// Two adjacent digits on a purple line must have consecutive values: each
// purple line is a run of cells that are diagonal neighbours (not grid
// neighbours), so the relation is expressed with one Pair per line, in the
// line's own cell order, rather than WhiteDot (which only links orthogonally
// adjacent cells).
// Two cells a single knight's move apart cannot contain the same digit.

const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);

return [
  new Shape('9x9'),

  new Given('R4C6', 6),
  new Given('R6C5', 8),

  new AntiKnight(),

  new Pair(consecutiveKey, 'purple consecutive', 'R4C1', 'R3C2', 'R2C3', 'R1C4'),
  new Pair(consecutiveKey, 'purple consecutive', 'R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'),
  new Pair(consecutiveKey, 'purple consecutive', 'R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'),
  new Pair(consecutiveKey, 'purple consecutive', 'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'),
  new Pair(consecutiveKey, 'purple consecutive', 'R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'),
  new Pair(consecutiveKey, 'purple consecutive', 'R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'),
  new Pair(consecutiveKey, 'purple consecutive', 'R9C6', 'R8C7', 'R7C8', 'R6C9'),
];
