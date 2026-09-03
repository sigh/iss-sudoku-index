// Title: Lupin's Loop 6 - Between Worlds
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=0T0CmdiX6QE
// Source: https://sudokupad.app/9snrpdy9fe

// Normal 9x9 sudoku, no givens.
//
// White dot: consecutive. Yellow dot: non-consecutive. Red dot: one even digit
// and one odd digit.
//
// A single cable runs orthogonally from cell to cell, never branching, crossing
// or overlapping itself, and closes into a loop. It passes through every
// electricity sign and never steps across a river (a blue border).
//
// 90-degree turns cut the loop into segments; a segment runs from one turn to
// the next and includes both of them, so a turn cell is an endpoint of one
// horizontal and one vertical segment, and a segment holds between 2 and 9 cells.
//   - For every length N that occurs, the number M of segments of that length
//     satisfies M > 1 and M = N (mod 2).
//   - A segment of length N has the digit N in one of its two endpoint cells.
//   - No cell of either marked diagonal belongs to a segment of length exactly 5.
//
// A purple sensor's digit is the number of loop cells in the 3x3 area centred on
// it (the sensor included), clipped to the grid.
//
// OMITTED: the loop is only required to be connected, not to be a single cycle.
// ConnectedValues tests cell adjacency, and this cable is allowed to run
// alongside itself, so two disjoint cables lying side by side share no used edge
// yet stay cell-connected. Everything else above is encoded.
//
// The arrowheads outside the two top corners mark the diagonals for the
// segment-length rule only; neither diagonal is all-different.

// --- Loop shape codes, one per grid cell: which of the cell's four sides the
// cable uses. OFF is unvisited, HORIZ/VERT are straights, the last four are the
// turns, named for the two sides they join.
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const ON_SHAPES = [HORIZ, VERT, UL, UR, DL, DR];
const ALL_SHAPES = [OFF, ...ON_SHAPES];

// --- Segment-length codes, one pair per grid cell: VH is the length of the
// horizontal segment the cell lies on, VV the vertical one. A segment holds at
// least two cells, so the unused value 1 is free as the "no such segment" mark.
const NO_SEGMENT = 1;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const shape = graph.makeOverlay('VS');
const hSeg = graph.makeOverlay('VH');
const vSeg = graph.makeOverlay('VV');
const gridCells = graph.cells();

// Drawn data, transcribed from the source artwork.
// Cells carrying an electricity sign (blue rounded squares).
const electricity = [
  'R1C2', 'R1C3', 'R1C9', 'R2C1', 'R2C2', 'R3C1', 'R3C5', 'R3C6',
  'R6C1', 'R7C2', 'R8C1', 'R8C3', 'R8C5', 'R9C2', 'R9C8',
];
// Cells carrying a purple sensor.
const sensors = ['R2C4', 'R2C8', 'R4C9', 'R5C5', 'R7C5', 'R8C2'];
// Rivers: the blue bars, as the two cells each one separates.
const rivers = [
  ['R1C6', 'R2C6'], ['R2C3', 'R2C4'], ['R3C2', 'R4C2'], ['R3C8', 'R4C8'],
  ['R5C9', 'R6C9'], ['R6C2', 'R7C2'], ['R6C7', 'R7C7'], ['R8C6', 'R8C7'],
];
// Edge dots, as the two cells each one sits between.
const whiteDots = [
  ['R1C3', 'R1C4'], ['R5C6', 'R6C6'], ['R7C8', 'R8C8'], ['R8C7', 'R8C8'],
];
const yellowDots = [['R3C6', 'R4C6'], ['R5C7', 'R5C8'], ['R7C3', 'R7C4']];
const redDots = [
  ['R1C1', 'R1C2'], ['R1C8', 'R1C9'], ['R4C5', 'R5C5'], ['R4C7', 'R4C8'],
  ['R4C9', 'R5C9'], ['R6C2', 'R6C3'], ['R7C4', 'R8C4'], ['R9C5', 'R9C6'],
];
// The two arrowed diagonals, R1C1-R9C9 and R1C9-R9C1.
const diagonalCells = [
  ...graph.ray('R1C1', 1, 1),
  ...graph.ray('R1C9', 1, -1),
];

