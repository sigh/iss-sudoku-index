// Title: Polyominos 2 - Kropki-esque
// Author: Thomas Occhipinti
// Video: https://www.youtube.com/watch?v=vDakUGey-Pk
// Source: https://app.crackingthecryptic.com/sudoku/99mhp87F4G

// Rules encoded here:
//   * Normal Sudoku.
//   * The grid divides fully into polyominoes; each holds exactly one circled
//     cell and no repeated digits. The circled cell's own digit is the number
//     of cells in its polyomino.
//   * White boxes: the two cells share a polyomino and hold consecutive
//     digits.
//   * Black boxes: the two cells are in different polyominoes and hold digits
//     in a 1:2 ratio.
//   * Three polyominoes (sizes 2, 6 and 8 -- the unique smallest and the
//     unique largest, plus one more) are fully drawn; their shapes are read
//     directly from the puzzle's shading, not solved for.
//   * "All such boxes of both types are given": every orthogonally adjacent
//     pair without a drawn box must be neither a same-polyomino consecutive
//     pair nor a different-polyomino 1:2-ratio pair.
// Nothing is omitted.

// The three drawn polyominoes (their exact cells, read off the puzzle's own
// shaded-region artwork).
const KNOWN_REGIONS = {
  A2: { cells: ['R3C3', 'R3C4'], anchor: 'R3C4', size: 2 },
  B6: { cells: ['R5C2', 'R5C3', 'R6C2', 'R6C3', 'R7C2', 'R8C2'], anchor: 'R5C3', size: 6 },
  C8: {
    cells: ['R5C6', 'R5C7', 'R5C8', 'R6C6', 'R7C6', 'R7C7', 'R8C7', 'R8C8'],
    anchor: 'R8C8', size: 8,
  },
};
const knownCells = Object.values(KNOWN_REGIONS).flatMap(r => r.cells);

// The remaining 15 circles (drawn overlay #24-#41 minus the three matched
// above) anchor 15 undrawn polyominoes. Label values are arbitrary ids, one
// per anchor, used only inside this script.
const ANCHORS = [
  { cell: 'R1C3', label: 1 }, { cell: 'R2C2', label: 2 }, { cell: 'R3C1', label: 3 },
  { cell: 'R8C1', label: 4 }, { cell: 'R8C3', label: 5 }, { cell: 'R4C4', label: 6 },
  { cell: 'R4C5', label: 7 }, { cell: 'R9C5', label: 8 }, { cell: 'R8C6', label: 9 },
  { cell: 'R9C7', label: 10 }, { cell: 'R6C8', label: 11 }, { cell: 'R5C9', label: 12 },
  { cell: 'R1C9', label: 13 }, { cell: 'R3C7', label: 14 }, { cell: 'R1C6', label: 15 },
];

// Drawn white boxes (edge(...) overlays, fill=white): same polyomino, consecutive.
// Split by whether each side is a cell of a known (already fully drawn) region.
const WHITE_EDGES = [
  ['R1C1', 'R1C2'], ['R3C2', 'R4C2'], ['R5C2', 'R6C2'], ['R7C2', 'R8C2'],
  ['R8C1', 'R9C1'], ['R8C6', 'R9C6'], ['R7C7', 'R8C7'], ['R6C6', 'R7C6'],
  ['R6C5', 'R7C5'], ['R4C5', 'R5C5'], ['R1C7', 'R2C7'], ['R2C7', 'R2C8'],
  ['R1C9', 'R2C9'],
];
// Drawn black boxes (edge overlays, fill=black): different polyomino, 1:2 ratio.
const BLACK_EDGES = [
  ['R1C3', 'R2C3'], ['R1C4', 'R2C4'], ['R2C9', 'R3C9'], ['R3C6', 'R3C7'],
  ['R3C4', 'R4C4'], ['R4C8', 'R5C8'], ['R6C1', 'R6C2'], ['R7C1', 'R7C2'],
  ['R6C3', 'R7C3'], ['R8C8', 'R8C9'], ['R9C5', 'R9C6'],
];

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const NONE = 16; // "not part of any of the 15 undrawn polyominoes"
const shape = new Shape('9x9', NONE);
const graph = cellGraph(shape);
const geom = graph.gridGeometry();
const gridCells = graph.cells();
const knownSet = new Set(knownCells);
const unclued = gridCells.filter(c => !knownSet.has(c));

