// Title: Stranger in a Strange Land
// Author: Wuschel
// Video: https://www.youtube.com/watch?v=PAAS013jMOM
// Source: https://sudokupad.app/hqyaharmuk

// Normal sudoku, plus: shade some cells so shaded cells form one orthogonally
// connected region, unshaded cells form another, and no 2x2 block is
// monochrome (rules text). Each cell also carries a derived "value": digit+1
// when shaded, digit-1 when unshaded (rules text). The blue lines' equal
// box-border-segment sums and the black/white dots are stated in terms of
// this value, not the digit itself. Fog and its reveal triggers are solving
// UI only (clear as digits are entered) and have no bearing on the finished
// grid, so they are omitted.

const SHADED = 1;
const UNSHADED = 2;

// Shape is widened to 0-10 so the "value" overlay (digit-1 .. digit+1, i.e.
// 0..10) fits the grid's value range; real grid cells are restricted back to
// 1-9 below.
const shape = new Shape('9x9', '0-10');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const shade = graph.makeOverlay('VS');
const value = graph.makeOverlay('VV');

const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// value = digit+1 (shaded) or digit-1 (unshaded). No class expresses a
// shade-conditioned linear relation, so each cell is an Or of the two cases,
// each an And of the shade Given and the Sum it forces
// (digit - value = -1 when shaded, +1 when unshaded).
const valueLinks = gridCells.map(cell => {
  const d = cell;
  const s = shade.at(cell);
  const v = value.at(cell);
  return new Or([
    new And([new Given(s, SHADED), new Sum(-1, d, [v, -1])]),
    new And([new Given(s, UNSHADED), new Sum(1, d, [v, -1])]),
  ]);
});

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, val) => {
    if (done === true) return { done: true };
    const next = [...seen, val];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(x => x === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// White dots (values differ by 1) and black dots (one value double the
// other), from the drawn edge-circle overlays; both act on "value", not the
// digit. Absence of a dot carries no negative information (rules text), so
// undotted pairs get no constraint.
const whiteDotPairs = [
  ['R9C2', 'R9C3'], ['R9C1', 'R9C2'], ['R8C1', 'R9C1'], ['R7C1', 'R8C1'],
  ['R1C2', 'R2C2'], ['R1C2', 'R1C3'], ['R1C3', 'R2C3'], ['R2C2', 'R2C3'],
  ['R1C5', 'R2C5'], ['R2C5', 'R3C5'],
];
const blackDotPairs = [
  ['R2C7', 'R2C8'], ['R6C2', 'R7C2'], ['R4C2', 'R5C2'], ['R4C7', 'R5C7'],
  ['R7C6', 'R7C7'],
];
const dotRules = [
  ...whiteDotPairs.map(pair => new WhiteDot(...value.at(pair))),
  ...blackDotPairs.map(pair => new BlackDot(...value.at(pair))),
];

// Blue lines: each line's value-sum is the same across every box-border
// segment, encoded as one EqualSum per line over the value overlay (segments
// derived from the drawn waypoints' box membership, not RegionSumLine, since
// that class only recognizes the real grid's own boxes). A closed loop that
// begins and ends in the same box has its wrap-around run merged into one
// segment (loop 4 below).
const lineSegments = [
  // Loop/path 1 (open, 4 cells): R9C7-R9C6-R8C7-R7C8.
  [['R9C7'], ['R9C6'], ['R8C7', 'R7C8']],
  // Loop/path 2 (open, 7 cells): R6C8-R6C7-R5C6-R4C5-R4C4-R3C3-R3C2.
  [['R6C8', 'R6C7'], ['R5C6', 'R4C5', 'R4C4'], ['R3C3', 'R3C2']],
  // Loops 3a+3b (closed, 4+4 cells): R6C3-R6C4-R7C4-R7C3-(R6C3) and
  // R7C3-R8C3-R8C2-R7C2-(R7C3), two closed strokes meeting only at R7C3 (a
  // 4-way branch there; drawn as one connected stroke union). Read as one
  // line, so R7C3's box segment is the other stroke's whole box (R7C3,
  // R8C3, R8C2, R7C2 all share the bottom-left box) rather than R7C3 alone.
  [['R6C3'], ['R6C4'], ['R7C4'], ['R7C3', 'R8C3', 'R8C2', 'R7C2']],
  // Loop 4 (closed, 10 cells): R3C9-R4C8-R4C7-R4C6-R3C6-R2C6-R1C7-R1C8-R1C9-
  // R2C9-(back to R3C9). R3C9 and R1C7..R2C9 share a box and the wrap edge
  // R2C9/R3C9 crosses no box border, so they are one 5-cell segment.
  [
    ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
    ['R4C8', 'R4C7'],
    ['R4C6'],
    ['R3C6', 'R2C6'],
  ],
];
function equalSumOverValue(segments) {
  const lengths = segments.map(segment => segment.length);
  const flatValues = value.at(segments.flat());
  const valueSegments = [];
  let offset = 0;
  for (const length of lengths) {
    valueSegments.push(flatValues.slice(offset, offset + length));
    offset += length;
  }
  return new EqualSum(...valueSegments);
}
const equalSumLines = lineSegments.map(equalSumOverValue);

return [
  shape,
  shade.toVar('shade'),
  value.toVar('value'),
  digitDomain,
  shadeDomain,
  ...valueLinks,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...dotRules,
  ...equalSumLines,
];
