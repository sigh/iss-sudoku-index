// Title: Big Bad Wolf
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=RAU3qfBTn88
// Source: https://sudokupad.app/8cs9gx5dfg

// Rules encoded below, in full; nothing is omitted.
//   Divide the grid into nine regions, each of nine orthogonally connected
//   cells. Place a digit from 1-9 in every cell such that each digit appears
//   exactly once in every row, column and region.
//   Region boundaries divide the line into segments. The digit in the Nth cell
//   of a segment indicates the position of the digit N on that segment.
//   Positions are counted starting from 1 at an end of the segment which must
//   be determined. Different segments may count in different directions
//   relative to the line.

// Drawn data: the turquoise line's waypoints, in the order the stroke was
// drawn.
const WAYPOINTS = [
  'R2C1', 'R2C2', 'R1C2', 'R2C3', 'R1C4', 'R2C4', 'R3C3', 'R3C2', 'R4C2',
  'R4C3', 'R2C5', 'R1C5', 'R2C6', 'R1C7', 'R2C7', 'R2C9', 'R3C8', 'R4C9',
  'R5C8', 'R4C7', 'R5C6', 'R4C5', 'R5C4', 'R6C4', 'R7C5', 'R7C6', 'R8C7',
  'R9C6', 'R9C4', 'R8C4', 'R7C3', 'R9C3', 'R9C2', 'R7C2', 'R8C1', 'R6C1',
  'R5C2',
];

// Each stroke between two waypoints is straight or at 45 degrees, so the cells
// it covers are the evenly spaced steps between them.
const LINE = WAYPOINTS.flatMap((id, k) => {
  if (k === 0) return [id];
  const a = parseCellId(WAYPOINTS[k - 1]);
  const b = parseCellId(id);
  const steps = Math.max(Math.abs(b.row - a.row), Math.abs(b.col - a.col));
  return Array.from({ length: steps }, (_, s) => makeCellId(
    a.row + (b.row - a.row) / steps * (s + 1),
    a.col + (b.col - a.col) / steps * (s + 1)));
});
const N = LINE.length;  // 43 cells

const cc = cellGraph('9x9').makeOverlay('CC');
const borders = new Var('F', 'Segment borders', String(N - 1));
const lrStatuses = new Var('A', 'Left-to-right status', String(N));
const rlStatuses = new Var('B', 'Right-to-left status', String(N));
const border = k => borders.cell(k + 1);   // between LINE[k] and LINE[k + 1]
const lrStatus = k => lrStatuses.cell(k + 1);
const rlStatus = k => rlStatuses.cell(k + 1);

// Where the segments are. VF_k is 1 when LINE[k] and LINE[k+1] share a region
// (no boundary crossed, so one segment continues) and 2 when they do not (the
// boundary ends a segment). The machine reads
// [region(LINE[0]), VF_0, region(LINE[1]), VF_1, ...] and carries the previous
// region label so that each flag is checked against the two labels it sits
// between.
const borderSpec = {
  startState: { atLabel: true, prev: 0, flag: 0 },
  transition: ({ atLabel, prev, flag }, value) => {
    if (!atLabel) {
      return value <= 2 ? { atLabel: true, prev, flag: value } : undefined;
    }
    if (flag && (flag === 1) !== (value === prev)) return undefined;
    return { atLabel: false, prev: value, flag: 0 };
  },
  accept: ({ atLabel }) => !atLabel,
};

// The segment rule, per segment of length L with positions counted from the
// scanned end. "The digit in the Nth cell gives the position of digit N" makes
// the position-to-digit map its own inverse: whenever the digit at position s
// is t, the digit at position t must be s, and every digit must be at most L
// so that the position it names exists. A segment lies inside a single region,
// so its digits are distinct; given that, checking only the claims that point
// forward along the scan (s < t) is equivalent to the full rule, since a
// permutation in which every forward-pointing claim is answered splits into
// fixed points and swapped pairs.
//
// One machine tracking every open claim exceeds the 4096-state compile limit,
// so the claims are split by the parity of the position they name, and each
// half is checked by its own machine. To keep the two halves talking about the
// same reading, a status variable per line cell records how that cell's
// segment fares in this scan direction:
//   1 = the rule holds for the segment, read from this end
//   2 = it fails on an even-numbered position
//   3 = even positions are answered but an odd-numbered one fails
// The even machine fixes 2 versus {1, 3} and the odd machine separates 1 from
// 3, so between them the status is pinned rather than chosen.
const EVEN = [2, 4, 6, 8];
const ODD = [3, 5, 7, 9];

