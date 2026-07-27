// Title: Foggy Pea-losophy
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=T29RlxU1Xt0
// Source: https://sudokupad.app/f6xcgzdav3

// Full encoding of: Sudoku, Yin Yang (with a neutral R5C5), Split Peas,
// Pea Circles, and XV. Fog is solving UI and is not encoded (it clears
// cells as they are solved; it imposes no final-grid rule).

const SHADED = 1;
const UNSHADED = 2;
const NEUTRAL = 3;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Yin Yang shading. R5C5 is fixed neutral (rules text); every other cell is
// shaded or unshaded, discovered by the solver.
const neutralCell = shade.at('R5C5');
const shadedCells = shade.cells().filter(c => c !== neutralCell);
const shadeDomain = shade.makeReplicate(
  new Given(shadedCells[0], SHADED, UNSHADED), shadedCells);

// Which physical region counts as "shaded" is a label the rules never fix:
// the connectivity, no-mono-2x2, sight-count and sum clues only ever compare
// cells to each other, never to an absolute shade name. Pin one arbitrary
// cell as a representative to break that label symmetry. This does not
// narrow which shadings are accepted, only which of the two mirror images
// of a given shape is reported.
const shadeRepresentative = new Given(shadedCells[0], SHADED);

// Each shade is one orthogonally-connected region; the neutral cell is an
// obstacle to both (it belongs to neither value).
const connectivity = [
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
];

// No 2x2 block may be all one shade (a block containing the neutral cell
// trivially can't be, since NEUTRAL only occurs once).
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

// Split Pea / Pea Circle lines: drawn cell order and circled cells (13
// white-filled, green-bordered circle marks).
const LINES = [
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2', 'R2C3', 'R1C3', 'R1C2'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C4',
    'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4',
    'R8C4', 'R8C5', 'R8C6', 'R7C6', 'R6C6', 'R6C5'],
  ['R1C6', 'R1C7', 'R2C7', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R4C6', 'R5C6'],
  ['R8C7', 'R7C7', 'R6C7', 'R6C8'],
];
const CIRCLE_CELLS = new Set([
  'R1C1', 'R1C2', 'R4C2', 'R3C4', 'R4C1', 'R4C5', 'R8C2', 'R5C6', 'R1C6',
  'R8C6', 'R6C5', 'R8C7', 'R6C8',
]);

// Split Peas: the sum of the cells strictly between two circles equals a
// concatenation of the two circles' digits, either circle holding the tens
// digit. Every consecutive pair of circles along a line is its own segment
// ("Every set of cells between two circles is a separate summation.").
function splitPeaSegment(between, c1, c2) {
  const asTensUnits = (tens, units) =>
    new Sum(0, ...between, [tens, -10], [units, -1]);
  return new Or([asTensUnits(c1, c2), asTensUnits(c2, c1)]);
}

// Pea Circles: the digit in a circle equals the length of the maximal run of
// cells of the circle's own shade, running both directions along the line
// from the circle (through other circles too, stopping only at a shade
// change or the line's end). Enumerate every window [start..end] containing
// the circle's index: one And per window pinning the digit to the window
// length, the window to the target shade, and each in-line boundary to the
// opposite shade; exactly one window is the true run, so the clue is their
// Or. The target shade is the circle's own (unknown) shade, so both shades
// are tried.
function sightCountConstraint(digitCell, lineCells, index, targetShade) {
  const blocker = targetShade === SHADED ? UNSHADED : SHADED;
  const starts = Array.from({ length: index + 1 }, (_, start) => start);
  const ends = Array.from(
    { length: lineCells.length - index }, (_, i) => index + i);
  // A run longer than the max digit can never be the true window (no digit
  // could record its length), so it is dropped rather than turned into an
  // out-of-range Given.
  const windows = starts.flatMap(start => ends
    .filter(end => end - start + 1 <= geometry.numValues)
    .map(end => ({ start, end })));

  return new Or(windows.map(({ start, end }) => new And([
    new Given(digitCell, end - start + 1),
    ...shade.at(lineCells.slice(start, end + 1))
      .map(cell => new Given(cell, targetShade)),
    ...(start > 0
      ? [new Given(shade.at(lineCells[start - 1]), blocker)] : []),
    ...(end + 1 < lineCells.length
      ? [new Given(shade.at(lineCells[end + 1]), blocker)] : []),
  ])));
}

const splitPeas = LINES.flatMap(line => {
  const circleIdxs = line
    .map((cell, i) => (CIRCLE_CELLS.has(cell) ? i : -1))
    .filter(i => i >= 0);
  return circleIdxs.slice(1).map((idx, k) => {
    const prev = circleIdxs[k];
    return splitPeaSegment(line.slice(prev + 1, idx), line[prev], line[idx]);
  });
});

const peaCircles = LINES.flatMap(line => line
  .map((cell, index) => (CIRCLE_CELLS.has(cell) ? { cell, index } : null))
  .filter(Boolean)
  .map(({ cell, index }) => new Or([
    sightCountConstraint(cell, line, index, SHADED),
    sightCountConstraint(cell, line, index, UNSHADED),
  ])));

// XV: drawn edge marks (V/X letters between the given cell pairs).
const vPairs = [
  ['R2C5', 'R2C6'],
  ['R6C4', 'R6C5'],
  ['R8C7', 'R9C7'],
  ['R8C5', 'R8C6'],
];
const xPairs = [
  ['R7C2', 'R7C3'],
];
const xv = [
  ...vPairs.map(pair => new V(...pair)),
  ...xPairs.map(pair => new X(...pair)),
];

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  shadeRepresentative,
  new Given(neutralCell, NEUTRAL),
  ...connectivity,
  noMono2x2,
  ...splitPeas,
  ...peaCircles,
  ...xv,
];