// --- Shape domains. A side may be used only when the neighbour on it exists and
// no river lies on that border, so border cells and river banks lose the shapes
// that would step off the grid or across the water. Electricity cells also lose
// OFF, since the cable must visit them.
const riverBorders = new Set(
  rivers.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));
const canStep = (from, to) =>
  to !== null && !riverBorders.has(`${from}|${to}`);
const SIDES = [
  [usesUp, -1, 0], [usesDown, 1, 0], [usesLeft, 0, -1], [usesRight, 0, 1],
];
const electricitySet = new Set(electricity);
const shapeDomains = gridCells.map(cell => new Given(shape.at(cell),
  ...ALL_SHAPES.filter(s =>
    (s !== OFF || !electricitySet.has(cell)) &&
    SIDES.every(([uses, dRow, dCol]) =>
      !uses(s) || canStep(cell, graph.step(cell, dRow, dCol))))));

// --- Edge agreement: two neighbouring cells must agree about the border they
// share, which is what makes the shape codes join up into cable.
const agreeRight = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), numValues);
const agreeDown = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), numValues);
// One template per direction, replicated over the cells that have such a
// neighbour; the last column and last row start no pair.
const origin = shape.cells()[0];
const edgeAgreement = [
  shape.makeReplicate(
    new Pair(agreeRight, 'edge-h', origin, shape.step(origin, 0, 1)),
    shape.cells().filter(cell => shape.step(cell, 0, 1))),
  shape.makeReplicate(
    new Pair(agreeDown, 'edge-v', origin, shape.step(origin, 1, 0)),
    shape.cells().filter(cell => shape.step(cell, 1, 0))),
];

// --- Segments. One machine per row (and per column) scans the line in order,
// reading each cell's shape, then its segment-length code, then its digit.
//
// Along a row, a cell using neither of its left/right sides lies on no
// horizontal segment and must carry NO_SEGMENT; a cell using only its right side
// opens a segment; HORIZ continues it; a cell using only its left side closes it.
// The state carries the cells counted so far (`len`), the length the opening cell
// claimed (`claimed`, which every cell of the segment must repeat), and whether
// the opening cell's digit already matched that length (`ok`). At the close the
// run must be exactly as long as claimed, and the endpoint-digit rule needs the
// claimed length in one of the two endpoints. `role` remembers what the shape
// just read said, for the two following symbols.
const segmentScan = (usesBack, usesForward) => NFA.encodeSpec({
  startState: { p: 'shape', len: 0, claimed: 0, ok: 0, role: 'none' },
  transition: ({ p, len, claimed, ok, role }, value) => {
    if (p === 'shape') {
      const back = usesBack(value), forward = usesForward(value);
      if (!back && !forward) {
        return len === 0 ? { p: 'len', len: 0, claimed: 0, ok: 0, role: 'none' } : undefined;
      }
      if (forward && !back) {
        return len === 0 ? { p: 'len', len: 1, claimed: 0, ok: 0, role: 'open' } : undefined;
      }
      if (len === 0 || len >= claimed) return undefined;
      return { p: 'len', len: len + 1, claimed, ok, role: back && forward ? 'mid' : 'close' };
    }
    if (p === 'len') {
      if (role === 'none') {
        return value === NO_SEGMENT ? { p: 'digit', len, claimed, ok, role } : undefined;
      }
      if (role === 'open') {
        // The opening cell names the segment's length; 1 is the no-segment mark.
        return value === NO_SEGMENT ? undefined
          : { p: 'digit', len, claimed: value, ok, role };
      }
      return value === claimed ? { p: 'digit', len, claimed, ok, role } : undefined;
    }
    if (role === 'none') return { p: 'shape', len: 0, claimed: 0, ok: 0, role: 'none' };
    if (role === 'open') {
      return len > claimed ? undefined
        : { p: 'shape', len, claimed, ok: value === claimed ? 1 : 0, role: 'none' };
    }
    if (role === 'mid') return { p: 'shape', len, claimed, ok, role: 'none' };
    // Closing cell: the run must have reached the claimed length, and one of the
    // two endpoints must hold that length as its digit.
    if (len !== claimed) return undefined;
    if (!ok && value !== claimed) return undefined;
    return { p: 'shape', len: 0, claimed: 0, ok: 0, role: 'none' };
  },
  accept: ({ p, len }) => p === 'shape' && len === 0,
}, numValues);
const rowScan = segmentScan(usesLeft, usesRight);
const columnScan = segmentScan(usesUp, usesDown);
const scanCells = (line, lengths) =>
  line.flatMap(cell => [shape.at(cell), lengths.at(cell), cell]);
