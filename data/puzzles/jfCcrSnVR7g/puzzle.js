// Title: Gurthy Clones
// Author: gdc
// Video: https://www.youtube.com/watch?v=jfCcrSnVR7g
// Source: https://sudokupad.app/1xjpfvl0y4

// Normal sudoku rules apply.
// Halvers: one halver cell lies in every row, column, and box; the nine
// halver cells hold each digit 1-9 exactly once. A halver's contribution to
// any sum below is half its digit rather than the digit itself.
// Region Sum Lines: a line's cells split into one group per box they occupy,
// and the (halver-scaled) sum must be the same in every group. Five drawn
// lines (R2C6-R2C7; R8C3-R8C4-R8C5; R1C4-R1C3-R1C2-R1C1; R8C9-R7C9-R6C9-
// R5C9-R5C8; R3C3-R3C4-R3C5-R3C6) cross a box border outright and split the
// ordinary way. Two more pairs of drawn line objects sit close together
// near a shared cell, but their own waypoint coordinates settle each pair
// differently:
// - R9C3-R8C2-R9C1 and R8C2-R7C2-R6C1-R5C1 share the exact waypoint R8C2 --
//   it is the first line's midpoint and the second line's endpoint, so
//   their union has a degree-3 branch at R8C2 (arms to R9C3, R9C1, and
//   R7C2) and is not reducible to a single ordered cell list. Splitting the
//   two lines independently by their own box crossings, or forcing the
//   union into one ordered path by dropping any single arm, is
//   arithmetically inconsistent with the puzzle's solution in every case.
//   The one reading whose segments can agree groups the union's cells by
//   box regardless of which stroke drew them: {R9C3,R8C2,R9C1,R7C2} (box6)
//   vs {R6C1,R5C1} (box3).
// - R4C6-R4C5-R4C4 and R5C6-R6C5-R6C4 do not share a waypoint: each line's
//   final waypoint is a distinct off-centre point inside R5C3, not a common
//   vertex, and each stays its own connected component. They are the only
//   2 of the puzzle's 9 region sum lines with an off-centre endpoint --
//   evidence that each line's path genuinely extends into R5C3 rather than
//   stopping short of it. Read as two ordinary, independent lines whose
//   path ends at R5C3, each splits at its own box crossing: {R4C6,R4C5,
//   R4C4} vs {R5C3}, and {R5C6,R6C5,R6C4} vs {R5C3} (box4 vs box3) -- the
//   puzzle's ordinary segmentation rule, no combined-mark reading needed.
// Rotating Clones: cages sharing a label hold identical digits in the same
// position relative to the label. Two cages ("Bob", "Charles") carry their
// label on a rotated text overlay rather than the cage's own value field;
// the drawn rotation, and the overlay landing on the cell each rotation
// maps the other cage's label-anchor cell to, fix the correspondence below.
// Every cage is also taken as all-different: SudokuPad's default rendering
// for a cage entry (dashed border) is a killer-style cage, and nothing in
// the rules or drawing overrides that for these cages.

const HALF = 1;
const FULL = 2;
const graph = cellGraph('9x9');
const halver = graph.makeOverlay('VH');
const halverOf = cell => halver.at(cell);
const cells = graph.cells();
const halverCells = halver.at(cells);
const valueStream = group => group.flatMap(cell => [halverOf(cell), cell]);

// Each digit 1-9 appears exactly once among the flagged (HALF) cells.
const halverDigits = NFA.encodeSpec({
  startState: { phase: 'flag', seen: 0 },
  transition: ({ phase, seen, flag }, value) => {
    if (phase === 'flag') return value === HALF || value === FULL
      ? { phase: 'digit', seen, flag: value } : undefined;
    if (flag !== HALF) return { phase: 'flag', seen };
    const bit = 1 << (value - 1);
    return (seen & bit) ? undefined : { phase: 'flag', seen: seen | bit };
  },
  accept: ({ phase, seen }) => phase === 'flag' && seen === 511,
}, 9);

