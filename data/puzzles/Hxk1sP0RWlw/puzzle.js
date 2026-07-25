// Title: Fault Lines
// Author: SeveNateNine
// Video: https://www.youtube.com/watch?v=Hxk1sP0RWlw
// Source: https://sudokupad.app/2qstow5gy2

// Yin-Yang: shade every cell with one of two colours so that each colour
// forms one orthogonally-connected region and no 2x2 block is monochrome.
// Arrows: each drawn arrow's circled cell equals the sum of its own arm
// (16 separate arrows; some circles carry two independent arms, each
// summing to the same circled digit).
// Coloring: two cells that share a diagonal (any distance, i.e. a bishop's
// move) and hold the same digit must be the same colour.
// Caged cells: the three single-cell, no-total cages mark cells that must
// all share one colour. (Each cage is disconnected from the others, so the
// tool could only draw them as separate single-cell outlines; the rules
// line "Caged cells must be the same color" links them as one group -- read
// per-cage it would be vacuous, since every drawn cage here has only one
// cell.)

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// Every rule above treats "shaded" and "unshaded" symmetrically (no rule
// names a colour), so swapping every shade label is always a second,
// solver-internal solution to this encoding with an identical digit grid.
// Pin one cell's label to remove that duplicate; it cannot exclude the true
// digit grid, since swapping the labels never changes it.
const pinShadeLabel = new Given(firstShade, SHADED);

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
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
}, graph.gridGeometry().numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Arrows -- one entry per drawn arrow, [circle cell, ...arm cells]; a
// circle with two arrows gets two Arrow constraints, each independently
// summing to the shared digit.
const arrows = [
  ['R2C3', 'R1C4'],
  ['R2C3', 'R3C4', 'R4C5', 'R3C6', 'R2C7'],
  ['R4C3', 'R3C4'],
  ['R1C7', 'R2C6', 'R3C5', 'R2C5'],
  ['R1C7', 'R2C8', 'R3C7'],
  ['R5C6', 'R4C6', 'R3C7'],
  ['R5C6', 'R4C7'],
  ['R4C2', 'R3C3'],
  ['R3C8', 'R4C7'],
  ['R3C8', 'R4C8', 'R5C7'],
  ['R7C6', 'R6C5'],
  ['R5C5', 'R4C4', 'R5C3'],
  ['R5C2', 'R6C3', 'R7C3'],
  ['R8C7', 'R9C6'],
  ['R7C8', 'R6C9'],
  ['R3C2', 'R4C1'],
];
const arrowConstraints = arrows.map(cells => new Arrow(...cells));

// Coloring: every diagonally-aligned cell pair (any distance) with equal
// digits must share a shade. Walk both diagonal directions from every cell
// to enumerate each unordered diagonal pair exactly once.
const diagonalPairs = [];
for (const cell of gridCells) {
  for (const [dRow, dCol] of [[1, 1], [1, -1]]) {
    for (let other = graph.step(cell, dRow, dCol); other;
      other = graph.step(other, dRow, dCol)) {
      diagonalPairs.push([cell, other]);
    }
  }
}
const bishopColorRules = diagonalPairs.map(([a, b]) => new Or([
  new AllDifferent(a, b),
  new SameValues(2, shade.at(a), shade.at(b)),
]));

// Caged cells (three single-cell, no-total cages: R7C2, R8C6, R6C4) must
// all be one colour.
const cagedCells = ['R7C2', 'R8C6', 'R6C4'];
const cagedSameColor = new SameValues(
  cagedCells.length, ...shade.at(cagedCells));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  pinShadeLabel,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...arrowConstraints,
  ...bishopColorRules,
  cagedSameColor,
];
