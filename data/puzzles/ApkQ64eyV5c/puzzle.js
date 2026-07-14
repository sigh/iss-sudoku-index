// Title: Go forth and multiply
// Author: Nightmare2805
// Video: https://www.youtube.com/watch?v=ApkQ64eyV5c
// Source: https://sudokupad.app/5ct3dss6pm

// Normal sudoku rules apply. The grid is covered in fog that clears as
// correct digits are placed; that is solving UI, not a final-grid rule, so
// it is not encoded.
//
// CAGES (no totals shown): two single-cell cages (R3C5, R2C9) and one
// 3-cell cage (R1C1-R1C2-R1C3). "Digits in a cage cannot sum to a prime
// number" -- for a single cell that means the digit itself is not prime.
//
// THERMOMETERS (7): multiplicative thermometers -- every digit along the
// line must be a multiple of the one before it, read from the bulb
// (the drawn line's first waypoint). `Pair` already applies its relation to
// consecutive cells, so one Pair per thermometer covers the whole chain.
//
// PRODUCT ARROWS (2): the pill bulb (2 or 3 cells) holds the multi-digit
// target, read left-to-right; the arm cells must multiply to that number.
// ISS has no product cage/arrow class (Arrow/PillArrow/Sum are sum-only),
// so each arrow is a custom NFA: accumulate the arm cells' product, then
// peel its decimal digits off most-significant first and match each one
// against the corresponding real pill cell.
//
// TURQUOISE LINES (5): each must split into two contiguous segments (each
// of any length >=1) whose digit-products are consecutive integers. This
// is encoded as an Or over every split point. A segment's product can run
// well past ISS's per-cell value cap (16), so it is never held in one cell
// -- each segment's product is decomposed into auxiliary base-15 "digit"
// Vars (0-14, via a widened Shape close to ISS's own MAX_SIZE) using the
// same NFA technique as the arrows, and the two segments are compared with
// a ripple-carry NFA (`Sum`'s coefficients are capped at +-100, far below
// the place values a several-digit product needs, so it cannot do this
// comparison). Base 15 isn't meaningful to the puzzle -- it is only used
// because it packs each segment's product into fewer auxiliary digits than
// base 10 would, which keeps the compiled-state count for the longest
// segment (6 cells, from the 7-cell line) under the NFA compiler's 4096
// state limit; base 10 alone does not fit for that one.

const graph = cellGraph('9x9');

// Widen the value range to 0-14 so the turquoise segments' auxiliary digit
// Vars can hold a full base-15 digit. Every real grid cell is restricted
// back to the true 1-9 sudoku range below. Any *multi-segment* NFA in this
// script (the segment-break marker reuses the candidate bitmask's next free
// bit) must declare exactly this many values, whether or not it actually
// needs them all -- see productArrow below, whose own real alphabet is 1-9.
const GRID_NUM_VALUES = 15;
const SHAPE = new Shape('9x9', `0-${GRID_NUM_VALUES - 1}`);
const gridCells = graph.cells();
const restrictGrid = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// ---------------------------------------------------------------------
// Cages: "digits in a cage cannot sum to a prime number".
// ---------------------------------------------------------------------

// A single-cell cage's "sum" is just its own digit.
const NON_PRIME_DIGITS = [1, 4, 6, 8, 9];
const singleCellCages = [
  new Given('R3C5', ...NON_PRIME_DIGITS),
  new Given('R2C9', ...NON_PRIME_DIGITS),
];

// The 3-cell cage (R1C1-R1C3): distinct digits summing to a non-prime
// total. Achievable 3-distinct-digit sums run 6..24; enumerate the
// non-prime ones (excludes 7, 11, 13, 17, 19, 23) and let a killer Cage
// handle the distinctness for each candidate total.
const NON_PRIME_TRIPLE_SUMS = [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24];
const tripleCage = new Or(
  NON_PRIME_TRIPLE_SUMS.map(sum => new Cage(sum, 'R1C1', 'R1C2', 'R1C3'))
);

