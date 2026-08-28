// Title: Black and White
// Author: Thomas Occhipinti
// Video: https://www.youtube.com/watch?v=N3bfncZTHt0
// Source: https://app.crackingthecryptic.com/sudoku/mr3fHnMfQp

// Normal sudoku rules apply, with one given: R5C5 = 4. Some cells must be
// shaded, so that:
//   1) all shaded cells are orthogonally connected;
//   2) no 2x2 region is entirely shaded or entirely unshaded;
//   3) no group of unshaded cells is enclosed by shaded cells;
//   4) the clue outside a row or column is the sum of that line's shaded digits;
//   5) all circled cells are shaded;
//   6) the digit in a circle is the number of shaded cells in its box.
//
// The alphabet is widened to 0-9 so that an auxiliary cell can hold 0; the grid
// cells are restricted back to 1-9 below.

const SHADED = 1;
const UNSHADED = 2;

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// --- Shading layer -------------------------------------------------------
// Rule 3 forbids an unshaded group that is walled in, i.e. every unshaded cell
// must reach the outside of the grid through unshaded cells. So the shading
// layer is an 11x11 board: the 9x9 grid inset by one, surrounded by a border
// ring of cells that are permanently unshaded. Rule 3 is then exactly "the
// unshaded cells form one connected region", the ring being part of it, and
// rule 1 is the same statement for the shaded cells.
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
  shadeLayer.makeReplicate(new Given(shadeVar.cell(1), SHADED, UNSHADED)),
  ...ringShade.map(cell => new Given(cell, UNSHADED)),
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
];

// --- Shaded-digit layer --------------------------------------------------
// One cell per grid cell, holding that cell's digit when it is shaded and 0
// when it is not, so that rule 4 is a plain sum along a row or column.
const weight = graph.makeOverlay('VW');
// The two halves of that definition: the weight is the cell's own digit or 0,
// and it is non-zero exactly on the shaded cells.
const digitKey = Pair.fnToKey((digit, w) => w === 0 || w === digit, shape);
const shadeKey = Pair.fnToKey((s, w) => (s === SHADED) === (w !== 0), shape);

const weights = [
  weight.toVar('shaded digit'),
  ...gridCells.map(
    cell => new Pair(digitKey, 'digit or 0', cell, weight.at(cell))),
  ...gridCells.map(
    cell => new Pair(shadeKey, 'nonzero iff shaded', shadeAt(cell), weight.at(cell))),
];

// --- Rule 2 --------------------------------------------------------------
// Every 2x2 block of the grid must show both shades.
const noMonochrome2x2 = gridCells
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block !== null)
  .map(block => new ContainAtLeast(
    `${SHADED}_${UNSHADED}`, ...block.map(shadeAt)));

// --- Rule 4 --------------------------------------------------------------
// Clues printed to the left of each row and above each column, in order.
const rowClues = [17, 38, 9, 44, 13, 40, 24, 43, 8];
const colClues = [38, 21, 30, 30, 7, 15, 28, 38, 29];

const lineSums = [
  ...rowClues.map((clue, i) => new Sum(clue, ...weight.row(i + 1))),
  ...colClues.map((clue, i) => new Sum(clue, ...weight.column(i + 1))),
];

// --- Rules 5 and 6 -------------------------------------------------------
// Circled cells, read off the drawn circles.
const circles = ['R2C5', 'R3C3', 'R3C8', 'R5C1', 'R5C8', 'R8C5', 'R9C1', 'R9C8'];

const circleRules = [
  ...circles.map(cell => new Given(shadeAt(cell), SHADED)),
  // A box's nine shading cells sum to 9*UNSHADED minus its shaded count, so
  // rule 6 is "circled digit + that sum = 9*UNSHADED".
  ...circles.map(cell => new Sum(
    9 * UNSHADED, cell,
    ...graph.boxes().find(box => box.includes(cell)).map(shadeAt))),
];

return [
  shape,
  // Only the auxiliary shaded-digit cells may hold 0.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new Given('R5C5', 4),
  ...shading,
  ...weights,
  ...noMonochrome2x2,
  ...lineSums,
  ...circleRules,
];
