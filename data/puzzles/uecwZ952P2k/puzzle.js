// Title: Friend Zone
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=uecwZ952P2k
// Source: https://app.crackingthecryptic.com/sudoku/B8mntN82FD
//
// Normal sudoku rules apply. 13 cages are drawn (see below), none with a
// printed total. Every cage lies inside a single row, column, or box, so its
// "no repeats" half is already implied by ordinary sudoku; the cages exist
// only to define a total for the friend-counting rule.
//
// Once solved, two cages are "friends" if their totals are equal. Cages A-I
// each carry one circled cell, whose digit must equal how many *other*
// cages (of all 13) share its total. Cages K (yellow), L (blue) and M
// (purple) have no circle; the rules state outright that each of them has
// zero friends. Cage J has neither a circle nor a colour: nothing
// constrains its own friend count, it only matters as a possible friend of
// the others.

const cages = [
  { name: 'A', cells: ['R1C5', 'R2C4', 'R2C5'], circled: 'R2C5' },
  { name: 'B', cells: ['R1C7', 'R1C8', 'R1C9', 'R2C8'], circled: 'R1C9' },
  { name: 'C', cells: ['R1C1', 'R1C2', 'R2C2', 'R3C1', 'R3C2'], circled: 'R1C1' },
  { name: 'D', cells: ['R5C1', 'R5C2', 'R6C1', 'R6C2'], circled: 'R5C2' },
  { name: 'E', cells: ['R4C4', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C6'], circled: 'R5C5' },
  { name: 'F', cells: ['R4C9', 'R5C8', 'R5C9', 'R6C9'], circled: 'R5C8' },
  { name: 'G', cells: ['R8C9', 'R9C8', 'R9C9'], circled: 'R9C9' },
  { name: 'H', cells: ['R8C5', 'R9C5'], circled: 'R8C5' },
  { name: 'I', cells: ['R9C1', 'R9C2'], circled: 'R9C1' },
  { name: 'J', cells: ['R8C1', 'R8C2'] },
  { name: 'K', cells: ['R9C6', 'R9C7'], noFriends: true },
  { name: 'L', cells: ['R8C3', 'R9C3'], noFriends: true },
  { name: 'M', cells: ['R8C8'], noFriends: true },
];

// A cage's total is bounded by its cell count alone (min = smallest N
// distinct digits, max = largest N distinct digits); every cage sits inside
// one row/column/box so its digits are already forced distinct. Two cages
// can only ever be friends if their bound ranges overlap -- cages whose
// ranges never overlap need no comparison at all.
function totalRange(size) {
  let min = 0, max = 0;
  for (let k = 0; k < size; k++) { min += k + 1; max += 9 - k; }
  return [min, max];
}
const ranges = cages.map(c => totalRange(c.cells.length));

// One friend/not-friend pair per two cages whose totals could plausibly
// coincide. Excluded pairs (e.g. a size-1 and a size-4 cage) can never tie,
// so no comparison machinery is spent on them.
const pairs = [];
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    const [minI, maxI] = ranges[i], [minJ, maxJ] = ranges[j];
    if (Math.max(minI, minJ) <= Math.min(maxI, maxJ)) pairs.push([i, j]);
  }
}

// One flag Var per candidate pair: 2 means the two cages' totals are equal
// (friends), 1 means they are not.
const eqVars = new Var('EQ', 'cage total equal flags', pairs.length);
const eqCells = eqVars.cells();

// Compares the two cage segments' totals against the flag cell's own value.
// Segment A's total is carried into segment B as a single running
// difference (not alongside a second independently-growing total), so the
// compiled state stays one-dimensional instead of the cross product of two
// wide sums. The largest pair used is a 7-cell cage against a 5-cell cage
// plus the 1-cell flag, so maxDepth = 7 + 5 + 1 cells + 2 segment breaks.
const equalTotalsSpec = NFA.encodeSpec({
  startState: { phase: 'A', sum: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.phase === 'A') return { phase: 'B', diff: state.sum };
      if (state.phase === 'B') return { phase: 'FLAG', equal: state.diff === 0 };
      return undefined;
    }
    if (state.phase === 'A') return { phase: 'A', sum: state.sum + value };
    if (state.phase === 'B') return { phase: 'B', diff: state.diff - value };
    // phase === 'FLAG': `value` is the flag cell's own candidate value.
    return { ...state, flag: value };
  },
  accept: (state) =>
    state.phase === 'FLAG' && state.flag !== undefined &&
    (state.equal === (state.flag === 2)),
  maxDepth: 15,
}, 9, { multiSegment: true });

const equalTotalsNFAs = pairs.map(([i, j], idx) =>
  new NFA(equalTotalsSpec, `eq_${cages[i].name}_${cages[j].name}`,
    cages[i].cells, cages[j].cells, [eqCells[idx]]));

// Pairs touching a given cage index, as [pairIndex, flagCell].
function pairsFor(cageIdx) {
  return pairs
    .map((p, idx) => [idx, p])
    .filter(([, p]) => p.includes(cageIdx))
    .map(([idx]) => eqCells[idx]);
}

// Circled cage: its digit = count of flags reading "friend" among its
// pairs. flagCell is 1 (not friend) or 2 (friend), so
// sum(flags) - #pairs = #friends; rearranged so Sum's target is a plain
// non-negative integer: sum(flags) - circledDigit = #pairs.
const friendCountEquations = cages
  .filter(c => c.circled)
  .map(c => {
    const flags = pairsFor(cages.indexOf(c));
    return new Sum(flags.length, [c.circled, -1], ...flags.map(f => [f, 1]));
  });

// No-friends cage: every touching flag must read "not friend".
const noFriendsGivens = cages
  .filter(c => c.noFriends)
  .flatMap(c => pairsFor(cages.indexOf(c)).map(f => new Given(f, 1)));

return [
  new Shape('9x9'),
  ...cages.filter(c => c.cells.length > 1).map(c => new AllDifferent(...c.cells)),
  eqVars,
  ...eqCells.map(c => new Given(c, 1, 2)),
  ...equalTotalsNFAs,
  ...friendCountEquations,
  ...noFriendsGivens,
];
