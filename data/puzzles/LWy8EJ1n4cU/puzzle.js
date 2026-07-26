// Title: Cages Up The Magoo
// Author: FatPhil
// Video: https://www.youtube.com/watch?v=LWy8EJ1n4cU
// Source: https://sudokupad.app/b9q7xfczfe

// Normal sudoku rules apply. All 18 cages share one common (undrawn) total:
// one EqualSum constraint ties every cage's cells together. No cage may
// contain a repeated digit: AllDifferent per cage. White dots join digits
// differing by 1, black dots join a 2:1 pair; "within cages, all possible
// black and white dots are given" is a *scoped* negative rule, so every
// orthogonally-adjacent in-cage cell pair without a drawn dot gets an
// explicit "neither relation holds" Pair constraint (a dotless pair that
// crosses a cage boundary is unconstrained -- the rule only promises
// exhaustiveness inside a cage).
//
// "No two cages contain the same set of digits": sets of different sizes
// can never coincide, so this only bites the eight 3-cell cages among
// themselves and, separately, the eight 4-cell cages (the lone 2-cell and
// lone 5-cell cage have no same-size peer to collide with). A single
// scalar "signature" per cage was considered (e.g. sum of 2^(digit-1) over
// the cage) but rejected: ISS caps every Var's alphabet at 16 values,
// which is below the up to C(9,4)=126 distinct digit-sets such a signature
// would need to tell apart. Encoded instead with a digit-presence flag per
// (cage, digit) -- Var group `D`, value 2 means "digit is in this cage", 1
// means it isn't -- set by one small NFA per cage that scans the cage's
// own cells (building the set of digits seen) and then its own 9 flags in
// fixed digit order. A second small NFA per same-size cage pair
// interleaves the two cages' flag sequences and accepts iff some digit's
// flags differ.

// Cage cells, letter-labelled A-R for readability (A is the top-left cage,
// then roughly reading order).
const CAGES = {
  A: ['R1C1', 'R1C2', 'R1C3'],
  B: ['R2C1', 'R2C2', 'R2C3', 'R3C1'],
  C: ['R1C4', 'R2C4', 'R3C4'],
  D: ['R1C5', 'R2C5', 'R2C6', 'R3C5'],
  E: ['R1C9', 'R2C9'],
  F: ['R2C7', 'R2C8', 'R3C8', 'R3C9'],
  G: ['R4C6', 'R4C7', 'R4C8'],
  H: ['R5C7', 'R5C8', 'R5C9', 'R6C7'],
  I: ['R6C6', 'R7C5', 'R7C6'],
  J: ['R4C4', 'R5C4', 'R5C5', 'R6C4', 'R6C5'],
  K: ['R4C3', 'R5C3', 'R6C2', 'R6C3'],
  L: ['R4C1', 'R4C2', 'R5C2'],
  M: ['R6C1', 'R7C1', 'R8C1'],
  N: ['R7C2', 'R7C3', 'R8C2', 'R8C3'],
  O: ['R8C4', 'R8C5', 'R9C3', 'R9C4'],
  P: ['R7C7', 'R8C6', 'R8C7'],
  Q: ['R7C8', 'R7C9', 'R8C9'],
  R: ['R8C8', 'R9C7', 'R9C8', 'R9C9'],
};

// Dot overlay edges (white background = difference-of-1, black background
// = 2:1 ratio); every one lies on an orthogonally-adjacent, same-cage cell
// pair.
const WHITE_DOTS = [
  ['R1C2', 'R1C3'], ['R2C1', 'R2C2'], ['R2C8', 'R3C8'], ['R8C6', 'R8C7'],
  ['R6C4', 'R6C5'], ['R5C7', 'R5C8'], ['R5C8', 'R5C9'], ['R5C3', 'R6C3'],
  ['R6C1', 'R7C1'],
];
const BLACK_DOTS = [
  ['R5C4', 'R6C4'], ['R5C5', 'R6C5'], ['R7C2', 'R8C2'], ['R1C5', 'R2C5'],
  ['R7C9', 'R8C9'], ['R9C8', 'R9C9'],
];

const isAdjacent = (a, b) => {
  const pa = parseCellId(a), pb = parseCellId(b);
  return Math.abs(pa.row - pb.row) + Math.abs(pa.col - pb.col) === 1;
};
const edgeKey = (a, b) => [a, b].sort().join('-');
const dottedPairs = new Set(
  [...WHITE_DOTS, ...BLACK_DOTS].map(([a, b]) => edgeKey(a, b)));

