// Title: Aquapelago
// Author: Menderbug
// Video: https://www.youtube.com/watch?v=Kpbb67x4moI
// Source: https://app.crackingthecryptic.com/sudoku/qbHfnf7n9b

// Rules: Shade some cells so that no two shaded cells are orthogonally
// adjacent and the remaining unshaded cells form one orthogonally connected
// area. No 2x2 area may be entirely unshaded. Clued cells must be shaded, and
// indicate the number of shaded cells in the diagonally connected group they
// belong to.
//
// This is not a digit-sudoku: there is no row/column/box play at all, only a
// shading. The grid is a Raw shape whose "digit" at each cell is the shading
// state (SHADED or UNSHADED); a widened alphabet also carries an auxiliary
// diagonal-adjacency overlay described below.
//
// The setter marks 8 cells with a grey background (drawn art, 180-degree
// rotationally symmetric); 3 of them additionally print a count (R3C5=5,
// R3C9=6, R7C1=4). All 8 are read as "clued cells" under the rules sentence
// "Clued cells must be shaded": every marked cell is a forced-shaded given,
// and the 3 that print a number additionally state their diagonal group's
// size. The other 5 are forced-shaded with no size stated for their group.

const SHADED = 1;
const UNSHADED = 2;

const shape = new Shape('9x9', 6, 'Raw');
const graph = cellGraph(shape);

// The 8 grey-background cells from the drawn art (row, col, clued size or
// null when the cell is shaded but its group's size is not printed).
const CLUED_CELLS = [
  { row: 1, col: 7, size: null },
  { row: 3, col: 9, size: 6 },
  { row: 3, col: 5, size: 5 },
  { row: 7, col: 1, size: 4 },
  { row: 9, col: 3, size: null },
  { row: 7, col: 5, size: null },
  { row: 5, col: 3, size: null },
  { row: 5, col: 7, size: null },
];
const cluedKey = (row, col) => `${row},${col}`;
const cluedByCell = new Map(
  CLUED_CELLS.map(c => [cluedKey(c.row, c.col), c]));

// --- Board givens: every cell is SHADED or UNSHADED, stamped over the whole
// grid with one Replicate; the 8 marked cells additionally get the narrower
// Given(cell, SHADED), which intersects with the stamped domain. ---
const allBoardCells = graph.cells();
const cluedCells = allBoardCells.filter(c => {
  const { row, col } = parseCellId(c);
  return cluedByCell.has(cluedKey(row, col));
});
const boardGivens = [
  ...cluedCells.map(c => new Given(c, SHADED)),
  new Replicate(
    [new Given(allBoardCells[0], SHADED, UNSHADED)],
    Replicate.encodeTargetCells(allBoardCells, allBoardCells[0], graph),
    allBoardCells[0]),
];

// --- No two shaded cells orthogonally adjacent. One template per direction
// (rightward, downward), each stamped over every cell that has that
// neighbour, with Replicate. ---
const noAdjacentShadedKey = Pair.fnToKey((a, b) => !(a === SHADED && b === SHADED), shape);
const rightTargets = graph.cells().filter(c => graph.step(c, 0, 1) !== null);
const downTargets = graph.cells().filter(c => graph.step(c, 1, 0) !== null);
const noAdjacentShadedPairs = [
  new Replicate(
    [new Pair(noAdjacentShadedKey, 'no-adjacent-shaded', rightTargets[0], graph.step(rightTargets[0], 0, 1))],
    Replicate.encodeTargetCells(rightTargets, rightTargets[0], graph),
    rightTargets[0]),
  new Replicate(
    [new Pair(noAdjacentShadedKey, 'no-adjacent-shaded', downTargets[0], graph.step(downTargets[0], 1, 0))],
    Replicate.encodeTargetCells(downTargets, downTargets[0], graph),
    downTargets[0]),
];

// --- No 2x2 area entirely unshaded: each block contains at least one SHADED cell. ---
const no2x2UnshadedBlocks = [];
for (let row = 1; row <= 8; row++) {
  for (let col = 1; col <= 8; col++) {
    no2x2UnshadedBlocks.push(new Quad(makeCellId(row, col), SHADED));
  }
}

// --- The unshaded cells form one orthogonally connected area. ---
const unshadedConnected = new ConnectedValues('', UNSHADED);

