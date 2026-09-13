// Title: Funky Town
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=QEnVuvbmkqE
// Source: https://yusitnikov.github.io/puzzletv/#3-funky-town

// FRACTIONAL SUDOKU. The board is a 4x4 grid of "real cells", each split by
// grey lines into 1-4 "cell pieces" of area 1-4 that together cover the real
// cell. Each piece holds one digit 1-4; a digit may not repeat within a real
// cell (across pieces), but is not otherwise restricted between pieces. In
// each row, column and box of real cells, the total area of the pieces
// holding digit 1 must equal the area of a single real cell; likewise for
// digits 2, 3 and 4 (equivalently: every digit's area sums to exactly one
// real cell's worth, 4, in every row/column/box). Equal-size pieces in the
// same real cell may take their digits in either order (see the symmetry
// pin below).
//
// Model: every real cell is represented by its four unit sub-cells on an 8x8
// Raw grid (2 sub-cell rows x 2 sub-cell cols per real cell), value range
// 1-4. A piece's sub-cells are tied to one value with SameValues (split into
// one singleton set per sub-cell); one representative sub-cell per piece
// then stands in for AllDifferent within the real cell. A row/column/box
// "area sums to one real cell" is then just
// "each of 1-4 occurs exactly 4 times among that row/column/box's 16
// sub-cells" -- ContainExact over the sub-cell scope, weighting each piece's
// contribution by however many tied sub-cells it occupies.
const shape = new Shape('8x8', 4, 'Raw');

// Per-real-cell piece geometry, one entry per real cell in row-major order
// (I = real-cell row 0-3, J = real-cell col 0-3), each piece listed as its
// sub-cells' R#C# ids. Derived from the source puzzle's drawn grey-line
// piece boundaries and per-sub-cell fill colour: within each real cell's 2x2
// sub-cell block, sub-cells sharing an edge and the same fill colour belong
// to the same grey-line piece (checked: every equal-fill pair within a real
// cell is edge-connected, so this grouping is unambiguous).
const realCellPieces = [
  // I=0
  [['R1C1', 'R2C1'], ['R1C2'], ['R2C2']],
  [['R1C3', 'R1C4', 'R2C4'], ['R2C3']],
  [['R1C5', 'R1C6'], ['R2C5', 'R2C6']],
  [['R1C7', 'R2C7'], ['R1C8'], ['R2C8']],
  // I=1
  [['R3C1', 'R3C2', 'R4C1', 'R4C2']],
  [['R3C3', 'R3C4', 'R4C4'], ['R4C3']],
  [['R3C5', 'R3C6', 'R4C5'], ['R4C6']],
  [['R3C7', 'R3C8', 'R4C7', 'R4C8']],
  // I=2
  [['R5C1', 'R6C1'], ['R5C2'], ['R6C2']],
  [['R5C3'], ['R5C4', 'R6C4'], ['R6C3']],
  [['R5C5', 'R6C5'], ['R5C6', 'R6C6']],
  [['R5C7', 'R5C8'], ['R6C7', 'R6C8']],
  // I=3
  [['R7C1', 'R7C2'], ['R8C1', 'R8C2']],
  [['R7C3', 'R8C3'], ['R7C4', 'R8C4']],
  [['R7C5'], ['R7C6'], ['R8C5', 'R8C6']],
  [['R7C7'], ['R7C8', 'R8C8'], ['R8C7']],
];

// Givens: the puzzle's only three clues, each on a size-1 piece (single
// sub-cell), read from the source puzzle's drawn given digits.
const givens = [
  new Given('R2C3', 2),
  new Given('R4C6', 3),
  new Given('R6C2', 4),
];

// Tie every multi-sub-cell piece to one shared value: split into as many
// singleton sets as the piece has sub-cells, so SameValues forces them equal.
const pieceTies = realCellPieces.flat()
  .filter(piece => piece.length > 1)
  .map(piece => new SameValues(piece.length, ...piece));

// "Digits may not repeat in a cell": one representative sub-cell per piece,
// all-different within each real cell (the piece's own sub-cells are already
// tied equal above, so this only compares across different pieces).
const cellDistinctness = realCellPieces.map(
  pieces => new AllDifferent(...pieces.map(piece => piece[0])));

// Symmetry pin, not a rule: the rules say equal-size pieces in one real cell
// may take their digits "in either order", so swapping the digits of any two
// same-size pieces in a cell yields another accepted grid. That is a genuine
// solution multiplicity of the stated rules, not a gap in this encoding, so
// pin one order per same-size pair (lower value at the piece listed first
// above) to report the row's uniqueness up to that named freedom. Every such
// pair's representative sub-cells happen to be orthogonally adjacent, so the
// native adjacent-cell inequality expresses it directly.
const symmetryPins = realCellPieces.flatMap(pieces => {
  const pins = [];
  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      if (pieces[i].length === pieces[j].length) {
        pins.push(new GreaterThan(pieces[j][0], pieces[i][0]));
      }
    }
  }
  return pins;
});

// Row/column/box "area rule": within each 16-sub-cell scope, every digit
// 1-4 must occur exactly 4 times (= the area of one real cell).
const exactCounts = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4].join('_');

const rowConstraints = [];
for (let bandRow = 0; bandRow < 4; bandRow++) {
  const cells = [];
  for (const dr of [1, 2]) {
    for (let col = 1; col <= 8; col++) {
      cells.push(makeCellId(2 * bandRow + dr, col));
    }
  }
  rowConstraints.push(new ContainExact(exactCounts, ...cells));
}

const colConstraints = [];
for (let bandCol = 0; bandCol < 4; bandCol++) {
  const cells = [];
  for (let row = 1; row <= 8; row++) {
    for (const dc of [1, 2]) {
      cells.push(makeCellId(row, 2 * bandCol + dc));
    }
  }
  colConstraints.push(new ContainExact(exactCounts, ...cells));
}

const boxConstraints = [];
for (let boxRow = 0; boxRow < 2; boxRow++) {
  for (let boxCol = 0; boxCol < 2; boxCol++) {
    const cells = [];
    for (let dr = 1; dr <= 4; dr++) {
      for (let dc = 1; dc <= 4; dc++) {
        cells.push(makeCellId(4 * boxRow + dr, 4 * boxCol + dc));
      }
    }
    boxConstraints.push(new ContainExact(exactCounts, ...cells));
  }
}

return [
  shape,
  ...givens,
  ...pieceTies,
  ...cellDistinctness,
  ...rowConstraints,
  ...colConstraints,
  ...boxConstraints,
  ...symmetryPins,
];
