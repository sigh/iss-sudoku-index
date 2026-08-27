// Title: Negator XS
// Author: thoughtbyte
// Video: https://www.youtube.com/watch?v=4167wzmS0aE
// Source: https://tinyurl.com/negatorxs

// Normal sudoku rules apply. Additionally:
// - Negators: one cell in each row/column/box is a negator (its value is
//   the negative of its digit); the nine negator cells hold all of 1-9
//   between them.
// - X-sums: an outside clue reads its line from the near cell. Let X be the
//   near cell's (possibly negative) value. X > 0: sum the first X cells,
//   continuing away from the clue. X < 0: sum the near cell plus the first
//   |X|-1 cells counted from the line's *opposite* end, working back toward
//   the near cell (worked example in the rules text). A "?" clue is not
//   printed; the rules give it as some single-digit total, i.e. constrained
//   to [-9, 9] rather than an exact value.
// - Odd/even: grey circle = odd digit, grey square = even digit.
// - Diagonal: no repeated digit on the marked diagonal, regardless of sign
//   (distinctness is on the digit shown; the main grid only ever holds
//   digits 1-9, sign is a derived property via the negator flag below, so
//   this is exactly the built-in Diagonal class).

const graph = cellGraph('9x9');
const cells = graph.cells();

// ---- Negator flag per cell (Var overlay 'VN'): 1 = normal, 2 = negator.
// Construction validated elsewhere in this corpus for negator puzzles
// (e.g. FiWWRYRKG4Y "A E.").
const flags = graph.makeOverlay('VN');
const flag = cell => flags.at(cell);
const flagDomain = flags.makeReplicate(new Given(flag(cells[0]), 1, 2));

// Interleaves a lane's cells with their flag cells: [cell1, flag1, cell2,
// flag2, ...], the alphabet every NFA below reads.
const interleave = laneCells => laneCells.flatMap(cell => [cell, flag(cell)]);

// ---- Placement: exactly one flag=2 among each row/column/box's nine flag
// cells. Eight flag=1 cells plus one flag=2 cell sum to 10; any other count
// of flag=2 cells sums to something else.
const placementSums = graph.rowsColumnsBoxes().map(group =>
  new Sum(10, ...flags.at(group)));

// ---- Row-negator-digit selector: one aux cell per row (VRD, anchored 1:1
// against column 1) holding that row's negator's digit. Scans the row's
// interleaved (digit, flag) pairs, captures the digit where flag == 2, then
// checks the capture against the appended VRD cell. AllDifferent over the
// nine VRD cells then forces "each digit appears in exactly one negator".
const anchors = graph.column(1);
const rowDigit = graph.makeOverlay('VRD', anchors);

const rowNegatorDigitSpec = NFA.encodeSpec({
  startState: { phase: 'digit', count: 0, captured: null },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', count: state.count, captured: state.captured, digit: value };
    }
    if (state.phase === 'flag') {
      if (value !== 1 && value !== 2) return undefined;
      const captured = value === 2 ? state.digit : state.captured;
      const count = state.count + 1;
      return { phase: count === 9 ? 'check' : 'digit', count, captured };
    }
    if (state.phase === 'check') {
      return state.captured === value ? { phase: 'done' } : undefined;
    }
    return { phase: 'done' };
  },
  accept: state => state.phase === 'done',
}, 9);

const rowNegatorDigitLinks = Array.from({ length: 9 }, (_, i) => {
  const r = i + 1;
  return new NFA(rowNegatorDigitSpec, `row-${r}-negator-digit`,
    ...interleave(graph.row(r)), rowDigit.at(anchors[i]));
});

const negatorDigitsDistinct = new AllDifferent(...rowDigit.cells());

