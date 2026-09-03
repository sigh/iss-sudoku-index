// Title: The Wall
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=v_uoAIwOFpI
// Source: https://sudokupad.app/g13eyoghwx?setting-nogrid=1

// Rules encoded below:
//   Place the digits 1-9 once each in every row and column. No boxes are drawn
//   or stated, so the box groups are removed.
//   INDIVIDUALITY - No two bricks have the same digits (regardless of order).
//   COMMONALITY - A brick's commonality is the number of bricks that have the
//   same sum (including itself). An inequality symbol points to the less common
//   brick.
// Omitted: "A circled digit on a brick shows its commonality." Eight bricks
//   carry a circle, but no digit is drawn inside any of them, so the eight
//   values are unavailable and the clue is left out. The circled bricks are
//   R1C1, R1C2-R1C3, R2C3-R2C4, R3C2-R3C3, R5C2-R5C3, R8C1-R8C2, R9C2-R9C3
//   and R9C8-R9C9.
// Note-taking cells outside the wall carry no rule and are not modelled.

const shape = new Shape('9x9');

// The wall, transcribed from the thick strokes that draw it: a running bond,
// each row a course of one one-cell brick and four horizontal two-cell bricks.
// Odd rows put the one-cell brick at column 1, even rows at column 9.
const bricks = [];
for (let row = 1; row <= 9; row++) {
  const oddCourse = row % 2 === 1;
  if (oddCourse) bricks.push([makeCellId(row, 1)]);
  for (let col = oddCourse ? 2 : 1; col < 9; col += 2) {
    bricks.push([makeCellId(row, col), makeCellId(row, col + 1)]);
  }
  if (!oddCourse) bricks.push([makeCellId(row, 9)]);
}
const singleBricks = bricks.filter(b => b.length === 1);
const doubleBricks = bricks.filter(b => b.length === 2);

// INDIVIDUALITY. Bricks of different sizes can never hold the same digits, so
// the rule splits by size.
// One-cell bricks: holding the same digits is holding the same digit.
const individualSingles = new AllDifferent(...singleBricks.map(b => b[0]));

// Two-cell bricks: forbid the two ways two dominoes can hold the same pair,
// aligned (a1=b1 and a2=b2) and crossed (a1=b2 and a2=b1). Each is negated as a
// disjunction of two inequalities. A branch whose two cells share a row or a
// column is already forced apart by the latin rules, which makes that whole
// disjunction true, so it is dropped rather than restated.
const NOT_EQUAL = Pair.fnToKey((a, b) => a !== b, shape);
const latinSeparated = (u, v) => {
  const p = parseCellId(u);
  const q = parseCellId(v);
  return p.row === q.row || p.col === q.col;
};
const individualDoubles = [];
for (let i = 0; i < doubleBricks.length; i++) {
  for (let j = i + 1; j < doubleBricks.length; j++) {
    const [a1, a2] = doubleBricks[i];
    const [b1, b2] = doubleBricks[j];
    for (const [u, p, v, q] of [[a1, b1, a2, b2], [a1, b2, a2, b1]]) {
      if (latinSeparated(u, p) || latinSeparated(v, q)) continue;
      individualDoubles.push(new Or([
        new Pair(NOT_EQUAL, 'ne', u, p),
        new Pair(NOT_EQUAL, 'ne', v, q),
      ]));
    }
  }
}

// COMMONALITY. Under INDIVIDUALITY the census of brick sums is the same in
// every solution, so a brick's commonality is a function of its sum alone.
// Every two-cell brick lies within one row, so it holds two different digits;
// no two may hold the same pair, and there are exactly 36 unordered pairs of
// different digits for the 36 two-cell bricks, so each pair occurs once. The
// nine one-cell bricks likewise take the nine digits once each. Counting that
// census by sum gives commonality directly.
const brickCountBySum = new Map();
const countBrick = (sum) => brickCountBySum.set(sum, (brickCountBySum.get(sum) || 0) + 1);
for (let x = 1; x <= 9; x++) {
  countBrick(x);                                        // one-cell brick {x}
  for (let y = x + 1; y <= 9; y++) countBrick(x + y);    // two-cell brick {x, y}
}
const commonality = (sum) => brickCountBySum.get(sum) || 0;

// The twelve inequality symbols, read from the chevrons drawn on the wall
// strokes: each entry is [brick the chevron's tip points into, brick on the
// other side of that wall], and the rule makes the first the less common.
const inequalities = [
  [['R2C1', 'R2C2'], ['R3C1']],
  [['R3C4', 'R3C5'], ['R3C2', 'R3C3']],
  [['R4C3', 'R4C4'], ['R3C2', 'R3C3']],
  [['R4C7', 'R4C8'], ['R4C5', 'R4C6']],
  [['R5C1'], ['R6C1', 'R6C2']],
  [['R6C1', 'R6C2'], ['R7C2', 'R7C3']],
  [['R6C7', 'R6C8'], ['R7C6', 'R7C7']],
  [['R7C2', 'R7C3'], ['R8C3', 'R8C4']],
  [['R7C6', 'R7C7'], ['R8C7', 'R8C8']],
  [['R7C8', 'R7C9'], ['R6C9']],
  [['R8C3', 'R8C4'], ['R9C4', 'R9C5']],
  [['R8C7', 'R8C8'], ['R9C6', 'R9C7']],
];

// One machine per symbol. It reads the pointed-at brick's cells first: at the
// hand-off `low` freezes that brick's commonality and the running sum restarts
// over the other brick, which must end up strictly more common.
const lessCommonSpec = (pointedSize, otherSize) => NFA.encodeSpec({
  startState: { read: 0, sum: 0, low: 0 },
  transition: (state, value) => {
    const read = state.read + 1;
    const sum = state.sum + value;
    if (read < pointedSize) return { read, sum, low: 0 };
    if (read === pointedSize) return { read, sum: 0, low: commonality(sum) };
    return { read, sum, low: state.low };
  },
  accept: (state) => state.read === pointedSize + otherSize
    && commonality(state.sum) > state.low,
  maxDepth: pointedSize + otherSize,
}, shape);
const commonalityMarks = inequalities.map(([pointed, other]) => new NFA(
  lessCommonSpec(pointed.length, other.length),
  'less-common', ...pointed, ...other));

return [
  shape,
  new NoBoxes(),
  individualSingles,
  ...individualDoubles,
  ...commonalityMarks,
];
