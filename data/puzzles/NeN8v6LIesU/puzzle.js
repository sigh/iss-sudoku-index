// Title: Balance Loop Sudoku
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=NeN8v6LIesU
// Source: https://app.crackingthecryptic.com/sudoku/LdgRt8ddjQ

// Rules encoded here:
//   Normal sudoku rules apply.
//   Draw a single closed loop that travels orthogonally through the centres of
//   some cells. The loop does not use any cell more than once and must travel
//   through each dot.
//   The two loop segments extending from both sides of a dot must be balanced,
//   i.e. the sum of the digits up to and including the digit in the cell
//   containing the first turn must be the same on both sides.
//   ALL possible dots are given: every point of the loop that carries no drawn
//   dot must instead have its two sums differ.
//
// A dot marks a point of the loop, drawn either on a cell centre or on the
// border between two cells, and those are exactly the two kinds of point a
// centre-to-centre loop has. So the loop visits every dotted cell and uses every
// dotted border. From such a point the loop runs off two ways; each side's
// segment is the straight run of cells ending at (and including) the first cell
// in which the loop turns. For a centre dot each run starts at the neighbour the
// loop leaves towards -- the dotted cell itself lies on both sides, so whether it
// is counted cannot change an equality or a difference. For a border dot each run
// starts at the cell on its own side of the border.
//
// A centre dot on a cell where the loop turns is read the same way, its two
// segments running out to the *next* turns. The competing reading -- that such a
// dot's "first turn" is the turn beneath it, leaving the dot vacuous -- is
// excluded by the drawing plus "ALL possible dots are given": the dots on the
// R1C2/R2C2 and R1C3/R2C3 borders put the loop through R1C2 and R1C3 on their
// lower edges, and a row-1 cell using its lower edge has only a left or right
// edge left to take, so it turns; neither cell carries a dot, which that reading
// would require.
//
// Omitted rule: "a SINGLE closed loop". What follows below is that the used
// edges form a disjoint union of closed loops -- each cell gives the loop no
// edges or exactly two, and neighbours agree about a shared edge -- not that
// there is exactly one. The loop may run alongside itself here, so degree is read
// off each cell's own shape code rather than by counting on-loop neighbours, and
// ConnectedValues (added below, and sound: the cells of one loop are
// orthogonally connected) only narrows -- two loops running side by side are
// cell-connected while sharing no used edge. Closing it needs connectivity over
// the solver-chosen edge set, which ISS has no constraint for.

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
// The two directions the loop leaves a cell in, one entry per shape code.
const SHAPE_DIRS = {
  [HORIZ]: [LEFT, RIGHT], [VERT]: [UP, DOWN],
  [UL]: [UP, LEFT], [UR]: [UP, RIGHT], [DL]: [DOWN, LEFT], [DR]: [DOWN, RIGHT],
};

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const gridCells = graph.cells();

// The sixteen drawn dots, transcribed from the payload's sixteen identical
// white-filled circle overlays: ten centred on a cell, six on the midpoint of the
// border between the two cells named (left/right or top/bottom).
const cellDots = [
  'R1C1', 'R2C5', 'R3C9', 'R4C2', 'R5C5',
  'R6C1', 'R6C3', 'R8C2', 'R9C1', 'R9C8'];
const edgeDots = [
  ['R1C2', 'R2C2'], ['R1C3', 'R2C3'], ['R1C5', 'R1C6'],
  ['R5C8', 'R5C9'], ['R8C4', 'R8C5'], ['R8C7', 'R9C7']];

// --- Shape domains. A cell can only give the loop an edge it actually has, so a
// border cell loses every shape that would use an off-grid edge.
const shapeDomains = gridCells.map(cell => new Given(shape.at(cell), OFF,
  ...LOOP_SHAPES.filter(s => SHAPE_DIRS[s].every(d => graph.step(cell, ...d)))));

// --- Edge agreement: two neighbours use their shared edge together or not at
// all. The predicate reads the two shape codes; `d` points from the first cell to
// the second, so the second must use the edge back the other way.
const agreeKey = d => Pair.fnToKey(
  (a, b) => usesDir(a, d) === usesDir(b, opposite(d)), geometry);

// Every orthogonal pair of the grid, listed once, as [cellA, cellB, dir A->B].
const gridEdges = gridCells.flatMap(cell => [RIGHT, DOWN]
  .map(d => [cell, graph.step(cell, ...d), d])
  .filter(([, other]) => other));

