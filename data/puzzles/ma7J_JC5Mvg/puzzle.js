// Title: Picnic
// Author: Jeremy Butler
// Video: https://www.youtube.com/watch?v=ma7J_JC5Mvg
// Source: https://cracking-the-cryptic.web.app/sudoku/t8PNdb4Qbm

// Normal sudoku (default row/column/box all-different). Digits increase along
// thermometers from the bulb to the end. Each outside clue is a Sandwich: the
// sum of the digits strictly between the 1 and the 9 in that row/column.
// Five of the outside clues are letter-valued (L, U, N, C, H -- "LUNCH");
// each letter is the unknown digit held by one specific grid cell (a small
// letter is drawn in that cell instead of a numeral), reused in that clue's
// arithmetic. Column 1 has no drawn outside clue, so it carries no Sandwich
// constraint.

const geometry = cellGeometry('9x9');

const rowCells = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colCells = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

// Four plain two-cell thermometers, bulb given by the drawn circle at each
// line's endpoint.
const simpleThermos = [
  ['R9C2', 'R8C2'],
  ['R1C2', 'R1C1'],
  ['R1C8', 'R1C9'],
  ['R8C8', 'R9C8'],
];

// Four more strokes are each drawn bent (or, for the last two, crossing one
// another) with a circle at the interior vertex rather than at an end: the
// circle marks a shared bulb, splitting each stroke into the two
// thermometers below that both increase away from it. The last two strokes
// both bulb at R5C5 -- one horizontal, one diagonal crossing it -- forming a
// four-armed star.
const bulbedThermos = [
  ['R3C5', 'R2C4', 'R1C4'],
  ['R3C5', 'R2C6', 'R1C6'],
  ['R4C5', 'R4C4', 'R3C3'],
  ['R4C5', 'R4C6', 'R3C7'],
  ['R5C5', 'R5C4', 'R5C3', 'R4C2'],
  ['R5C5', 'R5C6', 'R5C7', 'R4C8'],
  ['R5C5', 'R6C4', 'R7C3', 'R8C3'],
  ['R5C5', 'R6C6', 'R7C7', 'R8C7'],
];

const thermos = [...simpleThermos, ...bulbedThermos]
  .map((cells) => new Thermo(...cells));

// Numeric (constant-value) Sandwich clues, drawn on the left of a row or the
// top of a column.
const numericSandwiches = [
  ...Object.entries({ 1: 17, 2: 14, 3: 0, 4: 22, 5: 15, 7: 14, 8: 35, 9: 9 })
    .map(([row, value]) => Sandwich.fromCells(value, rowCells(+row), geometry)),
  ...Object.entries({ 2: 25, 3: 0, 5: 0, 9: 0 })
    .map(([col, value]) => Sandwich.fromCells(value, colCells(+col), geometry)),
];

// Letter-valued Sandwich clues. Each letter is the digit held by one grid
// cell (letterCell); since Sandwich takes a fixed integer, disjoin over that
// cell's nine candidate digits and pin the matching Sandwich total in each
// branch. Skip a candidate whose required total would be negative or
// fractional -- a Sandwich sum can never be either, so that digit is already
// excluded by the rule itself (e.g. row 6 forces the R1C5 digit != 1, since
// "L-2" would demand a sum of -1; column 6 forces the R7C7 digit even, since
// "H/2" must be a whole sandwich total).
function letterSandwich(letterCell, laneCells, target) {
  const branches = [];
  for (let v = 1; v <= 9; v++) {
    const t = target(v);
    if (!Number.isInteger(t) || t < 0) continue;
    branches.push(new And([
      new Given(letterCell, v),
      Sandwich.fromCells(t, laneCells, geometry),
    ]));
  }
  return new Or(branches);
}

const letterSandwiches = [
  letterSandwich('R1C5', rowCells(6), (l) => l - 2),        // row 6: L-2
  letterSandwich('R6C6', colCells(4), (c) => c),             // col 4: C
  letterSandwich('R7C7', colCells(6), (h) => (h % 2 === 0 ? h / 2 : NaN)), // col 6: H/2
  letterSandwich('R4C4', colCells(7), (u) => u * 2),         // col 7: Ux2
  letterSandwich('R5C4', colCells(8), (n) => n * 3),         // col 8: Nx3
];

return [
  new Shape('9x9'),
  ...thermos,
  ...numericSandwiches,
  ...letterSandwiches,
];