const segmentScans = [
  ...graph.rows().map(row => new NFA(rowScan, 'h-segments', ...scanCells(row, hSeg))),
  ...graph.columns().map(col => new NFA(columnScan, 'v-segments', ...scanCells(col, vSeg))),
];

// --- Segment counts. One machine per length N sweeps the whole grid reading each
// cell's shape, VH and VV, and counts the segments of length N: a cell opens a
// horizontal segment when its shape uses only its right side, and a vertical one
// when its shape uses only its down side, so counting openings counts segments.
// The tally only ever has to answer "none / exactly one / two-or-more of which
// parity", so it saturates into those four states rather than counting up.
const ZERO = 0, ONE = 1, MANY_EVEN = 2, MANY_ODD = 3;
const bump = c => c === ZERO ? ONE : c === ONE ? MANY_EVEN
  : c === MANY_EVEN ? MANY_ODD : MANY_EVEN;
const countSpec = (n) => NFA.encodeSpec({
  startState: { p: 'shape', c: ZERO, h: 0, v: 0 },
  transition: ({ p, c, h, v }, value) => {
    if (p === 'shape') {
      return {
        p: 'h', c,
        h: (value === UR || value === DR) ? 1 : 0,
        v: (value === DL || value === DR) ? 1 : 0,
      };
    }
    if (p === 'h') {
      return { p: 'v', c: h && value === n ? bump(c) : c, h: 0, v };
    }
    return { p: 'shape', c: v && value === n ? bump(c) : c, h: 0, v: 0 };
  },
  accept: ({ p, c }) => p === 'shape' &&
    (c === ZERO || c === (n % 2 === 0 ? MANY_EVEN : MANY_ODD)),
}, numValues);
const countCells = gridCells.flatMap(cell =>
  [shape.at(cell), hSeg.at(cell), vSeg.at(cell)]);
const segmentCounts = Array.from({ length: 8 }, (_, i) => i + 2)
  .map(n => new NFA(countSpec(n), `count-${n}`, ...countCells));

// --- Marked diagonals: no segment of length exactly 5 may contain these cells.
// A turn cell belongs to a horizontal and a vertical segment, so both codes drop 5.
const notFive = [1, 2, 3, 4, 6, 7, 8, 9];
const diagonalRules = diagonalCells.flatMap(cell => [
  new Given(hSeg.at(cell), ...notFive),
  new Given(vSeg.at(cell), ...notFive),
]);

// --- Sensors: the digit counts the loop cells of the 3x3 area centred on the
// sensor, itself included. Reads the digit, then the shapes of the area's cells.
const sensorSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === OFF ? 0 : 1);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, numValues);
const sensorRules = sensors.map(cell => {
  // R4C9 sits on the right edge, so its area is the six in-grid cells of the 3x3.
  const area = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1],
                [1, -1], [1, 0], [1, 1]]
    .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
    .filter(Boolean);
  return new NFA(sensorSpec, 'sensor', cell, ...shape.at(area));
});

// --- Edge dots.
const nonConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, numValues);
const oppositeParity = Pair.fnToKey((a, b) => (a + b) % 2 === 1, numValues);
const dotRules = [
  ...whiteDots.map(pair => new WhiteDot(...pair)),
  ...yellowDots.map(pair => new Pair(nonConsecutive, 'yellow', ...pair)),
  ...redDots.map(pair => new Pair(oppositeParity, 'red', ...pair)),
];

return [
  new Shape('9x9'),
  shape.toVar('cable'),
  hSeg.toVar('h-segment'),
  vSeg.toVar('v-segment'),
  ...shapeDomains,
  ...edgeAgreement,
  new ConnectedValues('VS', ON_SHAPES),
  ...segmentScans,
  ...segmentCounts,
  ...diagonalRules,
  ...sensorRules,
  ...dotRules,
];
