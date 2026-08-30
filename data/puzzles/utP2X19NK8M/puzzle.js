// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=utP2X19NK8M
// Source: https://cracking-the-cryptic.web.app/sudoku/MFrTfQm8rd

// Rules encoded:
//  - Normal Sudoku: rows, columns and 3x3 boxes each contain 1-9 once.
//    There are no givens.
//  - 27 killer cages partition all 81 cells. Digits do not repeat in a cage.
//  - Each cage carries a string of the letters O and E in place of a total.
//    The string is the parity of the decimal digits of the cage total, read
//    left to right: a one-letter label is a one-digit total, a two-letter
//    label a two-digit total. So 'O' is a total in {3,5,7,9}, 'OE' a total
//    whose tens digit is odd and units digit even (10,12,14,...), and so on.
//    The source carries no rules text; this reading is forced by the labels
//    themselves. Every cage whose label has one letter has 2 cells (total
//    below 10 is only reachable there), and all seven 2-cell cages with a
//    two-letter label start with 'O' -- a 2-cell total is at most 17, so its
//    tens digit can only be the odd 1. Readings that pair a whole-cage
//    property with each letter are refuted by the same 2-cell cages: parity
//    of (sum, product) and of (product, sum) both make 'OO' impossible on two
//    cells, parity of (sum, count of odd digits) makes 'OE' impossible, and
//    one letter per cell is refuted by the 7-cell cage labelled 'OE'.

// Drawn cage outlines and their letter labels, one entry per cage, label
// first.
const cages = [
  ['OE', 'R1C3', 'R1C2', 'R1C1', 'R3C1', 'R2C1'],
  ['EO', 'R2C2', 'R3C2', 'R4C2'],
  ['EO', 'R1C4', 'R1C5', 'R1C6'],
  ['OE', 'R1C7', 'R2C7'],
  ['OE', 'R1C9', 'R1C8'],
  ['OO', 'R2C8', 'R3C8'],
  ['OO', 'R2C9', 'R3C9'],
  ['OO', 'R3C7', 'R3C6'],
  ['OE', 'R2C4', 'R2C5', 'R2C6'],
  ['OO', 'R2C3', 'R3C3', 'R3C4', 'R3C5'],
  ['EE', 'R4C1', 'R5C1', 'R6C1', 'R6C2'],
  ['OE', 'R5C2', 'R5C3'],
  ['OE', 'R4C3', 'R4C4', 'R4C5', 'R5C5', 'R6C5', 'R6C6', 'R6C7'],
  ['OO', 'R5C6', 'R4C6', 'R4C7'],
  ['OO', 'R4C8', 'R4C9', 'R5C9', 'R6C9'],
  ['O', 'R5C7', 'R5C8'],
  ['EO', 'R6C8', 'R7C8', 'R8C8'],
  ['OO', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['OE', 'R5C4', 'R6C4', 'R6C3'],
  ['O', 'R7C1', 'R8C1'],
  ['O', 'R7C2', 'R8C2'],
  ['O', 'R9C1', 'R9C2'],
  ['O', 'R8C3', 'R9C3'],
  ['OO', 'R7C3', 'R7C4'],
  ['EE', 'R7C5', 'R7C6', 'R7C7', 'R8C7'],
  ['OO', 'R8C4', 'R8C5', 'R8C6'],
  ['OE', 'R9C4', 'R9C5', 'R9C6'],
];

// Parity string of a total's decimal digits, in the label's alphabet.
const digitParities = (total) =>
  String(total).split('').map((d) => (+d % 2 ? 'O' : 'E')).join('');

// Totals a cage of n distinct digits from 1-9 can reach: 1+..+n up to
// (10-n)+..+9.
const totalRange = (n) => {
  const range = [];
  let lo = 0;
  let hi = 0;
  for (let i = 1; i <= n; i++) {
    lo += i;
    hi += 10 - i;
  }
  for (let t = lo; t <= hi; t++) range.push(t);
  return range;
};

// Cage(0, ...) is the killer cage without a total: the distinctness alone.
const cageDistinct = cages.map(([, ...cells]) => new Cage(0, ...cells));

// The label fixes the total only up to the set of reachable totals with those
// digit parities, so each cage is a disjunction over that set.
const cageTotals = cages.map(([label, ...cells]) => new Or(
  totalRange(cells.length)
    .filter((t) => digitParities(t) === label)
    .map((t) => new Sum(t, ...cells))));

return [
  new Shape('9x9'),
  ...cageDistinct,
  ...cageTotals,
];
