// Title: Fire and Water
// Author: Mad-Tyas
// Video: https://www.youtube.com/watch?v=HCeC3df8Lvk
// Source: https://sudokupad.app/kglg9thtij

// Normal sudoku rules apply.
//
// Fire/Water cells: there are nine Fire cells, exactly one in each row, column,
// and box (a hidden permutation set, not marked in the grid). There are also
// nine Water cells, independently following the same one-per-row/column/box
// rule. A cell may be a Fire cell, a Water cell, both, or neither.
//
// The "value" of a Fire or Water cell is its digit multiplied by the minimum
// number of orthogonal steps (Manhattan distance) between that box's Fire cell
// and its Water cell. A cell that is simultaneously Fire and Water has distance
// 0, so its value is 0. Every other cell's value is just its digit.
//
// Killer: dashed cages hold distinct digits, and their VALUES (not necessarily
// the raw digits) sum to the total in the top-left corner.

const graph = cellGraph('9x9');

// ISS caps a grid's value range at 16, so a Fire/Water "value" (up to 9 * 4 =
// 36, from a digit of 9 at one corner of a box and its partner at the
// opposite corner, Manhattan distance 4) can't live in one cell/Var. Split it
// into a tens digit (0-3) and a ones digit (0-9), each shifted by +1 for the
// grid's 1-based alphabet (so range 1-4 and 1-10) -- both comfortably under 16.
const RANGE = 10;
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// Fire/Water flags: one Var per grid cell, encoded {1 = not in the set,
// 2 = in the set}, following the doubler-flag convention (booleans share the
// grid's 1-based value alphabet).
const fire = graph.makeOverlay('VF');
const water = graph.makeOverlay('VW');

// Exactly one flagged cell per house (row/column/box): with 9 cells encoded
// 1/2 and exactly one 2, the house sums to 8*1 + 1*2 = 10.
const oneHotPerHouse = (flags) => graph.houses().map(
  (house) => new Sum(10, ...house.map((cell) => flags.at(cell))));

// Per-box local coordinates (0,1,2 within the box, row-major), needed to work
// out the in-box Fire/Water distance. boxIndexOf matches graph.boxes()'s
// reading-order numbering (verified against its topLeft formula).
const boxes = graph.boxes();
const boxIndexOf = (cell) => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
};

// Local-coordinate Vars (encoded local-coord + 1, so range 1-3), one per box,
// for each of the four quantities: fire's row/col, water's row/col.
const fireLocalRow = new Var('FR', 'fire local row in box (0-2, +1 shift)', 9);
const fireLocalCol = new Var('FC', 'fire local col in box (0-2, +1 shift)', 9);
const waterLocalRow = new Var('WR', 'water local row in box (0-2, +1 shift)', 9);
const waterLocalCol = new Var('WC', 'water local col in box (0-2, +1 shift)', 9);

// With exactly one flagEnc = 2 per box (the rest = 1):
//   sum(coord_i * flagEnc_i) = sum(coord_i) + coord_of_the_flagged_cell
// so   encVar (= coord_of_the_flagged_cell + 1)
//    = sum(coord_i * flagEnc_i) - sum(coord_i) + 1
// Rearranged into Sum's "coefficients sum to a constant" form:
//   sum(coord_i * flagEnc_i) - encVar = sum(coord_i) - 1
const localCoordConstraint = (encCell, flags, coordFn) => boxes.map((boxCells, bi) => {
  const coordTotal = boxCells.reduce((acc, _, i) => acc + coordFn(i), 0);
  const terms = boxCells
    .map((cell, i) => [flags.at(cell), coordFn(i)])
    .filter(([, coeff]) => coeff !== 0);
  return new Sum(coordTotal - 1, [encCell.cell(bi + 1), -1], ...terms);
});
const localRowOf = (i) => Math.floor(i / 3);
const localColOf = (i) => i % 3;

// Absolute difference of two encoded local coordinates (each range 1-3, true
// range 0-2), via an Or of the two possible signs -- the branch whose
// subtraction would be negative is simply infeasible against diffCell's
// 1-3 domain, so the solver is left with the correct one.
//   diffCell - 1 = |aCell - bCell|   (the +1 shift cancels in the subtraction)
// Branch A (a >= b): aCell - bCell - diffCell = -1
// Branch B (b >= a): bCell - aCell - diffCell = -1
const absDiff = (aCell, bCell, diffCell) => new Or([
  new Sum(-1, aCell, [bCell, -1], [diffCell, -1]),
  new Sum(-1, bCell, [aCell, -1], [diffCell, -1]),
]);

const diffRow = new Var('XR', 'abs row diff in box (0-2, +1 shift)', 9);
const diffCol = new Var('XC', 'abs col diff in box (0-2, +1 shift)', 9);
// Distance = diffRow + diffCol (both true, unshifted): with the +1 shift on
// each term, distEnc - 1 = (diffRowEnc - 1) + (diffColEnc - 1).
const dist = new Var('DS', 'box fire/water Manhattan distance (0-4, +1 shift)', 9);

const boxDistanceConstraints = range(1, 9).flatMap((b) => [
  absDiff(fireLocalRow.cell(b), waterLocalRow.cell(b), diffRow.cell(b)),
  absDiff(fireLocalCol.cell(b), waterLocalCol.cell(b), diffCol.cell(b)),
  new Sum(1, diffRow.cell(b), diffCol.cell(b), [dist.cell(b), -1]),
]);

