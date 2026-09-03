// Title: Balance Loop Sudoku
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=7qoHeiyQ3r0
// Source: https://app.crackingthecryptic.com/sudoku/LdgRt8ddjQ

// Rules encoded here:
//   Normal sudoku rules apply.
//   Draw a single closed loop that travels orthogonally through the centres of
//   some cells; the loop does not use any cell more than once, and it must
//   travel through each dot.
//   The two loop segments extending from both sides of a dot must be balanced,
//   i.e. the sum of the digits up to and including the digit in the cell
//   containing the first turn must be the same on both sides.
//   ALL possible dots are given: at every point of the loop that carries no
//   drawn dot the two sums must instead differ.
//
// A dot is a point of the loop, drawn either on a cell centre or on the edge
// between two cells, so the positions a dot can occupy are the cells the loop
// visits and the edges it uses. From such a point the loop runs off in two
// directions; each side's segment is the straight run of cells ending at (and
// including) the first cell where the loop turns. For a centre dot the run
// starts at the cell after the dot's own cell -- that cell lies on both sides,
// so whether it is counted cannot change the comparison. For an edge dot each
// run starts at the cell on its own side of the edge.
//
// A dot on a cell where the loop turns is read the same way, its two segments
// running out to the *next* turns. The alternative reading -- that such a dot's
// "first turn" is the turn under the dot itself, making the dot vacuous -- is
// excluded by the drawn dots together with "ALL possible dots are given": the
// dots on the R1C2/R2C2 and R1C3/R2C3 edges put the loop through R1C2 and R1C3
// using their lower edges, and a row-1 cell using its lower edge has to turn, so
// under that reading those two turns would be balanced points with no dot on
// them.
//
// Omitted rule: the loop is only forced to be a disjoint union of closed loops,
// not a single one. The route may run alongside itself here, so degree comes
// from each cell's own shape code and ConnectedValues over the loop cells (added
// below, and sound) narrows without closing; closing it needs connectivity over
// the used-edge graph, which ISS does not have.

