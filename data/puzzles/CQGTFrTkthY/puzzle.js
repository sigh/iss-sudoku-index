// Title: Forcing
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=CQGTFrTkthY
// Source: https://sudokupad.app/jcdh680q0f

// Chaos construction: the grid divides into nine non-overlapping,
// orthogonally-connected 9-cell regions. Rows, columns and regions are
// standard sudoku houses; there are no given boxes.
//
// In each region the leftmost cell of its topmost row is "circled". That
// cell is exactly the region's row-major-first cell, so it is derived
// rather than given: a single scanning NFA walks the whole grid in
// row-major order and marks a cell circled iff its region label has not
// appeared at any earlier cell. This relies on ChaosConstruction's own
// canonical-label-order symmetry breaking (each region label first appears
// strictly before the next), which makes "region label not seen before"
// equivalent to "region label equals the count of distinct labels used so
// far" -- a running counter, not a 9-bit seen-set. Verified in isolation
// against a hand-built accept/reject table (region-sequence -> forced flag
// sequence) before wiring it into the puzzle.
//
// Every circled digit counts how many cells of its own region, itself
// included, are visible in its column: a same-region run starting at the
// circled cell, extended up and down the column, stopping in each
// direction at the first cell of a different region (the border blocks
// further view). This is the same "run length" ChaosArrow computes, but
// ChaosArrow is a ChaosConstruction-category handler and so cannot be
// nested inside Or/And to make it conditional on "am I circled" -- so the
// run is instead a purpose-built NFA (StateMachine category, composable),
// applied per cell inside "not circled OR run-equals-digit". Also verified
// in isolation (self-only, blocked border, both arms).
//
// The nine circled cells (one per region) form their own orthogonally
// connected group containing every digit once: ConnectedValues gives the
// connectivity, and one small counting NFA per digit value gives the
// distinctness (each digit must appear among circled cells exactly once).

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');
const flag = graph.makeOverlay('VG');
const cells = graph.cells();

const NOT_CIRCLED = 1;
const CIRCLED = 2;

// --- Derive which cell is circled in each region (see header comment). ---
const circledScan = [];
for (const cell of cells) circledScan.push(cc.at(cell), flag.at(cell));

const circledSpec = NFA.encodeSpec({
  // counter: the next region label (display value, 1-9) not yet seen.
  // pendingIsNew: null while expecting a region-label read; the just
  // computed isNew verdict while expecting the paired flag read.
  startState: { counter: 1, pendingIsNew: null },
  transition: ({ counter, pendingIsNew }, value) => {
    if (pendingIsNew === null) {
      const isNew = value === counter;
      return { counter: isNew ? counter + 1 : counter, pendingIsNew: isNew };
    }
    const expected = pendingIsNew ? CIRCLED : NOT_CIRCLED;
    if (value !== expected) return undefined;
    return { counter, pendingIsNew: null };
  },
  // All nine regions must have been seen: counter walked 1 -> 10.
  accept: ({ counter, pendingIsNew }) => pendingIsNew === null && counter === 10,
}, 9);

// --- Circled-cell visibility run (see header comment). ---
function runCheckNfa(cell) {
  const upArm = graph.ray(cell, -1, 0).slice(1).map(c => cc.at(c));
  const downArm = graph.ray(cell, 1, 0).slice(1).map(c => cc.at(c));
  const segments = [[cell, cc.at(cell)]];
  if (upArm.length) segments.push(upArm);
  if (downArm.length) segments.push(downArm);

  const spec = NFA.encodeSpec({
    // digit: this cell's own value (the claimed visible count).
    // region: this cell's own region label (the target to match along
    // both arms).
    // count: cells seen so far that are still a contiguous same-region run
    // from the start (starts at 1 for the cell itself).
    // matching: false once the current arm has hit a different region.
    startState: { digit: null, region: null, count: 0, matching: true },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) return { ...state, matching: true };
      if (state.digit === null) return { ...state, digit: value };
      if (state.region === null) {
        return { ...state, region: value, count: 1, matching: true };
      }
      if (!state.matching) return state;
      if (value === state.region) {
        return { ...state, count: Math.min(state.count + 1, 10) };
      }
      return { ...state, matching: false };
    },
    accept: ({ digit, region, count }) =>
      digit !== null && region !== null && count === digit,
  }, 9, { multiSegment: true });

  return new NFA(spec, `run-${cell}`, ...segments);
}

// --- Every digit appears exactly once among the circled cells. ---
function circledDigitCountNfa(value) {
  const scan = [];
  for (const cell of cells) scan.push(flag.at(cell), cell);

  const spec = NFA.encodeSpec({
    startState: { count: 0, pendingFlag: null },
    transition: ({ count, pendingFlag }, v) => {
      if (pendingFlag === null) return { count, pendingFlag: v };
      const matched = pendingFlag === CIRCLED && v === value;
      return {
        count: matched ? Math.min(count + 1, 2) : count,
        pendingFlag: null,
      };
    },
    accept: ({ count, pendingFlag }) => pendingFlag === null && count === 1,
  }, 9);

  return new NFA(spec, `circled-digit-${value}`, scan);
}

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),

  flag.toVar('circled cell flags'),
  flag.makeReplicate(
    [new Given(flag.cells()[0], NOT_CIRCLED, CIRCLED)]),

  new NFA(circledSpec, 'circled-derivation', circledScan),

  ...cells.map(cell => new Or([
    new Given(flag.at(cell), NOT_CIRCLED),
    new And([new Given(flag.at(cell), CIRCLED), runCheckNfa(cell)]),
  ])),

  new ConnectedValues('VG', CIRCLED),
  ...Array.from({ length: 9 }, (_, i) => circledDigitCountNfa(i + 1)),
];
