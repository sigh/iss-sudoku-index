// Title: Manhattan Sudoku
// Author: Madhav Sankaranarayanan
// Video: https://www.youtube.com/watch?v=ajvkwAqhGys
// Source: https://cracking-the-cryptic.web.app/sudoku/gpp2Jq3bRJ

// Normal Sudoku rules apply. Both main diagonals (R1C1-R9C9, R1C9-R9C1) hold
// 1-9 once each. R1C3 < R1C4 (drawn inequality glyph, apex in R1C3).
// R5C4/R6C4: one is double the other (drawn black dot).
//
// Taxicab rule: a cell qualifies for "red" if some other cell shares its
// digit at a taxicab (Manhattan) distance equal to that digit. Only the
// drawn red cells (below) may qualify; every other (white) cell must not.
// The relation is symmetric (if A qualifies via B, B equally qualifies via
// A), so "only red cells may have this property" is enforced as: for every
// pair of cells a taxicab distance d (1-9) apart, forbid both holding digit
// d unless both are red. Only that direction is enforced: the rules never
// require a red cell to actually have a qualifying partner, only forbid a
// white one from having one.
//
// Digit-subset rule: of 1-9, only a subset summing to less than 15 may
// appear across the 11 red cells (repeats don't add to the sum twice).
// Encoded as a disjunction over every *maximal* subset of {1..9} summing to
// under 15 (enumerated below by brute force over all 511 nonempty subsets):
// each branch restricts every red cell's domain to that subset. A
// non-maximal valid subset is dominated by (implied by) a maximal
// superset -- restricting to the bigger set is always at least as
// permissive -- so only maximal subsets are needed for a complete
// disjunction.

const graph = cellGraph('9x9');

// Red cells -- drawn as solid red 1x1 filled squares.
const RED_CELLS = [
  'R1C5', 'R1C8', 'R2C2', 'R3C1', 'R3C6', 'R4C9',
  'R5C1', 'R6C5', 'R7C3', 'R8C4', 'R9C7',
];
const isRed = cell => RED_CELLS.includes(cell);

// One shared truth-table key per distance 1-9: forbid both cells reading
// exactly that distance's value.
const taxicabKeys = {};
for (let d = 1; d <= 9; d++) {
  taxicabKeys[d] = Pair.fnToKey((a, b) => !(a === d && b === d), 9);
}

const inGrid = (r, c) => r >= 1 && r <= 9 && c >= 1 && c <= 9;

// Every relative offset (dr, dc) with |dr| + |dc| = d, canonicalized to
// dr >= 0 (and dc > 0 when dr === 0) so each unordered cell-pair shift is
// generated exactly once.
function offsetsForDistance(d) {
  const offsets = [];
  for (let dr = 0; dr <= d; dr++) {
    const dc = d - dr;
    if (dr === 0) offsets.push([0, dc]);
    else if (dr === d) offsets.push([dr, 0]);
    else { offsets.push([dr, dc]); offsets.push([dr, -dc]); }
  }
  return offsets;
}

// lint_constraints.js flags 50+ raw copies of one Pair template as a missed
// Replicate; match that threshold so every eligible template (d = 1, 2, 3,
// where the grid is large relative to the offset) is actually Replicated
// and the rest -- too few instances, or thinned by the red/red exemption --
// stay as plain Pairs.
const REPLICATE_THRESHOLD = 50;

const taxicabConstraints = [];
for (let d = 1; d <= 9; d++) {
  for (const [dr, dc] of offsetsForDistance(d)) {
    const targets = [];
    for (let r = 1; r <= 9; r++) {
      for (let c = 1; c <= 9; c++) {
        const r2 = r + dr, c2 = c + dc;
        if (!inGrid(r2, c2)) continue;
        const a = makeCellId(r, c), b = makeCellId(r2, c2);
        if (isRed(a) && isRed(b)) continue; // red/red is exempt -- see above
        targets.push(a);
      }
    }
    if (targets.length === 0) continue;

    if (targets.length >= REPLICATE_THRESHOLD) {
      const origin = targets[0];
      const { row, col } = parseCellId(origin);
      const originPartner = makeCellId(row + dr, col + dc);
      taxicabConstraints.push(new Replicate(
        [new Pair(taxicabKeys[d], `taxicab${d}`, origin, originPartner)],
        Replicate.encodeTargetCells(targets, origin, graph),
        origin,
      ));
    } else {
      for (const a of targets) {
        const { row, col } = parseCellId(a);
        const b = makeCellId(row + dr, col + dc);
        taxicabConstraints.push(new Pair(taxicabKeys[d], `taxicab${d}`, a, b));
      }
    }
  }
}

// Every nonempty subset of {1..9} summing to under 15, then keep only the
// maximal ones (no valid superset among the candidates).
const subsetCandidates = [];
for (let mask = 1; mask < 512; mask++) {
  let sum = 0;
  const values = [];
  for (let v = 1; v <= 9; v++) {
    if (mask & (1 << (v - 1))) { values.push(v); sum += v; }
  }
  if (sum < 15) subsetCandidates.push({ mask, values });
}
const maximalSubsets = subsetCandidates
  .filter(({ mask }) => !subsetCandidates.some(
    other => other.mask !== mask && (mask & other.mask) === mask))
  .map(({ values }) => values);

const redDigitSubset = new Or(maximalSubsets.map(subset =>
  new And(RED_CELLS.map(cell => new Given(cell, ...subset)))
));

return [
  new Shape('9x9'),

  // Givens (drawn cell values).
  new Given('R1C2', 4),
  new Given('R2C1', 2),
  new Given('R6C9', 1),
  new Given('R8C8', 5),
  new Given('R9C3', 8),

  new Diagonal(-1), // main diagonal, R1C1-R9C9 ('\')
  new Diagonal(1),  // anti diagonal, R1C9-R9C1 ('/')

  new GreaterThan('R1C4', 'R1C3'),
  new BlackDot('R5C4', 'R6C4'),

  ...taxicabConstraints,
  redDigitSubset,
];