// --- Diagonal-connected group sizes for the 3 numbered clues. ---
//
// Diagonal adjacency preserves the parity of (row + col), so a diagonally
// connected group of shaded cells lives entirely within one checkerboard
// colour class, and never touches the other class. All 8 marked cells sit on
// the (row + col) even class (checked by hand from the coordinates above).
//
// Rotating that class 45 degrees turns diagonal adjacency into ordinary
// orthogonal adjacency: with u = (row + col) / 2 and v = (row - col) / 2,
// each of a cell's 4 diagonal neighbours maps to one of (u, v)'s 4 orthogonal
// neighbours (a short check of the four offsets confirms this). The auxiliary
// Var group VD below is exactly that (u, v) grid -- one 9x9 layer laid out
// with u as its row and v (shifted by +5 to stay positive) as its column.
// Cells of VD whose (u, v) does not correspond to an in-range (row, col) are
// pinned to UNSHADED_MIRROR: they carry no real board cell and must never
// take part in a diagonal group.
const vd = new Var('D', 'diagonal groups', '9x9');
// A locator sized to VD's own 9x9 layout: its cell ids already coincide with
// vd.cell(row, col) and it supports step()/cells(), unlike the plain Var group.
const vdLocator = cellGraph('9x9').makeOverlay('VD');

const UNSHADED_MIRROR = UNSHADED;   // 2: the paired board cell is unshaded, or off-board.
const GROUP_NONE = 3;               // shaded, but not part of a numbered clue's group.
const GROUP_A = 4;                  // R3C5's group (clue 5).
const GROUP_B = 5;                  // R3C9's group (clue 6).
const GROUP_C = 6;                  // R7C1's group (clue 4).

const GROUPS = [
  { row: 3, col: 5, value: GROUP_A, size: 5 },
  { row: 3, col: 9, value: GROUP_B, size: 6 },
  { row: 7, col: 1, value: GROUP_C, size: 4 },
];
const groupByCell = new Map(GROUPS.map(g => [cluedKey(g.row, g.col), g.value]));

const vdGivens = [];
// (row, col) <-> (u, v) with v shifted to stay within 1..9 as v' = v + 5.
const boardCellForUV = (u, vPrime) => {
  const v = vPrime - 5;
  const row = u + v;
  const col = u - v;
  return (row >= 1 && row <= 9 && col >= 1 && col <= 9) ? { row, col } : null;
};

const crossLinkKey = Pair.fnToKey(
  (a, b) => (a === UNSHADED_MIRROR && b === UNSHADED) || (a >= GROUP_NONE && b === SHADED),
  shape);
const crossLinkPairs = [];

for (let u = 1; u <= 9; u++) {
  for (let vPrime = 1; vPrime <= 9; vPrime++) {
    const vdCell = vd.cell(u, vPrime);
    const boardPos = boardCellForUV(u, vPrime);
    if (!boardPos) {
      vdGivens.push(new Given(vdCell, UNSHADED_MIRROR));
      continue;
    }
    const anchorValue = groupByCell.get(cluedKey(boardPos.row, boardPos.col));
    if (anchorValue) {
      vdGivens.push(new Given(vdCell, anchorValue));
    } else {
      vdGivens.push(new Given(vdCell, UNSHADED_MIRROR, GROUP_NONE, GROUP_A, GROUP_B, GROUP_C));
    }
    crossLinkPairs.push(new Pair(
      crossLinkKey, 'diag-mirror', vdCell, makeCellId(boardPos.row, boardPos.col)));
  }
}

// Two diagonally-adjacent shaded cells belong to the same true diagonal
// group, so whenever both are shaded (VD value >= GROUP_NONE) they must carry
// the *same* VD value. Without this, a numbered clue's group could be
// under-counted by leaving a genuinely-connected shaded cell unlabelled (or
// mislabelled into a different clue's group).
const groupMergeKey = Pair.fnToKey(
  (a, b) => !(a >= GROUP_NONE && b >= GROUP_NONE) || a === b,
  shape);
const vdRightTargets = vdLocator.cells().filter(c => vdLocator.step(c, 0, 1) !== null);
const vdDownTargets = vdLocator.cells().filter(c => vdLocator.step(c, 1, 0) !== null);
const groupMergePairs = [
  new Replicate(
    [new Pair(groupMergeKey, 'diag-merge', vdRightTargets[0], vdLocator.step(vdRightTargets[0], 0, 1))],
    Replicate.encodeTargetCells(vdRightTargets, vdRightTargets[0], vdLocator),
    vdRightTargets[0]),
  new Replicate(
    [new Pair(groupMergeKey, 'diag-merge', vdDownTargets[0], vdLocator.step(vdDownTargets[0], 1, 0))],
    Replicate.encodeTargetCells(vdDownTargets, vdDownTargets[0], vdLocator),
    vdDownTargets[0]),
];

const groupConnectivity = GROUPS.map(
  g => new ConnectedValues('VD', g.value, g.size));

return [
  shape,
  vd,
  ...boardGivens,
  ...noAdjacentShadedPairs,
  ...no2x2UnshadedBlocks,
  unshadedConnected,
  ...vdGivens,
  ...crossLinkPairs,
  ...groupMergePairs,
  ...groupConnectivity,
];
