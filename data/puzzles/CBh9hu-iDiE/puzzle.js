// Title: Regional Heatwave
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=CBh9hu-iDiE
// Source: https://sudokupad.app/rd2kn6vy6d

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
//
// Segmented lines: the 3x3 box borders split each drawn line into segments
// (a segment is the run of consecutive line cells inside one box; no line
// visits a box twice). A line's segment sums must strictly increase from
// one end of the line to the other. No marker (arrowhead, colour/thickness
// change) says which end is the low end, so both reading directions are
// accepted: for each line, either its segment sums increase strictly in
// the drawn cell order, or they increase strictly in the reverse order --
// i.e. the sequence of segment sums, read in the drawn order, must be
// strictly monotonic (increasing or decreasing).
// "Different lines are different colours", "lines never branch or share a
// cell", and "lines cross only at cell vertices" all describe properties
// the drawn geometry already has -- nothing further to constrain.
//
// Fog-of-war reveal state ("some of the grid is covered in fog...") is
// solving UI, not a final-grid rule -- omitted. The four single-cell
// "foglight" cages (one per line's starting corner) are that same UI's
// light-source markers, not clues -- omitted.

const graph = cellGraph('9x9');

// Drawn line cell paths, one per coloured line, transcribed from the
// payload's `lines[].wayPoints` (interpolated to cell centres).
const LINES = [
  ['R1C6', 'R1C7', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R7C1', 'R6C1'],
  ['R3C6', 'R4C5', 'R5C4', 'R6C3'],
  ['R5C3', 'R5C2', 'R4C1', 'R3C1', 'R2C2', 'R3C3', 'R3C4', 'R4C4'],
  ['R4C3', 'R3C2', 'R2C1', 'R1C2', 'R1C3', 'R2C4', 'R1C5', 'R2C5', 'R2C6', 'R2C7', 'R1C8', 'R1C9'],
  ['R5C6', 'R5C7', 'R4C7', 'R4C8', 'R3C9', 'R2C9'],
  ['R6C6', 'R7C6', 'R8C7', 'R7C8', 'R6C8', 'R6C7'],
  ['R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
];

// Box index (0-8) of every grid cell, used to split each line into
// box-crossing segments below.
const boxOf = new Map();
graph.boxes().forEach((box, i) => box.forEach(cell => boxOf.set(cell, i)));

// A segment is a maximal run of consecutive line cells sharing one box.
function segmentsOf(cells) {
  const segments = [];
  for (const cell of cells) {
    const box = boxOf.get(cell);
    const last = segments[segments.length - 1];
    if (last && last.box === box) {
      last.cells.push(cell);
    } else {
      segments.push({ box, cells: [cell] });
    }
  }
  return segments;
}
const lineSegments = LINES.map(segmentsOf);

// A single sum is at most 6+7+8+9=30 (a box segment has at most 4 cells in
// this puzzle); clamp the running per-segment sum at 31 once it can no
// longer matter, purely to bound the compiled NFA's state count (this
// puzzle's real segments never actually reach the clamp).
const SUM_CLAMP = 31;
// direction: 0 = undecided, 1 = increasing so far, 2 = decreasing so far.
const SEGMENTED_LINE_SPEC = NFA.encodeSpec({
  startState: { prevTotal: null, curSum: 0, direction: 0 },
  transition: (state, value) => {
    if (value !== SEGMENT_BREAK) {
      return {
        prevTotal: state.prevTotal,
        curSum: Math.min(state.curSum + value, SUM_CLAMP),
        direction: state.direction,
      };
    }
    // A segment just ended: compare it with the previous one (if any).
    if (state.prevTotal === null) {
      return { prevTotal: state.curSum, curSum: 0, direction: state.direction };
    }
    if (state.curSum === state.prevTotal) return undefined; // equal sums: reject
    const cmp = state.curSum > state.prevTotal ? 1 : 2;
    if (state.direction !== 0 && state.direction !== cmp) return undefined; // direction changed: reject
    return { prevTotal: state.curSum, curSum: 0, direction: cmp };
  },
  accept: (state) => {
    // Compare the last segment (never followed by a break) the same way.
    if (state.prevTotal === null || state.curSum === state.prevTotal) return false;
    const cmp = state.curSum > state.prevTotal ? 1 : 2;
    return state.direction === 0 || state.direction === cmp;
  },
  // Symbols consumed = cells + one SEGMENT_BREAK per join; the longest line
  // has 12 cells and 3 joins.
  maxDepth: 15,
}, 9, { multiSegment: true });

const lineConstraints = lineSegments.map(segs =>
  new NFA(SEGMENTED_LINE_SPEC, 'SegmentedLine', ...segs.map(s => s.cells)));

return [
  new Shape('9x9'),
  ...lineConstraints,
];
