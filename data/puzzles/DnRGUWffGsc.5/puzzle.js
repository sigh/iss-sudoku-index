// Title: Benediction
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=DnRGUWffGsc
// Source: https://tinyurl.com/2p87n567

// Normal sudoku rules apply.
//
// Blue squares: each of the four lavender 3x3 blocks is a magic square --
// it contains the digits 1-9 (no repeats) and its 3 rows, 3 columns, and 2
// main diagonals all sum to one common (undrawn) total. Two of the four
// blocks (A and D below) coincide with sudoku boxes 3 and 7, so their
// all-different is already implied by the baseline box rule; the other two
// (B and C) span three different sudoku boxes each and need an explicit
// all-different below.

const givens = [
  new Given('R1C3', 1),
  new Given('R2C2', 2),
  new Given('R2C6', 7),
  new Given('R4C6', 2),
  new Given('R6C4', 8),
  new Given('R8C4', 3),
  new Given('R8C8', 8),
  new Given('R9C7', 9),
];

// Blue magic-square blocks, transcribed from the drawn lavender shading,
// row-major within each 3x3 block. A and D are sudoku boxes 3 and 7; B and
// C are not box-aligned.
const magicSquareCells = {
  A: ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'],
  B: ['R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4', 'R5C2', 'R5C3', 'R5C4'],
  C: ['R5C6', 'R5C7', 'R5C8', 'R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8'],
  D: ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
};
const boxAlignedBlocks = new Set(['A', 'D']);

// For a row-major 3x3 block, build its 3 rows, 3 columns, and 2 main
// diagonals as EqualSum segments, and pair that with the block's
// all-different-9 requirement (only added where not already implied by a
// baseline sudoku box).
function magicSquareConstraints(key, cells) {
  const rows = [cells.slice(0, 3), cells.slice(3, 6), cells.slice(6, 9)];
  const cols = [0, 1, 2].map(c => [cells[c], cells[c + 3], cells[c + 6]]);
  const diagonals = [
    [cells[0], cells[4], cells[8]],
    [cells[2], cells[4], cells[6]],
  ];
  return [
    new EqualSum(...rows, ...cols, ...diagonals),
    ...(boxAlignedBlocks.has(key) ? [] : [new AllDifferent(...cells)]),
  ];
}

const magicSquares = Object.entries(magicSquareCells)
  .flatMap(([key, cells]) => magicSquareConstraints(key, cells));

return [
  new Shape('9x9'),
  ...givens,
  ...magicSquares,
];
