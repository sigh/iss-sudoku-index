// Title: Unique Arrow Sudoku
// Author: Serhii Tyshchenko
// Video: https://www.youtube.com/watch?v=1dMEVGXHKAM
// Source: https://app.crackingthecryptic.com/sudoku/93Q9HD7tp8

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes),
// no givens.
//
// Nine arrows, each a two-cell horizontal pill (bulb) plus a shaft (arm):
// digits along the arm sum to the 2-digit number in the pill, read left
// cell = tens, right cell = units (every pill spans two cells in one row,
// per the drawn geometry) -> PillArrow(2, leftCell, rightCell, ...arm).
//
// "All numbers in pills are unique 2-digit numbers": the nine pill values
// must be pairwise distinct. A pill's tens/units digits are single sudoku
// digits (1-9, no leading zero), so its 2-digit value is determined
// injectively by the (tens, units) pair -- two pills give the same value
// iff both their tens cells match and both their units cells match. So
// "values differ" reduces to "tens cells differ OR units cells differ",
// encoded per pair as Or(AllDifferent(tens_i, tens_j),
// AllDifferent(units_i, units_j)) over all 36 pairs of the 9 pills.
//
// Three thermometers, each a straight 3-cell run: digits increase from the
// bulb (filled circle) end -> Thermo(bulb, ...rest).

const PILLS = [
  // [tens, units, ...arm]
  ['R3C1', 'R3C2', 'R3C3', 'R2C3', 'R1C3', 'R1C2', 'R1C1', 'R2C1'],
  ['R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R1C5', 'R1C4', 'R2C4'],
  ['R3C7', 'R3C8', 'R3C9', 'R2C9', 'R2C8', 'R2C7'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R6C8', 'R6C7'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4'],
  ['R5C1', 'R5C2', 'R5C3', 'R6C3', 'R6C2', 'R6C1'],
  ['R9C2', 'R9C3', 'R9C1', 'R8C1', 'R7C1', 'R7C2', 'R7C3', 'R8C3'],
  ['R7C5', 'R7C6', 'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C6'],
  ['R8C8', 'R8C9', 'R8C7', 'R9C7', 'R9C8', 'R9C9'],
];

const THERMOS = [
  ['R3C6', 'R2C6', 'R1C6'],
  ['R6C9', 'R6C8', 'R6C7'],
  ['R6C3', 'R6C2', 'R6C1'],
];

const arrows = PILLS.map(
  ([tens, units, ...arm]) => new PillArrow(2, tens, units, ...arm));

const thermos = THERMOS.map(cells => new Thermo(...cells));

const uniquePills = [];
for (let i = 0; i < PILLS.length; i++) {
  for (let j = i + 1; j < PILLS.length; j++) {
    const [tensI, unitsI] = PILLS[i];
    const [tensJ, unitsJ] = PILLS[j];
    uniquePills.push(new Or([
      new AllDifferent(tensI, tensJ),
      new AllDifferent(unitsI, unitsJ),
    ]));
  }
}

return [
  new Shape('9x9'),
  ...arrows,
  ...thermos,
  ...uniquePills,
];
