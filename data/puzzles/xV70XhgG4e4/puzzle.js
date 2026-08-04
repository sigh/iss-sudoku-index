// Title: Schreedinger's Cat
// Author: Christounet
// Video: https://www.youtube.com/watch?v=xV70XhgG4e4
// Source: https://app.crackingthecryptic.com/sudoku/tT7m9JG8Nd

// Normalish sudoku: digits 0-9 once per row, column, and box (default 2x4
// boxes). Every house is only 8 cells wide, so one cell per house (the
// Schreedinger cell) holds all 3 of its remaining digits at once; every
// rule below reads a cell's "value" -- its own digit, or the sum of its 3
// digits when it is the Schreedinger cell of that reading.
// Renban (purple): a line's values form a set of consecutive integers, any
// order. German Whisper (green): consecutive line values differ by >= 5.
// Kropki (black dot): the two values are in a 1:2 ratio. Quadruple (white
// circle): each listed digit appears >=1 time among the 4 surrounding
// cells' digits (a Schreedinger cell there contributes all 3 of its
// digits). Arrows: values along the arrow sum to the bulb cell's value.
// Two renban and two whisper lines join cells a knight's move apart (not
// orthogonally adjacent) -- otherwise ordinary lines.

const SENTINEL = 10; // one above the top digit (9): "no extra digit" here.
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const bitPositions = n => { const out = []; for (let i = 0; n; i++, n >>= 1) if (n & 1) out.push(i); return out; };

// Wide enough for SENTINEL and the base-9 cell-value split (VH,VL) below;
// playable grid cells and the overlays are each restricted back to their
// true range via a Given near the bottom.
const shape = new Shape('8x8', '0-10');
const graph = cellGraph(shape);
const cells = graph.cells();
const VB = graph.makeOverlay('VB'); // 2nd Schreedinger digit, or SENTINEL
const VC = graph.makeOverlay('VC'); // 3rd Schreedinger digit, or SENTINEL
const VH = graph.makeOverlay('VH'); // cell value, base 9 (high digit)
const VL = graph.makeOverlay('VL'); // cell value, base 9 (low digit): value = 9*VH + VL

// A Schreedinger cell always holds exactly 3 digits, never 2: VB and VC
// are both the sentinel, or both a real (and, per canonicalPair below,
// ordered) digit.
const sentinelPairing = Pair.fnToKey((a, b) => (a === SENTINEL) === (b === SENTINEL), shape);
// VB/VC are an unordered pair; break the artificial ordering symmetry
// between "2nd digit" and "3rd digit" that the encoding otherwise creates.
const canonicalPair = Pair.fnToKey((a, b) => b === SENTINEL || b > a, shape);

// One house-wide scan of (digit, VB, VC) x 8 cells: every non-sentinel
// value read is added to a running seen-mask over 0-9, rejecting outright
// if it repeats. Accepting requires all ten digits seen. 8 cells contribute
// 8 digits if none is a Schreedinger cell, or 8-1+3=10 if exactly one is
// (matching the rule) -- reaching all ten therefore forces exactly one
// Schreedinger cell per house: a second one would need 12 distinct
// additions into a 10-bit mask, an impossible repeat by pigeonhole, so no
// separate "already used" flag is needed.
const houseSpec = NFA.encodeSpec({
  startState: { mask: 0 },
  transition: (s, x) => {
    if (x === SENTINEL) return s;
    if (x > 9) return undefined;
    const bit = 1 << x;
    return (s.mask & bit) ? undefined : { mask: s.mask | bit };
  },
  accept: s => s.mask === 0b1111111111,
  maxDepth: 24, // 8 cells x (digit, VB, VC)
}, shape);

// Ties a cell's digit(s) to its value (sum, when it is the Schreedinger
// cell), split as 9*VH+VL since the raw value can reach 24 (7+8+9).
const valueSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= 9 ? { k: 1, sum: x } : undefined; // digit
    if (s.k === 1) { // VB
      if (x === SENTINEL) return { k: 2, sum: s.sum, single: true };
      return x <= 9 ? { k: 2, sum: s.sum + x, single: false } : undefined;
    }
    if (s.k === 2) { // VC
      if (s.single) return x === SENTINEL ? { k: 3, sum: s.sum } : undefined;
      return x <= 9 ? { k: 3, sum: s.sum + x } : undefined;
    }
    if (s.k === 3) return x === Math.floor(s.sum / 9) ? { k: 4, low: s.sum % 9 } : undefined; // VH
    if (s.k === 4) return x === s.low ? { done: true } : undefined; // VL
    return undefined;
  },
  accept: s => s.done === true,
  maxDepth: 5, // digit, VB, VC, VH, VL
}, shape);

