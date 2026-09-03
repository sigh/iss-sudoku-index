// Title: How Shall We Split This?
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=dlwcgvKmnoY
// Source: https://sudokupad.app/rmac5anfcn

// Rules, in full:
//   Normal sudoku rules apply.
//   Each line is divided into segments at 'split points', to be discovered on
//   certain cell edges crossed by the line. Each segment along a line has the
//   same sum, but this sum can be different for different lines. Digits MAY
//   repeat along a segment, if allowed by sudoku. The digit in a green circle
//   indicates the number of split points on that line.
// There are no givens, and nothing is omitted below.
//
// The ten lines are drawn twice each, as a white outline under a lightsteelblue
// fill over the same cells; that is one line each, listed once here.
//
// A split point may sit between any two consecutive cells of a drawn path. Seven
// steps of these paths run corner to corner rather than edge to edge (R4C3-R5C4,
// R7C3-R6C4, R4C7-R5C8, R6C8-R5C7, R8C8-R7C7, R8C7-R9C6, R8C5-R9C4). The rules
// say only that the split points are "to be discovered", singling out no step of
// any line, so barring those seven would be a restriction the rules do not state.

// Drawn geometry: the ten line paths in drawn order, each with the cell holding
// its green circle. Together they cover all 81 cells exactly once.
const LINES = [
  { cells: ['R3C1', 'R2C1', 'R1C1'], circle: 'R1C1' },
  { cells: ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
    circle: 'R1C2' },
  { cells: ['R3C3', 'R4C3', 'R5C4', 'R5C5'], circle: 'R3C3' },
  { cells: ['R2C4', 'R3C4', 'R3C5', 'R2C5', 'R2C6', 'R3C6'], circle: 'R2C4' },
  { cells: ['R2C3', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R6C3', 'R5C3'],
    circle: 'R2C2' },
  { cells: ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2'],
    circle: 'R8C1' },
  { cells: ['R9C3', 'R8C3', 'R8C2', 'R7C2', 'R7C3', 'R6C4', 'R6C5'],
    circle: 'R8C2' },
  { cells: ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R5C8', 'R4C8', 'R4C9', 'R5C9',
            'R6C9', 'R6C8', 'R5C7', 'R5C6', 'R6C6', 'R6C7'], circle: 'R6C6' },
  { cells: ['R2C9', 'R3C9', 'R3C8', 'R2C8', 'R2C7', 'R3C7'], circle: 'R2C9' },
  { cells: ['R8C8', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7',
            'R8C7', 'R9C6', 'R9C5', 'R8C5', 'R9C4', 'R8C4', 'R7C4', 'R7C5',
            'R7C6', 'R8C6'], circle: 'R8C8' },
];

// One Var cell per step of a line carries that step's split flag.
const NO_SPLIT = 1;
const SPLIT = 2;
const VAR_PREFIXES = 'ABCDEFGHIJ';

// Sudoku bounds on a line's digit total. Cells sharing a row, a column or a box
// are all different, so each of those three groupings bounds the total (a group
// of n cells holds at least 1+..+n and at most 9+..+(10-n)); the tightest of the
// three is returned.
const totalBounds = (cells) => {
  const groupings = [
    (c) => parseCellId(c).row,
    (c) => parseCellId(c).col,
    (c) => 3 * Math.floor((parseCellId(c).row - 1) / 3)
      + Math.floor((parseCellId(c).col - 1) / 3),
  ];
  let min = cells.length;
  let max = 9 * cells.length;
  for (const key of groupings) {
    const sizes = new Map();
    for (const cell of cells) {
      sizes.set(key(cell), (sizes.get(key(cell)) || 0) + 1);
    }
    let low = 0;
    let high = 0;
    for (const n of sizes.values()) {
      for (let i = 1; i <= n; i++) {
        low += i;
        high += 10 - i;
      }
    }
    min = Math.max(min, low);
    max = Math.min(max, high);
  }
  return { min, max };
};

// The values the common segment sum of a line could take. The line's segments
// all sum to S and there are (circle digit + 1) of them, so S * segments equals
// the line total: segments runs 2..10 because a circle holds a digit 1-9, and no
// further than one per step of the path. Values of S with no (segments, total)
// pair behind them are impossible, and rejecting them on sight is what keeps the
// scan below inside the NFA state limit.
const candidateSums = (cells) => {
  const { min, max } = totalBounds(cells);
  const maxSegments = Math.min(10, cells.length);
  const sums = [];
  for (let s = 1; s * 2 <= max; s++) {
    for (let segments = 2; segments <= maxSegments; segments++) {
      if (s * segments >= min && s * segments <= max) {
        sums.push(s);
        break;
      }
    }
  }
  return sums;
};

// Equal segment sums, scanned over the line's cells with each step's split flag
// interleaved: cell, flag, cell, flag, ..., cell. The flag carries the segment
// boundary that a label-comparing scan would have to hold in state.
//   target: the common segment sum, 0 until the first split fixes it
//   run:    running total of the segment being read
//   atFlag: the next symbol is a split flag rather than a line cell
const equalSegmentSums = (cells, sums, name, scan) => {
  const maxTarget = sums[sums.length - 1];
  const allowed = new Set(sums);
  const spec = NFA.encodeSpec({
    startState: { target: 0, run: 0, atFlag: false },
    transition: ({ target, run, atFlag }, value) => {
      if (!atFlag) {
        const next = run + value;
        // No segment can exceed the common sum, and the common sum is at most
        // maxTarget, so both overruns are dead branches.
        if (next > maxTarget) return undefined;
        if (target > 0 && next > target) return undefined;
        return { target, run: next, atFlag: true };
      }
      if (value === NO_SPLIT) return { target, run, atFlag: false };
      if (value !== SPLIT) return undefined;
      // A split ends a segment: the first one fixes the common sum, the rest
      // must match it.
      if (target === 0) {
        return allowed.has(run) ? { target: run, run: 0, atFlag: false } : undefined;
      }
      return run === target ? { target, run: 0, atFlag: false } : undefined;
    },
    // Circle digits are 1-9, so every line splits at least once and target is
    // fixed by the end of the scan; the final segment must match it too.
    accept: ({ target, run }) => target > 0 && run === target,
    maxDepth: scan.length,
  }, 9);
  return new NFA(spec, name, ...scan);
};

const lines = LINES.map((line, i) => {
  const steps = line.cells.length - 1;
  const flagVars = new Var(VAR_PREFIXES[i], `line ${i + 1} split flags`, steps);
  const flags = flagVars.cells();
  const scan = line.cells.flatMap((cell, j) => j ? [flags[j - 1], cell] : [cell]);
  return {
    flagVars,
    // A flag is SPLIT where the line is split at that step, NO_SPLIT where not.
    flagDomains: flags.map((flag) => new Given(flag, NO_SPLIT, SPLIT)),
    // sum(flags) - circle digit = number of steps, so the number of flags set to
    // SPLIT (= NO_SPLIT + 1) is exactly the circle digit.
    splitCount: new Sum(steps, ...flags, [line.circle, -1]),
    equalSums: equalSegmentSums(
      line.cells, candidateSums(line.cells),
      `line ${i + 1} equal segment sums`, scan),
  };
});

return [
  new Shape('9x9'),
  ...lines.map((line) => line.flagVars),
  ...lines.flatMap((line) => line.flagDomains),
  ...lines.map((line) => line.splitCount),
  ...lines.map((line) => line.equalSums),
];
