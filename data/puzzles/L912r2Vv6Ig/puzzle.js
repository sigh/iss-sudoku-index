// Title: Consectuive Territories
// Author: masetab
// Video: https://www.youtube.com/watch?v=L912r2Vv6Ig
// Source: https://sudokupad.app/x61fnlh3u8

// Rules encoded here:
//  - Rows and columns hold 1-9 once each (no 3x3 boxes: the puzzle's "regions"
//    are the ones the solver builds).
//  - The grid is partitioned into 17 orthogonally connected regions, one per
//    circle. A region's cell count equals the digit in its own circle: the
//    circles are drawn empty, so "the number in the region's circle" is the
//    digit the solver writes in that circled cell.
//  - Each region holds a set of consecutive digits, no digit repeated.
//  - A black dot is a 1:2 pair, a white dot a consecutive pair, and both cells
//    of a dot lie in the same region. Dots are not exhaustive, so unmarked
//    pairs get no constraint.
//  - Two little killer clues of 7.
//
// The regions are unknown, so they are carried by three label layers plus a
// base-digit variable per region:
//   VA  1-8 = regions 1-8,   9 = "elsewhere"
//   VB  1-8 = regions 9-16,  9 = "elsewhere"
//   VC  2   = region 17,     1 = "elsewhere"
//   VE  one cell per region, holding that region's lowest digit
// Three layers are needed because a cell holds at most 9 values while the
// puzzle has 17 regions; ConnectedValues then gets one single-value set per
// region on a full-grid layer, which is what it requires.

// One entry per drawn circle, in the order they are drawn: the cell the circle
// sits on, the label layer that carries its region, and that region's label
// value. Which layer holds which region is an arbitrary but fixed split.
const CIRCLES = [
  { cell: 'R1C1', layer: 'VA', label: 1 },
  { cell: 'R2C1', layer: 'VA', label: 2 },
  { cell: 'R1C2', layer: 'VA', label: 3 },
  { cell: 'R2C2', layer: 'VA', label: 4 },
  { cell: 'R3C2', layer: 'VA', label: 5 },
  { cell: 'R2C3', layer: 'VA', label: 6 },
  { cell: 'R4C2', layer: 'VA', label: 7 },
  { cell: 'R5C1', layer: 'VA', label: 8 },
  { cell: 'R2C9', layer: 'VB', label: 1 },
  { cell: 'R3C9', layer: 'VB', label: 2 },
  { cell: 'R3C8', layer: 'VB', label: 3 },
  { cell: 'R4C9', layer: 'VB', label: 4 },
  { cell: 'R8C1', layer: 'VB', label: 5 },
  { cell: 'R6C3', layer: 'VB', label: 6 },
  { cell: 'R4C4', layer: 'VB', label: 7 },
  { cell: 'R2C6', layer: 'VB', label: 8 },
  { cell: 'R3C5', layer: 'VC', label: 2 },
];

// The drawn edge dots.
const BLACK_DOTS = [['R5C8', 'R6C8'], ['R4C9', 'R5C9']];
const WHITE_DOTS = [
  ['R2C5', 'R2C6'], ['R7C9', 'R8C9'], ['R2C8', 'R2C9'], ['R8C4', 'R8C5'],
];

// Drawn little killer clues: total, then the diagonal's cells.
const LITTLE_KILLERS = [
  { total: 7, cells: ['R2C1', 'R1C2'] },
  { total: 7, cells: ['R9C8', 'R8C9'] },
];

const NUM_VALUES = 9;
const geometry = cellGeometry('9x9');
const graph = cellGraph(geometry);
const gridCells = graph.cells();
const layers = {
  VA: graph.makeOverlay('VA'),
  VB: graph.makeOverlay('VB'),
  VC: graph.makeOverlay('VC'),
};
const baseVar = new Var('E', 'region base digits', CIRCLES.length);
const bases = baseVar.cells();

// A region has at most 9 cells, because its size is a digit, so it reaches at
// most 8 orthogonal steps from its circle: cells beyond that cannot carry its
// label, and its machines need not scan them.
const distance = (cellA, cellB) => {
  const a = parseCellId(cellA), b = parseCellId(cellB);
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};
const reachable = circleCell => gridCells.filter(
  cell => distance(cell, circleCell) < NUM_VALUES);

// Interleaved [label, digit] streams: an NFA reading such a stream sees each
// cell's region membership immediately before its digit.
const labelDigitStream = (layer, cells) =>
  cells.flatMap(cell => [layers[layer].at(cell), cell]);

