// Title: Please Ignore
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=LaMr-s0RBKk
// Source: https://sudokupad.app/h1zrlsc75s

// Normal sudoku, plus one undetermined digit (1-9) that is "inactive": every
// drawn line below ignores a cell holding it, and applies its rule to only
// the remaining ("active") cells. Region-sum lines (B, blue) split into
// per-box segments with equal active-digit sums; renban lines (P, pink)
// form a non-repeating consecutive set of active digits; nabner lines
// (Y, yellow) forbid any two active digits anywhere on the line (not just
// neighbours) from being equal or consecutive.
//
// Every line cell gets a parallel "active" flag (1 active, 2 inactive),
// pinned to whether the cell equals the shared inactive-digit Var. Each
// line rule then scans flag/digit pairs instead of carrying the
// inactive digit itself through a long scan -- that would multiply every
// other state field by the 9 possible inactive-digit values and blow the
// NFA compiler's state cap.

// A single-count Var group's cell id is the bare prefix.
const VI = 'VI';

// Cell lists transcribed from the drawn lines. Y5 and P3 each stitch
// together two payload entries that meet edge-to-edge near R9C3 (same
// color and width, continuing direction, each fragment alone covering no
// whole cell); read together both cross into that cell.
const B1 = ['R5C1', 'R6C1', 'R7C1', 'R8C1'];
const B2 = ['R3C7', 'R2C7', 'R1C6', 'R1C5', 'R1C4', 'R2C4',
  'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2'];
const B3 = ['R3C6', 'R4C6', 'R5C5', 'R5C6', 'R5C7', 'R6C7', 'R6C6', 'R6C5',
  'R7C5', 'R7C4', 'R6C4', 'R5C4', 'R5C3', 'R5C2', 'R4C1', 'R4C2', 'R4C3',
  'R4C4', 'R4C5', 'R3C5', 'R2C6']; // closed loop

const Y1 = ['R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9'];
const Y2 = ['R6C2', 'R6C3'];
const Y3 = ['R5C9', 'R4C9', 'R3C9'];
const Y4 = ['R8C3', 'R8C2', 'R7C2'];
const Y5 = ['R8C5', 'R8C4', 'R9C3'];

const P1 = ['R8C7', 'R8C8'];
const P2 = ['R7C7', 'R7C8'];
const P3 = ['R9C1', 'R9C2', 'R9C3'];
const P4 = ['R6C9', 'R6C8', 'R5C8', 'R4C7'];

const ALL_LINES = [B1, B2, B3, Y1, Y2, Y3, Y4, Y5, P1, P2, P3, P4];

// One active flag per distinct line cell (R9C3 is on both Y5 and P3, so it
// gets a single shared flag), as a Var overlay paired 1:1 with those cells.
const flaggedCells = [...new Set(ALL_LINES.flat())];
const activeOverlay = cellGraph('9x9').makeOverlay('VA', flaggedCells);
const flags = activeOverlay.toVar('active flags (1 active, 2 inactive)');
const flagOf = (cell) => activeOverlay.at(cell);

const boxOf = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return `${Math.floor((row - 1) / 3)}_${Math.floor((col - 1) / 3)}`;
};

// Groups a region-sum line's cells into contiguous same-box runs (the
// segments the rule scores). A closed loop's drawn starting point is
// arbitrary, so when the first and last cell share a box, rotate the list
// first -- otherwise that shared box would be wrongly cut into two
// segments instead of one that wraps around.
const boxSegments = (cells, closed) => {
  let ordered = cells;
  if (closed && boxOf(cells[0]) === boxOf(cells[cells.length - 1])) {
    const startBox = boxOf(cells[0]);
    const cut = cells.findIndex(c => boxOf(c) !== startBox);
    ordered = [...cells.slice(cut), ...cells.slice(0, cut)];
  }
  const segments = [];
  for (const cell of ordered) {
    const last = segments[segments.length - 1];
    if (last && boxOf(last[0]) === boxOf(cell)) {
      last.push(cell);
    } else {
      segments.push([cell]);
    }
  }
  return segments;
};

// Pins one flag: reads [inactiveDigit, cell, flag] and accepts only the
// flag value ('1'/'2') matching whether cell's digit equals the shared
// inactive digit.
const flagLinkSpec = NFA.encodeSpec({
  startState: 'readInactive',
  transition: (state, value) => {
    if (state === 'readInactive') return { inactive: value };
    if (state.digit === undefined) return { inactive: state.inactive, digit: value };
    return { inactive: state.inactive, digit: state.digit, flag: value };
  },
  accept: (state) => (state.digit === state.inactive ? state.flag === 2 : state.flag === 1),
}, 9);