// ---------------------------------------------------------------------
// Thermometers: each digit is a multiple of the previous one, from the
// bulb (the line's first cell).
// ---------------------------------------------------------------------

// The bulb end of each thermometer is confirmed against the drawn fog-reveal
// circle markers, one per thermometer, that sit on the bulb cell; two of the
// seven (R7C5-R7C6 and R8C6-R9C6) have the bulb at the *second* drawn
// waypoint, opposite the other five.
const THERMOMETERS = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R1C3', 'R2C3'],
  ['R1C7', 'R2C7', 'R1C8'],
  ['R7C6', 'R7C5'],
  ['R7C4', 'R8C4'],
  ['R9C4', 'R9C5'],
  ['R9C6', 'R8C6'],
];

// Sized to GRID_NUM_VALUES (not the real 1-9 digit range): the solver
// builds every Pair's lookup table against the puzzle's actual (widened)
// value count, so a table sized only 1-9 is silently misread once the
// turquoise Vars below widen the grid.
const MULTIPLE_KEY = Pair.fnToKey((a, b) => a > 0 && b % a === 0, GRID_NUM_VALUES, -1);
const thermoClues = THERMOMETERS.map(
  cells => new Pair(MULTIPLE_KEY, 'MultiplyThermo', ...cells)
);

// ---------------------------------------------------------------------
// Product arrows: pill digits (left-to-right) equal the arm cells'
// product. One NFA per arrow: segment 1 scans the arm cells and
// accumulates their product; segment 2 scans the real pill cells and
// checks each one against the matching decimal digit of that product,
// most-significant first.
// ---------------------------------------------------------------------

function productArrow(armCells, pillCells) {
  const armLen = armCells.length;
  const pillSize = pillCells.length;
  // Any product at or past this can never equal a `pillSize`-digit target,
  // so clamp there.
  const SINK = 10 ** pillSize;
  const spec = NFA.encodeSpec({
    startState: { phase: 'arm', pos: 0, prod: 1 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        // Only one break is ever real, and only once every arm cell has
        // been read; reject any other hypothetical break instead of
        // building a bogus state (and letting the compiler explore the
        // 'arm' phase past its real length, which grows without bound).
        if (state.phase !== 'arm' || state.pos !== armLen) return undefined;
        return { phase: 'pill', remaining: state.prod, digitsLeft: pillSize };
      }
      // Both the arm and pill cells are real 1-9 sudoku digits; this NFA's
      // alphabet is wider only because a multi-segment NFA must match the
      // whole (widened) grid's value count. Reject the rest here so the
      // compiler doesn't waste state budget exploring them.
      if (value < 1 || value > 9) return undefined;
      if (state.phase === 'arm') {
        if (state.pos >= armLen) return undefined; // expecting the break next
        return { phase: 'arm', pos: state.pos + 1, prod: Math.min(state.prod * value, SINK) };
      }
      // phase === 'pill': read one decimal digit, most-significant first.
      if (state.digitsLeft === 0) return undefined; // no more digits expected
      const place = 10 ** (state.digitsLeft - 1);
      const expected = Math.floor(state.remaining / place);
      if (value !== expected) return undefined; // reject: digit mismatch
      return {
        phase: 'pill',
        remaining: state.remaining % place,
        digitsLeft: state.digitsLeft - 1,
      };
    },
    accept: (state) => state.phase === 'pill' && state.digitsLeft === 0,
    // +1 for the segment break itself, which is also a BFS step.
    maxDepth: armLen + pillSize + 1,
  }, GRID_NUM_VALUES, { valueOffset: -1, multiSegment: true });
  return new NFA(spec, 'ProductArrow', armCells, pillCells);
}

const productArrows = [
  // Bulb: R4C3-R4C4-R4C5 (3-digit pill). Arm runs R4C4(top edge) up
  // through R3C4, R2C4, across R2C5-R2C6, then down into R3C6.
  productArrow(['R3C4', 'R2C4', 'R2C5', 'R2C6', 'R3C6'], ['R4C3', 'R4C4', 'R4C5']),
  // Bulb: R5C3-R5C4 (2-digit pill). Arm runs down from the bulb's C3 edge
  // through R6C3 into R7C3.
  productArrow(['R6C3', 'R7C3'], ['R5C3', 'R5C4']),
];

