// Title: Empty Grid
// Author: Jodawo
// Video: https://www.youtube.com/watch?v=La7Yg_rav24
// Source: https://app.crackingthecryptic.com/sudoku/MLt47676Pr

// Rules encoded:
// - Standard sudoku: rows, columns, and 3x3 boxes each contain 1-9 once (default
//   grid, no givens at all).
// - "2-digit numbers" read left-to-right or top-to-bottom: the first cell in
//   reading order is the tens digit, the second is the units digit.
// - Box 1 (NW) contains all six 2-digit square numbers (16, 25, 36, 49, 64, 81),
//   each formed by some horizontally- or vertically-adjacent pair of cells fully
//   inside the box, read in either direction above. Numbers may overlap (share a
//   cell); the rule is existential only, so nothing else in the box is restricted.
// - Box 9 (SE) is a clone of box 1 rotated 180 degrees: each box-9 cell equals the
//   box-1 cell at the point-symmetric position. Box 9's own square-number
//   membership then follows from that equality and is not separately encoded.
// - Boxes 3 (NE), 5 (centre), 7 (SW): every cell in the box is part of at least
//   one 2-digit prime number formed the same way (adjacent pair, either
//   direction). The two-digit primes made only of digits 1-9 are 11, 13, 17, 19,
//   23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97 (checked by
//   primality below, not hand-enumerated).
// - Box 4 (W) is a magic square: its 3 rows, 3 columns, and 2 diagonals (each
//   read within the box only) all sum to the same total.
// - Boxes 6 (E) and 8 (S): each box's own two 3-cell diagonals sum to the same
//   total, independently per box (the rules explicitly note box 6's total may
//   differ from box 8's).
// - Box 2 (N) carries no stated rule beyond standard sudoku.

// 3x3 box cell grid, indexed [row 0-2][col 0-2], given the box's top-left
// 1-indexed grid coordinate.
const boxGrid = (rowStart, colStart) =>
  [0, 1, 2].map(i => [0, 1, 2].map(j => makeCellId(rowStart + i, colStart + j)));

// All 12 two-digit-number readings inside a 3x3 box: 6 horizontal (L-to-R) and
// 6 vertical (top-to-bottom), each as {tensCell, unitsCell}.
const boxReadings = (rowStart, colStart) => {
  const g = boxGrid(rowStart, colStart);
  const readings = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      readings.push({ tensCell: g[i][j], unitsCell: g[i][j + 1] });
    }
  }
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 2; i++) {
      readings.push({ tensCell: g[i][j], unitsCell: g[i + 1][j] });
    }
  }
  return readings;
};

// --- Box 1: contains all six 2-digit squares (existential, may overlap) ---
const squares = [16, 25, 36, 49, 64, 81];
const box1Readings = boxReadings(1, 1);
const squareConstraints = squares.map(sq => {
  const tens = Math.floor(sq / 10);
  const units = sq % 10;
  return new Or(box1Readings.map(({ tensCell, unitsCell }) =>
    new And([new Given(tensCell, tens), new Given(unitsCell, units)])));
});

// --- Box 9: clone of box 1, rotated 180 degrees ---
const box1Grid = boxGrid(1, 1);
const box9Grid = boxGrid(7, 7);
const cloneConstraints = box1Grid.flatMap((row, i) => row.map((a, j) => {
  const b = box9Grid[2 - i][2 - j]; // 180-degree rotated position
  return new SameValues(2, a, b); // a === b
}));

// --- Boxes 3, 5, 7: every digit contributes to at least one 2-digit prime ---
const isPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const primePairKey = Pair.fnToKey((a, b) => isPrime(10 * a + b), 9);

const boxPrimeConstraints = (rowStart, colStart) => {
  const g = boxGrid(rowStart, colStart);
  return g.flatMap((row, i) => row.map((_, j) => {
    const incident = [
      j > 0 && [g[i][j - 1], g[i][j]], // this cell reads as units
      j < 2 && [g[i][j], g[i][j + 1]], // this cell reads as tens
      i > 0 && [g[i - 1][j], g[i][j]], // this cell reads as units
      i < 2 && [g[i][j], g[i + 1][j]], // this cell reads as tens
    ].filter(Boolean);
    return new Or(incident.map(([a, b]) => new Pair(primePairKey, 'prime', a, b)));
  }));
};

const primeConstraints = [
  ...boxPrimeConstraints(1, 7), // box 3 (NE)
  ...boxPrimeConstraints(4, 4), // box 5 (centre)
  ...boxPrimeConstraints(7, 1), // box 7 (SW)
];

// --- Box 4: magic square (3 rows + 3 cols + 2 diagonals of the box, equal sums) ---
const box4Grid = boxGrid(4, 1);
const magicSegments = [
  ...box4Grid,                                          // 3 rows
  ...[0, 1, 2].map(j => box4Grid.map(row => row[j])),    // 3 columns
  [box4Grid[0][0], box4Grid[1][1], box4Grid[2][2]],      // main diagonal
  [box4Grid[0][2], box4Grid[1][1], box4Grid[2][0]],      // anti diagonal
];
const magicConstraint = new EqualSum(...magicSegments);

// --- Boxes 6 and 8: each box's own two diagonals sum equal (independently) ---
const boxDiagonalConstraint = (rowStart, colStart) => {
  const g = boxGrid(rowStart, colStart);
  return new EqualSum(
    [g[0][0], g[1][1], g[2][2]],
    [g[0][2], g[1][1], g[2][0]],
  );
};

const diagonalConstraints = [
  boxDiagonalConstraint(4, 7), // box 6 (E)
  boxDiagonalConstraint(7, 4), // box 8 (S)
];

return [
  new Shape('9x9'),
  ...squareConstraints,
  ...cloneConstraints,
  ...primeConstraints,
  magicConstraint,
  ...diagonalConstraints,
];
