// Title: Monarch
// Author: grkles
// Video: https://www.youtube.com/watch?v=cuwa2h4BaJA
// Source: https://app.crackingthecryptic.com/sudoku/nbb8rJ69Ht

// Rules encoded:
// - Normal sudoku, 9x9, no givens in the grid.
// - Japanese sums shading: some grid cells are shaded. Outside each row and
//   column, a contiguous stack of clue cells (flush against the grid edge)
//   lists the sums of that line's maximal runs of shaded cells, one clue per
//   run, consecutive runs separated by at least one unshaded cell. Clue
//   values are printed numbers, one hidden value ("?"), and 17 unprinted
//   values (orange-outlined cells) the solver must determine.
// - Renban: values on each blue line are a consecutive, non-repeating set.
//   Blue lines run through both grid cells and outside-clue cells; a clue
//   cell's value (printed or unprinted) joins its line's consecutive set.
//
// The rules do not say which end of a clue stack pairs with which run. Both
// readings are encoded as a disjunction (one Or over the two orders, each
// applied uniformly to all 18 lanes): reading order (clue farthest from the
// grid = first run) or the reverse.
//
// The alphabet is widened to 0-11: 0/1 carry the shading overlay, and clue
// values up to 11 fit ordinary Var cells. Every unprinted clue held in a
// single Var sits on a blue line through grid cells or a printed value, which
// caps it at 11 or lower (see description), so the 0-11 alphabet excludes
// nothing the Renban itself would not. The three unprinted clues on the one
// line with no such anchor (canvas R5C11, R4C12, R3C12) can exceed 11, so
// each is held as a tens digit (VH, 0-4) and ones digit (VL, 0-9) of its
// value; their Renban is a custom NFA over the six digit cells.

const SHADED = 1;
const UNSHADED = 0;

const shape = new Shape('9x9', '0-11');
const graph = cellGraph(shape);
const shading = graph.makeOverlay('VS');

// Unprinted single-value clue cells, transcribed from the orange outlines in
// the source art (canvas coordinates; playable grid = canvas rows/cols 6-14).
// VC1  R4C9   column 4 clue 1   blue line 0
// VC2  R5C9   column 4 clue 2   blue line 0
// VC3  R4C13  column 8 clue 3   blue line 2
// VC4  R5C13  column 8 clue 4   blue line 2
// VC5  R7C2   row 2 clue 1      blue line 7
// VC6  R7C4   row 2 clue 3      blue line 4
// VC7  R8C2   row 3 clue 2      blue line 7
// VC8  R8C3   row 3 clue 3      blue line 7
// VC9  R8C4   row 3 clue 4      blue line 7
// VC10 R8C5   row 3 clue 5      blue line 4
// VC11 R9C3   row 4 clue 1      blue line 6
// VC12 R10C4  row 5 clue 2      blue line 6
// VC13 R12C4  row 7 clue 2      blue line 6
// VC14 R12C5  row 7 clue 3      blue line 5
const singleClueVars = new Var('C', 'unprinted outside clues', 14);

// Printed clue values that blue lines pass through (they join the Renban):
// VP1 = 6 at canvas R11C4 (line 6), VP2 = 1 at canvas R8C1 (line 7),
// VP3 = 2 at canvas R13C5 (line 9).
const printedLineClueVars = new Var('P', 'printed clues on blue lines', 3);

// Wide unprinted clues (line 1, no grid or printed anchor): value = 10*VH+VL.
// Pair 1 = canvas R5C11 (column 6 clue 2), pair 2 = R4C12 (column 7 clue 2),
// pair 3 = R3C12 (column 7 clue 1).
const wideTensVars = new Var('H', 'wide clue tens digits', 3);
const wideOnesVars = new Var('L', 'wide clue ones digits', 3);

// Outside-clue stacks, farthest-from-grid first, transcribed from the band's
// printed values, printed numbers, "?" and orange outlines in the source art.
// {t: n} printed sum; {t: null} hidden sum ("?"); {v}/{w} unprinted sum held
// in the named Var / VH-VL pair.
const LANES = [
  { name: 'col 1', cells: graph.column(1), clues: [{ t: 14 }, { t: 13 }] },
  { name: 'col 2', cells: graph.column(2), clues: [{ t: 2 }, { t: null }, { t: 3 }, { t: 6 }] },
  { name: 'col 3', cells: graph.column(3), clues: [{ t: 16 }, { t: 8 }, { t: 13 }] },
  { name: 'col 4', cells: graph.column(4), clues: [{ v: 'VC1' }, { v: 'VC2' }] },
  { name: 'col 5', cells: graph.column(5), clues: [{ t: 35 }] },
  { name: 'col 6', cells: graph.column(6), clues: [{ t: 1 }, { w: 1 }] },
  { name: 'col 7', cells: graph.column(7), clues: [{ w: 3 }, { w: 2 }, { t: 16 }] },
  { name: 'col 8', cells: graph.column(8), clues: [{ t: 9 }, { t: 3 }, { v: 'VC3' }, { v: 'VC4' }] },
  { name: 'col 9', cells: graph.column(9), clues: [{ t: 27 }, { t: 6 }] },
  { name: 'row 1', cells: graph.row(1), clues: [{ t: 13 }, { t: 18 }] },
  { name: 'row 2', cells: graph.row(2), clues: [{ v: 'VC5' }, { t: 8 }, { v: 'VC6' }, { t: 3 }] },
  { name: 'row 3', cells: graph.row(3), clues: [{ t: 1 }, { v: 'VC7' }, { v: 'VC8' }, { v: 'VC9' }, { v: 'VC10' }] },
  { name: 'row 4', cells: graph.row(4), clues: [{ v: 'VC11' }, { t: 13 }, { t: 11 }] },
  { name: 'row 5', cells: graph.row(5), clues: [{ t: 12 }, { v: 'VC12' }, { t: 4 }] },
  { name: 'row 6', cells: graph.row(6), clues: [{ t: 1 }, { t: 6 }, { t: 4 }] },
  { name: 'row 7', cells: graph.row(7), clues: [{ t: 11 }, { v: 'VC13' }, { v: 'VC14' }] },
  { name: 'row 8', cells: graph.row(8), clues: [{ t: 5 }, { t: 15 }, { t: 15 }, { t: 2 }] },
  { name: 'row 9', cells: graph.row(9), clues: [{ t: 10 }, { t: 17 }] },
];

