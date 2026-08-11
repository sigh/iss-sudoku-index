// Title: Modern Romance
// Author: zetamath
// Video: https://www.youtube.com/watch?v=iz2SQfvCZt8
// Source: https://app.crackingthecryptic.com/sudoku/bbR78tRnfd

// Normal sudoku rules apply (regular 3x3 boxes, no givens).
//
// The digits 1-9 form a hidden partition into three couples (size 2) and one
// throuple (size 3). A heart drawn between two orthogonally adjacent cells
// means their digits are in the same relationship group; "ALL hearts are
// given" makes this exhaustive -- every adjacent pair whose digits share a
// group has a heart, every other adjacent pair does not. An outside clue
// gives the sum of the digits strictly between the two outermost throuple
// members that appear in that row/column (including a throuple member that
// falls between them), reading in from the clue's side.
//
// There is no native ISS class for "digits share a hidden group membership",
// so the partition is built from primitives -- a Var per cell holding a
// small code, tied together by scanning NFAs:
//   - G1..G9 (Var group 'G'): the relationship-group label (1-4) of digit d.
//     A canonical NFA forces "restricted growth string" order (group labels
//     are assigned in order of the smallest digit that starts them) so a
//     grid solution has exactly one G vector, not one per relabelling -- and
//     checks every group ends at size 2 or 3 (which, summing to 9, forces
//     exactly one size-3 group).
//   - T (Var group 'T'): which label (1-4) is the size-3 (throuple) group.
//   - GC1_1..GC9_9 (Var group 'C', one per grid cell): the relationship group
//     of the digit actually placed in that cell. Tied to the grid cell's
//     value and the G array by one small NFA per cell -- this is the "array
//     lookup by cell value" primitive, reused unchanged per cell.
// Heart / no-heart is then just SameValues / AllDifferent between two GC
// cells, and each outside clue is one more NFA scanning [T, GC,val, GC,val,
// ...] down the row/column, matching the rules' own worked example.

const shape = new Shape('9x9');

// --- Var groups -------------------------------------------------------
const gGroup = new Var('G', 'relationship group of digit d', 9);
// The per-cell group tag is built via a full-grid overlay (rather than a bare
// Var) so its 81 identical domain restrictions can be one Replicate instead
// of 81 individual Given copies.
const cOverlay = cellGraph('9x9').makeOverlay('VC');
const cGroup = cOverlay.toVar('relationship group of the digit in this cell');
const tGroup = new Var('T', 'which label is the throuple', 1);

const G = d => gGroup.cell(d);
const GC = (r, c) => cGroup.cell(r, c);
const T = tGroup.cell(1);

// All three Var groups use the grid's 1-9 range by default; restrict every
// cell to the 4 relationship-group labels.
const domainGivens = [
  ...Array.from({ length: 9 }, (_, i) => new Given(G(i + 1), 1, 2, 3, 4)),
  cOverlay.makeReplicate(new Given(cOverlay.cells()[0], 1, 2, 3, 4)),
  new Given(T, 1, 2, 3, 4),
];

// --- 1. Canonical partition + cardinality + throuple-label NFA --------
// Reads G1..G9 then T. State carries per-label counts (capped at 3, the max
// legal group size) while scanning the digits; a new label may only be
// introduced in increasing order (restricted-growth-string canonicalization
// -- this is what removes the "same partition, different labelling" clones
// from the solution count). After the 9th digit every count must be 2 or 3.
// The final read (T) must name the label whose count is exactly 3.
const groupPartitionSpec = NFA.encodeSpec({
  startState: { counts: [0, 0, 0, 0], readCount: 0 },
  transition: (state, value) => {
    if (state.readCount < 9) {
      if (value < 1 || value > 4) return undefined; // only 4 group labels exist
      const counts = state.counts.slice();
      const used = counts.filter(c => c > 0).length;
      if (value > used + 1) return undefined; // would skip an unused label
      if (counts[value - 1] >= 3) return undefined; // group already full
      counts[value - 1]++;
      const readCount = state.readCount + 1;
      if (readCount === 9 && counts.some(c => c !== 2 && c !== 3)) {
        return undefined; // a group ended at a size other than 2 or 3
      }
      return { counts, readCount };
    }
    // Reading T: must name the (unique) size-3 group.
    if (value < 1 || value > 4) return undefined;
    if (state.counts[value - 1] !== 3) return undefined;
    return { counts: state.counts, readCount: state.readCount, done: true };
  },
  accept: (state) => state.done === true,
}, 9);

const groupPartitionConstraint = new NFA(
  groupPartitionSpec, 'group-partition',
  Array.from({ length: 9 }, (_, i) => G(i + 1)).concat([T])
);

// --- 2. Per-cell group lookup: GC(r,c) = G[value(r,c)] -----------------
// One shared spec, reused per cell: read the grid cell's own value (d),
// then G1..G9 -- capturing the value read at position d -- then the cell's
// GC output, which must equal the captured value.
const cellLookupSpec = NFA.encodeSpec({
  startState: { d: null, pos: 0, captured: null },
  transition: (state, value) => {
    if (state.d === null) {
      return { d: value, pos: 0, captured: null }; // reading the grid cell
    }
    if (state.pos < 9) {
      if (value < 1 || value > 4) return undefined; // G-cells only hold group labels
      const pos = state.pos + 1;
      const captured = (pos === state.d) ? value : state.captured;
      return { d: state.d, pos, captured };
    }
    return value === state.captured ? { ...state, ok: true } : undefined;
  },
  accept: (state) => state.ok === true,
}, 9);

