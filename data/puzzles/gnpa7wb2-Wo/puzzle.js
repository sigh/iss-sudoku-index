// Title: Sieves, rabbits, triangles, squares, REM, et al
// Author: Botaku
// Video: https://www.youtube.com/watch?v=gnpa7wb2-Wo
// Source: https://app.crackingthecryptic.com/sudoku/pBQq2Tg9nd

// Meidjuluk (a genre invented by GlumHippo; this row is Botaku's puzzle in
// it). There is no Sudoku layer, so the grid is Raw: rows, columns and boxes
// carry no rule and digits repeat freely.
//
// Rules encoded (metadata.rules, quoted in full):
//  * "Divide the grid into N regions, one of each size 1 to N." The board has
//    121 cells, one of them black and excluded (below), leaving 120; since
//    1+2+...+15 = 120, N = 15 is forced by that arithmetic, not asserted.
//  * "Black cells are disregarded (ie do not form part of any region)." One
//    drawn black cell (underlay #0) is excluded from every region.
//  * "A region may not contain repeated numbers, and it may only contain
//    divisors of its size (e.g. a region of size 6 may contain any
//    combination of 1,2,3, and 6, including none of them)." A region's own
//    size can exceed 9 (up to 15), so only its divisors that are also
//    playable digits (<=9) are ever reachable; e.g. a size-11 or size-13
//    region can only ever hold the digit 1, sizes 10/12/14/15 gain a few more.
//  * The 5 printed region-size hints (overlays #0-4): a number floating at a
//    cell's centre, not a digit given -- it states the size of that cell's
//    own region (this reading, not "a digit given", is forced because 11-15
//    are not playable digits at all, so they cannot be candidate givens).
//  * The 22 given numbers.
//
// Since the region sizes are forced pairwise distinct (each of 1..15 used
// once), a region's size doubles as a label for it with no separate identity
// machinery needed: one widened overlay (values 1-15, plus a BLACK sentinel
// for the excluded cell) carries one ConnectedValues(L, L) per size L, which
// pins connectivity and size together.
//
// A region need not fill every one of its cells ("...including none of
// them"), and indeed cannot whenever its cell count exceeds its playable
// divisor count (a size-11 region has only the divisor 1 to offer its 11
// cells). The puzzle's submitted answer is the partition, not a digit fill:
// no digit is placed beyond the 22 givens, and every other cell is pinned
// blank on the main grid, so a freely-chosen *extra* digit cannot manufacture
// solutions that differ only in decoration nobody asked for, while leaving
// the partition itself exactly as constrained by the rules text above.

const SIDE = 11;
const N = 15;               // regions 1..N; N fixed by 1+...+15 = 120 above
const BLACK = N + 1;        // 16: sentinel region-label for the excluded cell
const BLANK = 10;           // sentinel "no digit" value on the main grid

const shape = new Shape(SIDE + 'x' + SIDE, BLACK, 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// ---- Geometry ----

// Row/col past 9 are base-17 ('a', 'b', ...) in a real cell id, not decimal
// -- makeCellId(row, col) below, never a hand-written 'R11C1', keeps this
// correct at 11x11.
const at = (row, col) => makeCellId(row, col);

// The drawn black cell, row 6 col 6 (1-indexed).
const BLACK_CELL = at(6, 6);

// The 22 given digits, (row, col, digit), 1-indexed.
const GIVENS = Object.fromEntries([
  [at(1, 1), 2], [at(1, 2), 3], [at(1, 3), 5], [at(1, 4), 7],
  [at(3, 1), 1], [at(3, 2), 1], [at(3, 3), 2], [at(3, 4), 3], [at(3, 5), 5], [at(3, 6), 8],
  [at(5, 1), 1],
  [at(6, 11), 1],
  [at(7, 1), 5], [at(7, 10), 3],
  [at(8, 9), 6],
  [at(9, 1), 2], [at(9, 8), 1], [at(9, 9), 4], [at(9, 10), 9],
  [at(10, 1), 7],
  [at(11, 6), 2], [at(11, 11), 3],
]);

// The 5 printed region-size hints: a number floating at a cell's centre, not
// a digit given (11-15 are not playable digits) -- each states the size of
// that cell's own region.
const SIZE_HINTS = Object.fromEntries([
  [at(1, 5), 11], [at(11, 1), 12], [at(1, 6), 13], [at(6, 7), 15], [at(7, 8), 10],
]);

// ---- Main grid: blank everywhere except the 22 givens ----

// Two Given constraints on one cell INTERSECT their value sets (last one does
// not simply win), so a cell must never receive both a generic stamp and an
// override whose values are disjoint from it (BLANK vs. a real digit would
// intersect to nothing). Excluding the 22 given cells from the stamp's own
// target list keeps every cell single-pinned instead. Replicate always
// shifts relative to the graph's OWN first cell (cells[0]), never the first
// element of a filtered target subset, so the template must reference
// cells[0] itself regardless of which cells the stamp actually targets.
const blankCells = cells.filter(cell => GIVENS[cell] === undefined);
const mainGrid = [
  graph.makeReplicate(new Given(cells[0], BLANK), blankCells),
  ...Object.entries(GIVENS).map(([cell, d]) => new Given(cell, d)),
];

// ---- Region-size label overlay ----

const label = graph.makeOverlay('VL');

// The generic 1..N stamp must skip only BLACK_CELL, whose {16} override is
// disjoint from 1..N (two Givens on one cell intersect, so a disjoint pair
// would zero it out). SIZE_HINTS and GIVENS overrides are themselves subsets
// of 1..N, so stamping over those cells too is safe -- the override then
// simply re-intersects to itself. Shifting is again within the overlay's own
// coordinate system (an overlay cell id like 'VL7' only shifts correctly
// through the overlay's own makeReplicate, relative to its own first cell,
// label.cells()[0] -- never the main grid's).
const genericLabelVarCells = label.at(cells.filter(cell => cell !== BLACK_CELL));
const labelDomain = [
  label.makeReplicate(new Given(label.cells()[0], ...range(1, N)), genericLabelVarCells),
  new Given(label.at(BLACK_CELL), BLACK),
  ...Object.entries(SIZE_HINTS).map(
    ([cell, size]) => new Given(label.at(cell), size)),
  ...Object.entries(GIVENS).map(([cell, d]) =>
    // Only sizes divisible by this given digit can host it.
    new Given(label.at(cell), ...range(1, N).filter(L => L % d === 0))),
];

// One region per size 1..N: connected, exactly that many cells, and (being
// pairwise distinct) doubling as the region's own label.
const partition = range(1, N).map(L => new ConnectedValues('VL', L, L));

// No repeated numbers within a region: two given cells sharing a digit value
// can never end up in the same (same-labelled) region, i.e. their labels are
// all-different. Blank cells can never collide with anything, so only
// given-vs-given groups need this.
const byDigit = new Map();
for (const [cell, d] of Object.entries(GIVENS)) {
  if (!byDigit.has(d)) byDigit.set(d, []);
  byDigit.get(d).push(cell);
}
const noRepeats = [...byDigit.values()]
  .filter(sameDigitCells => sameDigitCells.length > 1)
  .map(sameDigitCells => new AllDifferent(...label.at(sameDigitCells)));

return [
  shape,
  label.toVar('region size'),
  ...mainGrid,
  ...labelDomain,
  ...partition,
  ...noRepeats,
];
