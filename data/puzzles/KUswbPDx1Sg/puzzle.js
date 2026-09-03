// Title: Lupin's Loop 1 - No Shared Factors
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=KUswbPDx1Sg
// Source: https://sudokupad.app/3p3nivu3o6

// Normal sudoku, no givens.
//
// The solver draws a single road: a closed loop of orthogonally-adjacent cells,
// never branching, crossing, or overlapping, so each road cell is entered once
// and left once and no cell is used twice. Nothing forbids the road from running
// alongside itself, so two road cells may be orthogonally adjacent without being
// consecutive along the road.
//
// The road must pass through every house. It may not step across a border
// marked with a traffic light.
//
// The bold 3x3 box borders cut the road into segments: a segment is a maximal
// run of consecutive road cells inside one box, and the road leaving a box and
// later re-entering it makes two segments. Within a segment the digits are
// pairwise prime (no two share a factor greater than 1). A digit in a house
// equals the number of cells in the segment containing it. Any segment of
// length 1 must contain the digit 1. A digit in a speed camera equals the number
// of road cells in that camera's whole row, its own cell included; the rules do
// not put the camera itself on the road.
//
// Solver-discovered state, six full-grid Var overlays:
//   VT   the step to this cell's successor along the road, 0 = not on the road,
//        1-4 = up/down/left/right
//   VL   how many cells of the current segment have been travelled up to and
//        including this cell, 1-9; 0 off-road
//   VG   the total length of the segment this cell belongs to, 1-9; 0 off-road
//   VF   which prime factors the current segment has used up to and including
//        this cell, as a bitmask: bit 0 = factor 2, bit 1 = factor 3; 0 off-road
//   VPH, VPL  how far along the road this cell is, counted from the seam cell,
//        as 9*VPH + VPL; 0 off-road
// The value range is widened to 0-9 so the overlays can carry their 0 sentinel;
// grid cells are restricted back to 1-9.

// Clue positions, transcribed from the payload's emoji overlays: the house
// (11), speed-camera (2) and traffic-light (3) marks, the last drawn on a
// border and listed as the two cells it separates.
const HOUSES = [
  'R1C4', 'R1C7', 'R2C1', 'R2C5', 'R3C2', 'R5C1',
  'R5C6', 'R7C5', 'R8C3', 'R9C1', 'R9C6',
];
const CAMERAS = ['R3C7', 'R5C9'];
const TRAFFIC_LIGHTS = [['R5C6', 'R5C7'], ['R3C9', 'R4C9'], ['R5C2', 'R6C2']];

const NO_STEP = 0;
// Step codes: 1 up, 2 down, 3 left, 4 right. OPP flips each (1<->2, 3<->4).
const STEPS = [null, [-1, 0], [1, 0], [0, -1], [0, 1]];
const DIRS = [1, 2, 3, 4];
const OPP = (d) => (d % 2 === 1 ? d + 1 : d - 1);

// Positions along the road are held as 9*VPH + VPL, so each half is a base-9
// digit; the loop cannot exceed 80 cells (a 9x9 grid graph is bipartite with
// parts of 41 and 40, and a cycle alternates between them), which 9*8 + 8 = 80
// covers.
const BASE = 9;
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// Prime-factor bitmask of a digit. Only 2 and 3 can ever be shared: a segment
// lies inside one box, so its digits are distinct, and 5 and 7 each have a
// single multiple in 1-9, so they can never appear twice in one segment.
const FACTOR_2 = 1;
const FACTOR_3 = 2;
const NO_FACTORS = 0;
const MAX_FACTORS = FACTOR_2 | FACTOR_3;
const maskOf = (d) => (d % 2 === 0 ? FACTOR_2 : 0) | (d % 3 === 0 ? FACTOR_3 : 0);

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const cells = graph.cells();

const T = graph.makeOverlay('VT');
const L = graph.makeOverlay('VL');
const G = graph.makeOverlay('VG');
const F = graph.makeOverlay('VF');
const PH = graph.makeOverlay('VPH');
const PL = graph.makeOverlay('VPL');

// Which box each cell is in, from the solver's own box regions.
const boxOf = new Map();
graph.boxes().forEach((box, i) => box.forEach((cell) => boxOf.set(cell, i)));

// The in-grid steps out of each cell, as direction codes.
const stepsFrom = new Map(cells.map((cell) => [
  cell, DIRS.filter((d) => graph.step(cell, ...STEPS[d]) !== null),
]));
const target = (cell, d) => graph.step(cell, ...STEPS[d]);
const dirBetween = (a, b) => DIRS.find((d) => target(a, d) === b);
// Every directed in-grid step, as [from, code, to].
const directedSteps = cells.flatMap(
  (cell) => stepsFrom.get(cell).map((d) => [cell, d, target(cell, d)]));

