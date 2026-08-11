// Title: Topsy-Turvy
// Author: zetamath and Tallcat
// Video: https://www.youtube.com/watch?v=y5hPv-Ba-L0
// Source: https://app.crackingthecryptic.com/sudoku/4TPGDbgjHd

// Normal sudoku rules apply. Digits on a between line, which may include
// repeats, must be strictly between the values in the circles on the ends of
// that line. Nine cells in the grid are doublers, one in each row, column and
// box; each digit 1-9 appears in a doubler cell exactly once; for the
// purposes of the between lines, a doubler cell's value is twice its digit
// and every other cell's value is its digit. Every clause is encoded; nothing
// is omitted.

// VD is a parallel flag layer over the grid: 1 marks an ordinary cell and 2
// marks a doubler. Which cells are doublers is solver state -- the payload
// draws no doubler marks, only the rule that locates them as a set (one per
// row/column/box, digits 1-9 once each) -- so every value-sensitive rule
// scans grid digits interleaved with their flags and uses digit * flag as
// the cell's effective value.
const graph = cellGraph('9x9');
const cells = graph.cells();
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const interleave = path => path.flatMap(cell => [cell, flag(cell)]);

// Exactly one doubler in the scan carries this digit. The machine alternates
// digit and flag symbols; `digit` holds the digit awaiting its flag.
const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', digit: 0, count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, count: state.count };
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', digit: 0, count };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, 9);

// Effective values reachable by a single cell: its digit (flag 1) or twice
// its digit (flag 2). Duplicates (e.g. 6 = 3*2 = 6*1) collapse via the Set.
const EFFECTIVE_VALUES = [...new Set(
  Array.from({ length: 9 }, (_, i) => i + 1).flatMap(d => [d, d * 2]))].sort((a, b) => a - b);

// A between line as three NFA segments: endpoint 1, the interior run, and
// endpoint 2 (SEGMENT_BREAK marks each join, so the machine always knows
// which cell is the second circle without counting position). Every interior
// effective value must sit strictly between the two endpoints' effective
// values, but the second endpoint's value isn't known until the last symbol,
// and endpoint 1's value can't be carried as free-ranging state without the
// compiled state count multiplying past the NFA limit. Instead `v1` and
// `dir` (whether endpoint 1 is the low or high end) are baked into the spec
// as constants: one small machine per (v1, dir) candidate, fixing endpoint
// 1's value the moment it is read and matching only that; an `Or` over every
// candidate below picks out whichever is realised. Each machine then only
// needs one running extreme -- the interior max under 'asc', the interior
// min under 'desc' -- checked strictly against `v1` per interior cell and
// against endpoint 2 at the close.
const betweenLineSpec = (v1, dir) => NFA.encodeSpec({
  startState: { stage: 'v1', sub: 'digit' },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.sub !== 'digit') return undefined;
      if (state.stage === 'v1') return { ...state, stage: 'interior' };
      if (state.stage === 'interior') return { ...state, stage: 'v2' };
      return undefined;
    }
    if (state.sub === 'digit') return { ...state, sub: 'flag', digit: value };
    // Flags only ever hold 1 or 2; rejecting anything else here (rather than
    // relying on the flag cell's own domain) keeps the compiled state count
    // bounded -- otherwise the compiler explores every 1-9 symbol at a flag
    // position and `effective` climbs well past its real 1-18 range.
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    if (state.stage === 'v1') {
      // Stay in stage 'v1' (sub back to 'digit') so the SEGMENT_BREAK that
      // follows -- not this symbol -- is what advances to 'interior'.
      return effective === v1 ? { stage: 'v1', sub: 'digit', bound: v1 } : undefined;
    }
    if (state.stage === 'interior') {
      if (dir === 'asc') {
        if (effective <= v1) return undefined;
        return { stage: 'interior', sub: 'digit', bound: Math.max(state.bound, effective) };
      }
      if (effective >= v1) return undefined;
      return { stage: 'interior', sub: 'digit', bound: Math.min(state.bound, effective) };
    }
    // stage === 'v2'
    const ok = dir === 'asc' ? effective > state.bound : effective < state.bound;
    return ok ? { stage: 'done' } : undefined;
  },
  accept: state => state.stage === 'done',
}, 9, { multiSegment: true });
// Skip the two candidates with no reachable interior value at all (desc from
// the lowest effective value, asc from the highest) -- a spec with no path to
// its accept state builds as a degenerate 0-symbol NFA that breaks the `Or`.
const [MIN_EFFECTIVE, MAX_EFFECTIVE] = [EFFECTIVE_VALUES[0], EFFECTIVE_VALUES.at(-1)];
const betweenLineSpecs = EFFECTIVE_VALUES.flatMap(v1 => ['asc', 'desc']
  .filter(dir => !(dir === 'asc' && v1 === MAX_EFFECTIVE) && !(dir === 'desc' && v1 === MIN_EFFECTIVE))
  .map(dir => betweenLineSpec(v1, dir)));

// Between lines, each as [endpoint1, ...interior, endpoint2]. Interior cells
// are the drawn stroke's cell path (an arc-length read of each line's
// waypoints); endpoints are the drawn circle nearest each stroke's first/last
// waypoint (13 circles, each strictly closer -- by at least 0.4 cell widths
// -- to one line end than to any other circle, so the pairing is
// unambiguous). Two drawn strokes carry no waypoints at all (styling
// residue) and are not lines.
const BETWEEN_LINES = [
  // stroke 1: R2C1 through row 1 and down to R3C8, to R2C9.
  ['R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C8', 'R3C8', 'R2C9'],
  // stroke 2: R2C1 to R3C5.
  ['R2C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5'],
  // stroke 3: R3C1 to R3C5.
  ['R3C1', 'R4C2', 'R4C3', 'R4C4', 'R3C5'],
  // stroke 4: R3C5 to R3C6, dipping through R2C6.
  ['R3C5', 'R2C6', 'R3C6'],
  // stroke 5: R5C3 to R8C1.
  ['R5C3', 'R5C2', 'R6C1', 'R7C1', 'R8C1'],
  // stroke 7: R8C1 through row 9 to R8C9.
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R8C9'],
  // stroke 8: R7C3 to R7C5.
  ['R7C3', 'R6C3', 'R6C4', 'R7C5'],
  // stroke 9: R7C6 to R8C9.
  ['R7C6', 'R7C7', 'R8C8', 'R8C9'],
  // stroke 10: R7C5 to R7C9.
  ['R7C5', 'R6C6', 'R6C7', 'R6C8', 'R7C9'],
  // stroke 11: R3C6 to R3C9.
  ['R3C6', 'R4C6', 'R4C7', 'R4C8', 'R3C9'],
];

const betweenLineConstraints = BETWEEN_LINES.map((path, i) => {
  const segments = [interleave([path[0]]), interleave(path.slice(1, -1)), interleave([path[path.length - 1]])];
  return new Or(betweenLineSpecs.map(
    spec => new NFA(spec, `between line ${i + 1}`, ...segments)));
});

return [
  new Shape('9x9'),

  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2)),
  ...graph.rowsColumnsBoxes().map(unit => new ContainExact('2', ...flags.at(unit))),
  ...Array.from({ length: 9 }, (_, i) => new NFA(
    doubledDigitSpec(i + 1), `doubler digit ${i + 1}`, ...interleave(cells))),

  ...betweenLineConstraints,
];
