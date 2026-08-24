// Title: Creature Power!
// Author: Panthera
// Video: https://www.youtube.com/watch?v=RkeJmDcLjAU
// Source: https://app.crackingthecryptic.com/sudoku/jGj4Gf36nb

// Normal sudoku rules apply (default row/column/box groups).
//
// Shading: no shading is drawn -- every cell's shaded/unshaded state is a
// solver Var. Outside clues give the sum of digits in each maximal run of
// shaded cells along that row/column ("groups...separated by at least 1
// unshaded cell" is exactly the definition of a maximal run). Multi-clue
// lanes are read in "as printed" order (the order you read the margin text
// itself: left-to-right for a left lane, top-to-bottom for a top lane) --
// which for a left/top margin is farthest-from-grid first, not
// nearest-grid-first. The rules text never states this order; the other
// reading (nearest-grid-first, matching the natural row/column scan
// direction) makes the full clue set unsatisfiable even before the
// creature rule is added, which rules it out on the puzzle's own
// arithmetic -- no known solution was used to pick between them.
// Modeled with one NFA per lane over its interleaved [shade, digit] cells:
// it counts closed runs and each run's digit sum, and requires exactly as
// many runs as the lane has clues, each run's sum equal to its clue in
// scan order.
//
// Creature rule: exactly one of Rhino / Camel / Elephant applies to the
// whole grid, and the rules text never says which. Per the "two candidates
// means disjunction" convention, this is encoded as Or() over all three
// full rulesets (never picked using the solution): a solution is accepted
// if it satisfies at least one candidate ruleset in full.
//   - Rhino: cells n cells over and n+1 cells up cannot share a digit, for
//     every value of n. n=1 is a normal knight leap; n runs 1..8 with the
//     board's own bounds silently emptying any n too large to fit (n>=8
//     yields no cell pairs on a 9x9 board). n=0 is omitted: "n cells over"
//     with n=0 is not a diagonal-ish leap, and it would only restate the
//     grid's own column all-different rule.
//   - Camel: a (1,3)/(3,1) extended-knight leaper, both orientations.
//   - Elephant: 1 or 2 steps diagonally apart (|dr| = |dc| = 1 or 2).

const SHADED = 2;
const UNSHADED = 1;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const shadeCells = shade.cells();

// Restrict every shading cell to {UNSHADED, SHADED}: one Given stamped over
// the whole VS group via Replicate.
const shadeDomain = new Replicate(
  [new Given(shadeCells[0], UNSHADED, SHADED)],
  Replicate.encodeTargetCells(shadeCells, shadeCells[0], shade),
  shadeCells[0],
);

// Row/column outside-clue sums, "as printed" order (see note above).
const rowClues = {
  1: [14],
  2: [13, 4],
  3: [5, 7, 21],
  4: [18, 20],
  5: [19, 22],
  6: [1, 32],
  7: [9, 9, 6],
  8: [3, 14, 2],
  9: [14, 5],
};
const colClues = {
  1: [2, 3],
  2: [24],
  3: [3, 17],
  4: [37],
  5: [5, 27],
  6: [44],
  7: [21],
  8: [14],
  9: [41],
};

// One NFA over a lane's interleaved [shade, digit] cells (shade read first,
// then the paired digit, per cell). State tracks how many maximal shaded
// runs have closed (g) and the currently-open run's digit sum; requires
// exactly targets.length runs, closing in order with each sum matching its
// target.
function laneSumNFA(name, digitCells, shadeCellsInOrder, targets) {
  const k = targets.length;
  const spec = NFA.encodeSpec({
    startState: { g: 0, sum: 0, inRun: false, pendingShade: null },
    transition: (state, value) => {
      if (state.pendingShade === null) {
        // First half of this cell's pair: its shade flag.
        return { ...state, pendingShade: value };
      }
      // Second half: this cell's digit, paired with the shade flag just read.
      const shaded = state.pendingShade === SHADED;
      let { g, sum, inRun } = state;
      if (shaded) {
        if (!inRun) {
          if (g >= k) return undefined; // one run more than the lane has clues
          inRun = true;
          sum = value;
        } else {
          sum += value;
        }
        // Saturate at "already too high to match" -- a sink past the target.
        sum = Math.min(sum, targets[g] + 1);
      } else if (inRun) {
        // The run closed on the previous cell; check it against its clue.
        if (sum !== targets[g]) return undefined;
        g += 1;
        inRun = false;
        sum = 0;
      }
      return { g, sum, inRun, pendingShade: null };
    },
    accept: (state) => {
      if (state.pendingShade !== null) return false;
      let { g, sum, inRun } = state;
      if (inRun) {
        if (sum !== targets[g]) return false;
        g += 1;
      }
      return g === k;
    },
    // 9 cells x 2 reads (shade, digit) per lane.
    maxDepth: 18,
  }, 9);

  const interleaved = digitCells.flatMap((d, i) => [shadeCellsInOrder[i], d]);
  return new NFA(spec, name, ...interleaved);
}

const rowSumNFAs = Object.entries(rowClues).map(([n, targets]) => laneSumNFA(
  `row ${n} shaded-run sums`, graph.row(+n), shade.row(+n), targets));
const colSumNFAs = Object.entries(colClues).map(([n, targets]) => laneSumNFA(
  `col ${n} shaded-run sums`, graph.column(+n), shade.column(+n), targets));

// Every unordered cell pair at a fixed relative offset, or set of offsets.
// Only offsets with dr > 0 are passed in, so each pair is produced exactly
// once (iterating the full grid covers both diagonal directions via dc's
// sign). Out-of-range offsets (dr or dc too large for the board) silently
// contribute no pairs.
function leaperPairs(offsets) {
  const pairs = [];
  for (const [dr, dc] of offsets) {
    for (let r = 1; r <= 9 - dr; r++) {
      for (let c = 1; c <= 9; c++) {
        const c2 = c + dc;
        if (c2 < 1 || c2 > 9) continue;
        pairs.push([makeCellId(r, c), makeCellId(r + dr, c2)]);
      }
    }
  }
  return pairs;
}

// Rhino: (over = n, up = n+1) in all 4 sign combinations, for n = 1..8 (the
// board's own bounds empty out n too large to fit).
const rhinoOffsets = [];
for (let n = 1; n <= 8; n++) rhinoOffsets.push([n + 1, n], [n + 1, -n]);
const rhinoPairs = leaperPairs(rhinoOffsets);

// Camel: a (1,3) extended-knight leaper, both orientations.
const camelOffsets = [[1, 3], [1, -3], [3, 1], [3, -1]];
const camelPairs = leaperPairs(camelOffsets);

// Elephant: 1 or 2 steps diagonally apart.
const elephantOffsets = [[1, 1], [1, -1], [2, 2], [2, -2]];
const elephantPairs = leaperPairs(elephantOffsets);

const creatureRule = new Or([
  new And(rhinoPairs.map(([a, b]) => new AllDifferent(a, b))),
  new And(camelPairs.map(([a, b]) => new AllDifferent(a, b))),
  new And(elephantPairs.map(([a, b]) => new AllDifferent(a, b))),
]);

return [
  new Shape('9x9'),
  shade.toVar('shaded'),
  shadeDomain,
  ...rowSumNFAs,
  ...colSumNFAs,
  creatureRule,
];