// ---------------------------------------------------------------------
// Turquoise lines: split into two segments whose products are
// consecutive integers.
// ---------------------------------------------------------------------

// Base for the auxiliary digit decomposition below. Not part of the puzzle
// -- chosen only to keep the compiled NFA state count down (see the header
// comment): a bigger base packs the longest segment (6 cells) into fewer
// digits than decimal's 6, which is what brings it under the 4096-state
// compiler limit. It must equal GRID_NUM_VALUES: this decomposition is a
// multi-segment NFA, and the grid's widened value count is the largest
// base that still leaves room for the segment-break marker.
const DIGIT_RADIX = GRID_NUM_VALUES;

// The number of DIGIT_RADIX digits needed to hold any product of `len`
// cells (each 1-9).
function digitsNeededFor(len) {
  let v = 9 ** len;
  let digits = 0;
  while (v > 0) { digits++; v = Math.floor(v / DIGIT_RADIX); }
  return digits;
}

// Ties `digitVars` (most-significant first, base DIGIT_RADIX) to the
// product of `cells`, via one multi-segment NFA: segment 1 accumulates the
// product over the real line cells; segment 2 peels the digits off against
// the auxiliary digit Vars (which can hold 0, unlike the arrows' real pill
// cells). A `pos` counter forces the break to land exactly after all of
// `cells` have been read -- without it the compiler's hypothetical
// exploration keeps accumulating in phase 'prod' past the real cell count,
// which grows the compiled-state count without bound.
function segmentProductDigits(cells, digitVars) {
  const armLen = cells.length;
  const SINK = DIGIT_RADIX ** digitVars.length;
  const spec = NFA.encodeSpec({
    startState: { phase: 'prod', pos: 0, prod: 1 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        if (state.phase !== 'prod' || state.pos !== armLen) return undefined;
        return { phase: 'digit', remaining: state.prod, digitsLeft: digitVars.length };
      }
      if (state.phase === 'prod') {
        if (state.pos >= armLen) return undefined; // expecting the break next
        // Real line cells are 1-9; this NFA's alphabet is wider (to also
        // cover the base-16 digit Vars below), so reject the rest here --
        // otherwise the compiler explores those extra hypothetical values
        // too, multiplying the reachable-state count for no reason.
        if (value < 1 || value > 9) return undefined;
        return { phase: 'prod', pos: state.pos + 1, prod: Math.min(state.prod * value, SINK) };
      }
      if (state.digitsLeft === 0) return undefined; // no more digits expected
      const place = DIGIT_RADIX ** (state.digitsLeft - 1);
      const expected = Math.floor(state.remaining / place);
      if (value !== expected) return undefined; // reject: digit mismatch
      return {
        phase: 'digit',
        remaining: state.remaining % place,
        digitsLeft: state.digitsLeft - 1,
      };
    },
    accept: (state) => state.phase === 'digit' && state.digitsLeft === 0,
    // +1 for the segment break itself, which is also a BFS step.
    maxDepth: armLen + digitVars.length + 1,
  }, DIGIT_RADIX, { valueOffset: -1, multiSegment: true });
  return new NFA(spec, 'SegmentProductDigits', cells, digitVars);
}

