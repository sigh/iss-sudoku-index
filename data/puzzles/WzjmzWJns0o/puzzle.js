// Title: Breakeven
// Author: Agent
// Video: https://www.youtube.com/watch?v=WzjmzWJns0o
// Source: https://app.crackingthecryptic.com/sudoku/dNrrG3Lgjt

// Normal sudoku (standard 3x3 boxes, no givens). Shade some cells: shaded
// cells form one orthogonally-connected region, unshaded cells form another
// (yin-yang connectivity), and no 2x2 block is monochrome. Ten killer cages
// (distinct digits, sum to the printed total); inside a cage, shaded cells
// hold even digits and unshaded cells hold odd digits. Cells outside every
// cage carry no shading-linked parity rule.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin (same construction as
// xin_yang_v2.js).
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Cages: cell lists and totals transcribed from the drawn cage geometry;
// each cage's own top-left cell carries the printed total.
const cages = [
  { cells: ['R1C2', 'R2C2', 'R3C2', 'R3C3'], total: 15 },
  { cells: ['R2C3', 'R1C3', 'R1C4', 'R1C5'], total: 22 },
  { cells: ['R2C4', 'R2C5', 'R3C5'], total: 12 },
  { cells: ['R3C4', 'R4C4', 'R4C3', 'R4C2'], total: 13 },
  { cells: ['R5C1', 'R6C1'], total: 5 },
  { cells: ['R5C2', 'R5C3', 'R5C4', 'R5C5', 'R6C4'], total: 18 },
  { cells: ['R7C3', 'R8C3', 'R8C4', 'R7C4'], total: 18 },
  { cells: ['R8C5', 'R8C6', 'R7C6', 'R7C7', 'R6C7', 'R6C8', 'R5C8'], total: 35 },
  { cells: ['R3C7', 'R3C8', 'R4C8'], total: 16 },
  { cells: ['R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6'], total: 27 },
];

const cageConstraints = cages.map(({ cells, total }) => new Cage(total, ...cells));

// Cage parity: a cage cell's digit is even exactly when its shade Var is
// SHADED, odd exactly when UNSHADED. One Pair per cage cell linking the
// digit cell to its own shade overlay cell (both drawn from the grid's 1-9
// value range).
const parityKey = Pair.fnToKey(
  (digit, shadeValue) => (shadeValue === SHADED) === (digit % 2 === 0),
  geometry.numValues);
const cageParity = cages.flatMap(({ cells }) => cells.map(
  cell => new Pair(parityKey, '', cell, shade.at(cell))));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...cageConstraints,
  ...cageParity,
];
