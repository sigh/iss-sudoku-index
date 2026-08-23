// Title: Whisper Of The Killer Snake
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=RLvFhIxpTxw
// Source: https://app.crackingthecryptic.com/sudoku/nGtnmLtndn

// Rules encoded here, in full:
//  * Normal sudoku: 1-9 once per row, column and box.
//  * 11 cages, each anchored at one printed total cell (below). A cage's cell
//    membership, shape and path order are entirely solver-discovered:
//    - a non-branching simple path of >= 2 orthogonally connected cells;
//    - starts or ends at its own total cell;
//    - the total cell is the topmost cell of the cage (leftmost breaks ties);
//    - the path may touch itself: two cells of the same cage may be
//      grid-adjacent without being *consecutive* along the path, and only
//      consecutive (used-edge) pairs carry the digit-difference rule below;
//    - digits along the cage sum to the printed total and never repeat;
//    - consecutive digits along the path differ by >= 5;
//    - cages never share a cell.
//
// Membership is unknown, so cage total, no-repeat and >=5-difference are all
// expressed over the whole grid rather than over a fixed cell list:
//  - CAGE: one Var per grid cell, value 0 (not in any cage) or 1-11 (which
//    cage). The topmost-leftmost rule is a domain restriction: a cell cannot
//    hold label k if it sits above, or in the same row and left of, label k's
//    own total cell. Each total cell's own domain is pinned to its own label.
//  - One boolean Var per grid edge (E) marks whether that edge is a
//    *consecutive path step* of some cage. E=1 forces both endpoints to share
//    the same nonzero CAGE label (via a Pair over the CAGE cells) and forces
//    their digits to differ by >= 5 (via a Pair over the grid cells); E=0
//    carries no constraint, which is what lets a cage touch itself without
//    tripping the >=5 rule on the touching (non-consecutive) pair.
//  - Per-cell degree (count of incident E=1 edges) is capped at 2 with a
//    slack Var (Sum to 2, slack in [0, incidentCount-2]) so no cage cell
//    branches; each total cell's degree is pinned to exactly 1, since it is
//    always a path endpoint.
//  - ConnectedValues ties each cage label's cells into one connected region.
//  - The total (Cage.Sum) and no-repeat (Cage.AllDifferent) rules are read
//    off the whole grid with one NFA each: for the total, scan
//    [digit, cageLabel] for every cell in a fixed order, adding the digit to
//    a running sum only on cells carrying that cage's label, and accept when
//    the final sum equals the printed total. No-repeat is one small NFA per
//    (cage, digit) pair over the same scan, rejecting a second occurrence of
//    that digit among that cage's cells.
//
// Latent gap: the E/degree/ConnectedValues model is sound (never rejects the
// true solution) but does not fully close single-path connectivity. A cage's
// cells could in principle split into two components that are only
// cell-adjacent (touching, not edge-connected), e.g. a stray self-contained
// loop hanging off the real path by mere adjacency. This can only add extra
// completions, never lose the real one.

const TOTALS = [
  { cell: 'R1C1', total: 7 },
  { cell: 'R2C2', total: 40 },
  { cell: 'R1C3', total: 10 },
  { cell: 'R3C9', total: 9 },
  { cell: 'R5C1', total: 10 },
  { cell: 'R6C2', total: 40 },
  { cell: 'R6C3', total: 14 },
  { cell: 'R9C2', total: 10 },
  { cell: 'R5C5', total: 8 },
  { cell: 'R8C9', total: 14 },
  { cell: 'R5C8', total: 16 },
];
const NUM_CAGES = TOTALS.length; // 11
const anchorByCell = new Map(TOTALS.map((t, i) => [t.cell, i + 1]));

// Widen the shape so the CAGE label (0-11) fits alongside the real 1-9
// digits; every playable grid cell is then restricted back to 1-9 below.
const shape = new Shape('9x9', '0-11');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// --- Real grid digits are restricted back to 1-9 -------------------------
const digitRestriction = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// --- CAGE label overlay ----------------------------------------------------
const cage = graph.makeOverlay('VCAGE');
const cageVar = cage.toVar('cage-label');

// Domain per cell: the total cell is pinned to its own label; any other cell
// may be 0 (no cage) or any label k whose own total cell it does not precede
// in "topmost, ties broken leftmost" order.
const cageDomainGivens = gridCells.map(cell => {
  const label = anchorByCell.get(cell);
  if (label !== undefined) return new Given(cage.at(cell), label);
  const { row, col } = parseCellId(cell);
  const allowed = [0, ...TOTALS
    .map((t, idx) => ({ idx, a: parseCellId(t.cell) }))
    .filter(({ a }) => !(row < a.row || (row === a.row && col < a.col)))
    .map(({ idx }) => idx + 1)];
  return new Given(cage.at(cell), ...allowed);
});