// Blue lines, with band cells replaced by their clue Vars (grid cells are
// grid-relative). Line 1 is the custom NFA below. Cell lists transcribed from
// the source's drawn line paths.
const RENBAN_LINES = [
  ['VC1', 'VC2', 'R1C4', 'R2C4', 'R3C4'],                // line 0
  ['VC3', 'VC4', 'R1C8', 'R2C8', 'R3C9'],                // line 2
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],              // line 3
  ['VC6', 'VC10', 'R4C1', 'R4C2', 'R5C2'],               // line 4
  ['VC14', 'R6C1', 'R6C2'],                              // line 5
  ['VC13', 'VP1', 'VC12', 'VC11'],                       // line 6
  ['VC5', 'VP2', 'VC7', 'VC8', 'VC9'],                   // line 7
  ['R8C6', 'R8C7', 'R7C8'],                              // line 8
  ['VP3', 'R8C1', 'R8C2', 'R9C3', 'R9C4'],               // line 9
];

// Lane machine: scans the line as interleaved (shade, digit) pairs. State:
// r = runs started so far, in = a run is open, sum = the open run's running
// total when its clue is a printed number (null targets are left free; the
// tie machines below pin them), ph = which symbol comes next ('S' shade,
// 'D' digit of a shaded cell, 'X' digit of an unshaded cell). Exactly
// targets.length runs must appear: each clue is one run.
const laneSpecCache = new Map();
function laneSpec(targets) {
  const key = targets.join(',');
  if (laneSpecCache.has(key)) return laneSpecCache.get(key);
  const k = targets.length;
  const spec = NFA.encodeSpec({
    startState: { r: 0, in: false, sum: 0, ph: 'S' },
    transition: (s, v) => {
      if (s.ph === 'S') {
        if (v === SHADED) {
          const r = s.in ? s.r : s.r + 1;
          if (r > k) return undefined;              // more runs than clues
          return { r, in: true, sum: s.sum, ph: 'D' };
        }
        if (v === UNSHADED) {
          if (s.in && targets[s.r - 1] !== null && s.sum !== targets[s.r - 1]) {
            return undefined;                       // run closed off-target
          }
          return { r: s.r, in: false, sum: 0, ph: 'X' };
        }
        return undefined;                           // not a shade value
      }
      if (v < 1 || v > 9) return undefined;         // not a grid digit
      if (s.ph === 'X') return { r: s.r, in: false, sum: 0, ph: 'S' };
      const t = targets[s.r - 1];
      if (t === null) return { r: s.r, in: true, sum: 0, ph: 'S' };
      const sum = s.sum + v;
      if (sum > t) return undefined;                // overshoots its clue
      return { r: s.r, in: true, sum, ph: 'S' };
    },
    accept: (s) => s.ph === 'S' && s.r === k &&
      (!s.in || targets[s.r - 1] === null || s.sum === targets[s.r - 1]),
  }, shape);
  laneSpecCache.set(key, spec);
  return spec;
}

