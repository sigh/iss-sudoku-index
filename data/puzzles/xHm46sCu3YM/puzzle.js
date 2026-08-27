// Title: Ground Floor
// Author: Ishie
// Video: https://www.youtube.com/watch?v=xHm46sCu3YM
// Source: https://sudokupad.app/88frf3hrkd

// Every cell has a real "value" in (0,10). An ordinary cell's value equals
// its digit. A brown-tagged "floor" cell's value is a non-integer whose
// floor is its digit; a pink-tagged "ceiling" cell's value is a non-integer
// whose ceiling is its digit. Black dots, teal diamonds, German whisper
// lines and arrows all constrain VALUES, not digits, so each is expressed
// below as a custom predicate over the touched cells' digits, testing
// whether *some* choice of fractional value inside each floor/ceiling
// cell's open interval satisfies the drawn relation.

// cellRange(kind, d): the achievable value interval for a cell of the given
// kind holding digit d -- a closed point {d,d} for an ordinary cell, or the
// open interval (d, d+1) / (d-1, d) for floor / ceiling. Every interval built
// here is symmetric (open at both ends, or closed at both): that invariant
// holds because sums, positive scalar multiples and negations of symmetric
// intervals stay symmetric, so a single `open` flag suffices throughout.
const FLOOR = ['R1C1', 'R1C4', 'R2C1', 'R2C8', 'R3C4', 'R3C7', 'R4C1', 'R4C9',
  'R6C2', 'R6C3', 'R6C5', 'R7C4', 'R9C6'];
const CEIL = ['R1C2', 'R1C5', 'R4C2', 'R4C3', 'R4C5', 'R5C7', 'R5C9', 'R6C6',
  'R6C7', 'R6C9', 'R8C4', 'R8C7', 'R9C3', 'R9C5', 'R9C7'];

const kindOf = cell => FLOOR.includes(cell) ? 'F' : CEIL.includes(cell) ? 'C' : 'N';

const cellRange = (kind, d) => {
  if (kind === 'F') return { lo: d, hi: d + 1, open: true };
  if (kind === 'C') return { lo: d - 1, hi: d, open: true };
  return { lo: d, hi: d, open: false };
};

const scaleRange = (r, k) => ({ lo: r.lo * k, hi: r.hi * k, open: r.open });

// Do two achievable-value ranges share a real number?
const overlaps = (a, b) => {
  if (a.hi < b.lo || b.hi < a.lo) return false;
  if (a.hi === b.lo && (a.open || b.open)) return false;
  if (b.hi === a.lo && (a.open || b.open)) return false;
  return true;
};

// Does range r contain some value >= t? / <= t?
const hasAtLeast = (r, t) => r.hi > t || (r.hi === t && !r.open);
const hasAtMost = (r, t) => r.lo < t || (r.lo === t && !r.open);

// Rule: "one value is k times the other" (black dot k=2, teal diamond k=3) --
// try both directions, since the drawn mark does not say which cell doubles.
const ratioFeasible = (k, kindA, kindB) => (a, b) => {
  const rA = cellRange(kindA, a), rB = cellRange(kindB, b);
  return overlaps(rA, scaleRange(rB, k)) || overlaps(scaleRange(rA, k), rB);
};

// Rule: German whisper -- |value(A) - value(B)| >= 5.
const whisperFeasible = (kindA, kindB) => (a, b) => {
  const rA = cellRange(kindA, a), rB = cellRange(kindB, b);
  const diff = { lo: rA.lo - rB.hi, hi: rA.hi - rB.lo, open: rA.open || rB.open };
  return hasAtLeast(diff, 5) || hasAtMost(diff, -5);
};

// Rule: an arrow with 2+ shaft cells needs an n-ary sum. Expressed as an NFA
// that reads the shaft cells in order, accumulating the achievable range of
// their value-sum (interval addition: lo/hi add, `open` is true as soon as
// any term is non-degenerate), then reads the circle cell last and accepts
// iff the accumulated shaft range overlaps the circle's own achievable
// range. `i` counts symbols consumed so far, capped by maxDepth so state
// creation stops once the whole shaft-plus-circle sequence is read.
const arrowNFA = (armKinds, circleKind) => NFA.encodeSpec({
  startState: { lo: 0, hi: 0, open: false, i: 0 },
  transition: ({ lo, hi, open, i }, value) => {
    if (i < armKinds.length) {
      const r = cellRange(armKinds[i], value);
      return { lo: lo + r.lo, hi: hi + r.hi, open: open || r.open, i: i + 1 };
    }
    // Final symbol is the circle cell.
    return overlaps({ lo, hi, open }, cellRange(circleKind, value)) ? 'ACCEPT' : undefined;
  },
  accept: state => state === 'ACCEPT',
  maxDepth: armKinds.length + 1,
}, 9);

