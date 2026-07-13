// Title: Uniqueness, with a Nudge
// Author: R. Mullinix
// Video: https://www.youtube.com/watch?v=pGrD3QJBpKU
// Source: https://sudokupad.app/j5947yd09n

// Normal Sudoku Rules: digits 1-9 once per row/column/box. The main-grid
// cells carry the written digit and get the default row/column/box groups;
// Given(cell,1..9) restricts every main-grid cell back to the true digit
// range after Shape is widened to 10 values for the "value" overlay below.
//
// Nudge cells: exactly one cell per row/column/box is a "nudge" cell; every
// other cell is "natural". A VF flag overlay (1 = natural, 2 = nudge) marks
// this per cell. A cell's effective value (VV overlay) is its written digit
// plus (flag - 1): the written digit itself when natural, one more when
// nudge (a written 9 nudges to value 10, hence the widened range). The nine
// nudge cells hold nine different written digits: enforced globally below
// (for each digit, at most one nudge cell may hold it; combined with
// exactly one nudge cell per row/column/box this forces all nine digits to
// occur, i.e. a bijection).
//
// German Whisker lines, white/black dots, and the two drawn cages compare
// the effective VALUE (post-nudge), not the written digit, per "The value of
// a nudge cell equals the digit in the cell plus 1." Each of those clue
// types also forbids a repeated value across ALL of its own instances (the
// "for all clue types below: no value may appear more than once on each
// clue type" rule) -- modelled as one AllDifferent over the union of cells
// touched by that clue type, which implies both the within-instance and
// cross-instance restrictions at once. The Blue Diagonal similarly forbids
// a repeated value along the whole diagonal.

const graph = cellGraph('9x9');
const flag = graph.makeOverlay('VF');
const value = graph.makeOverlay('VV');
const flagAt = cell => flag.at(cell);
const valueAt = cell => value.at(cell);
const allCells = graph.cells();

const MAXV = 10; // 9 (written digit) plus at most 1 (nudge)

function unionValueCells(groups) {
  return Array.from(new Set(groups.flat())).map(valueAt);
}

// Restrict the main grid back to true Sudoku digits (Shape widened the value
// range to 10 so the effective-value overlay can hold a nudged 9 -> 10).
const firstCell = allCells[0];
const gridConstraint = new Replicate([new Given(firstCell, 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  Replicate.encodeTargetCells(allCells, firstCell, graph), firstCell);

// Restrict the flag overlay to {1 = natural, 2 = nudge}.
const firstFlag = flag.cells()[0];
const flagConstraint = new Replicate([new Given(firstFlag, 1, 2)],
  Replicate.encodeTargetCells(flag.cells(), firstFlag, flag), firstFlag);

// Link written digit + flag to the effective value: value = digit + flag - 1,
// i.e. value - digit - flag = -1.
const valueConstraints = allCells.map(cell =>
  new Sum(-1, valueAt(cell), [cell, -1], [flagAt(cell), -1]));

// Exactly one nudge cell (flag = 2) per row/column/box: with flags in {1,2}
// over 9 cells, a house-sum of 10 means exactly one 2 and eight 1s.
const houseConstraints = [...graph.rows(), ...graph.columns(), ...graph.boxes()].map(house =>
  new Sum('10', ...house.map(flagAt)));

// The nine nudge cells hold nine different written digits. For each digit v,
// scan every (digit, flag) pair in the grid and reject a second nudge cell
// holding v. Combined with "exactly nine nudge cells" above and only nine
// possible digits, "at most one each" forces all nine digits to occur.
const interleaved = allCells.flatMap(cell => [cell, flagAt(cell)]);
const nudgeConstraints = Array.from({ length: 9 }, (_, i) => i + 1).map(v => {
  const machine = NFA.encodeSpec({
    startState: { awaitFlag: false, isV: false, seenV: 0 },
    transition: (state, val) => {
      if (!state.awaitFlag) return { awaitFlag: true, isV: val === v, seenV: state.seenV };
      if (state.isV && val === 2) {
        const seenV = state.seenV + 1;
        if (seenV > 1) return undefined; // a second nudge cell holds digit v
        return { awaitFlag: false, isV: false, seenV };
      }
      return { awaitFlag: false, isV: false, seenV: state.seenV };
    },
    accept: () => true,
  }, MAXV);
  return new NFA(machine, `nudge-digit-${v}-unique`, ...interleaved);
});

// German Whisker lines: effective values along each line differ by >= 5, and
// no value repeats across the four lines combined.
const whiskerLines = [
  ['R5C3', 'R4C3', 'R3C2'],
  ['R5C7', 'R4C7', 'R3C8'],
  ['R7C4', 'R8C4'],
  ['R7C6', 'R8C6'],
];
const whiskers = whiskerLines.flatMap(line => [
  new Whisper(5, ...line.map(valueAt)),
]);

// White dots: consecutive effective values, no value repeats across all
// white-dot cells combined.
const whiteDots = [
  ['R4C6', 'R5C6'],
  ['R5C6', 'R5C7'],
  ['R5C3', 'R5C4'],
  ['R5C4', 'R5C5'],
];
const whiteDotConstraints = whiteDots.flatMap(([a, b]) => [
  new WhiteDot(valueAt(a), valueAt(b)),
]);

// Black dots: effective values in a 1:2 ratio, no value repeats across all
// black-dot cells combined.
const blackDots = [
  ['R2C4', 'R3C4'],
  ['R1C4', 'R2C4'],
  ['R4C6', 'R4C7'],
  ['R4C3', 'R4C4'],
];
const blackDotConstraints = blackDots.flatMap(([a, b]) => [
  new BlackDot(valueAt(a), valueAt(b)),
]);

// Cages: no effective value repeats inside a cage, and none repeats across
// the three cages combined (the third is a single-cell, no-total cage that
// still participates in the cross-cage restriction) -- a single AllDifferent
// over their union expresses both at once.
const cages = [
  ['R4C8', 'R4C9', 'R5C8', 'R6C8', 'R6C9'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R2C6'],
];

// Blue Diagonal: no effective value repeats along the main diagonal.
const diagonal = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];

return [
  new Shape('9x9', MAXV),
  flag.toVar('nudge flag'),
  value.toVar('effective value'),

  gridConstraint,

  flagConstraint,

  ...valueConstraints,

  ...houseConstraints,

  ...nudgeConstraints,

  // Givens (written digits).
  new Given('R7C1', 9), new Given('R7C7', 2),

  ...whiskers,
  new AllDifferent(...unionValueCells(whiskerLines)),

  ...whiteDotConstraints,
  new AllDifferent(...unionValueCells(whiteDots)),

  ...blackDotConstraints,
  new AllDifferent(...unionValueCells(blackDots)),

  new AllDifferent(...unionValueCells(cages)),

  new AllDifferent(...diagonal.map(valueAt)),
];
