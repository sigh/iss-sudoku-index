// Title: Kakuro Variant
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=QBihIeXcL6I
// Source: https://cracking-the-cryptic.web.app/sudoku/d2pd4JrtgL

// Kakuro variant. Each playable cell holds a digit 1-9. There is no whole-grid
// Sudoku rule: rows and columns are not all-different, only entries are, so
// this uses the Raw grid type.
//
// The source is a 10x10 canvas whose top row and left column are a solid
// black border holding printed clue totals only; the playing field is the
// inner 9x9, used here directly (source R2C2 is this script's R1C1, etc.).
// BLOCKED cells within that 9x9 hold no digit. Shape widens to 10 values so
// a spare "blank" marker (10) exists to pin them; playable cells are
// restricted back to 1-9.
//
// PRIMARY: each printed across/down clue box sums its run to the printed
// total with no repeats -- Cage(total, ...cells), exactly as in basic
// Kakuro. Cells and totals are read from the payload's overlay text and its
// position within the clue-box cell (top-right corner = across, bottom-left
// corner = down).
//
// SHADED (the variant rule): some cells are shaded. A shaded cell's own
// digit is *also* the total for the run of subsequent cells in one or both
// directions, up to the next shaded cell, black cell, or edge -- modeled as
// Arrow(shadedCell, ...runCells) ("this cell equals the sum of those cells")
// plus an explicit AllDifferent over runCells of length > 1 (Arrow alone
// does not enforce distinctness, and a shaded-anchored run is not always a
// subset of any PRIMARY cage, so distinctness cannot be assumed from one).
// A direction with zero subsequent cells before the next black/shaded cell
// or the edge carries no clue and is omitted (SHADED_SINGLE/SHADED_DUAL
// below only list directions that have at least one cell).
//
// Six shaded cells have candidate runs in BOTH directions. The rules leave
// it "up to the solver to determine if the shaded cell digit is an across or
// a down clue, and it could be both" -- i.e. at least one reading holds,
// possibly both, and which is for the solve to determine, not the decode.
// Testing each candidate reading against the PRIMARY cages (never against a
// solution -- none is stored) settles five of the six outright:
//  - R1C4, R2C6, R5C6 each have a reading whose run is the *rest* of a
//    PRIMARY cage the shaded cell itself belongs to. Requiring the shaded
//    digit to equal that remainder's sum while the same cage's distinctness
//    requires it to differ from every one of those cells is a direct
//    contradiction (sharpest for R1C4: its only two-cell down cage with
//    R2C4 sums to 16, reachable only as {7, 9}, so "R1C4 equals R2C4" and
//    "R1C4 differs from R2C4" can't both hold). That reading is refuted, so
//    the other reading is the sole candidate -- forced, not chosen.
//  - R2C1's across reading requires R2C1 (<= 9) to equal R2C2 + R2C3 + R2C4,
//    but those three cells carry independent PRIMARY down-cage constraints
//    (R2C4 in particular is pinned to {7, 9} by its own two-cell cage) whose
//    combined minimum already exceeds 9. Refuted the same way; down is the
//    sole candidate.
//  - R4C4's two readings were checked together, not just separately, and
//    both readings hold simultaneously without contradiction -- an actual
//    instance of "it could be both", so both are encoded unconditionally.
// R7C4 is the only one where each reading is individually consistent with
// the rest of the puzzle but the two together are not (both readings force
// values that the PRIMARY down-34 cage R7C4 belongs to cannot support at
// once) -- a genuine "exactly one, and it's for the solve to find" case, so
// it alone is modeled as Or(acrossReading, downReading).

const shape = new Shape('9x9', 10, 'Raw');
const graph = cellGraph(shape);

// Blocked (non-playable) cells of the inner 9x9, derived from the payload's
// black-square underlays (shifted -1 row/-1 col to drop the border row/column).
const BLOCKED = [
  'R1C8', 'R1C9', 'R2C5', 'R3C3', 'R3C4', 'R4C7', 'R4C8', 'R5C5', 'R6C2', 'R6C3', 'R7C6', 'R7C7', 'R8C5', 'R9C1', 'R9C2'
];
const blockedSet = new Set(BLOCKED);
const playable = graph.cells().filter(c => !blockedSet.has(c));

