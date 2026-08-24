// Title: Snakes on a Plane
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=RJb1n9v_oiE
// Source: https://app.crackingthecryptic.com/sudoku/Dgtf7gGM4L

// Rules encoded here:
//  - Normal sudoku (rows, columns, 3x3 boxes all different; boxes are the
//    payload's own drawn regions, so no NoBoxes/RegionSize override needed).
//  - 16 pre-filled digits.
//  - The grid is partitioned into 17 orthogonally connected "snakes": one of
//    length 9, and two each of length 1-8. Digits don't repeat within a
//    snake.
//  - Nine given numbers each sit inside their own snake's own host cell and
//    give that snake's digit total. The rules state these nine snakes are
//    all differently sized: nine distinct size values (1-9) shared among
//    nine such snakes is a permutation, so exactly one of the nine is the
//    sole length-9 snake and the other eight take the eight remaining
//    (distinct) sizes 1-8.
//
// Omitted: "A snake is 1 cell wide, and has exactly one single bend" -- the
// snake's SHAPE beyond being connected and correctly sized.
//
// The 17 snakes are solver-discovered, so they live in three label layers
// (VA/VB/VC): a cell holds at most 9 values and there are 17 snakes. VA
// (labels 1-8, value 9 = elsewhere) carries the
// eight UNCLUED "twin" snakes, one per size 1-8. VB (labels 1-8, value 9 =
// elsewhere) and VC (label 2, value 1 = elsewhere) together carry the nine
// CLUED snakes, one per killer-clue cell.
//
// Exactly two snakes share each size 1-8, and the "nine differently sized"
// clued snakes cover every size 1-9 exactly once, so exactly one snake of
// each size 1-8 is clued and the other is not. Fixing each twin LABEL's own
// target size to a distinct compile-time constant 1-8 is therefore a
// labelling convention -- an artifact of this encoding, not a puzzle fact --
// and it also breaks the twin-label permutation symmetry (interchangeable
// labels would otherwise multiply the solution count by 8!). Each clued
// snake instead carries a size Var (domain 1-9), with AllDifferent across
// all nine forcing the stated permutation.

const NUM_VALUES = 9;
const geometry = cellGeometry('9x9');
const graph = cellGraph(geometry);
const gridCells = graph.cells();
const layers = {
  VA: graph.makeOverlay('VA'),
  VB: graph.makeOverlay('VB'),
  VC: graph.makeOverlay('VC'),
};

// Pre-filled digits, row-major from the source payload's own cell grid.
const GIVENS = [
  ['R1C3', 2], ['R1C6', 4], ['R1C7', 5], ['R2C2', 1], ['R2C6', 6],
  ['R2C7', 2], ['R4C9', 2], ['R5C3', 9], ['R5C7', 3], ['R5C8', 4],
  ['R5C9', 5], ['R6C4', 9], ['R6C9', 1], ['R8C5', 2], ['R8C7', 9],
  ['R9C4', 5],
];

// The nine killer-clue cells and their printed totals. Eight are arbitrarily
// assigned to VB, the ninth to VC's only label (2);
// which clue lands on which layer/label id is an encoding artifact, since
// each is anchored to its own real, distinct grid cell regardless.
const CLUES = [
  { cell: 'R9C1', total: 5, layer: 'VB', label: 1 },
  { cell: 'R9C2', total: 3, layer: 'VB', label: 2 },
  { cell: 'R6C3', total: 21, layer: 'VB', label: 3 },
  { cell: 'R5C4', total: 18, layer: 'VB', label: 4 },
  { cell: 'R1C7', total: 40, layer: 'VB', label: 5 },
  { cell: 'R2C7', total: 45, layer: 'VB', label: 6 },
  { cell: 'R2C8', total: 30, layer: 'VB', label: 7 },
  { cell: 'R3C8', total: 37, layer: 'VB', label: 8 },
  { cell: 'R7C6', total: 41, layer: 'VC', label: 2 },
];
const TWIN_LABELS = [1, 2, 3, 4, 5, 6, 7, 8]; // VA label k -> target size k.

const sizeVar = new Var('F', 'clued snake sizes', CLUES.length);
const sizes = sizeVar.cells();

// A snake has at most 9 cells, so it reaches at most 8 orthogonal steps from
// any one of its own cells -- in particular from its clue's host cell.
const distance = (cellA, cellB) => {
  const a = parseCellId(cellA), b = parseCellId(cellB);
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};
const reachable = anchorCell =>
  gridCells.filter(cell => distance(cell, anchorCell) < NUM_VALUES);

// Interleaved [label, digit] stream: an NFA reading it sees each cell's
// snake membership immediately before its digit.
const labelDigitStream = (layer, cells) =>
  cells.flatMap(cell => [layers[layer].at(cell), cell]);

// Clued-layer label domains, restricted to the clue cells each grid cell can
// reach. VA (the unclued twins) has no anchor cell to bound reach from, so
// it keeps its full default domain.
const domainOf = (layer, layerCell) => {
  const spare = layer === 'VC' ? 1 : NUM_VALUES; // this layer's "elsewhere"
  const cell = layers[layer].gridAt(layerCell);
  return [spare, ...CLUES.filter(
    c => c.layer === layer && distance(cell, c.cell) < NUM_VALUES
  ).map(c => c.label)];
};
const labelDomainConstraints = layer => {
  const cells = layers[layer].cells();
  const domains = cells.map(cell => domainOf(layer, cell));
  const widest = [...new Set(domains.flat())].sort((a, b) => a - b);
  return [
    ...(widest.length < NUM_VALUES
      ? [layers[layer].makeReplicate(new Given(cells[0], ...widest))] : []),
    ...cells.flatMap((cell, i) =>
      domains[i].length < widest.length ? [new Given(cell, ...domains[i])] : []),
  ];
};

