// Title: Anti-Killer Sudoku #2
// Author: Matt Cavnar-Johnson
// Video: https://www.youtube.com/watch?v=VyS_nJvUUso
// Source: https://app.crackingthecryptic.com/webapp/Fm8RGMNf2F

// Standard 9x9 sudoku (default row/column/box all-different, no givens),
// plus nine cages. Each cage shows the sum of its digits, but -- the "anti"
// in the title -- a cage's digits are not required to be all different:
// instead every cage must contain at least one repeated digit.

// Cell lists transcribed from the payload's `cages` array (a tenth entry has
// no cells and no total: a metadata stub, not a drawn cage).
const cages = [
  { total: 24, cells: ['R8C7', 'R9C7', 'R9C6', 'R9C8'] },
  { total: 29, cells: ['R7C6', 'R6C8', 'R7C8', 'R7C7'] },
  { total: 11, cells: ['R5C7', 'R5C6', 'R6C6'] },
  { total: 11, cells: ['R8C5', 'R9C5', 'R9C4', 'R9C3', 'R8C3'] },
  { total: 14, cells: ['R6C1', 'R7C2', 'R7C3', 'R7C1'] },
  { total: 13, cells: ['R6C3', 'R6C4', 'R5C4'] },
  { total: 17, cells: ['R2C6', 'R2C5', 'R2C4', 'R3C4', 'R3C3'] },
  { total: 29, cells: ['R2C3', 'R1C3', 'R1C2', 'R1C4'] },
  { total: 9, cells: ['R2C1', 'R3C1', 'R4C2', 'R4C3', 'R4C1'] },
];

// "At least one repeated digit" is an Or over every cell pair that could
// actually hold equal digits. A pair sharing a row, column, or box is
// already forced distinct by the sudoku baseline, so it is dropped rather
// than included as a dead disjunct.
const boxOf = ({ row, col }) =>
  3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3);

const cageRepeatRule = (cells) => {
  const pairs = [];
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = parseCellId(cells[i]);
      const b = parseCellId(cells[j]);
      if (a.row !== b.row && a.col !== b.col && boxOf(a) !== boxOf(b)) {
        pairs.push(new SameValues(2, cells[i], cells[j]));
      }
    }
  }
  return new Or(pairs);
};

const cageConstraints = cages.flatMap(({ total, cells }) => [
  // Sum (not Cage): digits are allowed to repeat within a cage here.
  new Sum(total, ...cells),
  cageRepeatRule(cells),
]);

return [
  new Shape('9x9'),
  ...cageConstraints,
];