// --- Edge Vars: is this grid edge a used (consecutive) path step? --------
const RIGHT = [0, 1], DOWN = [1, 0];
const edgeList = gridCells.flatMap(cell => [RIGHT, DOWN]
  .map(([dr, dc]) => graph.step(cell, dr, dc))
  .filter(nb => nb)
  .map(nb => ({ a: cell, b: nb })));
const edgeVar = new Var('E', 'snake-edge', edgeList.length);
const edgeCells = edgeVar.cells();

// incidence: grid cell id -> list of its incident edge Var cell ids
const incident = new Map(gridCells.map(c => [c, []]));
edgeList.forEach(({ a, b }, i) => {
  incident.get(a).push(edgeCells[i]);
  incident.get(b).push(edgeCells[i]);
});

const sameNonzeroKey = Pair.fnToKey((a, b) => a === b && a !== 0, shape);
const whisperKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, shape);

const edgeConstraints = edgeList.map(({ a, b }, i) => {
  const e = edgeCells[i];
  return new Or([
    new Given(e, 0),
    new And([
      new Given(e, 1),
      new Pair(sameNonzeroKey, 'cage-edge', cage.at(a), cage.at(b)),
      new Pair(whisperKey, 'whisper-edge', a, b),
    ]),
  ]);
});

// --- Degree: <=2 everywhere (no branching), exactly 1 at each total cell --
// Slack turns "at most 2 of these edges are used" into an equality: edges
// sum + slack = 2, slack in [0, 2] (edges sum can itself be 0-2 once this
// holds, so 2 is the slack's own max regardless of how many edges are
// incident).
const slackGridCells = gridCells
  .filter(cell => !anchorByCell.has(cell) && incident.get(cell).length > 2);
const slack = graph.makeOverlay('VSL', slackGridCells);
const slackVar = slack.toVar('snake-degree-slack');
const slackDomain = slack.makeReplicate(new Given(slack.cells()[0], 0, 1, 2));
const degreeCapConstraints = slackGridCells.map(
  cell => new Sum(2, ...incident.get(cell), slack.at(cell)));
const anchorDegreeConstraints = TOTALS.map(
  t => new Sum(1, ...incident.get(t.cell)));

// --- Connectivity: each cage label is one connected region ----------------
const connectivityConstraints = TOTALS.map(
  (_, idx) => new ConnectedValues('VCAGE', idx + 1));

// --- Cage total and no-repeat, scanned over the whole grid -----------------
// Fixed scan order; the sum is order-independent so any fixed order works.
const scan = gridCells.flatMap(cell => [cell, cage.at(cell)]);

const cageValueConstraints = TOTALS.flatMap((t, idx) => {
  const k = idx + 1;
  const target = t.total;
  const sumSpec = {
    startState: { sum: 0, pending: null },
    transition: (state, value) => {
      if (state.pending === null) {
        // Just read a digit cell; remember it until we see its cage label.
        return { sum: state.sum, pending: value };
      }
      // Just read a cage-label cell for the digit remembered above.
      const add = value === k ? state.pending : 0;
      const newSum = state.sum + add;
      if (newSum > target) return undefined;
      return { sum: newSum, pending: null };
    },
    accept: (state) => state.pending === null && state.sum === target,
  };
  const sumNFA = NFA.encodeSpec(sumSpec, shape);

  const noRepeatNFAs = Array.from({ length: 9 }, (_, i) => {
    const d = i + 1;
    const noRepeatSpec = {
      startState: { pendingIsD: null, count: 0 },
      transition: (state, value) => {
        if (state.pendingIsD === null) {
          return { pendingIsD: value === d, count: state.count };
        }
        const hit = state.pendingIsD && value === k;
        const newCount = hit ? state.count + 1 : state.count;
        if (newCount > 1) return undefined;
        return { pendingIsD: null, count: newCount };
      },
      accept: (state) => state.pendingIsD === null,
    };
    return new NFA(
      NFA.encodeSpec(noRepeatSpec, shape), `cage-${k}-digit-${d}-once`, ...scan);
  });

  return [new NFA(sumNFA, `cage-${k}-total`, ...scan), ...noRepeatNFAs];
});

return [
  shape,
  digitRestriction,
  cageVar,
  ...cageDomainGivens,
  edgeVar,
  ...edgeConstraints,
  slackVar,
  slackDomain,
  ...degreeCapConstraints,
  ...anchorDegreeConstraints,
  ...connectivityConstraints,
  ...cageValueConstraints,
];