// Exactly one of the three layers claims each cell, so the 17 label classes
// partition the grid. Read as [VA, VB, VC] per cell, across the whole grid.
const partitionNFA = NFA.encodeSpec({
  startState: { phase: 0, claims: 0 },
  transition({ phase, claims }, value) {
    const claimed = phase === 0 ? value <= 8 : phase === 1 ? value <= 8 : value === 2;
    const total = claims + (claimed ? 1 : 0);
    if (total > 1) return undefined;
    if (phase < 2) return { phase: phase + 1, claims: total };
    return total === 1 ? { phase: 0, claims: 0 } : undefined;
  },
  accept: ({ phase }) => phase === 0,
}, NUM_VALUES);

// Twin snake size: a compile-time constant (the label IS the target size).
// Reads the whole VA layer (no anchor cell to bound reach with).
const twinSizeNFA = size => NFA.encodeSpec({
  startState: 0,
  transition(count, value) {
    const next = count + (value === size ? 1 : 0);
    return next > size ? undefined : next;
  },
  accept: count => count === size,
}, NUM_VALUES);

// Clued snake size: reads the size Var first, then counts label cells
// against it. Read as [size Var, then the reachable slice of the layer].
const sizeNFA = label => NFA.encodeSpec({
  startState: { size: null, count: 0 },
  transition({ size, count }, value) {
    if (size === null) return { size: value, count: 0 };
    const next = count + (value === label ? 1 : 0);
    return next > size ? undefined : { size, count: next };
  },
  accept: ({ size, count }) => size !== null && count === size,
}, NUM_VALUES);

// Clued snake sum: total of the digits on the label's own cells equals the
// printed clue value. Read as the [label, digit] stream over reachable cells.
const sumNFA = (label, target) => NFA.encodeSpec({
  startState: { expectLabel: true, own: false, sum: 0 },
  transition({ expectLabel, own, sum }, value) {
    if (expectLabel) return { expectLabel: false, own: value === label, sum };
    if (own) {
      const next = sum + value;
      return next > target ? undefined : { expectLabel: true, own: false, sum: next };
    }
    return { expectLabel: true, own: false, sum };
  },
  accept: ({ expectLabel, sum }) => expectLabel && sum === target,
}, NUM_VALUES);

// No digit twice in a snake: the set of digits on the label's own cells,
// carried as a 9-bit mask, rejecting a repeat as soon as it is seen. Read as
// the [label, digit] stream.
const noRepeatNFA = label => NFA.encodeSpec({
  startState: { expectLabel: true, own: false, mask: 0 },
  transition({ expectLabel, own, mask }, value) {
    if (expectLabel) return { expectLabel: false, own: value === label, mask };
    if (own) {
      const bit = 1 << (value - 1);
      return (mask & bit) ? undefined : { expectLabel: true, own: false, mask: mask | bit };
    }
    return { expectLabel: true, own: false, mask };
  },
  accept: ({ expectLabel }) => expectLabel,
}, NUM_VALUES);

return [
  new Shape('9x9'),
  layers.VA.toVar('unclued twin snake labels'),
  layers.VB.toVar('clued snake labels a'),
  layers.VC.toVar('clued snake labels b'),
  sizeVar,

  // VC only ever marks its one clued snake's membership.
  layers.VC.makeReplicate(new Given(layers.VC.cells()[0], 1, 2)),

  ...GIVENS.map(([cell, d]) => new Given(cell, d)),

  new NFA(partitionNFA, 'one snake per cell',
    ...gridCells.flatMap(cell => [
      layers.VA.at(cell), layers.VB.at(cell), layers.VC.at(cell)])),

  // Every snake is a single orthogonally connected block.
  ...TWIN_LABELS.map(k => new ConnectedValues('VA', k)),
  ...CLUES.filter(c => c.layer === 'VB').map(c => new ConnectedValues('VB', c.label)),
  new ConnectedValues('VC', 2),

  // Each clue is pinned to its own snake, so every clued snake holds exactly
  // one clue.
  ...CLUES.map(c => new Given(layers[c.layer].at(c.cell), c.label)),

  // Clued-layer label domains, restricted to reachable clue cells.
  ...labelDomainConstraints('VB'),
  ...labelDomainConstraints('VC'),

  // "Nine differently sized snakes."
  new AllDifferent(...sizes),

  // Twin sizes: fixed compile-time targets (see header note).
  ...TWIN_LABELS.map(k =>
    new NFA(twinSizeNFA(k), `twin ${k} size`, ...layers.VA.cells())),

  // Twin no-repeat: full VA layer, since twins have no anchor to bound reach.
  ...TWIN_LABELS.map(k =>
    new NFA(noRepeatNFA(k), `twin ${k} distinct`,
      ...labelDigitStream('VA', gridCells))),

  // Clued size, sum and no-repeat: bounded to each clue's reachable cells.
  ...CLUES.map((c, i) => new NFA(sizeNFA(c.label), `clued ${c.cell} size`,
    sizes[i], ...layers[c.layer].at(reachable(c.cell)))),
  ...CLUES.map(c => new NFA(sumNFA(c.label, c.total), `clued ${c.cell} sum`,
    ...labelDigitStream(c.layer, reachable(c.cell)))),
  ...CLUES.map(c => new NFA(noRepeatNFA(c.label), `clued ${c.cell} distinct`,
    ...labelDigitStream(c.layer, reachable(c.cell)))),
];