// Every orthogonally-adjacent in-cage cell pair with no drawn dot: computed
// from the cage table above rather than hand-enumerated, since it is just
// "in-cage adjacencies minus the drawn dot list".
const dotlessPairs = [];
for (const cells of Object.values(CAGES)) {
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const [a, b] = [cells[i], cells[j]];
      if (isAdjacent(a, b) && !dottedPairs.has(edgeKey(a, b))) {
        dotlessPairs.push([a, b]);
      }
    }
  }
}
const noDotKey = Pair.fnToKey(
  (a, b) => a !== b + 1 && a !== b - 1 && a !== 2 * b && b !== 2 * a, 9);

// -- No two same-size cages may share a digit set --

const SIZE3 = ['A', 'C', 'G', 'I', 'L', 'M', 'P', 'Q'];
const SIZE4 = ['B', 'D', 'F', 'H', 'K', 'N', 'O', 'R'];
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const PRESENT = 2, ABSENT = 1;

const flagOrder = [...SIZE3, ...SIZE4];
// No explicit {present, absent} domain restriction is needed: each flag's
// own cage NFA already forces it to exactly PRESENT or ABSENT (any other
// value fails that NFA's transition), so a separate Given would be
// redundant with 144 near-duplicate constraints for no added constraint
// power -- Replicate does not apply either, since this Var group (144
// cells) is larger than the 81-cell grid it would need to shadow.
const flags = new Var('D', 'digit-in-cage flags', flagOrder.length * DIGITS.length);
const flagIndex = new Map(flagOrder.map((label, i) => [label, i]));
// The digit-d flag cell for a cage label (1-based Var cell index).
const flag = (label, digit) => flags.cell(flagIndex.get(label) * DIGITS.length + digit);

// Sets one cage's 9 flags: scan the cage's own k cells (building the sorted
// set of digits seen -- duplicates dead-end, which cages are already
// AllDifferent elsewhere so this never triggers), then the cage's own 9
// flag cells in fixed digit order 1..9, checking each flag against
// membership in that set. The "seen" field only grows during the first k
// steps and is then fixed, so the compiled state count is bounded by
// (subsets of size <=k of 9) x (9 flag positions) -- independent of any
// other cage.
const makeCageFlagSpec = k => NFA.encodeSpec({
  startState: { pos: 0, seen: [] },
  transition: ({ pos, seen }, value) => {
    if (pos < k) {
      if (seen.includes(value)) return undefined;
      return { pos: pos + 1, seen: [...seen, value].sort((a, b) => a - b) };
    }
    const digit = pos - k + 1;
    const expected = seen.includes(digit) ? PRESENT : ABSENT;
    if (value !== expected) return undefined;
    return { pos: pos + 1, seen };
  },
  accept: ({ pos }) => pos === k + DIGITS.length,
  // Without this, "pos" is an unbounded climbing counter to the compiler
  // (it has no way to know a given constraint instance is fed exactly
  // k+9 symbols), and compilation never terminates.
  maxDepth: k + DIGITS.length,
}, 9);
const cageFlagSpecBySize = { 3: makeCageFlagSpec(3), 4: makeCageFlagSpec(4) };

const cageFlagConstraints = flagOrder.map(label => new NFA(
  cageFlagSpecBySize[CAGES[label].length], `flags-${label}`,
  ...CAGES[label], ...DIGITS.map(d => flag(label, d)),
));

// Interleaves two cages' flag sequences ([A1,B1,A2,B2,...,A9,B9]) and
// accepts iff some digit's flags differ, i.e. the two digit sets are not
// identical.
const pairDiffSpec = NFA.encodeSpec({
  startState: { pending: null, differs: false },
  transition: ({ pending, differs }, value) => {
    if (pending === null) return { pending: value, differs };
    return { pending: null, differs: differs || pending !== value };
  },
  accept: ({ pending, differs }) => pending === null && differs,
}, 9);

const distinctPairs = labels => labels.flatMap((a, i) => labels.slice(i + 1).map(b => new NFA(
  pairDiffSpec, `distinct-${a}-${b}`,
  ...DIGITS.flatMap(d => [flag(a, d), flag(b, d)]),
)));

return [
  new Shape('9x9'),

  // No cage may contain a repeated digit.
  ...Object.values(CAGES).map(cells => new AllDifferent(...cells)),
  // All cages have the same sum.
  new EqualSum(...Object.values(CAGES)),

  // Dots.
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
  // Within cages, all possible black and white dots are given (scoped to
  // in-cage adjacent pairs only -- see isAdjacent/dotlessPairs above).
  ...dotlessPairs.map(([a, b]) => new Pair(noDotKey, 'no dot', a, b)),

  // No two cages contain the same set of digits.
  flags,
  ...cageFlagConstraints,
  ...distinctPairs(SIZE3),
  ...distinctPairs(SIZE4),
];
