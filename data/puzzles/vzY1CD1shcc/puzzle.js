// Title: Base 2
// Author: Hanks
// Video: https://www.youtube.com/watch?v=vzY1CD1shcc
// Source: https://sudokupad.app/dnz6khw1tf

// Normal sudoku rules apply, with digits 0-8. Every clue below (kropki dots,
// XV, arrows, the green line, the two blue lines, and the killer cage) is
// stated in the rules on a cell's VALUE, not its digit, where a cell holding
// digit N has value 2^N (2^0 = 1). VAL(d) below is that lookup. Because the
// map digit -> value is not linear, every clue is expressed with a custom
// `Pair` relation or a hand-written `NFA` reading the raw digits and doing
// the 2^d arithmetic itself, rather than with the library's dot/arrow/line
// classes (which compare raw digits).
//
// Dynamic fog is solving UI only (progressive reveal) and carries no rule of
// its own; it is not encoded.

const shape = new Shape('9x9', '0-8');
const VAL = d => 2 ** d;

// --- Kropki dots and XV, on values --------------------------------------
// White dot: consecutive values. Black dot: values in a 1:2 ratio -- since
// values are 2^digit, "double" is exactly "+1 to the exponent", so a black
// dot's value-ratio-2 is algebraically identical to its two DIGITS being
// consecutive (2^(d+1) = 2*2^d for every d), i.e. a plain WhiteDot on the
// digits themselves.
const whiteDotKey = Pair.fnToKey((a, b) => Math.abs(VAL(a) - VAL(b)) === 1, shape);
const xKey = Pair.fnToKey((a, b) => VAL(a) + VAL(b) === 10, shape);
const vKey = Pair.fnToKey((a, b) => VAL(a) + VAL(b) === 5, shape);

const dots = [
  new Pair(whiteDotKey, 'white dot', 'R6C1', 'R6C2'),
  new WhiteDot('R6C2', 'R6C3'), // black dot (value ratio 2) == digit WhiteDot
  new WhiteDot('R5C1', 'R5C2'), // black dot (value ratio 2) == digit WhiteDot
  new WhiteDot('R5C2', 'R5C3'), // black dot (value ratio 2) == digit WhiteDot
  new Pair(xKey, 'X', 'R9C1', 'R9C2'),
  new Pair(vKey, 'V', 'R8C1', 'R8C2'),
];

// --- German whisper line, on values --------------------------------------
// `Pair` applies its relation to consecutive pairs by list order, covering
// both edges of the 3-cell line.
const whisperKey = Pair.fnToKey((a, b) => Math.abs(VAL(a) - VAL(b)) >= 5, shape);
const whisperLine = new Pair(whisperKey, 'green line', 'R7C4', 'R7C5', 'R7C6');

// --- Arrows: arm values sum to the bulb's value --------------------------
// The NFA reads [bulb, ...arm] in order: the first digit fixes the target
// value, each following digit's value is subtracted, and the state accepts
// iff the remainder hits exactly 0 once every arm cell is consumed (arm
// values may repeat, per the rules text).
function arrowSpec(numArms) {
  return NFA.encodeSpec({
    startState: { readBulb: false, remaining: 0, armsLeft: numArms },
    transition: (state, d) => {
      const v = VAL(d);
      if (!state.readBulb) {
        return { readBulb: true, remaining: v, armsLeft: numArms };
      }
      if (state.armsLeft <= 0) return undefined; // no further arm cell expected
      if (v > state.remaining) return undefined;
      return {
        readBulb: true,
        remaining: state.remaining - v,
        armsLeft: state.armsLeft - 1,
      };
    },
    accept: state =>
      state.readBulb && state.armsLeft === 0 && state.remaining === 0,
  }, shape);
}
const arrowSpec5 = arrowSpec(5);

const arrows = [
  { bulb: 'R9C3', arm: ['R9C4', 'R9C5', 'R9C6', 'R9C7', 'R8C7'] },
  { bulb: 'R1C1', arm: ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R1C4'] },
  { bulb: 'R1C9', arm: ['R2C9', 'R2C8', 'R2C7', 'R2C6', 'R3C6'] },
].map(({ bulb, arm }) => new NFA(arrowSpec5, 'arrow', bulb, ...arm));

// --- Region sum lines: equal value-total per box-crossed segment --------
// Each box border splits its line into segments (two segments per line
// here). The NFA totals the first segment, then carries only the single
// remaining difference `target - runningSecondSegmentSum` (never both
// totals at once, which would multiply the state count past the compile
// cap) and accepts when that difference hits exactly 0.
function equalTwoSegmentsSpec(len1, len2) {
  return NFA.encodeSpec({
    startState: { seg: 0, i: 0, sum: 0, remaining: 0 },
    transition: (state, d) => {
      const v = VAL(d);
      if (state.seg === 0) {
        const sum = state.sum + v;
        const i = state.i + 1;
        if (i < len1) return { seg: 0, i, sum, remaining: 0 };
        return { seg: 1, i: 0, sum: 0, remaining: sum };
      }
      if (state.seg === 1) {
        if (v > state.remaining) return undefined; // values are positive
        const remaining = state.remaining - v;
        const i = state.i + 1;
        if (i < len2) return { seg: 1, i, sum: 0, remaining };
        return { seg: 2, i, sum: 0, remaining };
      }
      return undefined; // both segments already read
    },
    accept: state => state.seg === 2 && state.remaining === 0,
  }, shape);
}

const regionSumLines = [
  [['R6C5', 'R6C6'], ['R7C7', 'R7C8']],
  [['R9C9', 'R8C9', 'R7C9'], ['R6C8', 'R5C8', 'R4C8']],
].map(([seg1, seg2]) => new NFA(
  equalTwoSegmentsSpec(seg1.length, seg2.length),
  'region sum line', ...seg1, ...seg2));

// --- Killer cage: values (may repeat) sum to 511 -------------------------
// "May repeat" rules out the AllDifferent half of `Cage`, so the total is
// checked with a value-summing NFA instead of `Sum`, which only adds raw
// digits. The NFA prunes any partial sum that has already passed the
// target, since every value is positive.
function valueSumSpec(target, numCells) {
  return NFA.encodeSpec({
    startState: { i: 0, sum: 0 },
    transition: (state, d) => {
      if (state.i >= numCells) return undefined; // no further cell expected
      const sum = state.sum + VAL(d);
      if (sum > target) return undefined;
      return { i: state.i + 1, sum };
    },
    accept: state => state.i === numCells && state.sum === target,
  }, shape);
}

const cageCells = [
  'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R5C3', 'R5C5', 'R5C7', 'R6C7',
]; // cage total is printed in R4C3
const cage = new NFA(valueSumSpec(511, cageCells.length), 'killer cage', ...cageCells);

return [
  shape,
  ...dots,
  whisperLine,
  ...arrows,
  ...regionSumLines,
  cage,
];
