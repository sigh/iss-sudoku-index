// Title: Rising Tide
// Author: Nordy
// Video: https://www.youtube.com/watch?v=QWlRxdCKfxg
// Source: https://sudokupad.app/fB4rmjbndh

// Normal sudoku rules apply; there are no given digits.
//
// German whispers: along the green lines, adjacent digits must have a
// difference of 5 or greater.
//
// Coral variant: some cells are coral and others are water. The high digits
// and 5 {5,6,7,8,9} are all part of the coral. All coral cells are
// orthogonally connected. The low digits {1,2,3,4} are all part of the water.
// There may be multiple bodies of water, and all bodies of water are
// orthogonally connected to the edge of the grid. No 2x2 area is entirely
// coral or entirely water.
//
// {5,6,7,8,9} and {1,2,3,4} exhaust the digits, so a cell's side is fixed by
// its digit; the shading layer below is tied to the grid rather than chosen.

const CORAL = 1;
const WATER = 2;

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// --- Coral / water layer -------------------------------------------------
// The water clause permits several bodies and asks each of them to reach the
// grid edge, which is not "the water is one region". So the layer is 11x11:
// the 9x9 grid inset by one inside a border ring whose cells are pinned WATER.
// The ring is itself connected, so ConnectedValues on WATER says exactly
// "every water cell reaches the ring through water", i.e. reaches the outside
// of the grid, while several in-grid bodies stay legal. No ring cell is coral,
// so ConnectedValues on CORAL is the plain "all coral is one region".
const shadeLayer = cellGraph('11x11').makeOverlay('VS');
const shadeVar = shadeLayer.toVar('coral/water');
// The grid sits inside the ring, so grid RxCy is layer cell (x + 1, y + 1).
const shadeAt = (cell) => {
  const { row, col } = parseCellId(cell);
  return shadeVar.cell(row + 1, col + 1);
};
const gridShade = new Set(gridCells.map(shadeAt));
const ringShade = shadeLayer.cells().filter(cell => !gridShade.has(cell));

// The digit decides the side: coral exactly on 5-9, water exactly on 1-4.
const sideKey = Pair.fnToKey(
  (digit, side) => (digit >= 5) === (side === CORAL), shape);

const shading = [
  shadeVar,
  // The layer is two-valued; only CORAL and WATER exist on it.
  shadeLayer.makeReplicate(new Given(shadeVar.cell(1), CORAL, WATER)),
  ...ringShade.map(cell => new Given(cell, WATER)),
  ...gridCells.map(
    cell => new Pair(sideKey, 'coral iff high', cell, shadeAt(cell))),
  new ConnectedValues('VS', CORAL),
  new ConnectedValues('VS', WATER),
];

// --- No monochrome 2x2 ---------------------------------------------------
// Over the 64 blocks of the grid only: the ring is entirely WATER, so a block
// overlapping it would reject every grid.
const noMonochrome2x2 = gridCells
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block !== null)
  .map(block => new ContainAtLeast(
    `${CORAL}_${WATER}`, ...block.map(shadeAt)));

// --- German whispers -----------------------------------------------------
// The nine green lines, each read off the drawn stroke as its run of
// orthogonally adjacent cells.
const greenLines = [
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C3'],
  ['R8C5', 'R9C5'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R8C7', 'R7C7', 'R6C7', 'R5C7', 'R5C8', 'R4C8'],
  ['R2C9', 'R3C9'],
  ['R2C5', 'R2C6'],
  ['R7C8', 'R6C8', 'R6C9', 'R5C9'],
];

const whispers = greenLines.map(line => new Whisper(5, ...line));

return [
  shape,
  ...shading,
  ...noMonochrome2x2,
  ...whispers,
];