const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new NFA(houseSpec, `schreedinger-house-${i + 1}`,
    ...house.flatMap(cell => [cell, VB.at(cell), VC.at(cell)])));
const sentinelPairings = cells.map(cell =>
  new Pair(sentinelPairing, 'sentinel-pairing', VB.at(cell), VC.at(cell)));
const canonicalPairs = cells.map(cell =>
  new Pair(canonicalPair, 'canonical-pair', VB.at(cell), VC.at(cell)));
const valueTies = cells.map(cell =>
  new NFA(valueSpec, 'cell-value', cell, VB.at(cell), VC.at(cell), VH.at(cell), VL.at(cell)));

const valueTerms = (cell, coeff = 1) => [[VH.at(cell), 9 * coeff], [VL.at(cell), coeff]];

// Reads (VH,VL) for `length` cells in turn and accepts iff their values are
// pairwise distinct (a repeat collides in the seen-mask, same trick as
// houseSpec) and form a contiguous run -- i.e. a renban set.
// VH's and VL's true ranges (see the Givens near the bottom) -- every spec
// below that reads a (VH,VL) pair rejects outside these explicitly, since
// an NFA transition otherwise sees the whole widened shape range (0-10),
// not the narrower range a separate Given restricts it to elsewhere.
const VH_MAX = 2;
const VL_MAX = 8;
const VALUE_MAX = 24; // 7+8+9: the highest a 3-digit Schreedinger sum can reach.

const renbanSpec = length => NFA.encodeSpec({
  startState: { mask: 0, high: null },
  transition: (s, x) => {
    if (s.high === null) return x <= VH_MAX ? { mask: s.mask, high: x } : undefined; // VH
    if (x > VL_MAX) return undefined;
    const v = 9 * s.high + x; // VL: reconstruct this cell's value
    if (v > VALUE_MAX) return undefined; // shave the two unreachable high values
    const bit = 1 << v;
    return (s.mask & bit) ? undefined : { mask: s.mask | bit, high: null };
  },
  accept: s => {
    if (s.high !== null) return false;
    const positions = bitPositions(s.mask);
    return positions.length === length && positions[positions.length - 1] - positions[0] === length - 1;
  },
  maxDepth: 2 * length, // (VH,VL) per cell -- bounds the scan to exactly the line's cells
}, shape);

// Reads (VH,VL) for cell A then cell B; accepts iff the two values differ
// by at least 5 (German Whisper).
const whisperSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= VH_MAX ? { k: 1, hA: x } : undefined;
    if (s.k === 1) return x <= VL_MAX ? { k: 2, a: 9 * s.hA + x } : undefined;
    if (s.k === 2) return x <= VH_MAX ? { k: 3, a: s.a, hB: x } : undefined;
    if (s.k === 3) return x <= VL_MAX ? { k: 4, a: s.a, b: 9 * s.hB + x } : undefined;
    return undefined;
  },
  accept: s => s.k === 4 && Math.abs(s.a - s.b) >= 5,
  maxDepth: 4, // (VH,VL) x 2 cells
}, shape);

// Reads (VH,VL) for cell A then cell B; accepts iff the two values are in
// a 1:2 ratio either way (Kropki).
const kropkiSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= VH_MAX ? { k: 1, hA: x } : undefined;
    if (s.k === 1) return x <= VL_MAX ? { k: 2, a: 9 * s.hA + x } : undefined;
    if (s.k === 2) return x <= VH_MAX ? { k: 3, a: s.a, hB: x } : undefined;
    if (s.k === 3) return x <= VL_MAX ? { k: 4, a: s.a, b: 9 * s.hB + x } : undefined;
    return undefined;
  },
  accept: s => s.k === 4 && (s.a === 2 * s.b || s.b === 2 * s.a),
  maxDepth: 4, // (VH,VL) x 2 cells
}, shape);

// Reads (digit, VB, VC) for each of the 4 corner cells and ORs a bit into
// `found` whenever a read equals one of `targets` (SENTINEL and
// off-target digits are a no-op); accepts once every target digit has been
// seen at least once among the 12 reads -- a Schreedinger corner cell
// contributes all 3 of its digits this way, per the rules text.
const quadSpec = targets => {
  const bitFor = d => { const i = targets.indexOf(d); return i === -1 ? 0 : (1 << i); };
  const full = (1 << targets.length) - 1;
  return NFA.encodeSpec({
    startState: { found: 0 },
    transition: (s, x) => ({ found: s.found | bitFor(x) }),
    accept: s => s.found === full,
    maxDepth: 12, // 4 cells x (digit, VB, VC)
  }, shape);
};

