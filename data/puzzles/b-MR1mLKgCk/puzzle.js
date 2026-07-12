// Title: Battenburg Little Killer Sudoku
// Author: Switzerland
// Video: https://www.youtube.com/watch?v=b-MR1mLKgCk
// Source: https://sudokupad.app/zfxcjkmghx

// Normal sudoku rules apply.
//
// Battenburg: wherever 2 odd and 2 even digits form a 2x2 chessboard pattern
// (diagonally opposite cells share parity, and the two diagonals have
// different parities), a Battenburg marking is given. If there is no marking,
// that 2x2 pattern is not allowed there. This is checked at every 2x2
// intersection in the grid: marked ones must show the pattern, all others
// must not.
//
// Little killer: each clue outside the grid gives the sum of the digits
// along the indicated diagonal.

const givens = [
  ['R2C4', 8], ['R3C2', 1], ['R4C8', 1],
  ['R5C1', 8], ['R5C5', 7], ['R5C9', 6],
  ['R6C2', 9], ['R7C8', 7], ['R8C6', 4],
];

const littleKillers = [
  [['R1C2', 'R2C1'], 6],
  [['R1C3', 'R2C2', 'R3C1'], 20],
  [['R7C1', 'R8C2', 'R9C3'], 10],
  [['R8C1', 'R9C2'], 10],
  [['R9C8', 'R8C9'], 6],
  [['R9C7', 'R8C8', 'R7C9'], 17],
  [['R2C9', 'R1C8'], 6],
  [['R3C9', 'R2C8', 'R1C7'], 24],
];

const geometry = cellGeometry('9x9');

// Top-left cell of each 2x2 intersection that has a Battenburg marking.
const battenburgMarked = new Set([
  'R1C1', 'R1C8', 'R6C3', 'R3C3', 'R3C6', 'R6C6', 'R8C1', 'R8C8',
]);

// NFA reading a 2x2 block in order [TL, TR, BL, BR]. `mustMatch` selects
// whether the machine accepts the chessboard-parity pattern (marked
// intersection) or rejects it (unmarked intersection).
const battenburgNFA = (mustMatch) => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (s, value) => {
    const parity = value % 2;
    if (s.i === 0) return { i: 1, pTL: parity };
    if (s.i === 1) return { i: 2, pTL: s.pTL, pTR: parity };
    if (s.i === 2) return { i: 3, pTL: s.pTL, pTR: s.pTR, pBL: parity };
    // i === 3: final cell (BR).
    const isChecker = (s.pTL === parity) && (s.pTR === s.pBL) && (s.pTL !== s.pTR);
    return { i: 4, isChecker };
  },
  accept: (s) => s.i === 4 && (s.isChecker === mustMatch),
}, 9);

const battenburgMatchNFA = battenburgNFA(true);
const battenburgNoMatchNFA = battenburgNFA(false);

const constraints = [];

for (const [cell, val] of givens) constraints.push(new Given(cell, val));

for (const [cells, total] of littleKillers) {
  constraints.push(LittleKiller.fromCells(total, cells, geometry));
}

// Battenburg-marked intersections: only 8 of them, so they stay as individual
// NFA constraints (Replicate is not worth it below that count).
for (let row = 1; row <= 8; row++) {
  for (let col = 1; col <= 8; col++) {
    const tl = makeCellId(row, col);
    if (!battenburgMarked.has(tl)) continue;
    constraints.push(new NFA(
      battenburgMatchNFA, 'Battenburg',
      tl, makeCellId(row, col + 1),
      makeCellId(row + 1, col), makeCellId(row + 1, col + 1)));
  }
}

// Battenburg-unmarked intersections: 56 shifted copies of the same 2x2
// template (same relative TL/TR/BL/BR offsets everywhere), so replicate them
// from the first unmarked corner instead of stamping each one by hand.
const graph = cellGraph('9x9');
const noBattenburgOrigin = 'R1C2';
const noBattenburgTargets = [];
for (let row = 1; row <= 8; row++) {
  for (let col = 1; col <= 8; col++) {
    const tl = makeCellId(row, col);
    if (!battenburgMarked.has(tl)) noBattenburgTargets.push(tl);
  }
}
constraints.push(new Replicate(
  [new NFA(
    battenburgNoMatchNFA, 'NoBattenburg',
    noBattenburgOrigin, makeCellId(1, 3), makeCellId(2, 2), makeCellId(2, 3))],
  Replicate.encodeTargetCells(noBattenburgTargets, noBattenburgOrigin, graph),
  noBattenburgOrigin));

return constraints;