const origin = gridCells[0];
const edgeAgreement = [RIGHT, DOWN].map(d => shape.makeReplicate(
  new Pair(agreeKey(d), 'edge', ...shape.at([origin, graph.step(origin, ...d)])),
  shape.at(gridCells.filter(cell => graph.step(cell, ...d)))));

// --- The loop travels through each dot: a dotted cell is on the loop, and a
// dotted border is used by the cell on one side of it (its neighbour follows by
// edge agreement).
const dotPlacement = [
  ...cellDots.map(cell => new Given(shape.at(cell), ...LOOP_SHAPES)),
  ...edgeDots.map(([a, b]) => new Given(shape.at(a), ...LOOP_SHAPES.filter(
    s => usesDir(s, graph.step(a, ...RIGHT) === b ? RIGHT : DOWN)))),
];

// --- Balance, including its exhaustive half.
//
// One state machine per point that could carry a dot: one per (cell, loop shape)
// for the centres and one per grid border for the borders. Each reads a leading
// segment holding the shape code that decides whether its point is on the loop --
// the dotted cell's own code for a centre, the border's first cell's code for a
// border -- and then the two sides as [shape, digit] pairs running outward. It
// sums the first side and counts the second side back down against that total,
// accepting when they match (a drawn dot) or when they do not (no drawn dot, by
// "ALL possible dots are given"). A machine whose leading code does not hold has
// nothing to say and passes everything, so of the six machines on a cell only the
// one naming the loop's real shape there speaks, and a border machine is silent
// about a border the loop does not use.
//
// `cap` bounds the running total: a segment is a straight run inside one row or
// one column, so its cells hold distinct digits and side two can never exceed the
// sum of the largest `n` digits over its `n` reachable cells. Past `cap` the two
// totals cannot match, which fails an equality machine and satisfies a difference
// machine, so the state stays around 300 -- well inside the 4096-state limit.
const topSum = len => { let t = 0; for (let i = 0; i < len; i++) t += 9 - i; return t; };

// The leading segment's test: a centre machine wants its own shape code, a border
// machine wants the border to be used.
const gateHolds = (gate, v) =>
  gate[0] === 'shape' ? v === gate[1] : usesDir(v, gate[1]);

const specCache = new Map();
const balanceSpec = (d1, d2, cap, equal, gate) => {
  const key = JSON.stringify([d1, d2, cap, equal, gate]);
  if (!specCache.has(key)) specCache.set(key, NFA.encodeSpec({
    startState: { p: 'gate' },
    transition: (st, v) => {
      switch (st.p) {
        // The point is not on the loop, or the cell does not have this machine's
        // shape: nothing left to check.
        case 'any': return { p: 'any' };
        case 'gate':
          if (v === SEGMENT_BREAK) return undefined;
          return gateHolds(gate, v) ? { p: 'gateRead' } : { p: 'any' };
        case 'gateRead':
          return v === SEGMENT_BREAK ? { p: 'sum1', sum: 0 } : undefined;
        // Side one: add cells up until the loop turns out of line.
        case 'sum1':
          if (v === SEGMENT_BREAK) return undefined;   // ran straight off the grid
          if (!usesDir(v, opposite(d1))) return undefined;
          return { p: 'add1', sum: st.sum, straight: usesDir(v, d1) };
        case 'add1': {
          if (v === SEGMENT_BREAK) return undefined;
          const sum = st.sum + v;
          if (sum > cap) return equal ? undefined : { p: 'any' };
          return st.straight ? { p: 'sum1', sum } : { p: 'rest1', sum };
        }
        // Side one has ended; skip the rest of its ray.
        case 'rest1':
          return v === SEGMENT_BREAK ? { p: 'sum2', rem: st.sum } : st;
        // Side two: count side one's total back down.
        case 'sum2':
          if (v === SEGMENT_BREAK) return undefined;
          if (!usesDir(v, opposite(d2))) return undefined;
          return { p: 'add2', rem: st.rem, straight: usesDir(v, d2) };
        case 'add2': {
          if (v === SEGMENT_BREAK) return undefined;
          const rem = st.rem - v;
          if (rem < 0) return equal ? undefined : { p: 'any' };
          // Still going: reaching zero early means side two must overshoot.
          if (st.straight) return rem === 0 && equal ? undefined : { p: 'sum2', rem };
          // The loop turned here, so side two ends on this cell.
          return (rem === 0) === equal ? { p: 'done' } : undefined;
        }
        case 'done': return { p: 'done' };
      }
    },
    accept: st => st.p === 'any' || st.p === 'done',
  }, geometry, { multiSegment: true }));
  return specCache.get(key);
};

// A side's reachable cells, as [shape, digit] pairs running from `start` outward.
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
