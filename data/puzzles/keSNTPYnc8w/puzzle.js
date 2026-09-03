// Title: Reef
// Author: zetamath
// Video: https://www.youtube.com/watch?v=keSNTPYnc8w
// Source: https://app.crackingthecryptic.com/sudoku/dhm2Md99Mt

// Normal sudoku rules apply, with one given: R9C2 = 5. Some cells are shaded
// as "coral" and the rest are "water", and:
//   1) all coral cells are orthogonally connected;
//   2) every body of water contains a cell on the edge of the grid;
//   3) no 2x2 block of the grid is entirely water or entirely coral;
//   4) digits do not repeat within a cage;
//   5) within each cage, the coral digits and the water digits sum to the same
//      total;
//   6) the digit in a circle counts the cells of its own cage that share that
//      cell's colour, itself included.
// Nothing is omitted. "Shade some cells" (at least one coral cell) is carried by
// rule 1's connectivity constraint, which rejects an empty coral set.
//
// The alphabet is widened to 0-9 so that an auxiliary cell can hold 0; the grid
// cells are restricted back to 1-9 below.

const CORAL = 1;
const WATER = 2;

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// --- Shading layer -------------------------------------------------------
// Rule 2 asks that every water component reach the outside of the grid, which
// is weaker than "the water forms one region" -- a coral wall spanning the grid
// may split the water into two border-touching bodies. So the shading layer is
// an 11x11 board: the 9x9 grid inset by one, surrounded by a ring of cells that
// are permanently water. Rule 2 is then exactly "the water cells form one
// connected region", the ring being part of it, and rule 1 is the same
// statement for the coral cells. Every other constraint below reads grid cells
// only, never the ring.
const shadeLayer = cellGraph('11x11').makeOverlay('VS');
const shadeVar = shadeLayer.toVar('shading');
// The grid sits inside the ring, so grid RxCy is layer cell (x + 1, y + 1).
const shadeAt = (cell) => {
  const { row, col } = parseCellId(cell);
  return shadeVar.cell(row + 1, col + 1);
};
const gridShade = new Set(gridCells.map(shadeAt));
const ringShade = shadeLayer.cells().filter(cell => !gridShade.has(cell));

const shading = [
  shadeVar,
  shadeLayer.makeReplicate(new Given(shadeVar.cell(1), CORAL, WATER)),
  ...ringShade.map(cell => new Given(cell, WATER)),
  new ConnectedValues('VS', CORAL),
  new ConnectedValues('VS', WATER),
];

// --- Coral-digit layer ---------------------------------------------------
// Rule 5 adds up the digits of a solver-chosen subset of a cage, a product of a
// digit and an indicator, so it needs one cell per grid cell holding that
// cell's digit when the cell is coral and 0 when it is water. The two halves of
// that definition, as Pair predicates over (grid digit, weight) and
// (shading, weight): the weight is the cell's own digit or 0, and it is
// non-zero exactly on the coral cells.
const coral = graph.makeOverlay('VC');
const digitKey = Pair.fnToKey((digit, w) => w === 0 || w === digit, shape);
const shadeKey = Pair.fnToKey((s, w) => (s === CORAL) === (w !== 0), shape);

const coralDigits = [
  coral.toVar('coral digit'),
  ...gridCells.map(
    cell => new Pair(digitKey, 'digit or 0', cell, coral.at(cell))),
  ...gridCells.map(
    cell => new Pair(shadeKey, 'nonzero iff coral', shadeAt(cell), coral.at(cell))),
];

// --- Rule 3 --------------------------------------------------------------
// Every 2x2 block of the grid must show both colours.
const noMonochrome2x2 = gridCells
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block !== null)
  .map(block => new ContainAtLeast(
    `${CORAL}_${WATER}`, ...block.map(shadeAt)));

// --- Rules 4 and 5 -------------------------------------------------------
// The fifteen drawn cage outlines, in the order the source lists them. None of
// them carries a printed total.
const cages = [
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R2C7', 'R3C7', 'R3C8', 'R3C9'],
  ['R1C6', 'R1C7', 'R2C6', 'R3C6'],
  ['R1C1', 'R1C2', 'R2C2', 'R2C3'],
  ['R2C1', 'R2C4', 'R3C1', 'R3C2', 'R3C3', 'R3C4'],
  ['R1C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C3', 'R5C4'],
  ['R4C1', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R6C3'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C9', 'R6C7'],
  ['R5C8', 'R6C8', 'R6C9', 'R7C7', 'R7C8'],
  ['R7C9', 'R8C9', 'R9C8', 'R9C9'],
  ['R5C5', 'R5C6', 'R6C4', 'R6C5'],
  ['R6C6', 'R7C5', 'R7C6', 'R8C6'],
  ['R7C3', 'R7C4', 'R8C4', 'R9C4'],
  ['R7C1', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
];

const cageDistinct = cages.map(cells => new AllDifferent(...cells));

// A cage's coral total is the sum of its VC cells and its water total is the
// sum of its digits minus that, so rule 5 is 2*sum(VC) - sum(digits) = 0.
const cageBalance = cages.map(cells => new Sum(
  0,
  ...cells.map(cell => [coral.at(cell), 2]),
  ...cells.map(cell => [cell, -1])));

// --- Rule 6 --------------------------------------------------------------
// The eight drawn circles, each read with the cage that contains it.
const circles = ['R1C1', 'R1C9', 'R2C1', 'R3C6', 'R3C9', 'R4C4', 'R4C5', 'R5C7'];

// With CORAL = 1 and WATER = 2, a cage of k cells has shading cells summing to
// S = 2k - (coral count), so coral count = 2k - S and water count = S - k. The
// circled digit counts whichever colour the circled cell itself holds, so the
// rule is a choice between those two readings.
const circleCounts = circles.map(cell => {
  const cage = cages.find(cells => cells.includes(cell));
  const cageShades = cage.map(shadeAt);
  return new Or([
    new And([
      new Given(shadeAt(cell), CORAL),
      new Sum(2 * cage.length, cell, ...cageShades)]),
    new And([
      new Given(shadeAt(cell), WATER),
      new Sum(cage.length, [cell, -1], ...cageShades)])]);
});

return [
  shape,
  // Only the auxiliary coral-digit cells may hold 0.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new Given('R9C2', 5),
  ...shading,
  ...coralDigits,
  ...noMonochrome2x2,
  ...cageDistinct,
  ...cageBalance,
  ...circleCounts,
];
