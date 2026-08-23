// Title: Japanese Sums with Arrows
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=3BKeNnbigh4
// Source: https://app.crackingthecryptic.com/sudoku/B2nt9qTFp9

// Standard 9x9 sudoku (rows/cols/3x3 boxes) on the playable grid.
//
// Arrows: numbers along an arrow sum to the number in its circle. Every one
// of the 13 arrows is drawn on the 13x13 canvas; the 9x9 sudoku box regions
// occupy its rows/cols 5-13, leaving a 4-cell band above and to the left.
// Two arrows (bulb R8C4, R4C8 in playable-grid coordinates) run entirely
// inside the grid and are encoded with `Arrow`. The rest travel out of the
// grid into the band, or start and stay in it: their non-bulb cells and,
// where the bulb itself sits in the band, the bulb too, are outside-clue
// values rather than sudoku digits (see below), so those are encoded with
// coefficient `Sum`.
//
// Outside Japanese sums: shade cells in the grid so the clues outside the
// grid, in order, equal the sums of the digits in each row/column's
// contiguous shaded blocks (blocks separated by >=1 unshaded cell). The
// number of clues for a row/column equals its count of white (non-grey)
// cells in the band -- read from the payload's grey `underlay` rectangles,
// which mark every band cell that is NOT a clue position. Clue order here is
// nearest-to-farthest from the grid = first-to-last shaded block reading into
// the grid from that edge. That is this encoding's reading, not a settled
// convention: the genre reads the band as printed, which for a left or top
// band is farthest-from-grid first.
//
// No printed value exists anywhere in the payload for any arrow circle or
// outside clue (every circle overlay has `text: ""`; there is no other
// numeric field for the outside band). Rule 5 states outside numbers "can be
// greater than 9 (including in an arrow's circle)" and "can repeat" -- i.e.
// it states a property a value satisfies, not that a value was printed and
// lost. Every outside-clue position and arrow relationship is still pinned
// by the interlocking rules themselves (arrows tie band values to grid
// digits and to each other; see the per-arrow comments below), so each is
// modelled as an unknown aux variable rather than treated as a missing
// given. A clue's value is a shaded run of up to 9 sudoku digits, so its true
// range is 1-45, which exceeds ISS's 16-value alphabet cap: each is
// represented as two base-16 digits (hi, lo), value = 16*hi + lo, tied to
// its role (block sum, and/or arrow term) by a coefficient `Sum`.

const shape = new Shape('9x9', '0-15'); // 16-value alphabet for the hi/lo clue digits
const graph = cellGraph('9x9');
const gridCells = graph.cells();
const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// --- Outside clue slots ----------------------------------------------------
// One entry per playable row/column (local 1-9); slot count = number of
// white band cells for that line, nearest-to-farthest from the grid.
// Transcribed from `underlays` (marks every non-clue band cell) against the
// full outside band (13x13 canvas rows/cols 1-4 and 4-cell left/top strips).
// Local row/col 5 (the grid's own middle row/column) has zero white band
// cells -- entirely grey -- so it carries no outside clues at all.
const ROW_SLOTS = { 1: 3, 2: 3, 3: 3, 4: 4, 6: 4, 7: 3, 8: 2, 9: 2 };
const COL_SLOTS = { 1: 3, 2: 3, 3: 3, 4: 4, 6: 4, 7: 3, 8: 2, 9: 2 };

const totalSlots = Object.values(ROW_SLOTS).reduce((a, b) => a + b, 0)
  + Object.values(COL_SLOTS).reduce((a, b) => a + b, 0);

const clueHi = new Var('JH', 'outside clue value (hi base-16 digit)', totalSlots);
const clueLo = new Var('JL', 'outside clue value (lo base-16 digit)', totalSlots);

let nextSlot = 1;
function makeSlots(n) {
  const slots = [];
  for (let i = 0; i < n; i++) {
    const idx = nextSlot++;
    slots.push({ hi: clueHi.cell(idx), lo: clueLo.cell(idx) });
  }
  return slots;
}
const rowSlot = {}, colSlot = {};
for (const n of Object.keys(ROW_SLOTS).map(Number)) rowSlot[n] = makeSlots(ROW_SLOTS[n]);
for (const n of Object.keys(COL_SLOTS).map(Number)) colSlot[n] = makeSlots(COL_SLOTS[n]);

// A composite (hi, lo) value contributed positively/negatively to a Sum.
const plus = (slot) => [[slot.hi, 16], [slot.lo, 1]];
const minus = (slot) => [[slot.hi, -16], [slot.lo, -1]];