const flagLinks = flaggedCells.map(
  cell => new NFA(flagLinkSpec, 'active flag', VI, cell, flagOf(cell)));

// Reads one box segment as [flag, digit, flag, digit, ...],
// SEGMENT_BREAK, .... The first segment's active-digit sum becomes the
// shared target; every later segment's active-digit sum must match it.
const regionSumSpec = NFA.encodeSpec({
  startState: { target: null, sum: 0, pendingFlag: null },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.target === null) return { target: state.sum, sum: 0, pendingFlag: null };
      if (state.sum !== state.target) return undefined;
      return { ...state, sum: 0, pendingFlag: null };
    }
    if (state.pendingFlag === null) {
      // Flags are always 1 or 2 (see the Given restricting them); reject
      // anything else so the abstract compiler doesn't grow a state per
      // unused flag value.
      if (value !== 1 && value !== 2) return undefined;
      return { ...state, pendingFlag: value };
    }
    const contribution = state.pendingFlag === 1 ? value : 0;
    // Clamp relative to the target (once known) or to 46 -- one more than
    // the max possible 9-cell box-segment sum -- so the sum can never
    // spuriously equal a real target and the compiled state count stays
    // bounded regardless of segment length.
    const cap = (state.target === null ? 46 : state.target) + 1;
    return { ...state, sum: Math.min(state.sum + contribution, cap), pendingFlag: null };
  },
  accept: (state) => state.target === null || state.sum === state.target,
}, 9, { multiSegment: true });

const regionSum = (name, cells, closed) => {
  const segments = boxSegments(cells, closed)
    .map(segment => segment.flatMap(cell => [flagOf(cell), cell]));
  return new NFA(regionSumSpec, name, ...segments);
};

// Reads [flag, digit, flag, digit, ...]. Rejects as soon as an active
// digit repeats or neighbours (value +/-1) an already-seen active digit,
// anywhere earlier on the line -- the rule applies to any two, not just
// adjacent cells.
const nabnerSpec = NFA.encodeSpec({
  startState: { mask: 0, pendingFlag: null },
  transition: (state, value) => {
    if (state.pendingFlag === null) {
      if (value !== 1 && value !== 2) return undefined;
      return { ...state, pendingFlag: value };
    }
    const flag = state.pendingFlag;
    if (flag === 2) return { mask: state.mask, pendingFlag: null };
    const bit = 1 << (value - 1);
    const conflict = bit | (bit << 1) | (bit >>> 1);
    if (state.mask & conflict) return undefined;
    return { mask: state.mask | bit, pendingFlag: null };
  },
  accept: () => true,
}, 9);

const nabner = (name, cells) =>
  new NFA(nabnerSpec, name, ...cells.flatMap(cell => [flagOf(cell), cell]));

// Reads [flag, digit, flag, digit, ...]. Rejects a repeated active digit
// immediately; accepts only when the set of active digits seen (a 9-bit
// mask) forms one contiguous run, i.e. a consecutive set.
const renbanSpec = NFA.encodeSpec({
  startState: { mask: 0, pendingFlag: null },
  transition: (state, value) => {
    if (state.pendingFlag === null) {
      if (value !== 1 && value !== 2) return undefined;
      return { ...state, pendingFlag: value };
    }
    const flag = state.pendingFlag;
    if (flag === 2) return { mask: state.mask, pendingFlag: null };
    const bit = 1 << (value - 1);
    if (state.mask & bit) return undefined;
    return { mask: state.mask | bit, pendingFlag: null };
  },
  accept: (state) => {
    const mask = state.mask;
    if (mask === 0) return true;
    let shifted = mask;
    while ((shifted & 1) === 0) shifted >>>= 1;
    return (shifted & (shifted + 1)) === 0; // shifted is 0b0..01..1 (a run from bit 0)
  },
}, 9);

const renban = (name, cells) =>
  new NFA(renbanSpec, name, ...cells.flatMap(cell => [flagOf(cell), cell]));

return [
  new Shape('9x9'),
  new Var('I', 'the inactive digit', 1),
  flags,
  activeOverlay.makeReplicate(new Given(activeOverlay.cells()[0], 1, 2)),
  ...flagLinks,

  regionSum('region sum B1', B1, false),
  regionSum('region sum B2', B2, false),
  regionSum('region sum B3', B3, true),

  nabner('nabner Y1', Y1),
  nabner('nabner Y2', Y2),
  nabner('nabner Y3', Y3),
  nabner('nabner Y4', Y4),
  nabner('nabner Y5', Y5),

  renban('renban P1', P1),
  renban('renban P2', P2),
  renban('renban P3', P3),
  renban('renban P4', P4),
];
