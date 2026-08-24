// Title: The Bishop of Kropki
// Author: redino987
// Video: https://www.youtube.com/watch?v=H11w7GCIHxY
// Source: https://app.crackingthecryptic.com/sudoku/8pJ8D987Tg

// Standard sudoku (regions are the default 3x3 boxes; the payload's regions
// array is the default tiling). Black dots join two orthogonally-adjacent
// cells in ratio 1:2; not every valid dot pair is drawn, so an undotted pair
// carries no information (plain BlackDot, not StrictKropki). Thermometers
// increase strictly from the bulb.
//
// "Kropki digits" (1,2,3,4,6,8) are exactly the digits within 1-9 that can
// take part in a 1:2 ratio pair; 5, 7 and 9 cannot and are exempt from the
// diagonal rule below.
//
// "Identical [kropki] digits cannot share a diagonal": the title ("The
// Bishop of Kropki") and the video title ("The Dotty Bishop") both name the
// chess bishop, whose move is any distance along a diagonal, so "share a
// diagonal" is read as any two cells lying on one diagonal line of the grid
// (either direction), at any distance -- not only diagonally-adjacent cells,
// and not only the two long grid diagonals. Encoded as: for every maximal
// diagonal of length >= 2 (both directions), no two of its cells may hold
// the same kropki digit -- via one PairX per diagonal with a relation that
// is vacuous for non-kropki digits.

const dots = [
  ['R2C1', 'R2C2'],
  ['R2C3', 'R2C4'],
  ['R2C4', 'R2C5'],
  ['R2C3', 'R3C3'],
  ['R3C2', 'R4C2'],
  ['R4C1', 'R4C2'],
  ['R4C4', 'R4C5'],
  ['R5C6', 'R6C6'],
  ['R5C6', 'R5C7'],
  ['R5C7', 'R5C8'],
];

const thermos = [
  ['R2C9', 'R1C9'],
  ['R6C9', 'R7C8'],
  ['R8C6', 'R9C7'],
  ['R9C1', 'R9C2'],
];

// Group every cell into its two diagonals (row-col constant, row+col
// constant), keeping only diagonals with 2+ cells -- a length-1 diagonal has
// no pair to constrain.
const nwseDiagonals = new Map(); // key: row - col
const neswDiagonals = new Map(); // key: row + col
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    const cell = makeCellId(row, col);
    const nwseKey = row - col;
    const neswKey = row + col;
    (nwseDiagonals.get(nwseKey) ?? nwseDiagonals.set(nwseKey, []).get(nwseKey)).push(cell);
    (neswDiagonals.get(neswKey) ?? neswDiagonals.set(neswKey, []).get(neswKey)).push(cell);
  }
}
const diagonals = [...nwseDiagonals.values(), ...neswDiagonals.values()]
  .filter(cells => cells.length >= 2);

const KROPKI_DIGITS = new Set([1, 2, 3, 4, 6, 8]);
const noRepeatKropkiKey = PairX.fnToKey(
  (a, b) => !(a === b && KROPKI_DIGITS.has(a)), 9);

const kropkiDiagonals = diagonals.map(
  cells => new PairX(noRepeatKropkiKey, 'no repeated kropki digit on diagonal', ...cells));

return [
  new Shape('9x9'),
  ...dots.map(cells => new BlackDot(...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...kropkiDiagonals,
];