// Whether the number spelled by `moreVars` equals one more than the number
// spelled by `lessVars` (both most-significant first, same width, base
// DIGIT_RADIX). `Sum` cannot compare these directly -- its coefficients
// are capped at +-100, far below the place values a several-digit product
// needs -- so this ripple-carries the comparison digit by digit from the
// least-significant end instead, the way grade-school addition checks it.
// State is just a carry bit plus the one digit awaiting its partner, so it
// stays tiny regardless of how many digits are involved.
function isOneMore(moreVars, lessVars) {
  const width = moreVars.length; // === lessVars.length
  const moreLsbFirst = [...moreVars].reverse();
  const lessLsbFirst = [...lessVars].reverse();
  const interleaved = [];
  for (let i = 0; i < width; i++) interleaved.push(lessLsbFirst[i], moreLsbFirst[i]);

  const spec = NFA.encodeSpec({
    startState: { carry: 1, pending: null },
    transition: (state, value) => {
      if (state.pending === null) {
        // Just read the "less" digit at this place; hold it for its
        // "more" partner, which comes next in the interleaved sequence.
        return { carry: state.carry, pending: value };
      }
      const sum = state.pending + state.carry;
      const expected = sum % DIGIT_RADIX;
      const carryOut = sum >= DIGIT_RADIX ? 1 : 0;
      if (value !== expected) return undefined; // reject: digit mismatch
      return { carry: carryOut, pending: null };
    },
    accept: (state) => state.pending === null && state.carry === 0,
  }, DIGIT_RADIX, { valueOffset: -1 });
  return new NFA(spec, 'OneMore', ...interleaved);
}

// Var prefixes must be plain upper-case letters, so turn a running counter
// into a base-26 letter code (A, B, ..., Z, AA, AB, ...).
function letterCode(n) {
  let s = '';
  n++;
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

let auxIndex = 0;

// One split point of a turquoise line: ties two fresh digit-Var groups to
// the two segments' products (unconditionally -- `pins`, not gated by
// whether this split turns out to be the satisfying one) and reports the
// "consecutive" check on those now-pinned digits separately. Keeping the
// decomposition outside the eventual Or matters: gating it inside would
// leave a not-chosen split's digit Vars completely free, which is not a
// second grid solution but inflates the raw solution count exactly the
// way an unpinned auxiliary Var does. Both digit groups are padded to the
// wider segment's digit count so they line up place-for-place for the
// carry comparison (the decomposition NFA already zero-pads a shorter
// product into extra leading digit positions).
function turquoiseSplit(segA, segB) {
  const code = letterCode(auxIndex++);
  const width = Math.max(digitsNeededFor(segA.length), digitsNeededFor(segB.length));
  const digitsA = new Var(`Q${code}A`, 'segment product digit', width);
  const digitsB = new Var(`Q${code}B`, 'segment product digit', width);
  const varsA = digitsA.cells();
  const varsB = digitsB.cells();
  return {
    vars: [digitsA, digitsB],
    pins: [segmentProductDigits(segA, varsA), segmentProductDigits(segB, varsB)],
    consecutive: new Or([
      isOneMore(varsA, varsB), // productA = productB + 1
      isOneMore(varsB, varsA), // productB = productA + 1
    ]),
  };
}

function turquoiseLine(cells) {
  const vars = [];
  const pins = [];
  const consecutives = [];
  for (let k = 1; k < cells.length; k++) {
    const split = turquoiseSplit(cells.slice(0, k), cells.slice(k));
    vars.push(...split.vars);
    pins.push(...split.pins);
    consecutives.push(split.consecutive);
  }
  return { vars, pins, clue: new Or(consecutives) };
}

const TURQUOISE_LINES = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R2C2'],
  ['R7C1', 'R7C2', 'R7C3', 'R6C3'],
  ['R8C1', 'R8C2', 'R8C3', 'R7C4', 'R7C5', 'R6C6', 'R5C7'],
  ['R3C2', 'R4C2', 'R5C2'],
  ['R4C5', 'R4C6', 'R5C6', 'R6C5', 'R6C4'],
];

const turquoiseResults = TURQUOISE_LINES.map(turquoiseLine);
const turquoiseVars = turquoiseResults.flatMap(r => r.vars);
const turquoisePins = turquoiseResults.flatMap(r => r.pins);
const turquoiseClues = turquoiseResults.map(r => r.clue);

return [
  SHAPE,
  restrictGrid,
  ...singleCellCages,
  tripleCage,
  ...thermoClues,
  ...productArrows,
  ...turquoiseVars,
  ...turquoisePins,
  ...turquoiseClues,
];
