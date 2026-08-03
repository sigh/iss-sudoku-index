// Title: The Caribbean
// Author: Niverio
// Video: https://www.youtube.com/watch?v=6r1czEP1NQw
// Source: https://app.crackingthecryptic.com/sudoku/P4frHfDRFb

// Rules encoded here:
//   * Normal sudoku (standard 3x3 boxes; the source `regions` array is the
//     ordinary tiling, so the default Shape boxes already match it).
//   * One drawn X: R5C5/R5C6 sum to 10. "Not all Xs are given" is a negative
//     disclaimer, not a rule -- it says the absence of a mark elsewhere is not
//     informative, so no global negative is added for unmarked adjacent pairs.
//   * Shade some cells ("some" -> at least one) so the shaded cells form one
//     orthogonally-connected region with no 2x2 all-shaded block.
//   * The unshaded cells split into orthogonally-connected "islands". Seven
//     circles are drawn; "each island has exactly one circle" forbids both an
//     island with zero circles and one with two, which with exactly 7 circles
//     pins the island count at exactly 7. A circled cell is always part of its
//     island (never shaded): the rule "the number in the circle shows the size
//     of the island" only parses if the circle sits inside an island.
//   * The digit the solver places in a circled cell is that island's size N;
//     the island's N cells hold digits 1..N with no repeat. Each island's size
//     differs from every other island's.
// Nothing is omitted.
//
// Model: one Var per grid cell ('VI') labels it SHADED or with one of 7
// island ids, each id anchored to one circle by a Given (breaking the usual
// label-permutation symmetry outright, since every label is pinned to a named
// cell). ConnectedValues makes each label (shaded, and every island) a single
// connected region. A per-island NFA reads the circle's own digit first (its
// claimed size N), then scans every (label, digit) pair in the grid, folding
// digits seen on that island into a bitmask while rejecting a digit above N or
// a repeat; accepting only when the mask is exactly the full 1..N set. That
// single machine forces the island's digit content (1..N, no repeat) and,
// as a consequence, its cell count (exactly N cells can supply N distinct
// digits capped at N without a forced repeat).

const GRID = '9x9';
const graph = cellGraph(GRID);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const label = graph.makeOverlay('VI');

// Transcribed from the drawn circle positions. Order is arbitrary; each gets
// its own pinned label below so no ordering choice matters.
const CIRCLES = ['R1C2', 'R3C2', 'R4C3', 'R8C2', 'R6C5', 'R6C8', 'R3C7'];
const ISLAND_LABELS = CIRCLES.map((_, i) => i + 1);
const SHADED = ISLAND_LABELS.length + 1; // 8

// Every grid cell is shaded or belongs to exactly one of the 7 islands. One
// shared domain stamped over the whole grid; the narrower per-circle Given
// below intersects with it on those 7 cells rather than conflicting.
const labelDomain = label.makeReplicate(
  new Given(label.at(gridCells[0]), SHADED, ...ISLAND_LABELS));

// Each circle is pinned into its own island (see header note: a circled cell
// can't be shaded, or "the number in the circle" would have no island to
// describe).
const circleGivens = CIRCLES.map((cell, i) => new Given(label.at(cell), ISLAND_LABELS[i]));

// Shaded cells: one connected region (non-empty, since "shade SOME cells").
const shadedConnected = new ConnectedValues('VI', SHADED);

// No 2x2 block is all shaded. Template NFA over one 2x2 block, counting
// shaded cells and rejecting the 4th; Replicate stamps it at every in-grid 2x2
// top-left position.
const no2x2ShadedMachine = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => {
    const next = count + (value === SHADED ? 1 : 0);
    return next === 4 ? undefined : next;
  },
  accept: () => true,
}, geometry);
const twoByTwoOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const no2x2Shaded = label.makeReplicate(
  new NFA(no2x2ShadedMachine, 'no-2x2-shaded', ...label.at(graph.block(gridCells[0], 2, 2))),
  label.at(twoByTwoOrigins));

// Each island: connected, and its digits are exactly 1..N (N read from its
// own circle) with no repeat. See header note for how this also pins size.
const islandConnected = ISLAND_LABELS.map(id => new ConnectedValues('VI', id));

const islandContentsMachine = (islandLabel) => NFA.encodeSpec({
  // `target` is null until the first symbol (the circle's own digit) is read.
  // `reading` toggles between reading a cell's label and its digit; `inIsland`
  // remembers whether the label just read was this island's.
  startState: { target: null, reading: false, inIsland: false, mask: 0 },
  transition(state, value) {
    if (state.target === null) {
      return { target: value, reading: false, inIsland: false, mask: 0 };
    }
    if (!state.reading) {
      return { ...state, reading: true, inIsland: value === islandLabel };
    }
    if (!state.inIsland) {
      return { ...state, reading: false, inIsland: false };
    }
    // A digit on this island: reject if it exceeds the claimed size N
    // (pruning keeps the reachable state count well under the NFA state
    // cap: mask only ever ranges over subsets of 1..N for the branch
    // that reached this N) or if it repeats a digit already on the island.
    if (value > state.target) return undefined;
    const bit = 1 << (value - 1);
    if (state.mask & bit) return undefined;
    return { ...state, mask: state.mask | bit, reading: false, inIsland: false };
  },
  accept(state) {
    if (state.reading) return false;
    return state.mask === (1 << state.target) - 1;
  },
}, geometry);

const islandContents = CIRCLES.map((circleCell, i) => {
  const islandLabel = ISLAND_LABELS[i];
  const machine = islandContentsMachine(islandLabel);
  return new NFA(
    machine, `island-${islandLabel}-contents`,
    circleCell,
    ...gridCells.flatMap(cell => [label.at(cell), cell]));
});

// Every island's size is different. Size = the digit at its own circle, so
// this is just distinctness over the 7 circled cells.
const differentSizes = new AllDifferent(...CIRCLES);

return [
  new Shape(GRID),
  label.toVar('island'),

  // Givens, transcribed from `cells[][].value`.
  new Given('R2C8', 4),
  new Given('R3C2', 9),
  new Given('R6C6', 4),
  new Given('R9C2', 3),

  // Rule 2: the one drawn X.
  new X('R5C5', 'R5C6'),

  // Rule 3.
  labelDomain,
  ...circleGivens,
  shadedConnected,
  no2x2Shaded,
  ...islandConnected,
  ...islandContents,
  differentSizes,
];
