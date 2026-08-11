// Title: Line Of Sight
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=ctMB622o-IA
// Source: https://app.crackingthecryptic.com/sudoku/LGLRMdDTMt

// Fill each row, column and 7-cell region 1-7. The regions are unknown jigsaw
// shapes (orthogonally connected, size 7) that the solver must discover --
// ChaosConstruction plus its 'CC' region-label overlay.
//
// Six grid clues give the product of two sums: the digits a clue cell "sees"
// along its row within its own region (itself included, stopping the instant
// a region boundary is crossed) summed, times the same total down its column.
// "Can see at least two cells... both horizontally and vertically" (rules
// text, and the worked examples: 12 is the smallest clue, made from a 2-cell
// run each way) is encoded directly -- each axis's NFA branch tracks whether
// a neighbour cell actually joined the run and rejects a lone clue-cell total.
// This is not redundant with the arithmetic: two of the six clues here (50,
// 125) have a single-digit factor (2 or 5) whose complementary quotient (25,
// 10) is itself a reachable multi-cell sum, so a lone-cell reading would
// otherwise slip through.
//
// Each product clue is one custom NFA reading: the clue's own digit, then its
// row neighbours out to the left edge, then out to the right edge, then its
// column neighbours out to the top edge, then out to the bottom edge. Each
// neighbour cell is preceded by a same-region flag Var for the grid edge just
// behind it, so the automaton can freeze ("stopped") its running total the
// moment the flag says "different region" -- later cells in that ray are
// still read (fixed segment length) but no longer added.
//
// A plain running (sumH, sumV) pair would carry ~29 x 29 live states just for
// the two totals, before even counting phase/ray-position -- comfortably over
// the 4096-state cap. Instead, the instant the horizontal ray finishes the
// machine rejects unless the horizontal total divides the clue value P (dead
// branch, cut immediately per the NFA state-blowup guidance); from then on it
// carries only the required vertical total P/sumH (one of the few divisors of
// P that lie in a reachable sum range) and the running vertical total capped
// at that requirement, not the raw horizontal sum. A reference simulation of
// this transition function measured under 1700 reachable states for every
// one of the six clues here, comfortably under the cap; all six also
// compiled successfully through the real encoder.
//
// The same-region flags are derived once per adjacent grid-cell pair that a
// ray actually reads (full rows 1, 5, 6 and full columns 1, 2, 3, 4, 7):
// Or(And(Pair(equal), Given(flag, SAME)), And(Pair(notEqual), Given(flag,
// DIFF))) pins the flag to whether the two cells' Chaos-Construction region
// labels agree -- the standard "derive a boolean flag Var from two free
// cells" pattern, generalised from a Given-determined property to two
// solver-determined ones.
//
// Clue positions and values transcribed from the source's printed text
// overlays: R1C1=300, R1C4=121, R5C3=160, R6C2=256, R5C7=125, R6C4=50.

const SAME = 2;
const DIFF = 1;

const graph = cellGraph('7x7');
const cc = graph.makeOverlay('CC');

const eqKey = Pair.fnToKey((a, b) => a === b, 7);
const neqKey = Pair.fnToKey((a, b) => a !== b, 7);

// Build the 6 same-region flags along one full row/column and the
// Or/And constraints that pin each flag to the region-label comparison of
// its two grid cells. `cells`/`ccCells` are the 7 grid/region-label ids in
// index order; `flags[i]` covers the edge between cells[i] and cells[i+1].
function buildAxisFlags(prefix, cells, ccCells) {
  const flagVar = new Var(prefix, `${prefix}-flags`, 6);
  const derive = [];
  for (let i = 0; i < 6; i++) {
    const flagCell = flagVar.cell(i + 1);
    derive.push(new Or([
      new And([
        new Pair(eqKey, 'sameRegion', ccCells[i], ccCells[i + 1]),
        new Given(flagCell, SAME),
      ]),
      new And([
        new Pair(neqKey, 'diffRegion', ccCells[i], ccCells[i + 1]),
        new Given(flagCell, DIFF),
      ]),
    ]));
  }
  return { cells, flags: flagVar.cells(), varConstraint: flagVar, derive };
}

// Only the rows/columns actually touched by a clue's rays need flags.
// Var prefixes must be plain A-Z letters, so rows/columns get letter codes
// rather than their numeric index.
const ROWS_NEEDED = [[1, 'RA'], [5, 'RB'], [6, 'RC']];
// (Column 3's code skips 'CC' -- that prefix is already the chaos-region
// label overlay.)
const COLS_NEEDED = [[1, 'CA'], [2, 'CB'], [3, 'CF'], [4, 'CD'], [7, 'CE']];

const rowAxes = new Map(ROWS_NEEDED.map(([r, code]) => [
  r, buildAxisFlags(`F${code}`, graph.row(r), cc.row(r)),
]));
const colAxes = new Map(COLS_NEEDED.map(([c, code]) => [
  c, buildAxisFlags(`F${code}`, graph.column(c), cc.column(c)),
]));

const flagConstraints = [...rowAxes.values(), ...colAxes.values()]
  .flatMap(axis => [axis.varConstraint, ...axis.derive]);

// Clues transcribed from the source's printed text overlays.
const CLUES = [
  { cell: 'R1C1', row: 1, col: 1, product: 300 },
  { cell: 'R1C4', row: 1, col: 4, product: 121 },
  { cell: 'R5C3', row: 5, col: 3, product: 160 },
  { cell: 'R6C2', row: 6, col: 2, product: 256 },
  { cell: 'R5C7', row: 5, col: 7, product: 125 },
  { cell: 'R6C4', row: 6, col: 4, product: 50 },
];

