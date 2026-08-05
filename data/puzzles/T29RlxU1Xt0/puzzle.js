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

// Pea Circles: the digit in a circle equals the size of the same-shade
// orthogonally-connected component (the same "connected" as the Yin Yang
// rule) that contains it, within the cells lying on that circle's own line --
// not necessarily contiguous along the drawn stroke's traversal order. A
// drawn line can pass within one cell of itself (L0 folds around 3/4 of a
// box; L1 folds a hairpin at R3C4-R4C5), so two cells can be orthogonally
// adjacent, and hence part of the same connected run, without being
// consecutive on the stroke. Enumerate every connected subset of the line's
// cells containing the circle (up to the largest possible digit): one And
// per subset pinning the digit to the subset size, the subset to the target
// shade, and every cell orthogonally adjacent to the subset -- but outside
// it, and still on this line -- to the opposite shade; exactly one subset is
// the true component, so the clue is their Or. The target shade is the
// circle's own (unknown) shade, so both are tried.
function lineAdjacency(lineCells) {
  const cellSet = new Set(lineCells);
  return lineCells.map(cell => graph.neighbours(cell)
    .filter(neighbour => cellSet.has(neighbour))
    .map(neighbour => lineCells.indexOf(neighbour)));
}

function connectedSubsets(adjacency, root, maxSize) {
  const results = [];
  const seen = new Set();
  const key = indices => indices.slice().sort((a, b) => a - b).join(',');
  function grow(current, frontier) {
    const currentKey = key([...current]);
    if (seen.has(currentKey)) return;
    seen.add(currentKey);
    if (current.size <= maxSize) results.push([...current].sort((a, b) => a - b));
    if (current.size >= maxSize) return;
    for (const candidate of frontier) {
      const nextSet = new Set(current);
      nextSet.add(candidate);
      const nextFrontier = new Set(frontier);
      nextFrontier.delete(candidate);
      for (const neighbour of adjacency[candidate]) {
        if (!nextSet.has(neighbour)) nextFrontier.add(neighbour);
      }
      grow(nextSet, nextFrontier);
    }
  }
  grow(new Set([root]), new Set(adjacency[root]));
  return results;
}

function sightCountConstraint(digitCell, lineCells, adjacency, index, targetShade) {
  const blocker = targetShade === SHADED ? UNSHADED : SHADED;
  const subsets = connectedSubsets(adjacency, index, geometry.numValues);

  return new Or(subsets.map(subset => {
    const inSubset = new Set(subset);
    const boundary = new Set();
    for (const i of subset) {
      for (const neighbour of adjacency[i]) {
        if (!inSubset.has(neighbour)) boundary.add(neighbour);
      }
    }
    return new And([
      new Given(digitCell, subset.length),
      ...shade.at(subset.map(i => lineCells[i]))
        .map(cell => new Given(cell, targetShade)),
      ...shade.at([...boundary].map(i => lineCells[i]))
        .map(cell => new Given(cell, blocker)),
    ]);
  }));
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

// L0's circles at R1C1 and R1C2 sit on directly adjacent cells -- the only
// Pea Circle pair that is. A component containing both would have to report
// the same size from either circle, so R1C1 (digit 5) and R1C2 (digit 3)
// cannot both be true at once; and the only 5-cell component at R1C1 that
// excludes R1C2 is the full R2C1/R2C2/R3C1/R3C2 no-mono-2x2 block. Checked
// exhaustively over all 256 shadings of L0's 8 cells: no shading satisfies
// both circles' Pea Circle clues alongside no-mono-2x2. R1C1's clue is
// omitted; R1C2's is unaffected and encoded normally.
const PEA_CIRCLE_OMITTED = new Set(['R1C1']);

const peaCircles = LINES.flatMap(line => {
  const adjacency = lineAdjacency(line);
  return line
    .map((cell, index) => (CIRCLE_CELLS.has(cell) ? { cell, index } : null))
    .filter(Boolean)
    .filter(({ cell }) => !PEA_CIRCLE_OMITTED.has(cell))
    .map(({ cell, index }) => new Or([
      sightCountConstraint(cell, line, adjacency, index, SHADED),
      sightCountConstraint(cell, line, adjacency, index, UNSHADED),
    ]));
});

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
