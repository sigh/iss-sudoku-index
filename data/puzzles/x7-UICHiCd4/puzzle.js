// Title: 9 Hours, 9 Pins, 9 Doors
// Author: Botaku
// Video: https://www.youtube.com/watch?v=x7-UICHiCd4
// Source: https://app.crackingthecryptic.com/sudoku/RGM6Pt7qM7

// Normal sudoku rules apply. For each digit 1-9, some straight line of three
// mutually adjacent cells holds three copies of that digit somewhere in the
// grid.
//
// The default row/column all-different groups already forbid three equal
// digits from sitting consecutively in a row or a column, so a horizontal or
// vertical candidate line can never satisfy the rule; only the two diagonal
// directions can. Encoding only those two is therefore the same rule, not a
// narrower one. For each digit, the existential is one Or over every
// diagonal 3-in-a-row triple (both diagonal orientations), each branch an
// And pinning that triple's three cells to the digit.

const diagonalTriples = () => {
  const triples = [];
  for (let r = 1; r <= 7; r++) {
    for (let c = 1; c <= 7; c++) {
      // Down-right diagonal starting at (r, c).
      triples.push([makeCellId(r, c), makeCellId(r + 1, c + 1), makeCellId(r + 2, c + 2)]);
      // Down-left diagonal starting at (r, c + 2).
      triples.push([makeCellId(r, c + 2), makeCellId(r + 1, c + 1), makeCellId(r + 2, c)]);
    }
  }
  return triples;
};

const triples = diagonalTriples();

const tripleSomewhere = [];
for (let digit = 1; digit <= 9; digit++) {
  tripleSomewhere.push(new Or(
    triples.map(cells => new And(cells.map(cell => new Given(cell, digit))))));
}

return [
  new Shape('9x9'),

  new Given('R2C8', 4),
  new Given('R3C4', 2),
  new Given('R3C6', 4),
  new Given('R4C3', 1),
  new Given('R4C5', 3),
  new Given('R5C5', 5),
  new Given('R5C7', 7),
  new Given('R6C6', 6),
  new Given('R6C8', 8),
  new Given('R8C2', 4),

  ...tripleSomewhere,
];