const label = graph.makeOverlay('VP');

// Grid digits stay 1-9; the widened alphabet exists only for the label layer.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// The three drawn polyominoes: circle's digit = cell count (read from the
// shading, not solved for), and no repeated digit inside the shape.
const knownGivens = Object.values(KNOWN_REGIONS).map(r => new Given(r.anchor, r.size));
const knownAllDifferent = Object.values(KNOWN_REGIONS).map(r => new AllDifferent(...r.cells));
const knownLabelPins = knownCells.map(c => new Given(label.at(c), NONE));

// Each of the 15 circles sits inside its own (undrawn) polyomino.
const anchorGivens = ANCHORS.map(a => new Given(label.at(a.cell), a.label));

const dist = (a, b) => {
  const p = parseCellId(a), q = parseCellId(b);
  return Math.abs(p.row - q.row) + Math.abs(p.col - q.col);
};

// A polyomino has at most 9 cells and is connected, so a member cell is at
// most 8 steps from its own circle. reach() is that static candidate set,
// used both to bound each cell's label domain and to scope every NFA scan.
const reach = (a) => unclued.filter(c => dist(c, a.cell) <= 8);

// Every non-drawn cell joins exactly one of the 15 polyominoes -- its label
// domain is whichever circles it could possibly reach.
const labelDomains = unclued.map(c => new Given(
  label.at(c), ...ANCHORS.filter(a => dist(c, a.cell) <= 8).map(a => a.label),
));

// A polyomino is one orthogonally connected region: the cells sharing a label
// form exactly one connected component.
const connectivity = ANCHORS.map(a => new ConnectedValues('VP', a.label));

// Sound propagation cut, not new content: a member at distance d from its
// circle needs the circle's own digit (the polyomino's size) to exceed d.
const nearKey = (lbl, d) => Pair.fnToKey((l, n) => l !== lbl || n > d, geom);
const nearRules = ANCHORS.flatMap(a => reach(a)
  .filter(c => c !== a.cell)
  .map(c => new Pair(nearKey(a.label, dist(c, a.cell)), 'reach', label.at(c), a.cell)));

// Each polyomino's NFA scan: the circle's own digit (the target size), then
// alternating (label, digit) over every cell that could reach it.
const scan = (a) => [a.cell, ...reach(a).flatMap(c => [label.at(c), c])];

// Size = the circle's own digit. State: n = target size (read first), c =
// count of member cells seen so far, act alternates between reading a label
// (-1) and reading the digit of a cell that is (1) or is not (0) a member.
const sizeSpec = (lbl) => NFA.encodeSpec({
  startState: { n: null },
  transition: (s, v) => {
    if (s.n === null) return { n: v, c: 0, act: -1 };
    if (s.act === -1) return { n: s.n, c: s.c, act: (v === lbl ? 1 : 0) };
    if (s.act === 0) return { n: s.n, c: s.c, act: -1 };
    const c = s.c + 1;
    if (c > s.n) return undefined;
    return { n: s.n, c, act: -1 };
  },
  accept: (s) => s.n !== null && s.c === s.n,
}, geom);
const sizeRules = ANCHORS.map(a => new NFA(sizeSpec(a.label), `size${a.label}`, ...scan(a)));

// No repeated digit inside a polyomino: one machine per (polyomino, digit)
// rejects a second member cell holding that digit. Reuses the size scan minus
// the leading circle-digit symbol.
const distinctSpec = (lbl, digit) => NFA.encodeSpec({
  startState: { seen: 0, act: -1 },
  transition: (s, v) => {
    if (s.act === -1) return { seen: s.seen, act: (v === lbl ? 1 : 0) };
    if (s.act === 0 || v !== digit) return { seen: s.seen, act: -1 };
    if (s.seen) return undefined;
    return { seen: 1, act: -1 };
  },
  accept: () => true,
}, geom);
const distinctRules = ANCHORS.flatMap(a => DIGITS.map(
  d => new NFA(distinctSpec(a.label, d), `uniq${a.label}_${d}`, ...scan(a).slice(1))));

