// Title: Xerox
// Author: MathGuy_12
// Video: https://www.youtube.com/watch?v=IDvrTDM-5ek
// Source: https://sudokupad.app/9qw21nnjuy

// Rules encoded here:
//  - Normal sudoku.
//  - Each of the 64 2x2 areas of the grid reads as a four-digit number in
//    normal reading order: top-left, top-right, bottom-left, bottom-right.
//  - A clue in the centre of a 2x2 area gives that number's rank among the 64,
//    lowest 1, highest 64. Ties: rank N means exactly N-1 of the 64 numbers are
//    strictly lower.
//  - The two "X" clues stand for the same rank.
// Nothing is omitted.
//
// Two consequences of the rank definition are used below, because they are
// exactly equivalent to the clue and far cheaper than counting:
//  - Two areas have the same rank exactly when their numbers are equal.
//    (If A < B then every area below A is below B, and A itself is below B, so
//    rank(A) < rank(B).) A rank clue therefore fixes the digits of one area to
//    the digits of another whenever the two carry the same clue.
//  - rank R means "exactly R-1 of the 64 numbers are strictly lower", so
//    rank 1 means no number is lower, and three areas sharing rank 62 means all
//    three are equal and the other 61 numbers are strictly lower (61 lower plus
//    those three accounts for all 64).

// Clue circles, given as the top-left cell of the 2x2 area each one sits in.
const RANK_1 = [8, 5];
const RANK_62 = [[1, 7], [4, 6], [7, 1]];
const RANK_X = [[1, 1], [7, 7]];
const COUNTED = [
  { area: [3, 3], rank: 6, prefix: 'F' },
  { area: [5, 8], rank: 9, prefix: 'G' },
  { area: [5, 2], rank: 17, prefix: 'H' },
];

const AREAS = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) AREAS.push([r, c]);
}
const sameArea = (p, q) => p[0] === q[0] && p[1] === q[1];
const others = (excluded) => AREAS.filter(
  (a) => !excluded.some((e) => sameArea(a, e)));

// The four cells of a 2x2 area, in reading order.
const areaCells = ([r, c]) => [
  makeCellId(r, c), makeCellId(r, c + 1),
  makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
];

// A scanning order over the union of two areas' cells, plus the machinery to
// compare their two four-digit numbers while reading that order once.
//
// The two areas may overlap (adjacent areas share two cells, diagonal ones
// share one), so a cell is listed only at its first use. `order` interleaves
// the two areas digit by digit, which keeps the comparison state small: at each
// step the machine holds only the digits whose partner has not been read yet.
// `resolveAt[t]` lists the digit positions (0..3, most significant first) whose
// two cells are both known once cell `t` has been read; `lastNeeded[p]` is the
// last step at which the digit read at position `p` is still needed.
function comparisonScan(aCells, bCells) {
  const order = [];
  const idx = (id) => {
    let i = order.indexOf(id);
    if (i < 0) { order.push(id); i = order.length - 1; }
    return i;
  };
  const aPos = [];
  const bPos = [];
  for (let k = 0; k < 4; k++) { aPos.push(idx(aCells[k])); bPos.push(idx(bCells[k])); }
  const L = order.length;
  const resolveAt = Array.from({ length: L }, () => []);
  const lastNeeded = Array.from({ length: L }, () => -1);
  for (let k = 0; k < 4; k++) {
    const at = Math.max(aPos[k], bPos[k]);
    resolveAt[at].push(k);
    lastNeeded[aPos[k]] = Math.max(lastNeeded[aPos[k]], at);
    lastNeeded[bPos[k]] = Math.max(lastNeeded[bPos[k]], at);
  }
  // State: t = cells read so far, cmp = -1/0/+1 for a<b, a==b so far, a>b,
  // mem = digits read but not yet compared, keyed by their position in `order`.
  const step = ({ t, cmp, mem }, value) => {
    if (t >= L) return undefined;
    const vals = Object.assign({}, mem, { [t]: value });
    let c = cmp;
    for (const k of resolveAt[t]) {
      if (c !== 0) break;
      c = vals[aPos[k]] < vals[bPos[k]] ? -1
        : (vals[aPos[k]] > vals[bPos[k]] ? 1 : 0);
    }
    const keep = {};
    // Once the comparison is decided nothing later matters, so drop the memory
    // and let all the remaining paths merge.
    if (c === 0) {
      for (const p of Object.keys(vals)) if (lastNeeded[p] > t) keep[p] = vals[p];
    }
    return { t: t + 1, cmp: c, mem: keep };
  };
  return { order, L, step };
}

// "number(a) is less than number(b)", or its negation when strict is false.
function compare(name, a, b, strict) {
  const { order, L, step } = comparisonScan(areaCells(a), areaCells(b));
  const spec = NFA.encodeSpec({
    startState: { t: 0, cmp: 0, mem: {} },
    transition: step,
    accept: ({ cmp }) => (strict ? cmp < 0 : cmp >= 0),
    maxDepth: L,
  }, 9);
  return new NFA(spec, name, ...order);
}

// Same comparison, but recorded into a flag cell read as the final symbol:
// 2 when number(a) < number(b), 1 otherwise.
function compareIntoFlag(name, a, b, flagCell) {
  const { order, L, step } = comparisonScan(areaCells(a), areaCells(b));
  const spec = NFA.encodeSpec({
    startState: { t: 0, cmp: 0, mem: {} },
    transition: (state, value) => {
      if (state.t < L) return step(state, value);
      if (state.t > L) return undefined;
      const flag = state.cmp < 0 ? 2 : 1;
      return value === flag ? { t: L + 1, cmp: 0, mem: {} } : undefined;
    },
    accept: ({ t }) => t === L + 1,
    maxDepth: L + 1,
  }, 9);
  return new NFA(spec, name, ...order, flagCell);
}

const cellId = ([r, c]) => makeCellId(r, c);

// Rank 1: no area's number is lower than this one's.
const rank1 = others([RANK_1]).map(
  (j) => compare(`min ${cellId(RANK_1)}`, j, RANK_1, false));

// Rank 62 on three areas: the three numbers are equal, and every other area's
// number is strictly lower. Comparing against the first of the three is enough
// once they are tied together.
const equalTo = (p, q) => areaCells(p).map(
  (cell, i) => new SameValues(2, cell, areaCells(q)[i]));
const rank62 = [
  ...equalTo(RANK_62[0], RANK_62[1]),
  ...equalTo(RANK_62[0], RANK_62[2]),
  ...others(RANK_62).map(
    (j) => compare(`max ${cellId(RANK_62[0])}`, j, RANK_62[0], true)),
];

// The two X clues share a rank, so their numbers are equal.
const rankX = equalTo(RANK_X[0], RANK_X[1]);

// Ranks 6, 9 and 17: one flag per other area, summed to the required count of
// strictly lower numbers. 63 flags of value 1 or 2 sum to 63 + (rank - 1).
const counted = COUNTED.flatMap(({ area, rank, prefix }) => {
  const rest = others([area]);
  const vars = new Var(prefix, `rank ${rank} at ${cellId(area)}`, rest.length);
  const flags = vars.cells();
  return [
    vars,
    ...rest.map((j, i) => compareIntoFlag(
      `rank ${rank} ${cellId(area)}`, j, area, flags[i])),
    new Sum(rest.length + rank - 1, ...flags),
    // The flags are determined by the grid; branch on grid cells first.
    new SearchPriority(0, ...flags),
  ];
});

return [
  new Shape('9x9'),
  ...rank1,
  ...rank62,
  ...rankX,
  ...counted,
];