// "VT of `cell` is anything but `d`", as a Given over its legal codes.
const notStepping = (cell, d) => new Given(
  T.at(cell), NO_STEP, ...stepsFrom.get(cell).filter((e) => e !== d));

// -- Domains ---------------------------------------------------------------

const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),
  F.makeReplicate(new Given(F.cells()[0], ...range(NO_FACTORS, MAX_FACTORS))),
  PH.makeReplicate(new Given(PH.cells()[0], ...range(0, BASE - 1))),
  PL.makeReplicate(new Given(PL.cells()[0], ...range(0, BASE - 1))),
  ...cells.map((cell) => new Given(T.at(cell), NO_STEP, ...stepsFrom.get(cell))),
];

// A cell is on the road exactly when it steps somewhere. Off-road cells hold no
// state; on-road cells sit at position 1-9 of a segment of length 1-9 (a
// segment lies inside one box, so it has at most 9 cells).
const roadState = cells.map((cell) => new Or([
  new And([
    new Given(T.at(cell), ...stepsFrom.get(cell)),
    new Given(L.at(cell), ...range(1, 9)),
    new Given(G.at(cell), ...range(1, 9)),
  ]),
  new And([
    new Given(T.at(cell), NO_STEP),
    new Given(L.at(cell), 0),
    new Given(G.at(cell), 0),
    new Given(F.at(cell), 0),
    new Given(PH.at(cell), 0),
    new Given(PL.at(cell), 0),
  ]),
]));

// -- The road is a set of closed circuits -----------------------------------

// Predecessor count. Reading [VT of the cell, VT of each in-grid orthogonal
// neighbour], a cell on the road needs exactly one neighbour stepping into it
// and an off-road cell exactly none. One successor per cell plus one
// predecessor per cell makes the road a set of vertex-disjoint closed circuits;
// the position counters below cut that down to one circuit.
const predSpecCache = new Map();
const predSpecFor = (codes) => {
  const key = codes.join(',');
  if (!predSpecCache.has(key)) {
    predSpecCache.set(key, NFA.encodeSpec({
      startState: { phase: 'own' },
      transition: (s, v) => {
        if (s.phase === 'own') {
          return { phase: 'scan', i: 0, count: 0, need: v === NO_STEP ? 0 : 1 };
        }
        const count = s.count + (v === codes[s.i] ? 1 : 0);
        return count > s.need
          ? undefined
          : { phase: 'scan', i: s.i + 1, count, need: s.need };
      },
      accept: (s) => s.phase === 'scan' && s.i === codes.length
        && s.count === s.need,
      maxDepth: codes.length + 1,
    }, shape));
  }
  return predSpecCache.get(key);
};
const predecessorCounts = cells.map((cell) => {
  const present = stepsFrom.get(cell);
  return new NFA(
    predSpecFor(present.map(OPP)), 'one predecessor when on the road',
    T.at(cell), ...present.map((d) => T.at(target(cell, d))));
});

// The road never overlaps itself, so it cannot run back down the border it just
// crossed: two adjacent cells cannot step into each other.
const noReversal = cells.flatMap((cell) => [[0, 1], [1, 0]].flatMap(([dr, dc]) => {
  const next = graph.step(cell, dr, dc);
  if (next === null) return [];
  const d = dirBetween(cell, next);
  return [new Or([notStepping(cell, d), notStepping(next, OPP(d))])];
}));

// A traffic light border is never stepped across, in either direction.
const trafficLights = TRAFFIC_LIGHTS.flatMap(([a, b]) => {
  const d = dirBetween(a, b);
  return [notStepping(a, d), notStepping(b, OPP(d))];
});

// Every house is on the road.
const housesOnRoad = HOUSES.map(
  (cell) => new Given(T.at(cell), ...stepsFrom.get(cell)));

// -- One single loop --------------------------------------------------------

// The road is numbered from a seam cell: position 0 there, and every step
// increases the position by exactly one except the step back into the seam. A
// circuit that misses the seam would have to increase all the way round and
// return to its own starting number, so only the circuit through the seam can
// exist. R1C4 is a house, so it is on the road and can serve as the seam.
const SEAM = 'R1C4';
const seamStart = [new Given(PH.at(SEAM), 0), new Given(PL.at(SEAM), 0)];

// Both directions round the loop satisfy everything above, giving each road two
// mirror-image numberings. The seam's own two road borders are told apart by
// their step codes, so pinning the successor's code below the predecessor's
// keeps exactly one of the two.
const seamOrientation = stepsFrom.get(SEAM).flatMap((d) => stepsFrom.get(SEAM)
  .filter((e) => e < d)
  .map((e) => new Or([
    notStepping(SEAM, d),
    notStepping(target(SEAM, e), OPP(e)),
  ])));

