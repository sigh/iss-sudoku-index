// Title: Jekyll and Hyde Sudoku
// Author: Shye
// Video: https://www.youtube.com/watch?v=Y7LTiZuPhug
// Source: https://cracking-the-cryptic.web.app/sudoku/rNhrQRPdD2

// Rules encoded here:
//  - Normal sudoku rules apply. The grid has no given digits.
//  - Cells separated by dots have the same common difference (green for one
//    difference; red for another). Both differences are unknown, and they are
//    different from each other.
//  - Outer clues are grouped in pairs; in each pair, one clue is a sandwich clue
//    and the other is an x-sums clue. A sandwich clue gives the sum of the cells
//    between the 1 and the 9 of that row/column; an x-sums clue gives the sum of
//    the first X digits read inwards from the clue, X being the first of them.
//  - Some outside clues use dots in their equations: these are multiplication or
//    "to the power of", not concatenation.
//  - "Not all possible clues are given IE no negative constraints operate", so
//    no negative/strict dot constraint is added: an unmarked pair of adjacent
//    cells is free.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// A clue line's cells, ordered from the end its "near" clue is printed at.
const row = (r) => graph.ray(makeCellId(r, 1), 0, 1);
const col = (c) => graph.ray(makeCellId(1, c), 1, 0);

// Drawn dots, read off the border each one straddles.
const GREEN_DOTS = [
  ['R1C7', 'R1C8'], ['R2C5', 'R3C5'], ['R2C9', 'R3C9'], ['R5C3', 'R5C4'],
  ['R5C7', 'R6C7'], ['R7C1', 'R8C1'], ['R8C6', 'R9C6'], ['R9C7', 'R9C8'],
];
const RED_DOTS = [
  ['R3C1', 'R3C2'], ['R3C8', 'R3C9'], ['R4C5', 'R5C5'], ['R5C6', 'R6C6'],
  ['R6C8', 'R6C9'], ['R8C1', 'R9C1'],
];

// Two different digits of a 9x9 grid differ by 1..8, so those are the candidate
// values of each colour's common difference.
const DIFFS = [1, 2, 3, 4, 5, 6, 7, 8];

// The two differences are held in Var cells. Nothing reads them directly; they
// exist so that the separate value-disjunctions below -- the dots of a colour,
// and each printed clue that contains a dot of that colour -- are all forced to
// commit to the same value for that colour.
const greenVar = new Var('G', 'green difference', 1);   // cell VG
const redVar = new Var('R', 'red difference', 1);       // cell VR

// key(d) accepts exactly the ordered pairs whose members differ by d.
const key = (d) => Pair.fnToKey((a, b) => Math.abs(a - b) === d, 9);

// All dots of one colour share a single difference, so the choice of difference
// is one Or over the whole colour, not one per dot.
const dotGroup = (dots, varCell, name) => new Or(
  DIFFS.map(d => new And([
    new Given(varCell, d),
    ...dots.map(([a, b]) => new Pair(key(d), `${name}${d}`, a, b)),
  ])));

// One outside-clue pair, given the line's cells ordered from the end the "near"
// clue is printed at (left of a row, top of a column); the "far" clue is the one
// printed at the other end. Exactly one of the two is the sandwich clue and the
// rules never say which, so both assignments are offered. Sandwich reads the
// whole line, so its direction does not matter.
// An x-sums total contains X itself and is therefore at least 1: a printed 0 can
// only ever be the sandwich half of its pair, and ISS likewise refuses to build
// a 0-valued XSum, so that branch is not offered.
const cluePair = (cells, nearVal, farVal) => {
  const inwardsFromFar = cells.slice().reverse();
  return new Or([
    ...(nearVal > 0
      ? [new And([XSum.fromCells(nearVal, cells, geometry),
      Sandwich.fromCells(farVal, cells, geometry)])]
      : []),
    ...(farVal > 0
      ? [new And([Sandwich.fromCells(nearVal, cells, geometry),
      XSum.fromCells(farVal, inwardsFromFar, geometry)])]
      : []),
  ]);
};

return [
  new Shape('9x9'),

  greenVar,
  redVar,
  // "green for one difference; red for another": the two differ.
  new AllDifferent('VG', 'VR'),

  dotGroup(GREEN_DOTS, 'VG', 'green'),
  dotGroup(RED_DOTS, 'VR', 'red'),

  // Clue pairs whose two printed clues are plain numerals.
  cluePair(row(3), 16, 2),
  cluePair(col(4), 3, 0),

  // Clue pairs whose printed values contain only red dots.
  new Or(DIFFS.map(r => new And([
    new Given('VR', r),
    // Right of row 5: a red dot with a small raised '2' beside it.
    cluePair(row(5), 26, r * r),
    // Below column 6: '2' followed by a red dot on the same baseline.
    cluePair(col(6), 8, 2 * r),
  ]))),

  // Clue pairs whose printed values involve both colours; enumerated over both
  // differences together so that one (green, red) choice serves both lines.
  new Or(DIFFS.flatMap(g => DIFFS.map(r => new And([
    new Given('VG', g),
    new Given('VR', r),
    // Column 5: '7' then a red dot above, '3' then a green dot below, each on
    // its own baseline.
    cluePair(col(5), 7 * r, 3 * g),
    // Left of row 7: a green dot, '+', a red dot, all on one baseline.
    cluePair(row(7), g + r, 10),
  ])))),
];