// Black dots: value ratio 2, one per shared edge listed below (a render
// artifact doubles 3 of these edges' dot markers; still one clue each). Four
// more edges draw the same solid black round marker through a differently
// shaped payload entry (a "text" overlay with an empty string and a black
// background, rather than the "circle" overlay used elsewhere) -- same
// drawn dot, so the same clue. A dot between two ordinary cells is a plain
// digit ratio, so those use the native BlackDot; a dot touching a
// floor/ceiling cell needs the value-based custom predicate.
const valueDots = [
  ['R3C7', 'R4C7'], ['R8C7', 'R8C8'], ['R8C4', 'R9C4'], ['R9C3', 'R9C4'],
  ['R5C7', 'R6C7'], ['R5C7', 'R5C8'], ['R1C4', 'R1C5'], ['R4C9', 'R5C9'],
  ['R5C9', 'R6C9'], ['R4C1', 'R4C2'], ['R6C1', 'R6C2'], ['R5C3', 'R6C3'],
];
const plainDots = [
  ['R7C5', 'R7C6'], ['R8C2', 'R9C2'], ['R7C9', 'R8C9'], ['R7C6', 'R8C6'],
];
const dotConstraints = [
  ...valueDots.map(([a, b]) =>
    new Pair(Pair.fnToKey(ratioFeasible(2, kindOf(a), kindOf(b)), 9), 'dot', a, b)),
  ...plainDots.map(([a, b]) => new BlackDot(a, b)),
];

// Teal diamonds: value ratio 3 (aquamarine rotated-square overlays).
const diamonds = [
  ['R4C2', 'R4C3'], ['R2C7', 'R2C8'], ['R7C8', 'R8C8'], ['R7C8', 'R7C9'],
];
const diamondConstraints = diamonds.map(([a, b]) =>
  new Pair(Pair.fnToKey(ratioFeasible(3, kindOf(a), kindOf(b)), 9), 'diamond', a, b));

// German whisper lines: adjacent values differ by >= 5.
const whisperLines = [
  ['R6C6', 'R6C5', 'R5C4', 'R4C4'],
  ['R2C5', 'R2C4', 'R2C3', 'R3C3', 'R3C4', 'R4C5'],
];
const whisperConstraints = whisperLines.flatMap(line =>
  line.slice(0, -1).map((a, i) => {
    const b = line[i + 1];
    return new Pair(Pair.fnToKey(whisperFeasible(kindOf(a), kindOf(b)), 9), 'whisper', a, b);
  }));

// Arrows: shaft values sum to the circle's value. The 1-shaft-cell arrow is
// a plain value-equality Pair; the 2- and 3-shaft-cell arrows need the
// accumulating NFA above (cell order: shaft cells, then the circle last).
const arrow1 = new NFA(
  arrowNFA([kindOf('R1C1'), kindOf('R2C1')], kindOf('R1C2')),
  'arrow', ['R1C1', 'R2C1', 'R1C2']);
const arrow2 = new NFA(
  arrowNFA([kindOf('R7C5'), kindOf('R8C5'), kindOf('R9C5')], kindOf('R7C4')),
  'arrow', ['R7C5', 'R8C5', 'R9C5', 'R7C4']);
const arrow3 = new Pair(
  Pair.fnToKey((a, b) => overlaps(cellRange(kindOf('R9C7'), a), cellRange(kindOf('R9C6'), b)), 9),
  'arrow', 'R9C7', 'R9C6');
const arrow4 = new NFA(
  arrowNFA([kindOf('R6C2'), kindOf('R6C3')], kindOf('R5C2')),
  'arrow', ['R6C2', 'R6C3', 'R5C2']);

return [
  new Shape('9x9'),
  ...dotConstraints,
  ...diamondConstraints,
  ...whisperConstraints,
  arrow1, arrow2, arrow3, arrow4,
];
