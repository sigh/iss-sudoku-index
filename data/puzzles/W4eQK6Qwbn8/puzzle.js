// Title: T-Time
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=W4eQK6Qwbn8
// Source: https://app.crackingthecryptic.com/sudoku/gg2DBR7nRQ

// Normal sudoku, anti-knight, killer cages (top-left total, all-different
// within a cage is redundant here since every cage lies in one row/column),
// and 6 T-shaped Renban lines.
//
// Each T-shape is drawn as two stroke entries (a 3-cell straight segment and
// a 1-cell stub) sharing the same colour/thickness, with the stub's outer
// endpoint landing exactly on the segment's middle waypoint -- a branch
// point, not two lines that merely touch. That makes each T one connected
// 4-cell Renban clue rather than an independent 3-cell and 2-cell line.

const cages = [
  new Cage(13, 'R3C2', 'R4C2'),
  new Cage(12, 'R7C6', 'R7C7'),
  new Cage(13, 'R7C5', 'R8C5', 'R9C5'),
  new Cage(9, 'R7C8', 'R8C8', 'R9C8'),
];

const renbanTs = [
  new Renban('R1C2', 'R2C1', 'R2C2', 'R2C3'),
  new Renban('R1C5', 'R2C4', 'R2C5', 'R2C6'),
  new Renban('R1C8', 'R2C7', 'R2C8', 'R2C9'),
  new Renban('R5C1', 'R5C2', 'R5C3', 'R6C2'),
  new Renban('R5C4', 'R5C5', 'R5C6', 'R6C5'),
  new Renban('R5C7', 'R5C8', 'R5C9', 'R6C8'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
  ...renbanTs,
];
