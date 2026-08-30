// Title: Unknown
// Author: Volatility
// Video: https://www.youtube.com/watch?v=8WWaybbLKr8
// Source: https://tinyurl.com/y5ord7hj

// A 12x12 star-battle / loop hybrid with no digits at all. Rules (video
// description; no rules text is drawn on the board):
//   - Two stars in every row, column and region; no two stars touch, not
//     even diagonally; no star on a sun-or-moon cell.
//   - A single closed loop visits every region; in each region the loop uses
//     EITHER all of that region's moon cells OR all of its sun cells (never
//     both), and at least one such cell; the type alternates every time the
//     loop crosses into a newly-entered region; the loop never crosses a
//     starred cell.
//
// Omitted: (1) "the loop passes through each region exactly once" (no
// re-entry) -- that needs a global visiting-order constraint (an unknown
// Hamiltonian tour over the 12 regions), which has no established way to
// build once regions are already fixed geometry rather than
// solver-discovered; (2) "the type alternates every time the loop enters a
// new region" -- see the comment above roleRestrictions/markGates for why a
// per-boundary-edge model of this turned out not to be sound without (1).
//
// Layout data (REGION_CELLS, MARKS) is transcribed from the drawn region
// walls (flood-filled into 12 regions) and the 29 sun-or-moon marks ([row,
// col, styleFlag]). Cell ids are always built with makeCellId(row, col)
// rather than hand-written 'R#C#' strings: rows/columns 10-12 print as
// base-17 letters ('a'-'c'), so a literal "R10C4" would name the wrong
// cell.

const REGION_CELLS = [
  [[1,1],[1,2],[1,3],[2,1],[2,2],[2,3],[2,4],[3,1],[3,2],[3,3],[3,4],[3,5],[4,3],[4,4]],
  [[1,4],[1,5],[1,6],[1,7],[1,8],[2,5],[2,6],[2,7],[2,8],[3,6],[3,7]],
  [[1,9],[1,10],[1,11],[1,12],[2,10],[2,11],[2,12],[3,11],[3,12],[4,10],[4,11],[4,12],[5,10],[5,11],[5,12],[6,10],[6,11],[6,12]],
  [[2,9],[3,8],[3,9],[3,10],[4,9]],
  [[4,1],[4,2],[5,1],[5,2],[5,3],[6,1],[6,2],[6,3],[7,1],[7,2],[7,3],[8,1],[8,2],[8,3]],
  [[4,5],[4,6],[5,4],[5,5],[5,6],[5,7],[6,4],[6,5],[6,6],[6,7]],
  [[4,7],[4,8],[5,8],[5,9],[6,8],[6,9],[7,8],[7,9],[8,8],[8,9],[9,7],[9,8]],
  [[7,4],[7,5],[7,6],[7,7],[8,4],[8,5],[8,6],[8,7],[9,5],[9,6]],
  [[7,10],[7,11],[7,12],[8,10],[8,11],[8,12],[9,9],[9,10],[9,11],[9,12],[10,9],[10,10],[10,11],[10,12]],
  [[9,1],[9,2],[10,1],[10,2],[11,1],[11,2],[11,3],[12,1],[12,2],[12,3],[12,4],[12,5],[12,6],[12,7]],
  [[9,3],[9,4],[10,3],[10,4],[10,5],[10,6],[10,7],[10,8],[11,4],[11,5],[11,6],[11,7]],
  [[11,8],[11,9],[11,10],[11,11],[11,12],[12,8],[12,9],[12,10],[12,11],[12,12]],
];

// [row, col, styleFlag]. styleFlag is the payload's raw 1-or-2 symbol style
// under the shared shape id "sun_moon"; nothing in the decode tooling or this
// payload says which flag is the sun icon and which is the moon, and the
// rules treat the two symmetrically (alternate types between consecutive
// regions), so the flag value is used only as an opaque type id.
const MARKS = [
  [1,5,2], [1,9,1], [1,11,2], [2,3,2], [2,7,1], [3,5,1], [3,9,1], [4,1,1],
  [4,5,1], [4,6,1], [4,7,2], [6,9,2], [6,10,2], [6,12,1], [7,5,2], [7,11,1],
  [8,1,2], [8,10,2], [9,6,1], [9,7,2], [9,12,2], [10,2,1], [10,4,2],
  [10,5,1], [10,9,1], [11,3,2], [11,9,2], [11,11,2], [12,10,1],
];