// Tie machine: pins one unprinted clue to its run. Segment 1 is the lane as
// interleaved (shade, digit) pairs, tracking only run number `watch`'s sum
// (capped at 46, one past the largest possible run sum, a dead sink);
// segment 2 is the clue's Var cell -- or its VH then VL cell, matched as the
// sum's tens then ones digit. The break requires all k runs seen, agreeing
// with the lane machine.
const tieSpecCache = new Map();
function tieSpec(k, watch, wide) {
  const key = `${k},${watch},${wide}`;
  if (tieSpecCache.has(key)) return tieSpecCache.get(key);
  const CAP = 46;
  const spec = NFA.encodeSpec({
    startState: { r: 0, in: false, sum: 0, ph: 'S' },
    transition: (s, v) => {
      if (v === SEGMENT_BREAK) {
        if (s.r !== k) return undefined;
        return { sum: s.sum, ph: wide ? 'H' : 'V' };
      }
      if (s.ph === 'S') {
        if (v === SHADED) {
          const r = s.in ? s.r : s.r + 1;
          if (r > k) return undefined;
          return { r, in: true, sum: s.sum, ph: r === watch ? 'D' : 'X' };
        }
        if (v === UNSHADED) return { r: s.r, in: false, sum: s.sum, ph: 'X' };
        return undefined;
      }
      if (s.ph === 'V') return v === s.sum ? { ph: 'A' } : undefined;
      if (s.ph === 'H') {
        return v === Math.floor(s.sum / 10) ? { sum: s.sum % 10, ph: 'L' } : undefined;
      }
      if (s.ph === 'L') return v === s.sum ? { ph: 'A' } : undefined;
      if (v < 1 || v > 9) return undefined;
      if (s.ph === 'X') return { r: s.r, in: s.in, sum: s.sum, ph: 'S' };
      // ph 'D': a digit inside the watched run.
      return { r: s.r, in: true, sum: Math.min(s.sum + v, CAP), ph: 'S' };
    },
    accept: (s) => s.ph === 'A',
  }, shape, { multiSegment: true });
  tieSpecCache.set(key, spec);
  return spec;
}

// Renban over line 1's three two-digit values: scans VH1,VL1,VH2,VL2,VH3,VL3.
// State assembles each value from its tens digit (held in h); after two
// values it keeps only their min and gap d (|difference|, 1 or 2 -- anything
// else can never complete a 3-value consecutive set); the third value must
// fill exactly the remaining slot.
function wideRenbanSpec() {
  return NFA.encodeSpec({
    startState: { ph: 0 },
    transition: (s, v) => {
      switch (s.ph) {
        case 0: return v <= 4 ? { ph: 1, h: v } : undefined;
        case 1: {
          if (v > 9) return undefined;
          const v1 = s.h * 10 + v;
          return v1 >= 1 ? { ph: 2, v1 } : undefined;
        }
        case 2: return v <= 4 ? { ph: 3, v1: s.v1, h: v } : undefined;
        case 3: {
          if (v > 9) return undefined;
          const v2 = s.h * 10 + v;
          if (v2 < 1) return undefined;
          const d = Math.abs(v2 - s.v1);
          if (d !== 1 && d !== 2) return undefined;
          return { ph: 4, mn: Math.min(s.v1, v2), d };
        }
        case 4: return v <= 4 ? { ph: 5, mn: s.mn, d: s.d, h: v } : undefined;
        case 5: {
          if (v > 9) return undefined;
          const v3 = s.h * 10 + v;
          const ok = s.d === 2 ? v3 === s.mn + 1 : (v3 === s.mn - 1 || v3 === s.mn + 2);
          return ok ? { ph: 6 } : undefined;
        }
        default: return undefined;
      }
    },
    accept: (s) => s.ph === 6,
  }, shape);
}

// One stack-order branch: every lane's machine plus every unprinted clue's
// tie, with clue position j matched to run j (reading order) or run k+1-j
// (reversed).
function branchConstraints(reversed) {
  return LANES.flatMap(lane => {
    const entries = reversed ? [...lane.clues].reverse() : lane.clues;
    const targets = entries.map(e => (e.t !== undefined ? e.t : null));
    const scan = lane.cells.flatMap(cell => [shading.at(cell), cell]);
    return [
      new NFA(laneSpec(targets), 'jss lane', ...scan),
      ...entries.flatMap((e, i) => {
        if (e.t !== undefined) return [];
        const varCells = e.v
          ? [e.v]
          : [wideTensVars.cell(e.w), wideOnesVars.cell(e.w)];
        return [new NFA(
          tieSpec(targets.length, i + 1, !e.v), 'jss clue tie', scan, varCells)];
      }),
    ];
  });
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

return [
  shape,
  shading.toVar('shading'),
  singleClueVars,
  printedLineClueVars,
  wideTensVars,
  wideOnesVars,

  // The widened alphabet exists for the overlays; grid cells keep 1-9.
  graph.makeReplicate(new Given('R1C1', ...DIGITS)),
  shading.makeReplicate(new Given(shading.at('R1C1'), UNSHADED, SHADED)),

  // Var domains. Single-value clues: 1..11 (see header). Printed clues on
  // lines: their printed values. Wide clues: tens 0-4 (a run sum is at most
  // 45), ones 0-9.
  ...singleClueVars.cells().map(cell => new Given(cell, ...range(1, 11))),
  ...[6, 1, 2].map((v, i) => new Given(printedLineClueVars.cell(i + 1), v)),
  ...wideTensVars.cells().map(cell => new Given(cell, ...range(0, 4))),
  ...wideOnesVars.cells().map(cell => new Given(cell, ...range(0, 9))),

  ...RENBAN_LINES.map(cells => new Renban(...cells)),
  new NFA(wideRenbanSpec(), 'wide renban',
    'VH1', 'VL1', 'VH2', 'VL2', 'VH3', 'VL3'),

  new Or([
    new And(branchConstraints(false)),
    new And(branchConstraints(true)),
  ]),
];
