// Title: The Blue Square
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=ud1FmESQ_0g
// Source: https://app.crackingthecryptic.com/sudoku/7ttN3TmD7M

// Standard sudoku: digits 1-7 once per row and column, plus 7
// orthogonally-connected 7-cell regions whose shape the solver must
// discover, each also holding 1-7 once (ChaosConstruction). The grid has no
// default boxes: 7 is prime, so no rectangular box tiling exists.
//
// Green line: every pair of cells it joins must differ by >= 4. Every drawn
// green line here is a single 2-cell segment, so each is one Whisper(4)
// over its pair.
//
// Blue line: the digits along the line must sum to the same total within
// each region the line passes through, starting a fresh run each time the
// line crosses into a different region (the rule's own worked example --
// r2r3r4c6 vs r5r6c6 -- names the interior segment below). Two blue lines
// are drawn: the grid's outer border (a closed loop over every edge cell)
// and a 5-cell vertical segment R2C6-R3C6-R4C6-R5C6-R6C6. Only the interior
// segment is encoded; see the omission note above the NFA for the border
// loop.
//
// A sixth line entry (styled green, like the segments above) carries no
// coordinates at all and covers no cells: it renders no stroke and is not a
// drawn clue, so nothing is encoded for it.

const GREEN_PAIRS = [
  ['R2C1', 'R1C2'],
  ['R6C1', 'R7C2'],
  ['R2C2', 'R3C2'],
  ['R3C4', 'R3C5'],
  ['R4C5', 'R5C5'],
];

const greenWhispers = GREEN_PAIRS.map(([a, b]) => new Whisper(4, a, b));

// The interior blue line, top to bottom.
const BLUE_LINE = ['R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6'];

// ISS's RegionSumLine explicitly refuses ChaosConstruction (unknown
// regions), so the interior blue line's equal-run-sum rule is rebuilt
// directly from the CC region-label overlay. The border loop's instance of
// the same rule is omitted outright: a closed loop needs the run that
// straddles the array wrap-around merged with the run it started, and
// that merge depends on which of the (here, unknown-in-advance) regions
// happens to contain the loop's start cell -- no sound wrap-around merge
// over regions the solver itself is still discovering is available, so it
// is left as a gap rather than risking an unverified custom reduction.
//
// The NFA below reads (region label, digit) pairs down the interior line in
// order. It accumulates `sum` while the label stays the same as the
// previous cell's; when the label changes, the just-finished run's `sum`
// either becomes `target` (the first run seen) or must equal the existing
// `target`. `accept` requires the final run to also equal `target` (or
// accepts unconditionally if the label never changed -- the whole line sat
// in one region, so there is only one sum to compare against itself).
const regionSumSpec = {
  // `awaitingDigit` is false while the next input is a cell's region label,
  // true while it is that same cell's digit.
  startState: { awaitingDigit: false, label: null, sum: 0, target: null },
  transition({ awaitingDigit, label, sum, target }, value) {
    if (awaitingDigit) {
      // Clamp: once target is known, any sum past it can only fail, so
      // collapse every overshoot onto one sink value (target + 1). Without
      // this the running sum is unbounded across an arbitrarily long scan
      // and blows the compiled-state limit.
      const newSum = target === null
        ? sum + value : Math.min(sum + value, target + 1);
      return { awaitingDigit: false, label, sum: newSum, target };
    }
    if (label === null || value === label) {
      // First cell, or the region label repeats: the current run continues.
      return { awaitingDigit: true, label: value, sum, target };
    }
    // The region label changed: the run that just ended must match target,
    // or become target if this is the first run completed.
    if (target === null) {
      return { awaitingDigit: true, label: value, sum: 0, target: sum };
    }
    if (sum !== target) return undefined;
    return { awaitingDigit: true, label: value, sum: 0, target };
  },
  accept({ sum, target }) {
    return target === null || sum === target;
  },
  // Bounds state creation: 5 line cells, each a label then a digit.
  maxDepth: BLUE_LINE.length * 2,
};
const regionSumNFA = NFA.encodeSpec(regionSumSpec, 7);

const cc = cellGraph('7x7').makeOverlay('CC');
const regionSumCells = BLUE_LINE.flatMap(cell => [cc.at(cell), cell]);
const blueLineRegionSum =
  new NFA(regionSumNFA, 'BlueLineRegionSum', ...regionSumCells);

return [
  new Shape('7x7'),
  new Given('R1C1', 7),
  new Given('R1C7', 1),
  new Given('R6C4', 2),
  new Given('R7C1', 2),
  new Given('R7C7', 4),
  new ChaosConstruction(),
  ...greenWhispers,
  blueLineRegionSum,
];
