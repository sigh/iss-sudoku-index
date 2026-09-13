// Title: Lupin's Loop 7 - Where It All Began
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=c90l1I9YJ04
// Source: https://sudokupad.app/p676oglsv8

// Normal sudoku rules apply (default rows/columns/boxes).
//
// This encoding covers the digits, the four-way region partition, and every
// clue that is purely local or purely about the partition: cages, edge dots,
// the two diagonal-length sums, the six region/outside-clue lanes, and the
// six purple Sensors. It omits the two solver-drawn paths in full: their
// unknown pairing of the four Hourglass endpoints, the shared red-pin cell,
// the parity/consecutive digit rules along each path, the blue-dot
// avoidance, the arrow cell counts, and the Hourglass border-crossing
// counts. The region partition alone (encoded below) already pushes the
// acceptance search hard; adding a second solver-discovered graph on top of
// it, tied together at the Hourglass cells, was left out of this pass.
//
// Region partition (values 1-4 on overlay VG, one label per cell):
//  - Divide the grid into four regions, each orthogonally connected
//    (ConnectedValues per label).
//  - No 2x2 block lies entirely inside one region: for every 2x2 block, at
//    least one of three chained pairs differs (equivalent to "not all four
//    equal").
//  - Every region touches every other region orthogonally: for each of the
//    six label pairs, at least one grid edge has that pair of labels on its
//    two sides (one Pair equality-or-swapped check per edge, Or'd together).
//  - At least two regions share a size: one small NFA per label pair tracks
//    the running difference (count(i) - count(j)) while scanning the label
//    layer, accepting when the difference is zero at the end; Or'd over the
//    six pairs.
//  - Outside-clue lanes ("N outside a row/column: the first N cells from
//    that side share a region, the (N+1)th is a different region"): chained
//    label equalities over the first N cells, then a label inequality at the
//    boundary.
//
// Purple Sensors ("digit N in a Sensor means N appears exactly N times in
// the Sensor's own region"): one NFA per sensor. It reads the sensor cell's
// own (label, digit) first to fix the targets, then scans every other
// cell's (label, digit) pair, counting matches, and accepts iff the final
// count equals the sensor's own digit. The sensor cell is included once in
// its own scan (as the leading read) and again inside the main loop, which
// is fine: it trivially matches itself and that self-match is one of the
// N occurrences the rule counts.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const VG = graph.makeOverlay('VG'); // region-label overlay, values 1-4
const regionVar = VG.toVar('region');

// ---- Cages ----
const cages = [
  new Cage(21, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(13, 'R8C7', 'R8C8'),
  new Cage(15, 'R4C3', 'R5C3', 'R5C4'),
  new Cage(6, 'R4C6', 'R5C5', 'R5C6'),
];

// ---- Edge dots (drawn geometry; provenance: source-assets overlay list) ----
// White Kropki dots: consecutive.
const whiteDots = [
  new WhiteDot('R9C5', 'R9C6'),
  new WhiteDot('R4C8', 'R4C9'),
  new WhiteDot('R4C7', 'R4C8'),
];
// Black dots labelled "3": one value is TRIPLE the other (native BlackDot is
// a fixed 2:1 ratio, so this uses a custom Pair for the 3:1 relation).
const tripleKey = Pair.fnToKey(
  (a, b) => a === 3 * b || b === 3 * a, geometry);
const blackTripleDots = [
  new Pair(tripleKey, 'triple', 'R9C4', 'R9C5'),
  new Pair(tripleKey, 'triple', 'R7C9', 'R8C9'),
];
// Green dots: differ by at least 5 (a 2-cell Whisper is exactly this edge rule).
const greenDots = [
  new Whisper('R3C9', 'R4C9'),
  new Whisper('R7C2', 'R7C3'),
];

// ---- Diagonal length sums (main diagonal R1C1..R9C9) ----
// "Numbers outside the grid on a diagonal give the sum of the first X cells
// along that diagonal; X is not 6 and is for the solver to find." Both clues
// read the same diagonal from opposite ends, so X and Y are independent.
const diagForward = graph.ray('R1C1', 1, 1); // R1C1..R9C9
const diagBackward = graph.ray('R9C9', -1, -1); // R9C9..R1C1
const candidateLengths = [1, 2, 3, 4, 5, 7, 8, 9]; // excludes 6 per the rules
const diagonalSums = [
  new Or(candidateLengths.map(
    n => new Sum(29, ...diagForward.slice(0, n)))),
  new Or(candidateLengths.map(
    n => new Sum(38, ...diagBackward.slice(0, n)))),
];

// ---- Region partition base rules ----
// Restrict every label cell to {1,2,3,4} (Var cells default to the grid's
// 1-9 range); one Given template Replicated onto every overlay cell.
const labelRangeGivens = VG.makeReplicate(new Given(VG.cells()[0], 1, 2, 3, 4));

// Each region is one connected component.
const regionConnectivity = [1, 2, 3, 4].map(v => new ConnectedValues('VG', v));

// No 2x2 block lies entirely inside one region.
const neqKey = Pair.fnToKey((a, b) => a !== b, geometry);
const block2x2TopLefts = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) block2x2TopLefts.push(makeCellId(r, c));
}
const noMonochrome2x2 = block2x2TopLefts.map(topLeft => {
  const [a, b, cc, d] = VG.at(graph.block(topLeft, 2, 2));
  // Not all four equal <=> at least one of these three chained pairs differs.
  return new Or([
    new Pair(neqKey, 'region-2x2', a, b),
    new Pair(neqKey, 'region-2x2', b, cc),
    new Pair(neqKey, 'region-2x2', cc, d),
  ]);
});