const shape = new Shape('12x12', '1-2', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();

const NOSTAR = 1, STAR = 2;
const ON = 1, OFF = 2;

const regionIndexOf = (() => {
  const map = new Map();
  REGION_CELLS.forEach((cells, idx) => {
    for (const [r, c] of cells) map.set(r + ',' + c, idx);
  });
  return (r, c) => map.get(r + ',' + c);
})();

// --- Stars: exactly two per row, column and region; no two touch. ---

const starCounts = [
  ...graph.rows().map(row => new ContainExact('2_2', ...row)),
  ...graph.columns().map(col => new ContainExact('2_2', ...col)),
  ...REGION_CELLS.map(cells =>
    new ContainExact('2_2', ...cells.map(([r, c]) => makeCellId(r, c)))),
];

// One offset per unordered king-move adjacency; a Replicate per offset
// stamps the "not both starred" pair onto every such adjacency in the grid.
const notBothStarred = Pair.fnToKey(
  (a, b) => a === NOSTAR || b === NOSTAR, shape);
const TOUCHING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const noTouchPairs = TOUCHING_OFFSETS.map(([dr, dc]) => {
  const origins = graph.cells().filter(cell => graph.step(cell, dr, dc));
  const anchor = origins[0];
  const template = new Pair(notBothStarred, 'stars do not touch',
    anchor, graph.step(anchor, dr, dc));
  return new Replicate(
    [template], Replicate.encodeTargetCells(origins, anchor, graph), anchor);
});

// No star on a sun-or-moon cell.
const marksNoStar = MARKS.map(([r, c]) => new Given(makeCellId(r, c), NOSTAR));

// --- Loop: single closed loop over cell centres, no revisit. ---

const loop = graph.makeOverlay('VL');
const loopVar = loop.toVar('loop');

// Degree-2 among on-loop orthogonal neighbours, exactly as nordschleife.js:
// reads a cell's own membership, then each neighbour's.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
// The 100 interior cells (rows/columns 2-11) all read the same 5-cell
// relative shape (self, left, right, up, down) at a fixed shift, so they are
// one Replicate template instead of 100 hand-stamped copies; the 44
// boundary cells (2 or 3 neighbours) do not share that shape and stay
// individual.
const interiorCells = graph.cells().filter(cell => graph.neighbours(cell).length === 4);
const boundaryCells = graph.cells().filter(cell => graph.neighbours(cell).length !== 4);
const interiorOrigin = interiorCells[0];
const interiorDegreeTemplate = new NFA(degreeMachine, 'degree',
  ...loop.at([interiorOrigin, ...graph.neighbours(interiorOrigin)]));
const interiorDegrees = new Replicate(
  [interiorDegreeTemplate],
  Replicate.encodeTargetCells(loop.at(interiorCells), loop.at(interiorOrigin), loop),
  loop.at(interiorOrigin));
const degrees = [
  interiorDegrees,
  ...boundaryCells.map(cell => new NFA(degreeMachine, 'degree',
    ...loop.at([cell, ...graph.neighbours(cell)]))),
];

// The rules never say the loop cannot touch itself diagonally (unlike many
// single-loop puzzles, that clause is not stated here), so no
// no-diagonal-touch constraint is added -- adding one would tighten past
// what the text says. Degree-2 + single connected component already rules
// out any revisit or branch.

// Loop never crosses a starred cell.
const notStarredIfOnLoop = Pair.fnToKey(
  (starVal, loopVal) => !(starVal === STAR && loopVal === ON), shape);
const noStarOnLoop = graph.cells().map(cell =>
  new Pair(notStarredIfOnLoop, 'loop avoids stars', cell, loop.at(cell)));

// --- Region role: one Var per region, value = the style flag (1 or 2) of
// the type ("all moon" or "all sun") the loop uses in that region. ---

const regionRole = new Var('RG', 'region role', REGION_CELLS.length);

// A region whose marks are only one style flag cannot use the other: the
// other style has zero cells in that region, so "at least one moon-or-sun
// cell visited" would be unsatisfiable if that style were chosen. This is
// arithmetic on the fixed mark counts per region, not a solved deduction.
const roleRestrictions = REGION_CELLS.map((cells, idx) => {
  const inRegion = new Set(cells.map(([r, c]) => r + ',' + c));
  const styles = new Set(
    MARKS.filter(([r, c]) => inRegion.has(r + ',' + c)).map(([, , v]) => v));
  return styles.size === 1
    ? new Given(regionRole.cell(idx + 1), [...styles][0])
    : null;
}).filter(Boolean);

// A marked cell is on the loop iff its region's role equals its own style:
// "all of the chosen type" and "none of the other type" in one relation.
// Loop values and style/role values share one domain (ON=1/OFF=2, style
// 1-or-2), so "on the loop iff role matches this cell's style" collapses to
// a same-value relation when style===ON and an all-different one otherwise.
const markGates = MARKS.map(([r, c, style]) => {
  const loopCell = loopVar.cell(r, c);
  const roleCell = regionRole.cell(regionIndexOf(r, c) + 1);
  return style === ON
    ? new SameValues(2, loopCell, roleCell)
    : new AllDifferent(loopCell, roleCell);
});

// Alternation ("the type alternates every time the loop enters a new
// region") is NOT encoded. Tried: an NFA per region-boundary edge (every
// drawn wall segment) rejecting when both its cells are on-loop and their
// regions' roles match -- sound in isolation (fixture-verified) and correct
// under a true visits-once loop, where the region-visit sequence is a
// simple 12-cycle and "the edge the loop actually uses between two regions"
// is unambiguous. But without (1) above, a region pair sharing more than
// one wall segment (common here -- several region pairs touch along 3-6
// separate edges) can be crossed more than once by a single connected loop
// that revisits a region, and constraining every drawn wall segment this
// way is then a stronger, different rule: it 2-colours the *drawn*
// region-adjacency graph (which has odd cycles through this puzzle's
// regions) rather than the loop's own visiting order. Verified this is not
// a faithful stand-in, not a cap or a search artifact: with this
// puzzle's two other single-style-only regions pinned by roleRestrictions
// (forcing two fixed, different role values), adding the per-edge
// alternation NFAs made the full model -- and even a reduced model with
// only degree-2 and connectivity, no stars at all -- exhaustively
// unsatisfiable (solve.js, unbounded backtracks). Omitting it here rather
// than shipping an unsound tightening.

return [
  shape,
  loopVar,
  regionRole,

  ...starCounts,
  ...noTouchPairs,
  ...marksNoStar,

  new ConnectedValues('VL', ON),
  ...degrees,
  ...noStarOnLoop,

  ...roleRestrictions,
  ...markGates,
];