// --- Rule 3: outside Japanese sums ------------------------------------------
// Every (start,end) 0-indexed placement of exactly k contiguous runs (each
// length >= 1) over an n-cell line, with >= 1 unshaded cell between
// consecutive runs; slack before the first or after the last run is allowed.
function runPlacements(k, n) {
  const results = [];
  function rec(remaining, pos, segs) {
    if (remaining === 0) { results.push(segs.slice()); return; }
    const start = pos + 1 + (segs.length > 0 ? 1 : 0);
    const maxStart = n - (remaining + (remaining - 1));
    for (let s = start; s <= maxStart; s++) {
      const maxLen = n - s - (remaining - 1) * 2;
      for (let len = 1; len <= maxLen; len++) {
        const e = s + len - 1;
        segs.push([s, e]);
        rec(remaining - 1, e, segs);
        segs.pop();
      }
    }
  }
  rec(k, -1, []);
  return results;
}

// Shading is otherwise unconstrained bookkeeping (no other rule reads it), so
// it needs no explicit flag Var: enumerating every run-count-matching
// placement and tying each run's digit sum to its slot's value is enough.
function japaneseSumLine(cells, slots) {
  const placements = runPlacements(slots.length, cells.length);
  const options = placements.map((segs) => new And(segs.map(([s, e], i) => {
    const { hi, lo } = slots[i];
    return new Sum(0, ...cells.slice(s, e + 1), [hi, -16], [lo, -1]);
  })));
  return new Or(options);
}

const japaneseSums = [
  ...Object.keys(ROW_SLOTS).map(Number).map((n) => japaneseSumLine(graph.row(n), rowSlot[n])),
  ...Object.keys(COL_SLOTS).map(Number).map((n) => japaneseSumLine(graph.column(n), colSlot[n])),
];

// --- Rule 2: arrows ----------------------------------------------------------
// Two arrows run entirely inside the grid (ordinary Arrow sudoku):
const plainArrows = [
  new Arrow('R8C4', 'R8C5', 'R8C6'),
  new Arrow('R4C8', 'R5C8', 'R6C8'),
];

// The rest cross into, or lie entirely in, the outside band. Each is a
// coefficient Sum: bulb (minus) + arm terms (plus) = 0. A bulb/arm term is a
// bare grid cell id (an ordinary sudoku digit) or a slot's (hi, lo) pair (an
// outside clue value). Row/column and near/far positions are named by their
// slot index (0 = nearest the grid) per the ROW_SLOTS/COL_SLOTS tables above.
function arrowSum(bulbTerms, armTerms) {
  return new Sum(0,
    ...bulbTerms.flatMap((t) => (typeof t === 'string' ? [[t, -1]] : minus(t))),
    ...armTerms.flatMap((t) => (typeof t === 'string' ? [t] : plus(t))));
}

const bandArrows = [
  // Bulb R8C4 (shared with the plain arrow above): also sums row 7's
  // interior arm plus row 8's own two farthest outside clues.
  arrowSum(['R8C4'], ['R7C3', 'R7C2', 'R7C1', rowSlot[8][0], rowSlot[8][1]]),
  // Bulb row 9's farthest clue = its nearest clue + grid digit R9C1.
  arrowSum([rowSlot[9][1]], [rowSlot[9][0], 'R9C1']),
  // Bulb grid digit R6C1 = row 6's two nearest outside clues.
  arrowSum(['R6C1'], [rowSlot[6][0], rowSlot[6][1]]),
  // Bulb row 8's farthest clue = its two nearest-of-the-remaining clues.
  arrowSum([rowSlot[4][3]], [rowSlot[4][2], rowSlot[4][1]]),
  // Bulb row 2's nearest clue = the whole of row 3's clue set.
  arrowSum([rowSlot[2][0]], [rowSlot[3][0], rowSlot[3][1], rowSlot[3][2]]),
  // Bulb grid digit R1C1: sums row 1's whole clue set plus row 2's two
  // farthest clues (row 2's nearest clue is the separate arrow above).
  arrowSum(['R1C1'], [rowSlot[1][0], rowSlot[1][1], rowSlot[1][2], rowSlot[2][1], rowSlot[2][2]]),
  // Bulb grid digit R1C1 (shared): sums column 1's whole clue set plus
  // column 2's two farthest clues.
  arrowSum(['R1C1'], [colSlot[1][0], colSlot[1][1], colSlot[1][2], colSlot[2][1], colSlot[2][2]]),
  // Bulb column 2's nearest clue = column 3's two nearest clues.
  arrowSum([colSlot[2][0]], [colSlot[3][0], colSlot[3][1]]),
  // Bulb column 4's nearest clue = its two farthest-of-the-remaining clues.
  arrowSum([colSlot[4][0]], [colSlot[4][1], colSlot[4][2]]),
  // Bulb column 6's farthest clue = its two nearest-of-the-remaining clues.
  arrowSum([colSlot[6][3]], [colSlot[6][2], colSlot[6][1]]),
  // Bulb grid digit R4C8 (shared with the plain arrow above): also sums
  // column 7's interior arm plus column 8's own two farthest outside clues.
  arrowSum(['R4C8'], ['R3C7', 'R2C7', 'R1C7', colSlot[8][0], colSlot[8][1]]),
];

return [
  shape,
  digitDomain,
  clueHi,
  clueLo,
  ...japaneseSums,
  ...plainArrows,
  ...bandArrows,
];
