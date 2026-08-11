// Title: Yin Yang Kropki Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=uZhwZ27yHV4
// Source: https://app.crackingthecryptic.com/sudoku/92LftNNtD4

// Normal sudoku rules apply. A Yin-Yang shading (black/white) partitions the
// grid into two orthogonally-connected sets with no monochrome 2x2 block.
// Grey dots mark adjacent same-coloured cell pairs: on two black cells the
// digits are in a 1:2 ratio; on two white cells the digits are consecutive.
// "ALL possible grey dots are given" licenses the converse as a rule: any
// same-coloured adjacent pair WITHOUT a dot must NOT carry the matching
// relation (ratio for black, consecutive for white). Differently-coloured
// adjacent pairs are unconstrained either way, and same-coloured pairs may
// still carry the *other* relation (e.g. two adjacent black cells may be
// consecutive) without a dot.

const SHADED = 1;   // black
const UNSHADED = 2; // white

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

// Every shade Var is either shaded (black) or unshaded (white).
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// Grey dots drawn between adjacent cells (19 total).
const dots = [
  ['R1C4', 'R1C5'], ['R3C1', 'R3C2'], ['R3C4', 'R3C5'], ['R3C5', 'R3C6'],
  ['R4C4', 'R4C5'], ['R6C5', 'R6C6'], ['R4C7', 'R4C8'], ['R4C8', 'R4C9'],
  ['R6C1', 'R6C2'], ['R9C2', 'R9C3'], ['R7C8', 'R7C9'],
  ['R1C1', 'R2C1'], ['R1C3', 'R2C3'], ['R3C3', 'R4C3'], ['R4C6', 'R5C6'],
  ['R5C4', 'R6C4'], ['R5C7', 'R6C7'], ['R7C4', 'R8C4'], ['R7C7', 'R8C7'],
];
const dotSet = new Set(dots.map(([a, b]) => `${a}|${b}`));

// Every orthogonally-adjacent cell pair in the grid, each listed once
// (left-right, then top-down), so it can be classified as dotted or not.
const gridCells = graph.cells();
const allEdges = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  if (right) allEdges.push([cell, right]);
  const down = graph.step(cell, 1, 0);
  if (down) allEdges.push([cell, down]);
}

const notRatioKey = Pair.fnToKey(
  (a, b) => a !== 2 * b && b !== 2 * a, geometry);
const notConsecutiveKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1, geometry);

// Dotted pair: same colour, plus the digit relation matching that colour.
const dotRules = dots.map(([a, b]) => new Or([
  new And([
    new Given(shade.at(a), SHADED),
    new Given(shade.at(b), SHADED),
    new BlackDot(a, b),
  ]),
  new And([
    new Given(shade.at(a), UNSHADED),
    new Given(shade.at(b), UNSHADED),
    new WhiteDot(a, b),
  ]),
]));

// Undotted pair: forbid the matching relation when both cells share the
// colour that relation is defined for. Or(shadeA=UNSHADED, shadeB=UNSHADED,
// notRatio) === NOT(both SHADED AND ratio); the other Or is its mirror.
const negRules = allEdges
  .filter(([a, b]) => !dotSet.has(`${a}|${b}`))
  .flatMap(([a, b]) => [
    new Or([
      new Given(shade.at(a), UNSHADED),
      new Given(shade.at(b), UNSHADED),
      new Pair(notRatioKey, 'not-1:2', a, b),
    ]),
    new Or([
      new Given(shade.at(a), SHADED),
      new Given(shade.at(b), SHADED),
      new Pair(notConsecutiveKey, 'not-consecutive', a, b),
    ]),
  ]);

// No 2x2 block may be all one colour: one stamped NFA on the top-left
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
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  new Given('R8C6', 2),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...dotRules,
  ...negRules,
];