// -- Segments ---------------------------------------------------------------

// VF accumulates the prime factors used by the segment so far. On a step that
// stays inside the box, reading [VF before, the next digit, VF after], the new
// digit's factors must be unused and are then added; a step that crosses a box
// border starts a fresh segment, so VF is just the new digit's own factors.
const carrySpec = NFA.encodeSpec({
  startState: { phase: 'before' },
  transition: (s, v) => {
    if (s.phase === 'before') {
      return v > MAX_FACTORS ? undefined : { phase: 'digit', used: v };
    }
    if (s.phase === 'digit') {
      const mask = maskOf(v);
      return (mask & s.used) ? undefined : { phase: 'after', want: s.used | mask };
    }
    return v === s.want ? { phase: 'done' } : undefined;
  },
  accept: (s) => s.phase === 'done',
  maxDepth: 3,
}, shape);
const startFactors = Pair.fnToKey((f, digit) => f === maskOf(digit), shape);
const posDelta = (from, to) => new Sum(
  1, [PH.at(to), BASE], [PL.at(to), 1], [PH.at(from), -BASE], [PL.at(from), -1]);

// What one taken step does: it advances the loop position (except the step that
// closes the loop at the seam), and it either continues the current segment or,
// across a box border, starts a new one.
const stepEffects = directedSteps.map(([from, d, to]) => {
  const crosses = boxOf.get(from) !== boxOf.get(to);
  const segment = crosses
    ? [
      new Given(L.at(to), 1),
      new Pair(startFactors, 'a new segment carries only its own factors',
        F.at(to), to),
    ]
    : [
      new Sum(1, [L.at(to), 1], [L.at(from), -1]),
      new Sum(0, [G.at(to), 1], [G.at(from), -1]),
      new NFA(carrySpec, 'segment digits share no factor',
        F.at(from), to, F.at(to)),
    ];
  return new Or([
    notStepping(from, d),
    new And([
      new Given(T.at(from), d),
      ...segment,
      ...(to === SEAM ? [] : [posDelta(from, to)]),
    ]),
  ]);
});

// A segment ends at the cell whose step leaves the box, and there its running
// count VL is the segment's total length VG; VG is copied back along the
// segment by the step rule above.
const segmentEnds = cells.flatMap((cell) => {
  const stays = stepsFrom.get(cell).filter(
    (d) => boxOf.get(target(cell, d)) === boxOf.get(cell));
  const leaves = stepsFrom.get(cell).filter(
    (d) => boxOf.get(target(cell, d)) !== boxOf.get(cell));
  // A box's centre cell has no border to leave by, so it never ends a segment.
  if (leaves.length === 0) return [];
  return [new Or([
    new Given(T.at(cell), NO_STEP, ...stays),
    new And([
      new Given(T.at(cell), ...leaves),
      new Sum(0, [G.at(cell), 1], [L.at(cell), -1]),
    ]),
  ])];
});

// -- Clues ------------------------------------------------------------------

const houseLengths = HOUSES.map(
  (cell) => new Sum(0, cell, [G.at(cell), -1]));

const lengthOneIsOne = Pair.fnToKey((g, digit) => g !== 1 || digit === 1, shape);
const singletonSegments = cells.map((cell) => new Pair(
  lengthOneIsOne, 'a segment of length 1 holds the digit 1', G.at(cell), cell));

// Reading [the camera's digit, VT of every cell of its row], the count of cells
// that step -- i.e. that are on the road -- is the digit.
const cameraSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: (s, v) => {
    if (s.target === null) return { target: v, count: 0 };
    const count = s.count + (v === NO_STEP ? 0 : 1);
    return count > s.target ? undefined : { target: s.target, count };
  },
  accept: (s) => s.target !== null && s.count === s.target,
  maxDepth: 1 + 9,
}, shape);
const cameraCounts = CAMERAS.map((cell) => new NFA(
  cameraSpec, 'road cells in the camera row',
  cell, ...T.at(graph.row(cell))));

return [
  shape,
  T.toVar('step to successor'),
  L.toVar('cells travelled in this segment'),
  G.toVar('length of this segment'),
  F.toVar('prime factors used in this segment'),
  PH.toVar('position along the road, high'),
  PL.toVar('position along the road, low'),
  ...domains,
  ...roadState,
  ...predecessorCounts,
  ...noReversal,
  ...trafficLights,
  ...housesOnRoad,
  ...seamStart,
  ...seamOrientation,
  ...stepEffects,
  ...segmentEnds,
  ...houseLengths,
  ...singletonSegments,
  ...cameraCounts,
];