// Printed clue-box entries: [total, cells], reading the run from the payload's
// diagonal-split clue boxes (top-right corner = across, bottom-left = down),
// per the provenance note above.
const PRIMARY = [
  [12, ['R2C6', 'R2C7', 'R2C8', 'R2C9']],  // across
  [16, ['R3C1', 'R3C2']],  // across
  [17, ['R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9']],  // across
  [12, ['R5C6', 'R5C7', 'R5C8', 'R5C9']],  // across
  [18, ['R8C1', 'R8C2', 'R8C3', 'R8C4']],  // across
  [12, ['R8C6', 'R8C7', 'R8C8', 'R8C9']],  // across
  [35, ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9']],  // across
  [32, ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2']],  // down
  [9, ['R1C3', 'R2C3']],  // down
  [16, ['R1C4', 'R2C4']],  // down
  [26, ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6']],  // down
  [6, ['R2C8', 'R3C8']],  // down
  [36, ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9']],  // down
  [11, ['R3C5', 'R4C5']],  // down
  [8, ['R4C3', 'R5C3']],  // down
  [34, ['R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4']],  // down
  [6, ['R5C7', 'R6C7']],  // down
  [19, ['R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8']],  // down
  [5, ['R6C5', 'R7C5']],  // down
  [8, ['R7C2', 'R8C2']],  // down
  [23, ['R7C3', 'R8C3', 'R9C3']],  // down
];

// Shaded cells with exactly one live candidate direction: [shadedCell,
// direction, runCells]. Unconditional. Nine of these had only one
// geometrically available direction to begin with; four more (R1C4, R2C1,
// R2C6, R5C6) started with two candidates but had one refuted by the
// same-cage arithmetic described above, leaving one forced reading.
const SHADED_SINGLE = [
  ['R1C1', 'across', ['R1C2', 'R1C3']],
  ['R1C4', 'across', ['R1C5', 'R1C6', 'R1C7']],  // down refuted
  ['R2C1', 'down', ['R3C1', 'R4C1']],  // across refuted
  ['R2C6', 'down', ['R3C6', 'R4C6']],  // across refuted
  ['R3C9', 'down', ['R4C9', 'R5C9', 'R6C9']],
  ['R5C1', 'down', ['R6C1', 'R7C1']],
  ['R5C2', 'across', ['R5C3', 'R5C4']],
  ['R5C6', 'across', ['R5C7', 'R5C8', 'R5C9']],  // down refuted
  ['R6C7', 'across', ['R6C8', 'R6C9']],
  ['R7C9', 'down', ['R8C9', 'R9C9']],
  ['R8C1', 'across', ['R8C2', 'R8C3', 'R8C4']],
  ['R8C6', 'across', ['R8C7', 'R8C8', 'R8C9']],
  ['R9C6', 'across', ['R9C7', 'R9C8', 'R9C9']],
];

// R4C4: both directions checked jointly and both hold without contradiction
// -- encoded unconditionally, both at once.
const SHADED_BOTH = [
  ['R4C4', ['R4C5', 'R4C6'], ['R5C4', 'R6C4']],
];

// R7C4: the one cell where each direction is individually consistent but
// the two are mutually exclusive together -- see the SHADED provenance note.
const SHADED_EITHER = [
  ['R7C4', ['R7C5'], ['R8C4', 'R9C4']],
];

const primaryCages = PRIMARY.map(([total, cells]) => new Cage(total, ...cells));

function reading(shaded, cells) {
  const arrow = new Arrow(shaded, ...cells);
  return cells.length > 1 ? new And([arrow, new AllDifferent(...cells)]) : arrow;
}

const singleReadings = SHADED_SINGLE.map(
  ([shaded, , cells]) => reading(shaded, cells));
const bothReadings = SHADED_BOTH.flatMap(
  ([shaded, acrossCells, downCells]) => [
    reading(shaded, acrossCells),
    reading(shaded, downCells),
  ]);
const eitherReadings = SHADED_EITHER.map(
  ([shaded, acrossCells, downCells]) => new Or([
    reading(shaded, acrossCells),
    reading(shaded, downCells),
  ]));

// Domain stamping: playable cells restricted to 1-9, blocked cells pinned to
// the spare blank marker 10, each as one Replicate over its group so the
// widened range never leaks into a real digit.
const playableDomain = new Replicate(
  [new Given(playable[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  Replicate.encodeTargetCells(playable, playable[0], graph),
  playable[0],
);
const blockedDomain = new Replicate(
  [new Given(BLOCKED[0], 10)],
  Replicate.encodeTargetCells(BLOCKED, BLOCKED[0], graph),
  BLOCKED[0],
);

return [
  shape, playableDomain, blockedDomain,
  ...primaryCages, ...singleReadings, ...bothReadings, ...eitherReadings,
];
