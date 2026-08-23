// Title: Dragonsnake
// Author: Agent
// Video: https://www.youtube.com/watch?v=rFEBuV4ssgY
// Source: https://app.crackingthecryptic.com/sudoku/78p3PfjjgG

// Standard sudoku rows/columns/boxes apply (unchanged).
//
// Shading: native YinYang over the YY overlay -- both shades form one
// connected region each, no 2x2 block may be monochrome, and the
// grey-marked cell R1C4 is shaded.
//
// The red line is drawn as two strokes sharing endpoint R1C1 (both waypoint
// lists start at [0.5,0.5]); read as one continuous 37-cell path.
//
// Along that path: adjacent cells of different shade must differ by >=5
// (one small NFA per edge below); adjacent cells of the same shade need not
// differ. Separately, every maximal same-shade run along the path must hold
// a non-repeating set of consecutive digits -- encoded with one NFA that
// scans (shade, digit) for each path cell in order, tracking the current
// run's shade and a 9-bit "digits seen this run" mask, and rejects a repeat
// within a run or a non-contiguous mask when a run ends (on a shade change,
// or at the path's end via `accept`).

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// The red line, one continuous path (reversing the first drawn stroke and
// appending the second, since both share their R1C1 endpoint).
const linePath = [
  'R1C4', 'R2C5', 'R3C4', 'R2C3', 'R3C2', 'R4C3', 'R5C2', 'R5C1', 'R4C1',
  'R3C1', 'R2C1', 'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C4', 'R5C3',
  'R6C2', 'R7C3', 'R8C4', 'R8C5', 'R7C6', 'R6C7', 'R5C6', 'R4C5', 'R3C6',
  'R2C7', 'R1C8', 'R2C9', 'R3C8', 'R4C9', 'R5C8', 'R6C8', 'R7C8', 'R8C7',
  'R9C6',
];

// Different-shade adjacent pairs along the line must differ by >= 5; equal
// shade pairs are unconstrained by this rule. Per edge, scan
// [shadeA, digitA, shadeB, digitB] and accept when either the shades match or
// the digits differ by >= 5.
const lineEdgeSpec = NFA.encodeSpec({
  startState: { step: 0, shadeA: null, digitA: null, same: null },
  transition: (state, value) => {
    if (state.step === 0) {
      const s = value === SHADED ? SHADED : UNSHADED;
      return { step: 1, shadeA: s, digitA: null, same: null };
    }
    if (state.step === 1) {
      return { step: 2, shadeA: state.shadeA, digitA: value, same: null };
    }
    if (state.step === 2) {
      const s = value === SHADED ? SHADED : UNSHADED;
      return {
        step: 3, shadeA: state.shadeA, digitA: state.digitA,
        same: s === state.shadeA,
      };
    }
    // step 3: digitB
    if (state.same) return { step: 4, ok: true };
    return Math.abs(state.digitA - value) >= 5 ? { step: 4, ok: true } : undefined;
  },
  accept: (state) => state.step === 4 && state.ok === true,
}, graph.gridGeometry().numValues);
const lineShadeDiffRules = [];
for (let i = 0; i + 1 < linePath.length; i++) {
  const a = linePath[i];
  const b = linePath[i + 1];
  lineShadeDiffRules.push(
    new NFA(lineEdgeSpec, 'line-edge', shade.at(a), a, shade.at(b), b));
}

// Every maximal same-shade run along the line holds a non-repeating set of
// consecutive digits. Scan (shade, digit) for every line cell in order.
// State tracks the current run's shade and a bitmask of digits seen so far
// in that run; `mask` is cleared whenever the shade changes from the
// previous cell (a run boundary), after checking the just-ended run's mask
// is a contiguous bit-range (a non-repeating consecutive digit set). The
// final run is checked the same way in `accept`.
function isContiguousMask(mask) {
  if (mask === 0) return true;
  let low = 0;
  while (((mask >> low) & 1) === 0) low++;
  let count = 0;
  for (let m = mask; m; m >>= 1) count += m & 1;
  return mask === (((1 << count) - 1) << low);
}
const lineRunSpec = NFA.encodeSpec({
  // phase: 'shade' expects the next symbol to be a shade value; 'digit'
  // expects the digit of the cell whose shade was just read.
  startState: { phase: 'shade', shade: null, mask: 0 },
  transition: (state, value) => {
    if (state.phase === 'shade') {
      // The scanned alphabet is sized to the grid's 9 digits, but a shade
      // Var only ever actually holds SHADED(1)/UNSHADED(2); collapse any
      // other symbol value the compiler explores onto UNSHADED so the
      // compiled state count tracks the real 2-value domain, not 9.
      const shadeVal = value === SHADED ? SHADED : UNSHADED;
      if (state.shade === null) {
        // First cell of the whole line: nothing to close yet.
        return { phase: 'digit', shade: shadeVal, mask: 0 };
      }
      if (shadeVal === state.shade) {
        return { phase: 'digit', shade: shadeVal, mask: state.mask };
      }
      // Shade changed: the run that just ended must be a valid consecutive
      // set before starting the new run.
      if (!isContiguousMask(state.mask)) return undefined;
      return { phase: 'digit', shade: shadeVal, mask: 0 };
    }
    // phase === 'digit'
    const bit = 1 << (value - 1);
    if (state.mask & bit) return undefined; // digit repeats within this run
    return { phase: 'shade', shade: state.shade, mask: state.mask | bit };
  },
  accept: (state) =>
    state.phase === 'shade' && isContiguousMask(state.mask),
}, graph.gridGeometry().numValues);
const lineRunCells = linePath.flatMap(cell => [shade.at(cell), cell]);
const lineRuns = new NFA(lineRunSpec, 'line-runs', ...lineRunCells);

return [
  new Shape('9x9'),
  new Given('R1C2', 9),
  new Given('R3C4', 5),
  new Given('R4C3', 5),
  new YinYang(),
  // The grey cell is shaded.
  new Given(shade.at('R1C4'), SHADED),
  ...lineShadeDiffRules,
  lineRuns,
];
