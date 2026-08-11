// Title: Parity Mirror
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=s-LYqmY_Hrs
// Source: https://app.crackingthecryptic.com/sudoku/gTQ3fMq6nM
//
// Normal sudoku rules apply (default 9x9 rows/cols/boxes).
//
// Diagonal (R1C1..R9C9, drawn thin blue line):
//  - "Digits do not repeat along the marked diagonal" -> Diagonal(-1)
//    (direction -1 is the '\' diagonal from R1C1 to R9C9).
//  - "The marked diagonal reflects odd/even parity on each side" -> for every
//    off-diagonal cell (r,c) and its transpose mirror (c,r), same parity.
//    Encoded as one Pair per mirrored cell pair (36 pairs over the 72
//    off-diagonal cells), using a shared same-parity relation key.
//
// Purple lines ("a set of consecutive, non-repeating digits") -> Renban over
// each line's cells, taken in drawn order. Two of the five purple lines run
// along part of the marked diagonal itself (R1C1-R2C2-R3C3 and
// R7C7-R8C8-R9C9); they are additional constraints on those cells, not a
// restatement of the diagonal rule.
//
// Arrows ("digits along an arrow sum to the digit in that arrow's circle")
// -> Arrow(circle, ...arm) per drawn arrow. Five circle cells anchor eight
// arrows total; two circles (R6C8, R8C2, R2C4) each anchor two independent
// arrows radiating outward, so each arm gets its own Arrow constraint against
// the shared circle -- not one path through both arms.

const diagonalCells = [];
for (let i = 1; i <= 9; i++) diagonalCells.push(makeCellId(i, i));

// Same-parity relation for the diagonal mirror pairs.
const sameParityKey = Pair.fnToKey((a, b) => (a % 2) === (b % 2), 9);
const mirrorPairs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = r + 1; c <= 9; c++) {
    mirrorPairs.push(
      new Pair(
        sameParityKey, `parity mirror R${r}C${c}/R${c}C${r}`,
        makeCellId(r, c), makeCellId(c, r)));
  }
}

// Purple lines, in drawn order.
const renbans = [
  ['R1C1', 'R2C2', 'R3C3'],
  ['R7C7', 'R8C8', 'R9C9'],
  ['R2C7', 'R1C8', 'R2C9', 'R3C8'],
  ['R5C2', 'R5C3'],
  ['R7C5', 'R8C5'],
].map(cells => new Renban(...cells));

// Arrows: circle cell first, then arm cells (circle cell identified as the
// arrow's starting waypoint, which coincides with a drawn circle underlay).
const arrows = [
  ['R2C8', 'R3C7', 'R4C6', 'R5C5'],
  ['R7C3', 'R6C4', 'R5C5'],
  ['R6C8', 'R5C8', 'R4C8'],
  ['R6C8', 'R7C8', 'R8C8', 'R8C9'],
  ['R8C2', 'R7C2', 'R6C2'],
  ['R8C2', 'R8C3', 'R8C4'],
  ['R2C4', 'R2C3', 'R2C2', 'R1C2'],
  ['R2C4', 'R2C5', 'R1C5'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  new Diagonal(-1),
  ...mirrorPairs,
  ...renbans,
  ...arrows,
];