// The label values still available to a layer cell, once out-of-reach regions
// are removed.
const domainOf = (layer, layerCell) => {
  const spare = layer === 'VC' ? 1 : NUM_VALUES;   // the "elsewhere" value
  const cell = layers[layer].gridAt(layerCell);
  return [spare, ...CIRCLES.filter(
    circle => circle.layer === layer && distance(cell, circle.cell) < NUM_VALUES
  ).map(circle => circle.label)];
};

// Stamp each layer's widest domain over the whole layer, then narrow the cells
// that reach fewer regions.
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

// Region size: the digit in the region's circle counts the cells carrying that
// region's label. Read as [circle digit, then the whole label layer].
const sizeNFA = label => NFA.encodeSpec({
  startState: { size: null, count: 0 },
  transition({ size, count }, value) {
    if (size === null) return { size: value, count: 0 };
    const next = count + (value === label ? 1 : 0);
    return next > size ? undefined : { size, count: next };
  },
  accept: ({ size, count }) => size !== null && count === size,
}, NUM_VALUES);

// Region window: every digit in the region lies in [base, base + size - 1].
// Read as [circle digit, region base, then the [label, digit] stream].
const windowNFA = label => NFA.encodeSpec({
  startState: { size: null, base: null, expectLabel: true, inRegion: false },
  transition({ size, base, expectLabel, inRegion }, value) {
    if (size === null) return { size: value, base: null, expectLabel: true, inRegion: false };
    if (base === null) return { size, base: value, expectLabel: true, inRegion: false };
    if (expectLabel) {
      return { size, base, expectLabel: false, inRegion: value === label };
    }
    if (inRegion && (value < base || value > base + size - 1)) return undefined;
    return { size, base, expectLabel: true, inRegion: false };
  },
  accept: ({ expectLabel }) => expectLabel,
}, NUM_VALUES);

// No digit twice in a region: one machine per (region, digit) over the
// [label, digit] stream, allowing at most one hit.
const distinctNFA = (label, digit) => NFA.encodeSpec({
  startState: { expectLabel: true, inRegion: false, seen: false },
  transition({ expectLabel, inRegion, seen }, value) {
    if (expectLabel) return { expectLabel: false, inRegion: value === label, seen };
    if (inRegion && value === digit) {
      if (seen) return undefined;
      return { expectLabel: true, inRegion: false, seen: true };
    }
    return { expectLabel: true, inRegion: false, seen };
  },
  accept: ({ expectLabel }) => expectLabel,
}, NUM_VALUES);

// Both cells of a dot share a region, i.e. agree on all three label layers.
// One SameValues per layer, each pairing two single-cell sets, so the layers
// are compared position by position.
const sameRegion = (cellA, cellB) => Object.keys(layers).map(
  layer => new SameValues(2, layers[layer].at(cellA), layers[layer].at(cellB)));

return [
  new Shape('9x9'),
  new NoBoxes(),
  layers.VA.toVar('regions 1-8'),
  layers.VB.toVar('regions 9-16'),
  layers.VC.toVar('region 17'),
  baseVar,

  // VC only ever marks region 17 membership.
  layers.VC.makeReplicate(new Given(layers.VC.cells()[0], 1, 2)),

  new NFA(partitionNFA, 'one region per cell',
    ...gridCells.flatMap(cell => [
      layers.VA.at(cell), layers.VB.at(cell), layers.VC.at(cell)])),

  // Each region is a single orthogonally connected block.
  ...CIRCLES.map(({ layer, label }) => new ConnectedValues(layer, label)),

  // Each circle is pinned to its own region, so every region holds exactly one.
  ...CIRCLES.map(({ cell, layer, label }) => new Given(layers[layer].at(cell), label)),

  // Label domains, restricted to the regions each cell can reach.
  ...Object.keys(layers).flatMap(labelDomainConstraints),

  ...CIRCLES.map(({ cell, layer, label }) =>
    new NFA(sizeNFA(label), `region ${label} size`,
      cell, ...layers[layer].at(reachable(cell)))),

  ...CIRCLES.map(({ cell, layer, label }, i) =>
    new NFA(windowNFA(label), `region ${label} window`,
      cell, bases[i], ...labelDigitStream(layer, reachable(cell)))),

  ...CIRCLES.flatMap(({ cell, layer, label }) =>
    Array.from({ length: NUM_VALUES }, (_, i) => i + 1).map(digit =>
      new NFA(distinctNFA(label, digit), `region ${label} digit ${digit}`,
        ...labelDigitStream(layer, reachable(cell))))),

  ...BLACK_DOTS.map(cells => new BlackDot(...cells)),
  ...WHITE_DOTS.map(cells => new WhiteDot(...cells)),
  ...[...BLACK_DOTS, ...WHITE_DOTS].flatMap(cells => sameRegion(...cells)),

  ...LITTLE_KILLERS.map(
    ({ total, cells }) => LittleKiller.fromCells(total, cells, geometry)),
];
