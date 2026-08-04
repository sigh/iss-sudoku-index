// Title: Rule Breakers
// Author: AstralSky
// Video: https://www.youtube.com/watch?v=BrBwqpBIbLc
// Source: https://app.crackingthecryptic.com/sudoku/bmmJg2843p

// Normal sudoku rules apply (default row/column/box all-different).
//
// Cage rule: within each cage, shade every cell whose digit repeats
// elsewhere in the same cage ("duplicate"); a digit that occurs once in
// the cage stays unshaded. Unlike a killer cage, cages are NOT
// all-different -- the rule requires the opposite ("every cage must have
// duplicates"), so no AllDifferent/Cage class is used over cage cells.
// The unshaded cells' digits sum to the cage's printed total. Shaded
// cells cannot be orthogonally adjacent anywhere in the grid. All
// unshaded cells -- cage and non-cage alike -- form one orthogonally
// connected area. "Cages never overlap" describes the drawn geometry
// (true of the cell lists below) and adds no separate constraint.

const UNSHADED = 1;
const SHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Cage cells and totals transcribed from the drawn cage outlines/totals.
const cages = [
  { total: 44, cells: ['R7C1', 'R8C1', 'R8C7', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'] },
  { total: 32, cells: ['R5C2', 'R5C3', 'R5C4', 'R6C1', 'R6C2', 'R7C2', 'R8C2'] },
  { total: 20, cells: ['R3C1', 'R3C2', 'R3C3', 'R4C3', 'R4C4'] },
  { total: 5, cells: ['R2C3', 'R2C4', 'R3C4'] },
  { total: 4, cells: ['R7C4', 'R7C5', 'R8C3', 'R8C4'] },
  { total: 44, cells: ['R4C5', 'R5C5', 'R5C8', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R7C3'] },
  { total: 18, cells: ['R3C7', 'R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9'] },
  { total: 20, cells: ['R7C6', 'R7C7', 'R7C8', 'R7C9', 'R8C5', 'R8C6', 'R8C8', 'R8C9', 'R9C8'] },
  { total: 21, cells: ['R1C4', 'R1C5', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C6'] },
];
const cageCellSet = new Set(cages.flatMap(c => c.cells));

// Every cell's shade Var may hold either value (Given(cell, 1, 2), stamped
// via Replicate over the whole grid: shade.cells()[0] is the Replicate
// origin, VS1, paired with R1C1). Cells outside any cage are then narrowed
// to always UNSHADED -- shading only exists where the rule defines it
// (inside a cage).
const shadeOrigin = shade.cells()[0];
const shadeDomain = shade.makeReplicate(new Given(shadeOrigin, UNSHADED, SHADED));
const nonCageShadeDomain = graph.cells()
  .filter(cell => !cageCellSet.has(cell))
  .map(cell => new Given(shade.at(cell), UNSHADED));

function pairs(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) result.push([arr[i], arr[j]]);
  }
  return result;
}

// Scans a cage as an interleaved [digit, shade, digit, shade, ...]
// sequence and adds each digit to a running sum whenever its own shade
// cell reads UNSHADED, clamped at target+1 (a pure "already too high"
// sink). Accepts iff the final sum equals target exactly. A per-cell
// conditional contribution (digit if unshaded, else 0) is not a fixed
// Sum coefficient, since "unshaded" is itself solver-determined, so the
// total is scanned rather than summed directly.
const conditionalSumNFACache = new Map();
function conditionalSumNFA(target) {
  if (conditionalSumNFACache.has(target)) return conditionalSumNFACache.get(target);
  const spec = NFA.encodeSpec({
    startState: { expectDigit: true, sum: 0 },
    transition: (state, value) => {
      if (state.expectDigit) {
        return { expectDigit: false, pendingDigit: value, sum: state.sum };
      }
      const add = value === UNSHADED ? state.pendingDigit : 0;
      return { expectDigit: true, sum: Math.min(state.sum + add, target + 1) };
    },
    accept: (state) => state.expectDigit === true && state.sum === target,
  }, 9);
  conditionalSumNFACache.set(target, spec);
  return spec;
}

// Per cage: tie the shade overlay to "has a same-valued partner in this
// cage" in both directions, require at least one duplicate, and check the
// unshaded total.
const cageConstraints = cages.flatMap(({ total, cells }) => {
  const cellPairs = pairs(cells);

  // Any two cells sharing a value are both duplicates, so both shaded.
  const duplicatesAreShaded = cellPairs.map(([a, b]) => new Or([
    new AllDifferent(a, b),
    new And([
      new Given(shade.at(a), SHADED),
      new Given(shade.at(b), SHADED),
    ]),
  ]));

  // A shaded cell must actually have a same-valued partner in the cage
  // (nothing is shaded without being a genuine duplicate).
  const shadedHaveDuplicates = cells.map(cell => new Or([
    new Given(shade.at(cell), UNSHADED),
    ...cells.filter(other => other !== cell).map(other => new SameValues(2, cell, other)),
  ]));

  // "Every cage must have duplicates."
  const hasADuplicate = new Or(cellPairs.map(([a, b]) => new SameValues(2, a, b)));

  const sumConstraint = new NFA(
    conditionalSumNFA(total), `cage-sum-${total}`,
    ...cells.flatMap(cell => [cell, shade.at(cell)]));

  return [...duplicatesAreShaded, ...shadedHaveDuplicates, hasADuplicate, sumConstraint];
});

// Shaded cells cannot be orthogonally adjacent, grid-wide (not just within
// a cage). Two Replicate templates (rightward edge, downward edge) cover
// every grid edge exactly once. numValues is 9 (not 2) because the VS
// overlay's declared domain follows the grid's Shape; Given merely
// narrows each cell's candidates.
const noAdjacentShadedKey = Pair.fnToKey((a, b) => !(a === SHADED && b === SHADED), 9);
const rightwardEdgeOrigins = shade.at(
  graph.cells().filter(cell => parseCellId(cell).col < 9));
const downwardEdgeOrigins = shade.at(
  graph.cells().filter(cell => parseCellId(cell).row < 9));
const noAdjacentShaded = [
  shade.makeReplicate(
    new Pair(noAdjacentShadedKey, 'no-adjacent-shaded',
      shadeOrigin, shade.at('R1C2')),
    rightwardEdgeOrigins),
  shade.makeReplicate(
    new Pair(noAdjacentShadedKey, 'no-adjacent-shaded',
      shadeOrigin, shade.at('R2C1')),
    downwardEdgeOrigins),
];

return [
  new Shape('9x9'),
  new Given('R3C7', 3),
  shade.toVar('shaded'),
  shadeDomain,
  ...nonCageShadeDomain,
  ...cageConstraints,
  ...noAdjacentShaded,
  // All unshaded cells, in or out of a cage, form one connected area.
  // (Shaded cells are never mutually connected -- they can't be adjacent
  // at all -- so only the UNSHADED side needs a connectivity constraint.)
  new ConnectedValues('VS', UNSHADED),
];