// ---- X-sum-with-negators. The near cell's signed value (its digit, negated
// if it is a negator) is X:
//   X > 0: total = sum of the first X cells (this one + X-1 more), reading
//          away from the clue.
//   X < 0: total = near cell + the first |X|-1 cells counted from the far
//          end of the line, working back toward the near cell (worked
//          example in the rules text: R2C1 = -4 gives R2C1+R2C9+R2C8+R2C7).
// X (the near cell's own digit and sign) is finite and known at encode time,
// so this is a disjunction over the 18 possible (sign, magnitude) readings
// of the near cell, each pinning the near cell + flag and checking a plain
// signed sum over the resulting fixed-length, fixed-cell-set lane segment.
// [lo, hi] gates that sum (lo === hi for an exact target), so the same
// per-length spec serves both an exact target (the "-1" clues) and a range
// (the "?" clues, whose rules-text meaning is "some single digit total",
// i.e. in [-9, 9]). This mirrors FiWWRYRKG4Y's signed-sum cage/diagonal NFA;
// splitting by branch here (instead of one automaton reading all 9 cells and
// picking its own subset at run time) keeps each compiled automaton to a
// single short segment -- reading the near cell twice (once to pin it, once
// inside the segment sum) is one cell's redundancy, not a blowup risk.
const signedSumSpec = (lo, hi, length) => NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, sum: state.sum };
    if (value !== 1 && value !== 2) return undefined;
    const sum = state.sum + (value === 2 ? -state.digit : state.digit);
    return { phase: 'digit', sum };
  },
  accept: state => state.phase === 'digit' && state.sum >= lo && state.sum <= hi,
  maxDepth: length * 2,
}, 9);

// One lane's full Or-of-18-branches X-sum constraint. `lane` is the 9 cells
// in near-to-far order; `lo`/`hi` is the target (equal for an exact clue).
// A length-1 segment is just the near cell itself, whose value the two
// Givens already pin -- checking that fixed value against [lo, hi] at
// authoring time (rather than an NFA/Pair over the same two cells) drops the
// branch outright when it can never satisfy the clue.
function xsumConstraint(lane, lo, hi, name) {
  const near = lane[0];
  const nearFlag = flag(near);
  const branches = [];
  if (lo <= 1 && 1 <= hi) {
    branches.push(new And([new Given(near, 1), new Given(nearFlag, 1)]));
  }
  for (let m = 2; m <= 9; m++) {
    const segment = lane.slice(0, m);
    branches.push(new And([
      new Given(near, m),
      new Given(nearFlag, 1),
      new NFA(signedSumSpec(lo, hi, m), `${name}-fwd${m}`, ...interleave(segment)),
    ]));
  }
  if (lo <= -1 && -1 <= hi) {
    branches.push(new And([new Given(near, 1), new Given(nearFlag, 2)]));
  }
  for (let k = 2; k <= 9; k++) {
    // Near cell plus the last k-1 cells of the lane (the far end).
    const segment = [lane[0], ...lane.slice(9 - (k - 1))];
    branches.push(new And([
      new Given(near, k),
      new Given(nearFlag, 2),
      new NFA(signedSumSpec(lo, hi, k), `${name}-rev${k}`, ...interleave(segment)),
    ]));
  }
  return new Or(branches);
}

// Lane geometry, provenance: derived from the payload's free-floating text
// labels -- which column/row each clue reads, and from which end (a
// top/left clue's near cell is the first cell of the natural top-to-bottom /
// left-to-right line; a bottom/right clue's near cell is the far end, so its
// lane is the line reversed).
const exactLanes = [
  graph.column(1),                    // top, col 1, near = R1C1
  graph.column(3),                    // top, col 3, near = R1C3
  graph.column(5),                    // top, col 5, near = R1C5
  graph.column(7),                    // top, col 7, near = R1C7
  [...graph.row(5)].reverse(),        // right, row 5, near = R5C9
  [...graph.row(8)].reverse(),        // right, row 8, near = R8C9
  [...graph.column(2)].reverse(),     // bottom, col 2, near = R9C2
]; // all seven printed clues are "-1"
const rangeLanes = [
  [...graph.column(4)].reverse(),     // bottom, col 4, near = R9C4 ("?")
  [...graph.column(6)].reverse(),     // bottom, col 6, near = R9C6 ("?")
  [...graph.column(8)].reverse(),     // bottom, col 8, near = R9C8 ("?")
  graph.row(6),                       // left, row 6, near = R6C1 ("?")
];

const xsumConstraints = [
  ...exactLanes.map((lane, i) => xsumConstraint(lane, -1, -1, `xsum-exact${i}`)),
  ...rangeLanes.map((lane, i) => xsumConstraint(lane, -9, 9, `xsum-range${i}`)),
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Given('R2C8', 1, 3, 5, 7, 9),   // grey circle: odd
  new Given('R7C3', 2, 4, 6, 8),      // grey square: even

  flags.toVar('negator flags'),
  flagDomain,
  rowDigit.toVar('row negator digit'),
  ...placementSums,
  ...rowNegatorDigitLinks,
  negatorDigitsDistinct,

  ...xsumConstraints,
];