const cellLookups = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cells = [makeCellId(r, c), ...Array.from({ length: 9 }, (_, i) => G(i + 1)), GC(r, c)];
    cellLookups.push(new NFA(cellLookupSpec, `link-R${r}C${c}`, cells));
  }
}

// --- 3. Hearts: every orthogonally adjacent cell pair, "ALL hearts given" --
// Hearted pairs force the two cells' GC to match; every other adjacent pair
// forces them to differ. All 144 adjacent pairs in the 9x9 grid are
// enumerated (row-major cell of the pair listed first), and the 18 hearted
// ones are subtracted out as the drawn negative-space rule requires.
//
// Hearts, transcribed from the drawn overlay positions, one heart per
// listed pair:
const heartPairs = new Set([
  'R1C3,R1C4', 'R2C4,R2C5', 'R1C6,R2C6', 'R3C5,R3C6', 'R3C6,R4C6',
  'R4C1,R5C1', 'R4C3,R5C3', 'R4C4,R5C4', 'R7C3,R7C4', 'R6C5,R7C5',
  'R7C6,R7C7', 'R5C7,R6C7', 'R5C8,R6C8', 'R7C8,R7C9', 'R8C7,R8C8',
  'R1C8,R1C9', 'R2C8,R2C9', 'R3C8,R3C9',
]);

const adjacentPairs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    if (c < 9) adjacentPairs.push([[r, c], [r, c + 1]]);
    if (r < 9) adjacentPairs.push([[r, c], [r + 1, c]]);
  }
}

let heartsSeen = 0;
const relationshipLinks = adjacentPairs.map(([[r1, c1], [r2, c2]]) => {
  const key = `${makeCellId(r1, c1)},${makeCellId(r2, c2)}`;
  const hearted = heartPairs.has(key);
  if (hearted) heartsSeen++;
  return hearted
    ? new SameValues(2, GC(r1, c1), GC(r2, c2))
    : new AllDifferent(GC(r1, c1), GC(r2, c2));
});
if (heartsSeen !== heartPairs.size) {
  throw new Error(`heart transcription mismatch: matched ${heartsSeen} of ${heartPairs.size}`);
}

// --- 4. Outside clues: sum strictly between the outer throuple members -----
// Scans [T, GC_1,val_1, ..., GC_9,val_9] down the row/column from the clue's
// side. throupleCount tracks how many of the 3 throuple-group cells have
// been seen; the 1st (nearest) and 3rd (farthest) are boundary members and
// their own values are excluded, everything strictly between them --
// including the middle throuple member -- is summed. Matches the rules'
// worked example (throuple 1,2,3; row 4 6 1 9 3 5 2 8 7 -> clue 17).
function buildBetweenSpec(targetSum) {
  return NFA.encodeSpec({
    startState: { haveT: false, T: 0, pendingGC: null, throupleCount: 0, sum: 0 },
    transition: (state, value) => {
      if (!state.haveT) {
        if (value < 1 || value > 4) return undefined; // T is a group label
        return { haveT: true, T: value, pendingGC: null, throupleCount: 0, sum: 0 };
      }
      if (state.pendingGC === null) {
        if (value < 1 || value > 4) return undefined; // GC cells only hold group labels
        return { ...state, pendingGC: value }; // just read a GC cell
      }
      // Just read the paired grid value; pendingGC tells us if it's a
      // throuple-group cell.
      const isThrouple = state.pendingGC === state.T;
      let { throupleCount, sum } = state;
      if (isThrouple) {
        throupleCount++;
        if (throupleCount > 3) return undefined; // more than 3 throuple hits: dead branch
        if (throupleCount === 2) sum = Math.min(sum + value, targetSum + 1); // middle member
        // throupleCount === 1 or 3: boundary member, its own value excluded
      } else if (throupleCount >= 1 && throupleCount < 3) {
        sum = Math.min(sum + value, targetSum + 1);
      }
      return { haveT: true, T: state.T, pendingGC: null, throupleCount, sum };
    },
    accept: (state) => state.throupleCount === 3 && state.sum === targetSum,
  }, 9);
}

function rowCells(r) {
  const out = [T];
  for (let c = 1; c <= 9; c++) out.push(GC(r, c), makeCellId(r, c));
  return out;
}
function colCells(c) {
  const out = [T];
  for (let r = 1; r <= 9; r++) out.push(GC(r, c), makeCellId(r, c));
  return out;
}

// Outside clues transcribed from the drawn overlay positions (left/top lane, value).
const outsideClues = [
  { name: 'left-R1', cells: rowCells(1), total: 9 },
  { name: 'left-R8', cells: rowCells(8), total: 14 },
  { name: 'left-R9', cells: rowCells(9), total: 21 },
  { name: 'top-C3', cells: colCells(3), total: 20 },
  { name: 'top-C4', cells: colCells(4), total: 18 },
  { name: 'top-C8', cells: colCells(8), total: 17 },
  { name: 'top-C9', cells: colCells(9), total: 33 },
].map(({ name, cells, total }) => new NFA(buildBetweenSpec(total), name, cells));

return [
  shape,
  gGroup, cGroup, tGroup,
  ...domainGivens,
  groupPartitionConstraint,
  ...cellLookups,
  ...relationshipLinks,
  ...outsideClues,
];
