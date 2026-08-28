// Title: Golden Arrows
// Author: Josias Everett
// Video: https://www.youtube.com/watch?v=ybHki5JW1fU
// Source: https://cracking-the-cryptic.web.app/sudoku/rNT7F9fQQ3
//
// Rules (from the video description): "1-9 must be placed in each row,
// column and marked region. The cages and arrows both show how many
// different digits appear in the cage or diagonal indicated. The green
// area is a magic square, in which all rows, columns and diagonals add
// to the same number." There are no default boxes; the nine marked
// regions replace them (NoBoxes + Jigsaw below). The bordered cages carry
// no sum -- their number is a distinct-digit count, same as the diagonal
// "arrows"; neither requires all cells in it to differ.
//
// CountDistinct needs a real cell to hold the count, so each fixed count
// (cage/diagonal) is pinned to its own off-grid Var with a Given.

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C1', 'R3C1', 'R4C1'],
  ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R4C2', 'R4C3', 'R4C4', 'R5C3', 'R6C3'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R2C5', 'R2C6', 'R3C3', 'R3C4', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R5C2', 'R5C4', 'R6C2', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C3', 'R8C4'],
  ['R3C6', 'R4C6', 'R4C7', 'R5C6', 'R6C6', 'R6C7', 'R7C6', 'R8C5', 'R8C6'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'],
  ['R5C7', 'R5C8', 'R6C8', 'R7C7', 'R7C8', 'R8C7', 'R9C5', 'R9C6', 'R9C7'],
  ['R4C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
];

const givens = [
  ['R2C2', 8], ['R2C6', 1], ['R3C8', 7], ['R4C1', 9], ['R5C5', 2],
];

// Bordered cages (gold and chocolate), both labelled "2" -- a distinct
// digit count only, not a sum and not an all-different requirement.
const cageGold = ['R3C6', 'R4C6', 'R4C5', 'R5C5', 'R5C4', 'R6C4', 'R6C3'];
const cageChoc = ['R3C4', 'R3C3', 'R4C3', 'R4C2', 'R5C2', 'R5C1', 'R6C1'];

// Outside diagonal "arrow" clues. Each badge sits on a lane boundary;
// the arrow's drawn direction (down-left in every case) fixes the on-grid
// starting cell as the one below the boundary rather than the one above.
const diagMain = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'];
const diagMid = ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'];
const diagShort = ['R7C9', 'R8C8', 'R9C7'];

// One off-grid Var per fixed distinct-digit-count clue, pinned by a Given
// so CountDistinct's control cell holds the printed number.
const countClues = [
  ['CG', cageGold, 2],
  ['CC', cageChoc, 2],
  ['DM', diagMain, 3],
  ['DD', diagMid, 1],
  ['DS', diagShort, 2],
];

const magicRows = [
  ['R7C5', 'R7C6', 'R7C7'],
  ['R8C5', 'R8C6', 'R8C7'],
  ['R9C5', 'R9C6', 'R9C7'],
];
const magicCols = [
  ['R7C5', 'R8C5', 'R9C5'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R7C7', 'R8C7', 'R9C7'],
];
const magicDiags = [
  ['R7C5', 'R8C6', 'R9C7'],
  ['R7C7', 'R8C6', 'R9C5'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  ...givens.map(([cell, value]) => new Given(cell, value)),

  ...countClues.flatMap(([prefix, cells, count]) => {
    const v = new Var(prefix, `distinct=${count}`);
    const control = v.cell();
    return [v, new Given(control, count), new CountDistinct(control, ...cells)];
  }),

  // Magic square: EqualSum over the block's 3 rows, 3 columns and 2
  // diagonals forces all 8 lines to the same total, exactly the stated
  // rule -- the block spans three different jigsaw regions (D, F, H), so
  // it is not itself an all-different set and nothing pins the total to 15.
  new EqualSum(...magicRows, ...magicCols, ...magicDiags),
];