// Provenance: purple lines[0..5] (D23BE7); two 2-cell knight's-move jumps
// (lines[2],[3]) join cells that also lie on arrow A's path but not
// consecutively there.
const RENBAN_LINES = [
  ['R4C7', 'R5C6'],
  ['R5C3', 'R4C2'],
  ['R1C1', 'R3C2'],
  ['R1C8', 'R3C7'],
  ['R3C3', 'R3C4', 'R4C4'],
  ['R4C5', 'R3C5', 'R3C6'],
];
// Provenance: green lines[6..9] (A3E048); lines[8],[9] are the two
// knight's-move jumps the rules' own example (R6C1/R5C3) refers to.
const WHISPER_LINES = [
  ['R5C6', 'R5C7'],
  ['R5C3', 'R5C2'],
  ['R6C1', 'R5C3'],
  ['R6C8', 'R5C6'],
];
// Provenance: black edge marks, overlays[2..4].
const KROPKI_DOTS = [
  ['R1C4', 'R1C5'],
  ['R5C4', 'R5C5'],
  ['R4C8', 'R5C8'],
];
// Provenance: white corner circles overlays[5]/[8], each with its digits
// split across two edge-offset text overlays ("6 7" / "8 9").
const QUADRUPLES = [
  { cells: ['R3C3', 'R3C4', 'R4C3', 'R4C4'], targets: [6, 7, 8, 9] },
  { cells: ['R3C5', 'R3C6', 'R4C5', 'R4C6'], targets: [6, 7, 8, 9] },
];
// Provenance: arrows[0] (arrows[2] duplicates its stroke); bulb overlays[0].
const ARROW_A = {
  bulb: 'R6C4',
  path: ['R5C3', 'R4C2', 'R3C2', 'R2C1', 'R1C1', 'R1C2', 'R2C3', 'R2C4', 'R2C5',
    'R2C6', 'R1C7', 'R1C8', 'R2C8', 'R3C7', 'R4C7', 'R5C6', 'R6C5'],
};
// Provenance: arrows[1]; bulb overlays[1].
const ARROW_B = { bulb: 'R8C1', path: ['R8C2', 'R8C3', 'R7C4', 'R7C5', 'R8C6', 'R8C7'] };

const renbans = RENBAN_LINES.map((line, i) =>
  new NFA(renbanSpec(line.length), `renban-${i + 1}`, ...line.flatMap(cell => [VH.at(cell), VL.at(cell)])));
const whispers = WHISPER_LINES.map((line, i) =>
  new NFA(whisperSpec, `whisper-${i + 1}`, ...line.flatMap(cell => [VH.at(cell), VL.at(cell)])));
const kropkis = KROPKI_DOTS.map((pair, i) =>
  new NFA(kropkiSpec, `kropki-${i + 1}`, ...pair.flatMap(cell => [VH.at(cell), VL.at(cell)])));
const quadruples = QUADRUPLES.map((q, i) =>
  new NFA(quadSpec(q.targets), `quadruple-${i + 1}`,
    ...q.cells.flatMap(cell => [cell, VB.at(cell), VC.at(cell)])));
const arrows = [ARROW_A, ARROW_B].map(a =>
  new Sum(0, ...valueTerms(a.bulb, 1), ...a.path.flatMap(cell => valueTerms(cell, -1))));

return [
  shape,
  VB.toVar('2nd Schreedinger digit'),
  VC.toVar('3rd Schreedinger digit'),
  VH.toVar('cell value (high, base 9)'),
  VL.toVar('cell value (low, base 9)'),
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VB.makeReplicate(new Given(VB.at(cells[0]), ...range(0, 10))),
  VC.makeReplicate(new Given(VC.at(cells[0]), ...range(0, 10))),
  VH.makeReplicate(new Given(VH.at(cells[0]), ...range(0, 2))),
  VL.makeReplicate(new Given(VL.at(cells[0]), ...range(0, 8))),
  ...houses,
  ...sentinelPairings,
  ...canonicalPairs,
  ...valueTies,
  ...renbans,
  ...whispers,
  ...kropkis,
  ...quadruples,
  ...arrows,
];