// One ray as an interleaved [flag, digit, flag, digit, ...] segment, ordered
// nearest-to-the-clue first, out to the grid edge.
function buildRay(axis, originIndex, direction) {
  // direction: +1 walks toward higher index (right/down), -1 toward lower
  // (left/up). `axis.cells`/`axis.flags` are 0-indexed by grid position;
  // flags[i] is the edge between cells[i] and cells[i+1].
  const seg = [];
  let i = originIndex;
  while (true) {
    const next = i + direction;
    if (next < 0 || next > 6) break;
    const flagIndex = direction > 0 ? i : next; // the edge between i and next
    seg.push(axis.flags[flagIndex], axis.cells[next]);
    i = next;
  }
  return seg;
}

// Compile one product-clue NFA. Horizontal rays are read first (rays 1, 2);
// the machine rejects unless their total divides `product` and the quotient
// is itself a reachable vertical total, then reads the vertical rays (3, 4)
// tracking only how much of that required total remains.
function makeLineOfSightSpec(product) {
  const maxSum = 28; // 1+2+...+7, the largest possible same-region run total
  const divisors = [];
  for (let h = 1; h <= maxSum; h++) {
    if (product % h === 0 && product / h <= maxSum) divisors.push(h);
  }
  const divisorSet = new Set(divisors);

  const spec = {
    startState: { kind: 'H', phase: 'eq', rays: 0, originDigit: 0, sumH: 0, extra: false, stopped: false },
    transition(state, value) {
      if (state.kind === 'H') {
        const { phase, rays, originDigit, sumH, extra, stopped } = state;
        if (value === SEGMENT_BREAK) {
          const nextRays = rays + 1;
          if (nextRays === 3) {
            // Horizontal rays finished. `extra` requires a neighbour cell
            // actually joined the run -- "sees at least two cells", not the
            // clue cell alone -- and sumH must divide `product` with a
            // reachable, in-range quotient.
            if (!extra || sumH === 0 || !divisorSet.has(sumH)) return undefined;
            const reqV = product / sumH;
            if (reqV > maxSum || originDigit > reqV) return undefined;
            return { kind: 'V', phase: 'eq', rays: 3, reqV, accumV: originDigit, extra: false, stopped: false };
          }
          if (nextRays > 2) return undefined; // only rays 1 (left), 2 (right) exist here
          return { kind: 'H', phase: 'eq', rays: nextRays, originDigit, sumH, extra, stopped: false };
        }
        if (rays === 0) {
          // Origin segment: a single digit symbol.
          return { kind: 'H', phase: 'eq', rays: 0, originDigit: value, sumH: value, extra, stopped };
        }
        if (phase === 'eq') {
          const nowStopped = stopped || value !== SAME;
          return { kind: 'H', phase: 'digit', rays, originDigit, sumH, extra, stopped: nowStopped };
        }
        // phase === 'digit'
        if (stopped) return { kind: 'H', phase: 'eq', rays, originDigit, sumH, extra, stopped };
        const nextSum = sumH + value;
        if (nextSum > maxSum) return undefined;
        return { kind: 'H', phase: 'eq', rays, originDigit, sumH: nextSum, extra: true, stopped };
      }
      // state.kind === 'V'
      const { phase, rays, reqV, accumV, extra, stopped } = state;
      if (value === SEGMENT_BREAK) {
        // Only rays 3 (up) and 4 (down) exist; a break past the down ray
        // would mean a 6th segment, which never happens in real use --
        // reject rather than let `rays` climb without bound.
        if (rays >= 4) return undefined;
        return { kind: 'V', phase: 'eq', rays: rays + 1, reqV, accumV, extra, stopped: false };
      }
      if (phase === 'eq') {
        const nowStopped = stopped || value !== SAME;
        return { kind: 'V', phase: 'digit', rays, reqV, accumV, extra, stopped: nowStopped };
      }
      // phase === 'digit'
      if (stopped) return { kind: 'V', phase: 'eq', rays, reqV, accumV, extra, stopped };
      const nextV = accumV + value;
      if (nextV > reqV) return undefined;
      return { kind: 'V', phase: 'eq', rays, reqV, accumV: nextV, extra: true, stopped };
    },
    // `extra` here requires a vertical neighbour too, so both axes see >=2 cells.
    accept: (state) => state.kind === 'V' && state.accumV === state.reqV && state.extra,
    // cells consumed = origin(1) + 6 row neighbours*2 + 6 col neighbours*2 = 25;
    // 4 segment breaks between the 5 segments => 29.
    maxDepth: 29,
  };
  return NFA.encodeSpec(spec, 7, { multiSegment: true });
}

const clueNFAs = CLUES.map(({ cell, row, col, product }) => {
  const rowAxis = rowAxes.get(row);
  const colAxis = colAxes.get(col);
  const leftSeg = buildRay(rowAxis, col - 1, -1);
  const rightSeg = buildRay(rowAxis, col - 1, +1);
  const upSeg = buildRay(colAxis, row - 1, -1);
  const downSeg = buildRay(colAxis, row - 1, +1);
  const spec = makeLineOfSightSpec(product);
  return new NFA(spec, `sight_${cell}_${product}`, [cell], leftSeg, rightSeg, upSeg, downSeg);
});

return [
  new Shape('7x7'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...flagConstraints,
  ...clueNFAs,
];