// White/black boxes. Membership is a plain fact, not a condition, so each
// marked edge asserts it directly: known-known pairs and known-unclued pairs
// get their membership fact from the drawn shapes (a known polyomino is
// closed, so any edge leaving it is automatically a different-polyomino
// edge); unclued-unclued pairs assert label equality/inequality alongside the
// digit relation.
const whiteRules = WHITE_EDGES.flatMap(([a, b]) => {
  const rules = [new WhiteDot(a, b)];
  if (!knownSet.has(a) && !knownSet.has(b)) {
    // Both cells are unclued (every white edge in the source is either this,
    // or wholly inside one already-drawn known region, where membership is
    // already a fact and needs no extra constraint).
    rules.push(new SameValues(2, label.at(a), label.at(b)));
  }
  return rules;
});
const blackRules = BLACK_EDGES.flatMap(([a, b]) => {
  const rules = [new BlackDot(a, b)];
  if (!knownSet.has(a) && !knownSet.has(b)) {
    rules.push(new AllDifferent(label.at(a), label.at(b)));
  }
  return rules;
});

// "All such boxes of both types are given": every orthogonal pair without a
// drawn box must fail both readings -- not a same-polyomino consecutive pair,
// not a different-polyomino 1:2-ratio pair. Membership is a fixed fact for a
// pair touching a known (already fully drawn) region -- closed shape, so any
// edge leaving it is a different-polyomino edge -- and a solver choice (the
// label Vars) between two unclued cells.
const regionOf = {};
for (const [name, r] of Object.entries(KNOWN_REGIONS)) {
  for (const c of r.cells) regionOf[c] = name;
}
const pairKey = (a, b) => [a, b].sort().join('|');
const markedPairs = new Set([...WHITE_EDGES, ...BLACK_EDGES].map(([a, b]) => pairKey(a, b)));
const orthogonalPairs = gridCells.flatMap(a => [
  graph.step(a, 0, 1),
  graph.step(a, 1, 0),
].filter(b => b !== null).map(b => [a, b]));

const notConsecutiveKey = Pair.fnToKey((x, y) => Math.abs(x - y) !== 1, geom);
const notRatioKey = Pair.fnToKey((x, y) => x !== 2 * y && y !== 2 * x, geom);

const exhaustivenessRules = orthogonalPairs
  .filter(([a, b]) => !markedPairs.has(pairKey(a, b)))
  .flatMap(([a, b]) => {
    const notConsecutive = new Pair(notConsecutiveKey, 'not-consec', a, b);
    const notRatio = new Pair(notRatioKey, 'not-ratio', a, b);
    const ra = regionOf[a], rb = regionOf[b];
    if (ra && rb && ra === rb) return [notConsecutive]; // same known region: same-poly is a fact
    if (ra && rb && ra !== rb) return [notRatio]; // different known regions: diff-poly is a fact
    if (ra || rb) return [notRatio]; // one known (closed), one unclued: always diff-poly
    // Both unclued: same-poly is (label.at(a) === label.at(b)), a solver choice.
    return [
      new Or([new And([new AllDifferent(label.at(a), label.at(b))]), new And([notConsecutive])]),
      new Or([new And([new SameValues(2, label.at(a), label.at(b))]), new And([notRatio])]),
    ];
  });

return [
  shape,
  label.toVar('label'),
  digitDomain,
  ...knownGivens,
  ...knownAllDifferent,
  ...knownLabelPins,
  ...anchorGivens,
  ...labelDomains,
  ...nearRules,
  ...connectivity,
  ...sizeRules,
  ...distinctRules,
  ...whiteRules,
  ...blackRules,
  ...exhaustivenessRules,
];
