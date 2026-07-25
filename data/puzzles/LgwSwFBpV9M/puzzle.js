// Title: Below Zero
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=LgwSwFBpV9M
// Source: https://sudokupad.app/mm2lcvh3w1

// Normal sudoku rules apply, standard boxes. One digit 1-9 (not given) is the
// "negative" digit: on any German Whisper line, Region Sum line, or V clue it
// appears on, it contributes its negated value instead of its face value; it
// is an ordinary positive digit everywhere else (rows/columns/boxes). German
// Whispers require adjacent line values to differ by >= 5; Region Sum lines
// require each box-bounded segment to share a common sum; V clues require the
// pair to sum to 5 (not every possible V is marked).
//
// None of the three rule types (Whisper, RegionSumLine, V) has native support
// for the negative-digit modifier, so all three are rebuilt here as small NFAs
// that first read a shared `neg` Var (the undetermined negative digit) and
// then compute each line/V cell's effective value against it.

const negVar = new Var('N', 'negative digit', 1);
const neg = negVar.cell(1);

// A cell's contribution to a line/V sum: its face value, unless it equals the
// (solver-determined) negative digit, in which case it is negated.
const effective = (digit, negValue) => (digit === negValue ? -digit : digit);

// German Whisper with the negative-digit modifier. Reads `neg` once, then the
// line cells in order; rejects as soon as an adjacent effective-value pair
// differs by less than 5. State: {neg, prev} -- prev is the previous cell's
// effective value, or null before the first line cell.
const whisperNegSpec = NFA.encodeSpec({
  startState: { neg: null, prev: null },
  transition: ({ neg: n, prev }, value) => {
    if (n === null) return { neg: value, prev: null };
    const ev = effective(value, n);
    if (prev !== null && Math.abs(ev - prev) < 5) return undefined;
    return { neg: n, prev: ev };
  },
  accept: () => true,
}, 9);

// V clue (sum to 5) with the negative-digit modifier. Reads `neg`, then the
// two cells. State: {phase, neg, a}.
const vNegSpec = NFA.encodeSpec({
  startState: { phase: 0, neg: null, a: null },
  transition: ({ phase, neg: n, a }, value) => {
    if (phase === 0) return { phase: 1, neg: value, a: null };
    if (phase === 1) return { phase: 2, neg: n, a: effective(value, n) };
    const ev = effective(value, n);
    if (ev + a !== 5) return undefined;
    return { phase: 3, neg: n, a };
  },
  accept: (s) => s.phase === 3,
}, 9);

// Region Sum equal-segment-sum, with the negative-digit modifier, checked one
// adjacent box-segment pair at a time (transitively equal all segments on a
// line). Reads `neg`, then segment A, then segment B (multiSegment so a
// SEGMENT_BREAK marks each boundary); accumulates A's sum, then subtracts B's,
// and accepts iff the two effective sums are equal. State: {phase, neg, sum}
// -- phase 0 = reading `neg`, 1 = accumulating segment A, 2 = subtracting
// segment B.
const regionSumPairSpec = NFA.encodeSpec({
  startState: { phase: 0, neg: null, sum: 0 },
  transition: ({ phase, neg: n, sum }, value) => {
    // Clamp phase at 2: every real usage passes exactly 3 segments ([neg],
    // segA, segB), so only 2 breaks ever occur; without the clamp the
    // compiler (which compiles this spec once, generically, for reuse across
    // every pair) explores unboundedly many further breaks.
    if (value === SEGMENT_BREAK) return { phase: Math.min(phase + 1, 2), neg: n, sum };
    if (phase === 0) return { phase: 0, neg: value, sum: 0 };
    const ev = effective(value, n);
    return { phase, neg: n, sum: sum + (phase === 1 ? ev : -ev) };
  },
  accept: (s) => s.phase === 2 && s.sum === 0,
  // Bounds compile-time state growth (`sum` is otherwise unbounded across
  // arbitrarily many same-phase reads); real usages never read more than
  // 1 (neg) + the longest adjacent segment-pair length on any line here.
  maxDepth: 12,
}, 9, { multiSegment: true });

// This puzzle's box tiling is the default 3x3, so box index from R#C# alone
// is enough to find where a region-sum line crosses a box border.
const boxOf = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// Split a region-sum line's drawn cell path into maximal same-box runs.
const boxSegments = (cells) => {
  const segments = [[cells[0]]];
  for (let i = 1; i < cells.length; i++) {
    if (boxOf(cells[i]) === boxOf(cells[i - 1])) {
      segments.at(-1).push(cells[i]);
    } else {
      segments.push([cells[i]]);
    }
  }
  return segments;
};

// One equal-sum NFA per adjacent segment pair on a region-sum line.
const regionSumLineNeg = (label, cells) => {
  const segments = boxSegments(cells);
  return segments.slice(1).map((seg, i) =>
    new NFA(regionSumPairSpec, `${label}-seg${i}`, [neg], segments[i], seg));
};

// German Whisper lines (green). The last is reconstructed from three split
// raw stroke entries sharing a corner at R1C3/R1C4/R2C3.
const whisperLines = [
  ['R6C4', 'R6C5', 'R6C6'],
  ['R2C8', 'R2C7', 'R1C7'],
  ['R4C7', 'R4C8'],
  ['R2C3', 'R1C3', 'R1C4', 'R1C5'],
];

// Region Sum lines (blue). The third is a closed loop -- its drawn path
// returns to R4C6. Unlike a sequential-pair class (Whisper, Palindrome, ...),
// RegionSumLine is segment-based: repeating the closing cell would add a
// spurious extra 1-cell "segment" not actually present in the box-crossing
// structure, so the closing cell is listed once, at the start only; box4's
// three genuine separate visits (each its own real segment) are still forced
// equal transitively through the seg[i]/seg[i+1] chain below.
const regionSumLines = [
  ['R1C6', 'R2C6', 'R3C7', 'R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9',
    'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R8C5', 'R9C4', 'R9C3'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R4C6', 'R5C5', 'R5C6', 'R5C7', 'R6C7', 'R7C6', 'R7C5', 'R6C6', 'R6C5',
    'R6C4', 'R5C3', 'R5C2', 'R4C2', 'R4C3', 'R5C4', 'R4C4', 'R4C5', 'R3C4',
    'R3C5'],
];

// V clues (edge marks; the first coincides with a whisper-line edge above).
const vClues = [
  ['R1C3', 'R2C3'],
  ['R5C3', 'R6C3'],
  ['R7C4', 'R8C4'],
];

return [
  new Shape('9x9'),
  negVar,

  ...whisperLines.map((cells, i) =>
    new NFA(whisperNegSpec, `whisper-neg-${i}`, neg, ...cells)),

  ...regionSumLines.flatMap((cells, i) =>
    regionSumLineNeg(`region-sum-neg-${i}`, cells)),

  ...vClues.map(([a, b], i) =>
    new NFA(vNegSpec, `v-neg-${i}`, neg, a, b)),
];