// One cage-cell's "value" (digit, or digit*box-distance when the cell is Fire
// or Water) is digit * multiplier, a product of two variables -- not
// expressible as one linear Sum. Branch on the digit (9 options); once the
// digit is pinned to a constant d, branch on whether the cell is Fire/Water
// and, if so, on the box's exact distance (5 options) -- 1 + 5 = 6 cases, each
// pinning tensCell/onesCell to the resulting value's known tens/ones digits:
//   - not Fire and not Water:              value = d            (tens 0)
//   - Fire and/or Water, distance = e-1:   value = d * (e - 1)
const cellValueConstraint = (cell, fireCell, waterCell, distCell, tensCell, onesCell) => {
  const pinValue = (value) => [
    new Sum(Math.floor(value / 10) + 1, tensCell),
    new Sum((value % 10) + 1, onesCell),
  ];
  return new Or(range(1, 9).map((d) => new And([
    new Sum(d, cell), // pin this cage cell's digit to d
    new Or([
      new And([ // not Fire and not Water: plain digit value
        new Sum(1, fireCell),
        new Sum(1, waterCell),
        ...pinValue(d),
      ]),
      ...range(1, 5).map((e) => new And([ // Fire and/or Water at distance e-1
        new Or([new Sum(2, fireCell), new Sum(2, waterCell)]),
        new Sum(e, distCell),
        ...pinValue(d * (e - 1)),
      ])),
    ]),
  ])));
};

const CAGES = [
  { cells: ['R1C3', 'R1C4', 'R2C3'], total: 45 },
  { cells: ['R1C5', 'R2C4', 'R2C5'], total: 41 },
  { cells: ['R8C7', 'R9C6', 'R9C7'], total: 43 },
  { cells: ['R8C5', 'R8C6', 'R9C5'], total: 41 },
  { cells: ['R3C1', 'R3C2', 'R4C2'], total: 15 },
  { cells: ['R6C8', 'R7C8', 'R7C9'], total: 17 },
  { cells: ['R3C6', 'R3C7', 'R4C6'], total: 10 },
  { cells: ['R6C4', 'R7C3', 'R7C4'], total: 10 },
  { cells: ['R1C7', 'R1C8', 'R2C8'], total: 12 },
  { cells: ['R8C2', 'R9C2', 'R9C3'], total: 12 },
];
const cageCells = CAGES.flatMap((cage) => cage.cells);
const cageValueTens = new Var('CT', 'cage-cell value tens digit (0-3, +1 shift)', cageCells.length);
const cageValueOnes = new Var('CO', 'cage-cell value ones digit (0-9, +1 shift)', cageCells.length);
const cageTensOf = new Map(cageCells.map((cell, i) => [cell, cageValueTens.cell(i + 1)]));
const cageOnesOf = new Map(cageCells.map((cell, i) => [cell, cageValueOnes.cell(i + 1)]));

const cageCellValueConstraints = cageCells.map((cell) => cellValueConstraint(
  cell, fire.at(cell), water.at(cell), dist.cell(boxIndexOf(cell)),
  cageTensOf.get(cell), cageOnesOf.get(cell)));

const cageConstraints = CAGES.flatMap(({ cells, total }) => [
  new AllDifferent(...cells),
  // value = 10*(tensEnc-1) + (onesEnc-1), so sum(value) = 10*sum(tensEnc) +
  // sum(onesEnc) - 11*cells.length.
  new Sum(
    total + 11 * cells.length,
    ...cells.map((cell) => [cageTensOf.get(cell), 10]),
    ...cells.map((cell) => cageOnesOf.get(cell))),
]);

return [
  new Shape('9x9', RANGE),
  // Restrict every main-grid cell back to true digits 1-9 (the extended
  // Shape range above exists only for the auxiliary Vars below).
  graph.makeReplicate(new Given(graph.cells()[0], ...range(1, 9))),

  fire.toVar('fire cell flags (2 = fire)'),
  water.toVar('water cell flags (2 = water)'),
  fire.makeReplicate(new Given(fire.cells()[0], 1, 2)),
  water.makeReplicate(new Given(water.cells()[0], 1, 2)),
  ...oneHotPerHouse(fire),
  ...oneHotPerHouse(water),

  fireLocalRow, fireLocalCol, waterLocalRow, waterLocalCol,
  ...fireLocalRow.cells().map((cell) => new Given(cell, 1, 2, 3)),
  ...fireLocalCol.cells().map((cell) => new Given(cell, 1, 2, 3)),
  ...waterLocalRow.cells().map((cell) => new Given(cell, 1, 2, 3)),
  ...waterLocalCol.cells().map((cell) => new Given(cell, 1, 2, 3)),
  ...localCoordConstraint(fireLocalRow, fire, localRowOf),
  ...localCoordConstraint(fireLocalCol, fire, localColOf),
  ...localCoordConstraint(waterLocalRow, water, localRowOf),
  ...localCoordConstraint(waterLocalCol, water, localColOf),

  diffRow, diffCol, dist,
  ...diffRow.cells().map((cell) => new Given(cell, 1, 2, 3)),
  ...diffCol.cells().map((cell) => new Given(cell, 1, 2, 3)),
  ...dist.cells().map((cell) => new Given(cell, 1, 2, 3, 4, 5)),
  ...boxDistanceConstraints,

  cageValueTens, cageValueOnes,
  ...cageValueTens.cells().map((cell) => new Given(cell, ...range(1, 4))),
  ...cageValueOnes.cells().map((cell) => new Given(cell, ...range(1, 10))),
  ...cageCellValueConstraints,
  ...cageConstraints,
];