// Loop shape codes: which pair of its four edges a cell gives to the loop.
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const LOOP_SHAPES = [HORIZ, VERT, UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const UP = [-1, 0], DOWN = [1, 0], LEFT = [0, -1], RIGHT = [0, 1];
const usesDir = (s, d) => d === UP ? usesUp(s) : d === DOWN ? usesDown(s)
  : d === LEFT ? usesLeft(s) : usesRight(s);
const opposite = d => d === UP ? DOWN : d === DOWN ? UP : d === LEFT ? RIGHT : LEFT;
// The two directions the loop leaves a cell in, per shape code.
const SHAPE_DIRS = { [HORIZ]: [LEFT, RIGHT], [VERT]: [UP, DOWN], [UL]: [UP, LEFT],
  [UR]: [UP, RIGHT], [DL]: [DOWN, LEFT], [DR]: [DOWN, RIGHT] };

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Drawn dots, read off the payload's sixteen circle overlays: ten are centred on
// a cell, six on the edge between the two cells named (left/right or top/bottom).
const cellDots = [
  'R1C1', 'R2C5', 'R3C9', 'R4C2', 'R5C5',
  'R6C1', 'R6C3', 'R8C2', 'R9C1', 'R9C8'];
const edgeDots = [
  ['R1C2', 'R2C2'], ['R1C3', 'R2C3'], ['R1C5', 'R1C6'],
  ['R5C8', 'R5C9'], ['R8C4', 'R8C5'], ['R8C7', 'R9C7']];

// --- Shape domains: a cell can only give the loop an edge it has, so border
// cells lose the shapes pointing off the grid.
const shapeDomains = gridCells.map(cell => new Given(shape.at(cell), OFF,
  ...LOOP_SHAPES.filter(s => SHAPE_DIRS[s].every(d => graph.step(cell, ...d)))));

// --- Edge agreement: two neighbours use their shared edge together or not at all.
const agreeKey = d => Pair.fnToKey(
  (a, b) => usesDir(a, d) === usesDir(b, opposite(d)), geometry);

// Every orthogonal pair, listed once, as [cellA, cellB, direction A->B].
const gridEdges = gridCells.flatMap(cell => [RIGHT, DOWN]
  .map(d => [cell, graph.step(cell, ...d), d])
  .filter(([, other]) => other));

const origin = gridCells[0];
const edgeAgreement = [RIGHT, DOWN].map(d => shape.makeReplicate(
  new Pair(agreeKey(d), 'edge', ...shape.at([origin, graph.step(origin, ...d)])),
  shape.at(gridCells.filter(cell => graph.step(cell, ...d)))));

// --- The loop travels through each dot.
const dotPlacement = [
  ...cellDots.map(cell => new Given(shape.at(cell), ...LOOP_SHAPES)),
  ...edgeDots.map(([a, b]) => new Given(shape.at(a), ...LOOP_SHAPES.filter(
    s => usesDir(s, graph.step(a, ...RIGHT) === b ? RIGHT : DOWN)))),
];

// --- Balance.
//
// One state machine per point the loop could carry a dot: per (cell, shape code)
// for the centres, per grid edge for the edges. It reads the two segments as
// [shape, digit] pairs running outward from the point, sums the first and
// counts the second down against it, and accepts when the totals match (a drawn
// dot) or when they do not (no drawn dot, by "ALL possible dots are given").
// Each machine opens on a leading segment holding the shape code that decides
// whether its point is on the loop at all -- the code of the dotted cell for a
// centre, of the edge's first cell for an edge -- and passes everything when
// that code says otherwise. So the six machines on a cell leave exactly the one
// describing the loop's real turn there with anything to say, and an edge
// machine says nothing about an edge the loop does not use.
//
// Segment cells are distinct digits of one row or one column, so `cap` -- the
// largest total the *second* segment can reach -- bounds the running sum; past
// it the totals cannot match, which fails an equality and satisfies a
// difference.
const topSum = len => { let t = 0; for (let i = 0; i < len; i++) t += 9 - i; return t; };

// The leading segment's test: a centre machine wants its own turn shape, an
// edge machine wants the edge to be used.
const gateHolds = (gate, v) =>
  gate[0] === 'shape' ? v === gate[1] : usesDir(v, gate[1]);

const specCache = new Map();
const balanceSpec = (d1, d2, cap, equal, gate) => {
  const key = JSON.stringify([d1, d2, cap, equal, gate]);
  if (!specCache.has(key)) specCache.set(key, NFA.encodeSpec({
    startState: { p: 'gate' },
    transition: (st, v) => {
      switch (st.p) {
        // The point is not on the loop, or not in this machine's shape: nothing
        // to check.
        case 'any': return { p: 'any' };
        case 'gate':
          if (v === SEGMENT_BREAK) return undefined;
          return gateHolds(gate, v) ? { p: 'gateRead' } : { p: 'any' };
        case 'gateRead':
          return v === SEGMENT_BREAK ? { p: 'sum1', sum: 0 } : undefined;
        // First segment: add up cells until the loop turns out of line.
        case 'sum1':
          if (v === SEGMENT_BREAK) return undefined;   // ran off the grid straight
          if (!usesDir(v, opposite(d1))) return undefined;
          return { p: 'add1', sum: st.sum, straight: usesDir(v, d1) };
        case 'add1': {
          if (v === SEGMENT_BREAK) return undefined;
          const sum = st.sum + v;
          if (sum > cap) return equal ? undefined : { p: 'any' };
          return st.straight ? { p: 'sum1', sum } : { p: 'rest1', sum };
        }
        case 'rest1':
          return v === SEGMENT_BREAK ? { p: 'sum2', rem: st.sum } : st;
        // Second segment: count the first segment's total back down.
        case 'sum2':
          if (v === SEGMENT_BREAK) return undefined;
          if (!usesDir(v, opposite(d2))) return undefined;
          return { p: 'add2', rem: st.rem, straight: usesDir(v, d2) };
        case 'add2': {
          if (v === SEGMENT_BREAK) return undefined;
          const rem = st.rem - v;
          if (rem < 0) return equal ? undefined : { p: 'any' };
          if (st.straight) return rem === 0 && equal ? undefined : { p: 'sum2', rem };
          return (rem === 0) === equal ? { p: 'done' } : undefined;
        }
        case 'done': return { p: 'done' };
      }
    },
    accept: st => st.p === 'any' || st.p === 'done',
  }, geometry, { multiSegment: true }));
  return specCache.get(key);
};

// The cells a segment can cover, as [shape, digit] pairs from `start` outward.
const segment = (start, d) =>
  graph.ray(start, ...d).flatMap(cell => [shape.at(cell), cell]);

const balanceNFA = (gateCell, gate, start1, d1, start2, d2, equal) => {
  const seg1 = segment(start1, d1), seg2 = segment(start2, d2);
  const cap = topSum(seg2.length / 2);
  return new NFA(balanceSpec(d1, d2, cap, equal, gate),
    equal ? 'balanced' : 'unbalanced', [shape.at(gateCell)], seg1, seg2);
};

const dottedEdges = new Set(edgeDots.map(pair => pair.join()));

const centreBalance = gridCells.flatMap(cell => LOOP_SHAPES
  .filter(s => SHAPE_DIRS[s].every(d => graph.step(cell, ...d)))
  .map(s => {
    const [d1, d2] = SHAPE_DIRS[s];
    return balanceNFA(cell, ['shape', s],
      graph.step(cell, ...d1), d1, graph.step(cell, ...d2), d2,
      cellDots.includes(cell));
  }));

const edgeBalance = gridEdges.map(([a, b, d]) => balanceNFA(a, ['dir', d],
  a, opposite(d), b, d, dottedEdges.has([a, b].join())));

return [
  new Shape('9x9'),
  shape.toVar('loop shape'),
  ...shapeDomains,
  ...edgeAgreement,
  ...dotPlacement,
  new ConnectedValues('VS', LOOP_SHAPES),
  ...centreBalance,
  ...edgeBalance,
];
