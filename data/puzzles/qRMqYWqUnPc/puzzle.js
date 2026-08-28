// Title: Battlefield Sudoku No.1
// Author: Big Tiger
// Video: https://www.youtube.com/watch?v=qRMqYWqUnPc
// Source: https://cracking-the-cryptic.web.app/sudoku/qr6dDQJRpf

// Normal sudoku rules apply: default row/column/3x3-box all-different
// (no NoBoxes/RegionSize override -- the puzzle uses standard boxes).
//
// "Battlefield" rule, for every row and every column: let X be the digit in
// the line's first cell and Y the digit in its last cell. Consider the first
// X cells and the last Y cells of the line. If the two groups overlap, the
// outside clue is the sum of the digits in the overlapping cells; if they
// don't overlap, the outside clue is the sum of the digits in the gap
// between them. Clue values are transcribed from the outside-clue overlays
// (row clues left of R1-R9, column clues above C1-C9).
//
// This is a value-conditional rule: which cells the sum covers depends on
// two other cells' own digits. It is encoded as a disjunction over every
// (X, Y) hypothesis for the line's first/last digits (81 branches). Only the
// branch whose X, Y match the line's actual first/last digits can have both
// Given sub-constraints hold, so exactly one branch is ever live -- this is
// the conditional rule itself, not a relaxation of it.
// When X + Y === 9 the two groups exactly tile the line with neither overlap
// nor gap, so the implied sum is over zero cells; every clue used here is
// non-zero, so that hypothesis is simply dropped from the disjunction rather
// than built as a 0-cell Sum.

const rowClue = [13, 36, 13, 3, 3, 3, 8, 9, 9];
const colClue = [19, 20, 24, 2, 26, 17, 4, 4, 24];

function battlefieldLine(clue, cells) {
  const branches = [];
  for (let X = 1; X <= 9; X++) {
    for (let Y = 1; Y <= 9; Y++) {
      let rangeCells;
      if (X + Y >= 10) {
        // Overlap: first X cells (pos 1..X) meet last Y cells (pos 10-Y..9)
        // in positions (10-Y)..X.
        rangeCells = cells.slice(9 - Y, X);
      } else if (X + Y < 9) {
        // Gap: the cells strictly between the two groups, pos (X+1)..(9-Y).
        rangeCells = cells.slice(X, 9 - Y);
      } else {
        // X + Y === 9: groups exactly tile the line.
        rangeCells = [];
      }
      if (rangeCells.length === 0) {
        if (clue === 0) {
          branches.push(new And([
            new Given(cells[0], X),
            new Given(cells[8], Y),
          ]));
        }
        continue;
      }
      branches.push(new And([
        new Given(cells[0], X),
        new Given(cells[8], Y),
        new Sum(clue, ...rangeCells),
      ]));
    }
  }
  return new Or(branches);
}

const battlefieldConstraints = [];
for (let r = 1; r <= 9; r++) {
  const cells = [];
  for (let c = 1; c <= 9; c++) cells.push(makeCellId(r, c));
  battlefieldConstraints.push(battlefieldLine(rowClue[r - 1], cells));
}
for (let c = 1; c <= 9; c++) {
  const cells = [];
  for (let r = 1; r <= 9; r++) cells.push(makeCellId(r, c));
  battlefieldConstraints.push(battlefieldLine(colClue[c - 1], cells));
}

return [
  new Shape('9x9'),
  ...battlefieldConstraints,
];