// One step of the claim bookkeeping over the digit at segment position i + 1.
// `claims` holds [position, requiredDigit] pairs still waiting to be answered;
// `bad` records that this parity half has already failed for this segment.
const readDigit = (s, value, targets) => {
  const i = s.i + 1;
  // A region holds nine cells, so no segment runs past nine.
  if (i > 9) return undefined;
  if (s.b) return { i: 0, b: 1, c: [] };
  let claims = s.c;
  let bad = 0;
  const idx = claims.findIndex(([t]) => t === i);
  if (idx >= 0) {
    if (claims[idx][1] !== value) bad = 1;   // position i answered wrongly
    claims = claims.filter((_, j) => j !== idx);
  }
  if (!bad && value > i && targets.includes(value)) {
    // Position i names position `value`, which is still ahead: it must hold i.
    if (claims.some(([t]) => t === value)) bad = 1;
    else claims = [...claims, [value, i]].sort((a, b) => a[0] - b[0]);
  }
  if (bad) return { i: 0, b: 1, c: [] };
  return { i, b: 0, c: claims };
};

// A claim left open at the end of a segment names a position past the segment,
// which is the "digit larger than L" failure.
const failed = (s) => (s.b || s.c.length > 0) ? 1 : 0;

// What the status must be, given how this half of the check turned out.
const segmentEnd = (s, isEvenHalf) => isEvenHalf
  ? s.v === (failed(s) ? 2 : 1)
  : !(s.v === 1 && failed(s)) && !(s.v === 3 && !failed(s));

// Both machines scan [status, digit, border, status, digit, border, ...], so
// `p` says which of the three the next cell is.
const makeSegmentSpec = (targets, isEvenHalf) => ({
  startState: { p: 0, v: 0, i: 0, b: 0, c: [] },
  transition: (s, value) => {
    if (s.p === 0) {
      if (value > 3) return undefined;
      // The even half only distinguishes status 2 from statuses 1 and 3.
      const v = isEvenHalf ? (value === 2 ? 2 : 1) : value;
      if (s.v && s.v !== v) return undefined;   // one status per segment
      if (!isEvenHalf && v === 2) return { p: 1, v: 2, i: 0, b: 0, c: [] };
      return { p: 1, v, i: s.i, b: s.b, c: s.c };
    }
    if (s.p === 1) {
      // Status 2 leaves the odd half unconstrained.
      if (!isEvenHalf && s.v === 2) return { p: 2, v: 2, i: 0, b: 0, c: [] };
      const next = readDigit(s, value, targets);
      return next && { p: 2, v: s.v, ...next };
    }
    if (value > 2) return undefined;
    if (value === 1) return { p: 0, v: s.v, i: s.i, b: s.b, c: s.c };
    if (!segmentEnd(s, isEvenHalf)) return undefined;
    return { p: 0, v: 0, i: 0, b: 0, c: [] };
  },
  accept: (s) => s.p === 2 && segmentEnd(s, isEvenHalf),
});

const borderNFA = NFA.encodeSpec(borderSpec, 9);
const evenNFA = NFA.encodeSpec(makeSegmentSpec(EVEN, true), 9);
const oddNFA = NFA.encodeSpec(makeSegmentSpec(ODD, false), 9);

const borderScan = LINE.flatMap((cell, k) =>
  k === N - 1 ? [cc.at(cell)] : [cc.at(cell), border(k)]);
// Left to right: positions counted from the segment's first cell in line order.
const lrScan = LINE.flatMap((cell, k) =>
  k === N - 1 ? [lrStatus(k), cell] : [lrStatus(k), cell, border(k)]);
// Right to left: the same machines over the reversed line count positions from
// the segment's other end, which is the other direction the rule allows.
const rlScan = LINE.flatMap((_, k) => {
  const j = N - 1 - k;
  return j === 0 ? [rlStatus(j), LINE[j]] : [rlStatus(j), LINE[j], border(j - 1)];
});

// Each segment must work read from one end or the other.
const eitherEnd = Pair.fnToKey((lr, rl) => lr === 1 || rl === 1, 9);

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  // The two digits printed in the grid.
  new Given('R3C5', 2),
  new Given('R9C8', 8),
  borders,
  lrStatuses,
  rlStatuses,
  new NFA(borderNFA, 'Segment borders', ...borderScan),
  new NFA(evenNFA, 'Even positions, left to right', ...lrScan),
  new NFA(oddNFA, 'Odd positions, left to right', ...lrScan),
  new NFA(evenNFA, 'Even positions, right to left', ...rlScan),
  new NFA(oddNFA, 'Odd positions, right to left', ...rlScan),
  ...LINE.map((_, k) =>
    new Pair(eitherEnd, 'Segment read from one end', lrStatus(k), rlStatus(k))),
];
