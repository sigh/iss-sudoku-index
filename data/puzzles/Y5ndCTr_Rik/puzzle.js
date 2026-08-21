// Title: Millstone
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=Y5ndCTr_Rik
// Source: https://sudokupad.app/james-sinclair/millstone-v3

// Rules encoded here:
//   - Digits 0-9, no digit repeated in a row, column or box, and exactly one
//     cell of every row, column and box holding two digits.
//   - A cell's value is the sum of its digits.
//   - Digits do not repeat within a cage (values may).
//   - The values along an arrow sum to the value in its circle.
//   - Values in shaded (even) cells are even.
//   - The three printed cage products: 63, 64 and 17.
// Omitted: the cross-cage half of the product rule -- that all fourteen cage
//   products are distinct and each is consecutive with exactly one other. That
//   is what determines the eleven unprinted products, so with it dropped those
//   cages carry only their digit-distinctness.

// Representation. The main grid holds one digit of each cell; the VS overlay
// holds that cell's second digit, or the sentinel 10 where the cell has only
// one digit. VD mirrors VS but maps the sentinel to 0, so a cell's value is
// (grid + VD) and every value clue stays linear.
const shape = new Shape('9x9', '0-10');
const NO_SECOND = 10;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS');
const VD = graph.makeOverlay('VD');

// A cell's value is carried by the two cells [grid, VD], which sum to it.
const valueCells = (cells) => cells.flatMap(cell => [cell, VD.at(cell)]);

// VD is VS with the sentinel read as "adds nothing".
const secondDigitValue = Pair.fnToKey(
  (vs, vd) => vd === (vs === NO_SECOND ? 0 : vs), shape);

// The two digits of a doubled cell are unordered, so which of them sits in the
// main grid is an artifact of this representation: pin the smaller one in VS.
// (They are always distinct: a row holds ten digits across nine cells, each
// once.)
const canonicalOrder = Pair.fnToKey(
  (primary, vs) => vs === NO_SECOND || vs < primary, shape);

// A house's nine grid cells plus their nine VS cells hold each digit exactly
// once and the sentinel eight times -- which is both "all ten digits appear"
// and "exactly one cell is doubled".
const HOUSE_MULTISET =
  [...DIGITS, ...DIGITS.slice(0, 8).map(() => NO_SECOND)].join('_');
const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new ContainExact(HOUSE_MULTISET, ...house, ...VS.at(house)));

// Cage cell lists transcribed from the drawn cage outlines; the no-total and
// single-cell cages are drawn cages too, so they keep their digit rule.
const CAGES = [
  ['R1C3', 'R1C4'], ['R2C5', 'R2C6'], ['R1C6', 'R1C7', 'R1C8'],
  ['R3C1', 'R4C1', 'R5C1', 'R5C2'], ['R4C2'], ['R3C4', 'R4C4'],
  ['R4C7', 'R4C8'], ['R6C7', 'R6C8'], ['R7C6', 'R7C7', 'R8C6'],
  ['R8C7', 'R8C8'], ['R8C2', 'R9C1', 'R9C2'], ['R7C2', 'R7C3'],
  ['R7C1', 'R8C1'], ['R8C3', 'R9C3'],
];
// Over a cage's grid and VS cells together: two digits clash unless at least
// one of them is the sentinel, i.e. is not a digit at all.
const distinctDigits = Pair.fnToKey(
  (a, b) => a === NO_SECOND || b === NO_SECOND || a !== b, shape);
const cageDigits = CAGES.map((cage, i) =>
  new PairX(distinctDigits, ...cage, ...VS.at(cage)));

// Printed cage products, read over [grid, VD] pairs. The machine carries the
// running product of the cell values read so far; it keeps only products that
// still divide the target, since the target is the running product times the
// values not yet read.
const cageProduct = (target) => NFA.encodeSpec({
  startState: { product: 1, primary: null },
  transition: (s, x) => {
    if (x > 9) return undefined;
    if (s.primary === null) return { product: s.product, primary: x };
    const product = s.product * (s.primary + x);
    if (product === 0 || target % product !== 0) return undefined;
    return { product, primary: null };
  },
  accept: s => s.primary === null && s.product === target,
}, shape);
const PRINTED_PRODUCTS = [[0, 63], [7, 64], [13, 17]];
const products = PRINTED_PRODUCTS.map(([cageIndex, target]) =>
  new NFA(cageProduct(target), `cage-product-${target}`,
    ...valueCells(CAGES[cageIndex])));

// Circle cell, then the arm of each arrow line drawn from it: the R4C1 circle
// carries three separate lines, each of which sums to it on its own.
const ARROWS = [
  ['R4C5', [['R3C6', 'R2C6']]],
  ['R4C1', [['R3C1'], ['R5C2'], ['R4C2', 'R5C3']]],
  ['R6C8', [['R6C7']]],
  ['R1C6', [['R1C7', 'R1C8']]],
];
const arrows = ARROWS.map(([circle, lines]) => new EqualSum(
  valueCells([circle]), ...lines.map(valueCells)));

const evenValue = Pair.fnToKey((primary, vd) => (primary + vd) % 2 === 0, shape);
const SHADED = ['R7C3', 'R8C1', 'R3C4', 'R4C7'];
const shaded = SHADED.map(
  cell => new Pair(evenValue, 'even value', cell, VD.at(cell)));

return [
  shape,
  VS.toVar('second digit'), VD.toVar('second digit value'),
  graph.makeReplicate(new Given(cells[0], ...DIGITS)),
  ...cells.map(cell => new Pair(secondDigitValue, 'second digit value',
    VS.at(cell), VD.at(cell))),
  ...cells.map(cell => new Pair(canonicalOrder, 'canonical digit order',
    cell, VS.at(cell))),
  ...houses, ...cageDigits, ...products, ...arrows, ...shaded,
];