// Every region touches every other region: for each unordered label pair,
// some grid edge has that pair of labels on its two sides.
const allEdges = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) allEdges.push([makeCellId(r, c), makeCellId(r, c + 1)]);
}
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 9; c++) allEdges.push([makeCellId(r, c), makeCellId(r + 1, c)]);
}
const labelPairs = [];
for (let i = 1; i <= 4; i++) for (let j = i + 1; j <= 4; j++) labelPairs.push([i, j]);
const regionsTouch = labelPairs.map(([i, j]) => {
  const key = Pair.fnToKey((a, b) => (a === i && b === j) || (a === j && b === i), geometry);
  return new Or(allEdges.map(
    ([a, b]) => new Pair(key, `touch-${i}-${j}`, VG.at(a), VG.at(b))));
});

// At least two regions share a size: one running-difference NFA per label
// pair over the whole label layer, accepting when count(i) === count(j).
const sizeEqualitySpecs = labelPairs.map(([i, j]) => {
  const spec = {
    startState: { diff: 0 },
    transition: ({ diff }, value) => {
      if (value === i) return { diff: diff + 1 };
      if (value === j) return { diff: diff - 1 };
      return { diff };
    },
    accept: ({ diff }) => diff === 0,
    maxDepth: 81,
  };
  return NFA.encodeSpec(spec, geometry);
});
const regionSizeEquality = new Or(sizeEqualitySpecs.map(
  (spec, idx) => new NFA(spec, `size-eq-${labelPairs[idx].join('-')}`, VG.at(graph.cells()))));

// Outside-clue lanes: "N outside a row/column: the first N cells from that
// side share a region, the (N+1)th is a different region." (source: overlay
// clue circles outside the grid, one per lane below.)
function regionLane(cellsFromEdge, n) {
  const labels = VG.at(cellsFromEdge);
  const sameRegionChain = Array.from({ length: n - 1 }, (_, k) =>
    new SameValues(2, labels[k], labels[k + 1]));
  const boundary = new AllDifferent(labels[n - 1], labels[n]);
  return [...sameRegionChain, boundary];
}
const outsideClueLanes = [
  ...regionLane(graph.row(3), 6), // left of R3: "6"
  ...regionLane(graph.row(7), 3), // left of R7: "3"
  ...regionLane([...graph.column(6)].reverse(), 4), // bottom of C6: "4"
  ...regionLane([...graph.row(8)].reverse(), 1), // right of R8: "1"
  ...regionLane([...graph.row(4)].reverse(), 1), // right of R4: "1"
  ...regionLane([...graph.row(2)].reverse(), 1), // right of R2: "1"
];

// ---- Purple Sensors ----
// Sensor cell positions (source: purple-circle underlays):
// R1C9, R1C3, R6C7, R4C3, R7C6, R9C1.
const sensorCells = ['R1C9', 'R1C3', 'R6C7', 'R4C3', 'R7C6', 'R9C1'];
const sensorNFAs = sensorCells.map(sensorCell => {
  const others = graph.cells().filter(c => c !== sensorCell);
  const spec = {
    startState: { phase: 'targetLabel' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'targetLabel':
          // Region labels only ever hold 1-4; reject the rest immediately so
          // the compiler does not grow unreachable branches from them.
          if (value > 4) return undefined;
          return { phase: 'targetDigit', targetLabel: value };
        case 'targetDigit': {
          const targetDigit = value;
          // The sensor cell trivially matches its own (label, digit), so it
          // already contributes one occurrence.
          return {
            phase: 'label', targetLabel: state.targetLabel, targetDigit,
            count: 1,
          };
        }
        case 'label':
          if (value > 4) return undefined;
          return { ...state, phase: 'digit', pendingLabel: value };
        case 'digit': {
          const hit = (state.pendingLabel === state.targetLabel && value === state.targetDigit) ? 1 : 0;
          return {
            phase: 'label', targetLabel: state.targetLabel, targetDigit: state.targetDigit,
            count: Math.min(state.count + hit, state.targetDigit + 1),
          };
        }
      }
      return undefined;
    },
    accept: (state) => state.phase === 'label' && state.count === state.targetDigit,
    maxDepth: 2 + 2 * others.length,
  };
  const encoded = NFA.encodeSpec(spec, geometry);
  const scanCells = [
    VG.at(sensorCell), sensorCell,
    ...others.flatMap(c => [VG.at(c), c]),
  ];
  return new NFA(encoded, `sensor-${sensorCell}`, scanCells);
});

return [
  new Shape('9x9'),
  regionVar,

  ...cages,
  ...whiteDots,
  ...blackTripleDots,
  ...greenDots,
  ...diagonalSums,

  labelRangeGivens,
  ...regionConnectivity,
  ...noMonochrome2x2,
  ...regionsTouch,
  regionSizeEquality,
  ...outsideClueLanes,

  ...sensorNFAs,
];