// Segments of a region sum line must share one common (halver-scaled) sum;
// the first segment to finish fixes the target for every later segment.
const scaledRegionSumLine = segments => NFA.encodeSpec({
  startState: {
    phase: 'flag', seg: 0, remaining: segments[0].length, sum: 0, target: null,
  },
  transition: (state, value) => {
    // Dead-end once every segment is closed, so the compiler doesn't keep
    // exploring an unbounded tail of segment indices past the line's length.
    if (state.seg === segments.length) return undefined;
    if (state.phase === 'flag') {
      return value === HALF || value === FULL
        ? { ...state, phase: 'digit', flag: value }
        : undefined;
    }
    const sum = state.sum + (state.flag === HALF ? value : 2 * value);
    // Contributions are non-negative, so a partial sum already past the
    // target can never come back down -- prune it now instead of carrying
    // it (and the target) forward as extra unreachable state combinations.
    if (state.target !== null && sum > state.target) return undefined;
    const remaining = state.remaining - 1;
    if (remaining > 0) return { ...state, phase: 'flag', remaining, sum };
    if (state.target !== null && sum !== state.target) return undefined;
    const seg = state.seg + 1;
    return {
      phase: 'flag',
      seg,
      remaining: seg < segments.length ? segments[seg].length : 0,
      sum: 0,
      target: state.target === null ? sum : state.target,
    };
  },
  accept: ({ phase, seg }) => phase === 'flag' && seg === segments.length,
}, 9);

const regionSumLine = segments => new NFA(
  scaledRegionSumLine(segments), 'region-sum-line', ...valueStream(segments.flat()));

// Segments split at each box border (each drawn line's lightblue stroke).
// The R8C2 pair is the one exception: its two strokes branch at a shared
// midpoint (see header comment), so its segments group by box across both
// strokes instead of following either stroke's own path order.
const regionSumLines = [
  [['R2C6'], ['R2C7']],
  [['R8C3'], ['R8C4', 'R8C5']],
  [['R1C4'], ['R1C3', 'R1C2', 'R1C1']],
  [['R8C9', 'R7C9'], ['R6C9', 'R5C9', 'R5C8']],
  [['R3C3'], ['R3C4', 'R3C5', 'R3C6']],
  [['R9C3', 'R8C2', 'R9C1', 'R7C2'], ['R6C1', 'R5C1']],
  [['R4C6', 'R4C5', 'R4C4'], ['R5C3']],
  [['R5C6', 'R6C5', 'R6C4'], ['R5C3']],
];

// Cages (as drawn); Bob's and Charles's second cage is named by a rotated
// text overlay rather than the cage's own value field.
const cages = {
  alice: [['R7C4', 'R8C3', 'R8C4'], ['R1C7', 'R2C6', 'R2C7']],
  bob: [
    ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1'],
    ['R5C8', 'R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ],
  charles: [['R1C8', 'R2C8'], ['R4C2', 'R5C2']],
};

// Cell-by-cell correspondence under each label's drawn rotation: identity
// for Alice (both cages plainly labelled, same shape, no rotation drawn),
// 90deg clockwise for Bob, 180deg for Charles.
const clonePairs = [
  ['R7C4', 'R1C7'], ['R8C3', 'R2C6'], ['R8C4', 'R2C7'],
  ['R1C1', 'R5C9'], ['R1C2', 'R6C9'], ['R1C3', 'R7C9'],
  ['R1C4', 'R8C9'], ['R2C1', 'R5C8'],
  ['R1C8', 'R5C2'], ['R2C8', 'R4C2'],
];

return [
  new Shape('9x9'),
  new Given('R2C1', 1),

  // Halvers.
  halver.toVar('halver status'),
  halver.makeReplicate([new Given(halverCells[0], HALF, FULL)], halverCells),
  ...graph.rows().map(row => new Sum(17, ...halver.at(row))),
  ...graph.columns().map(col => new Sum(17, ...halver.at(col))),
  ...graph.boxes().map(box => new Sum(17, ...halver.at(box))),
  new NFA(halverDigits, 'halver-digits', ...valueStream(cells)),

  // Region sum lines.
  ...regionSumLines.map(regionSumLine),

  // Rotating clones.
  ...Object.values(cages).flat().map(cage => new AllDifferent(...cage)),
  ...clonePairs.map(([a, b]) => new SameValues(2, a, b)),
];
