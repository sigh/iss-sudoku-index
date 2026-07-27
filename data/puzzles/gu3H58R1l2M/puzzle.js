// Title: Renban Caves
// Author: yttrio
// Video: https://www.youtube.com/watch?v=gu3H58R1l2M
// Source: https://sudokupad.app/vgbfcjxvav

// Partial encoding. Shading is a Var overlay (SHADED/UNSHADED per cell); the
// unshaded cells' single-region connectivity, the circle visibility clues,
// the white-dot shade-parity, and each box's shading-dependent Renban split
// are all encoded below. Omitted: "every shaded cell connects to the grid
// edge through other shaded cells" (shaded cells may form several separate
// blobs, each independently touching the border) -- ConnectedValues only
// expresses a *single* connected region for a value class, and there is no
// way to give a Var overlay a border-adjacent sink cell (Var groups never
// share adjacency edges with the main grid or each other), so this half of
// the shading rule has no ISS encoding. Only the unshaded side's
// single-region rule is enforced below; shaded topology is otherwise
// unconstrained. A "2x2 area may be entirely shaded or entirely unshaded" is
// simply the absence of any such rule -- nothing to encode.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

// Every shade Var is SHADED or UNSHADED.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(new Given(firstShade, SHADED, UNSHADED));

// Unshaded cells form exactly one orthogonally connected region.
const unshadedConnectivity = new ConnectedValues('VS', UNSHADED);

// --- Circle clues ---------------------------------------------------------
// Provenance: the drawn circle marks, decoded to cell centers.
const circles = [
  'R1C1', 'R3C3', 'R1C5', 'R1C6', 'R1C9',
  'R3C5', 'R5C1', 'R6C4', 'R6C5', 'R9C5', 'R7C8',
];

const circlesUnshaded = circles.map(cell => new Given(shade.at(cell), UNSHADED));

// Each circle's own digit equals the length of the unshaded run covering it
// in its row, plus the length of the unshaded run covering it in its column,
// minus 1 (the cell itself is counted in both runs). A run is the maximal
// contiguous unshaded stretch containing the cell, bounded by a shaded cell
// or the grid edge -- i.e. exactly the horizontal/vertical visibility the
// rule describes.
//
// runLengthConstraint enumerates every window [start..end] of `lineCells`
// containing `index`: pin the aux var to the window's length, the window to
// UNSHADED, and each in-line boundary cell (if any) to SHADED. Exactly one
// window is the true run, so the rule is their Or.
function runLengthConstraint(targetVarCell, lineCells, index) {
  const starts = Array.from({ length: index + 1 }, (_, s) => s);
  const ends = Array.from({ length: lineCells.length - index }, (_, i) => index + i);
  return new Or(starts.flatMap(start => ends.map(end => new And([
    new Given(targetVarCell, end - start + 1),
    ...shade.at(lineCells.slice(start, end + 1)).map(c => new Given(c, UNSHADED)),
    ...(start > 0
      ? [new Given(shade.at(lineCells[start - 1]), SHADED)] : []),
    ...(end + 1 < lineCells.length
      ? [new Given(shade.at(lineCells[end + 1]), SHADED)] : []),
  ]))));
}

const rowRun = new Var('RL', 'circle row run lengths', circles.length);
const colRun = new Var('CL', 'circle column run lengths', circles.length);

const runRules = circles.flatMap((cell, i) => {
  const { row, col } = parseCellId(cell);
  return [
    runLengthConstraint(rowRun.cell(i + 1), graph.row(cell), col - 1),
    runLengthConstraint(colRun.cell(i + 1), graph.column(cell), row - 1),
  ];
});

// digit = rowRun + colRun - 1
const sightSums = circles.map((cell, i) =>
  new Sum(-1, cell, [rowRun.cell(i + 1), -1], [colRun.cell(i + 1), -1]));

// --- White dots -------------------------------------------------------------
// Provenance: the drawn edge-centered rounded marks.
const dots = [
  ['R1C2', 'R2C2'],
  ['R2C2', 'R3C2'],
  ['R4C4', 'R4C5'],
  ['R1C8', 'R2C8'],
  ['R6C8', 'R6C9'],
  ['R5C7', 'R6C7'],
  ['R7C6', 'R8C6'],
  ['R8C7', 'R8C8'],
];

const dotRules = dots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  // Two-value shade domain, so "opposite shades" is just all-different.
  new AllDifferent(...shade.at([a, b])),
]);

// --- Per-box Renban on shading-connected components -------------------------
// A box's maximal connected unshaded components are determined by its own
// shading, so this is an enumerable-catalogue implication: for every
// connected subset S (size >= 2) of a box's 9 cells, "S is unshaded and every
// box-adjacent cell outside S is shaded" implies Renban(S). Enumerate the
// (fixed, box-topology-only) candidate subsets once and apply the resulting
// template to each box; single-cell components need no rule (Renban of one
// cell is vacuous).
function connectedSubsetPositions(size) {
  const cellCount = size * size;
  const neighbourPositions = pos => {
    const r = Math.floor(pos / size), c = pos % size;
    const result = [];
    if (r > 0) result.push(pos - size);
    if (r < size - 1) result.push(pos + size);
    if (c > 0) result.push(pos - 1);
    if (c < size - 1) result.push(pos + 1);
    return result;
  };
  const isConnected = subset => {
    const set = new Set(subset);
    const seen = new Set([subset[0]]);
    const stack = [subset[0]];
    while (stack.length) {
      const cur = stack.pop();
      for (const nb of neighbourPositions(cur)) {
        if (set.has(nb) && !seen.has(nb)) { seen.add(nb); stack.push(nb); }
      }
    }
    return seen.size === set.size;
  };
  const subsets = [];
  for (let mask = 1; mask < (1 << cellCount); mask++) {
    const subset = [];
    for (let p = 0; p < cellCount; p++) if (mask & (1 << p)) subset.push(p);
    if (subset.length >= 2 && isConnected(subset)) subsets.push(subset);
  }
  return subsets;
}

const boxSubsetPositions = connectedSubsetPositions(3); // 209 candidates

function boxRenbanRules(boxCells) {
  // boxCells: the box's 9 cells, row-major (matches connectedSubsetPositions'
  // 0..8 row-major position numbering).
  return boxSubsetPositions.map(subsetPositions => {
    const inSet = new Set(subsetPositions);
    const boundary = new Set();
    for (const pos of subsetPositions) {
      const r = Math.floor(pos / 3), c = pos % 3;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
          const np = nr * 3 + nc;
          if (!inSet.has(np)) boundary.add(np);
        }
      }
    }
    const setCells = subsetPositions.map(p => boxCells[p]);
    const boundaryCells = [...boundary].map(p => boxCells[p]);
    // Negation of "S unshaded and boundary(S) shaded", i.e. some S cell is
    // shaded or some boundary cell is unshaded, or else S must be Renban.
    return new Or([
      ...setCells.map(c => new Given(shade.at(c), SHADED)),
      ...boundaryCells.map(c => new Given(shade.at(c), UNSHADED)),
      new Renban(...setCells),
    ]);
  });
}

const boxRenbans = graph.boxes().flatMap(boxRenbanRules);

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  rowRun,
  colRun,
  shadeDomain,
  unshadedConnectivity,
  ...circlesUnshaded,
  ...runRules,
  ...sightSums,
  ...dotRules,
  ...boxRenbans,
];
