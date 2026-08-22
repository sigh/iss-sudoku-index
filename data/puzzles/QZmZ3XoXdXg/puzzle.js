// Title: Frank Spencer
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=QZmZ3XoXdXg
// Source: https://app.crackingthecryptic.com/sudoku/LM92bDhjFg

// Normal sudoku rules (default 9x9 shape with standard boxes; no givens).
//
// Every row and column carries an X-Sum clue: the sum of the first X cells
// (in the direction the clue points), where X is the value of the first of
// those cells. Each drawn clue is one or two "O" letters. Per the rules text,
// every digit of the true clue value is odd (1/3/5/7/9), and the letter count
// is the true clue's digit count. So a one-letter clue's value is an unknown
// element of {1,3,5,7,9}, and a two-letter clue's value is an unknown
// two-digit number whose tens and units digits are both in {1,3,5,7,9} (25
// candidates from 11 to 99). Which exact value applies is not determinable
// from the source without solving, so each clue is encoded as a disjunction
// of XSum constraints, one per admissible value; XSum itself already rejects
// values that are not achievable by any first-X-cells sum.

const geometry = cellGeometry('9x9');

const oneDigitOdd = [1, 3, 5, 7, 9];
const twoDigitAllOdd = [];
for (const tens of oneDigitOdd) {
  for (const units of oneDigitOdd) {
    twoDigitAllOdd.push(tens * 10 + units);
  }
}

const row = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const col = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

// clue: { cells, digits } where digits is 1 or 2 (letter count as drawn).
const outsideClues = [
  // Top (down the column, from row 1) -- provenance: drawn outside-grid
  // letter overlays above the grid.
  { cells: col(1), digits: 1 },
  { cells: col(2), digits: 2 },
  { cells: col(3), digits: 1 },
  { cells: col(4), digits: 2 },
  { cells: col(6), digits: 2 },
  { cells: col(9), digits: 1 },
  // Bottom (up the column, from row 9) -- provenance: overlays below the grid.
  { cells: col(3).slice().reverse(), digits: 2 },
  { cells: col(4).slice().reverse(), digits: 1 },
  { cells: col(6).slice().reverse(), digits: 2 },
  { cells: col(7).slice().reverse(), digits: 2 },
  { cells: col(9).slice().reverse(), digits: 2 },
  // Left (rightward along the row, from column 1) -- provenance: overlays
  // left of the grid.
  { cells: row(1), digits: 1 },
  { cells: row(2), digits: 2 },
  { cells: row(3), digits: 1 },
  { cells: row(4), digits: 2 },
  { cells: row(5), digits: 1 },
  { cells: row(6), digits: 2 },
  { cells: row(7), digits: 2 },
  // Right (leftward along the row, from column 9) -- provenance: overlays
  // right of the grid.
  { cells: row(1).slice().reverse(), digits: 2 },
  { cells: row(2).slice().reverse(), digits: 2 },
  { cells: row(3).slice().reverse(), digits: 2 },
  { cells: row(4).slice().reverse(), digits: 2 },
  { cells: row(6).slice().reverse(), digits: 1 },
  { cells: row(7).slice().reverse(), digits: 2 },
  { cells: row(9).slice().reverse(), digits: 1 },
];

const xSumClues = outsideClues.map(({ cells, digits }) => {
  const candidates = digits === 1 ? oneDigitOdd : twoDigitAllOdd;
  return new Or(candidates.map(
    (value) => XSum.fromCells(value, cells, geometry)));
});

return [
  new Shape('9x9'),
  ...xSumClues,
];
