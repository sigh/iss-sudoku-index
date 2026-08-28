// Title: Find the Magic!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=6_YLIevtOBA
// Source: https://cracking-the-cryptic.web.app/sudoku/2H3j4HRP9M

// Rules encoded:
// - Normal sudoku: 1-9 once per row, column and box (default Sudoku grid;
//   the payload's regions are the standard 3x3 tiling).
// - Four 3x3 magic squares appear somewhere in the grid: each is nine cells
//   holding 1-9 once, whose 3 rows, 3 columns and 2 diagonals all sum to the
//   same total. Their positions are not given -- finding them is the
//   puzzle's own deduction -- so each of the 49 axis-aligned 3x3 windows
//   gets one location flag, and each flag's Or branch either leaves the
//   window unconstrained or pins the flag and requires the window to be
//   magic (AllDifferent + EqualSum over its 8 lines). A single Sum forces
//   exactly four flags to the "magic" value, matching the stated count.

const GIVENS = [
  // Transcribed from the puzzle's printed grid.
  ['R1C2', 2], ['R1C4', 4], ['R1C5', 1], ['R2C4', 3],
  ['R3C3', 1], ['R3C6', 2], ['R3C9', 5], ['R4C8', 3],
  ['R5C7', 1], ['R6C3', 3], ['R6C5', 2], ['R7C2', 1],
  ['R7C7', 2], ['R8C9', 3], ['R9C1', 5], ['R9C8', 1],
];

const NOT_MAGIC = 1;
const MAGIC = 2;

// The 8 three-cell lines (3 rows, 3 columns, 2 diagonals) of the 3x3 window
// whose top-left corner is (r0, c0).
function windowSegments(r0, c0) {
  const cell = (r, c) => makeCellId(r, c);
  const rows = [0, 1, 2].map(dr => [0, 1, 2].map(dc => cell(r0 + dr, c0 + dc)));
  const cols = [0, 1, 2].map(dc => [0, 1, 2].map(dr => cell(r0 + dr, c0 + dc)));
  const diag1 = [0, 1, 2].map(d => cell(r0 + d, c0 + d));
  const diag2 = [0, 1, 2].map(d => cell(r0 + d, c0 + 2 - d));
  return [...rows, ...cols, diag1, diag2];
}

// One location flag per candidate 3x3 window (7x7 = 49 top-left positions).
const flags = new Var('MG', 'magic-square location flags', 49);

const windowClauses = [];
let flagIndex = 0;
for (let r0 = 1; r0 <= 7; r0++) {
  for (let c0 = 1; c0 <= 7; c0++) {
    flagIndex++;
    const flag = flags.cell(flagIndex);
    const segments = windowSegments(r0, c0);
    const windowCells = segments.slice(0, 3).flat(); // the 3 row-segments cover all 9 cells
    windowClauses.push(new Or([
      new Given(flag, NOT_MAGIC),
      new And([
        new Given(flag, MAGIC),
        new AllDifferent(...windowCells),
        new EqualSum(...segments),
      ]),
    ]));
  }
}

// Exactly four windows are flagged magic: each flag is NOT_MAGIC(1) or
// MAGIC(2) (enforced by the Or branches above), so summing all 49 flags to
// 45*1 + 4*2 = 53 forces exactly four MAGIC flags.
const magicCount = new Sum(53, ...flags.cells());

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  flags,
  ...windowClauses,
  magicCount,
];
