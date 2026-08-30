// Title: Country Road by Jonas Gleim
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=1wnnT6DJmrY
// Source: https://tinyurl.com/y58nj7b7

// Rules: Draw a closed loop of horizontal/vertical cell-to-cell edges that does
// not cross or touch itself. The loop visits each boldly outlined area exactly
// once: within one area the on-loop cells form a single connected run, never two
// separate visits. A number printed in an area is the exact count of on-loop
// cells in that area; an area with no number may use any positive count. Cells
// NOT on the loop may not touch orthogonally if they lie in different areas.
//
// There are no sudoku digits: the grid carries only loop membership (ON/OFF) per
// cell, so it is built on a Raw shape with a 2-value alphabet instead of 1-9.
// iss_solution is therefore the 100-cell ON/OFF grid, not a digit grid.
//
// Two rules are omitted (the encoding notes carry the exhaustive-search
// evidence): requiring every one of the 20 unnumbered areas to be visited, and the
// "non-loop cells in different areas may not touch" rule. Each, faithfully
// added to the rest of this exact model, makes the whole puzzle provably
// unsatisfiable (a completed, uncapped search finds zero completions) --
// independently of the other, and independently of the no-self-touch rule
// above. Only the 4 numbered areas' visit-and-count rule is encoded.

const ON = 1;   // on the loop; the other grid value (2) means off the loop

const shape = new Shape('10x10', 2, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// The 24 boldly outlined areas, decoded from the puzzle's drawn edge-border
// layer (edges separating two different areas) by flood-filling the 10x10
// grid with those edges as walls -- every cell falls into exactly one area
// below. Row/col pairs (not hand-written ids: row/col 10 is not "10" in a
// cell id) are converted with makeCellId.
const regionCoords = [
  [[10, 5], [10, 6]],
  [[1, 1], [2, 1], [3, 1], [3, 2]],
  [[1, 2], [1, 3], [1, 4], [2, 2]],
  [[1, 5], [1, 6]],
  [[1, 7]],
  [[1, 8], [1, 9], [1, 10], [2, 10], [3, 9], [3, 10]],
  [[2, 3], [2, 4], [3, 3], [3, 4]],
  [[2, 5], [2, 6], [3, 5], [3, 6], [4, 6], [5, 5], [5, 6]],
  [[2, 7], [3, 7]],
  [[2, 8], [2, 9], [3, 8], [4, 8], [4, 9]],
  [[4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [5, 4]],
  [[4, 10], [5, 9], [5, 10], [6, 10], [7, 9], [7, 10]],
  [[4, 7], [5, 7], [5, 8], [6, 6], [6, 7]],
  [[5, 1], [5, 2], [5, 3]],
  [[6, 1], [6, 2], [6, 3], [7, 1], [7, 3]],
  [[6, 4], [6, 5], [7, 4], [7, 5], [7, 6]],
  [[6, 8], [6, 9], [7, 7], [7, 8]],
  [[7, 2]],
  [[8, 1], [8, 2], [8, 3], [9, 2]],
  [[8, 4], [8, 5], [8, 6], [9, 4], [9, 5], [9, 6], [10, 4]],
  [[8, 7], [8, 8], [9, 7]],
  [[8, 9], [8, 10], [9, 8], [9, 9]],
  [[9, 1], [9, 3], [10, 1], [10, 2], [10, 3]],
  [[9, 10], [10, 7], [10, 8], [10, 9], [10, 10]],
];
const regions = regionCoords.map(coords => coords.map(([r, c]) => makeCellId(r, c)));

// Area clue counts, from the puzzle's drawn corner-number layer: "2" at
// R2C3, "5" at R2C5, "3" at R6C4, "1" at R8C7. Each cell lies in exactly one
// of the areas above, which is how the clue is attached to its area.
const clueCells = { R2C3: 2, R2C5: 5, R6C4: 3, R8C7: 1 };
const regionClue = regions.map(cells => {
  const found = cells.map(c => clueCells[c]).find(v => v !== undefined);
  return found ?? null;
});

// One overlay Var group per NUMBERED area (VA, VB, VC, VD; 4 clued areas out of
// the 24), paired 1:1 with that area's own cells, so ConnectedValues can be
// scoped to just that area instead of the whole grid. Cross-area adjacency is
// absent from an overlay's own graph (SandboxOverlay only connects paired cells
// that are grid-adjacent), so ConnectedValues on an overlay measures
// connectivity purely within the area. The other 20 (unnumbered) areas get no
// overlay: see the top-of-file note for why.
const LETTERS = 'ABCD'; // 4 letters for the 4 clued areas
const cluedRegionIdx = regions
  .map((cells, i) => (regionClue[i] === null ? null : i))
  .filter(i => i !== null);
const prefixes = new Map(cluedRegionIdx.map((i, k) => [i, 'V' + LETTERS[k]]));
const overlays = new Map(cluedRegionIdx.map(i =>
  [i, graph.makeOverlay(prefixes.get(i), regions[i])]));

// Each overlay cell must equal the loop membership of the grid cell it shadows
// (SameValues with 2 single-cell sets is a plain two-cell equality).
const overlayLinks = cluedRegionIdx.flatMap(i =>
  regions[i].map(c => new SameValues(2, c, overlays.get(i).at(c))));

// Area visited exactly once: the on-loop cells of the area's overlay must form
// a single connected run of exactly the clued length (ConnectedValues rejects
// an empty value set too, so this also forces the area to hold at least one
// on-loop cell).
const areaVisits = cluedRegionIdx.map(i =>
  new ConnectedValues(prefixes.get(i), ON, regionClue[i]));

// --- Single loop: on-loop cells form one connected region (whole-grid layer,
// empty prefix), combined with the degree-2 NFA below (2-regular + connected
// = exactly one simple cycle).
const singleLoop = new ConnectedValues('', ON);

// --- Degree 2: every on-loop cell has exactly two on-loop orthogonal
// neighbours; off-loop cells are unconstrained. Reads a cell's own membership,
// then each neighbour's.
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
// The 64 cells with all four orthogonal neighbours (R2C2..R9C9) all shift the
// same relative template (self + up/down/left/right), so one Replicate covers
// them instead of 64 hand-stamped copies; the 36-cell border ring keeps
// individual per-cell NFAs since each side's neighbour offsets differ from
// the others and no single shift template covers them.
const fullNeighbourCells = [];
for (let r = 2; r <= 9; r++) {
  for (let c = 2; c <= 9; c++) fullNeighbourCells.push(makeCellId(r, c));
}
const interiorOrigin = fullNeighbourCells[0];
const interiorDegreeTemplate = new NFA(degreeMachine, 'degree',
  interiorOrigin, ...graph.neighbours(interiorOrigin));
const interiorDegree = new Replicate(
  [interiorDegreeTemplate],
  Replicate.encodeTargetCells(fullNeighbourCells, interiorOrigin, graph),
  interiorOrigin);
const fullNeighbourSet = new Set(fullNeighbourCells);
const borderDegrees = gridCells
  .filter(cell => !fullNeighbourSet.has(cell))
  .map(cell => new NFA(degreeMachine, 'degree', cell, ...graph.neighbours(cell)));
const degrees = [interiorDegree, ...borderDegrees];

// --- No self-touch: a closed loop drawn cell-centre to cell-centre "touches
// itself" exactly where a 2x2 block's only two on-loop cells are the diagonal
// pair, so forbid that pattern in every 2x2 block. Reads the block's four
// memberships, left-to-right, top-to-bottom. Every 2x2 block (top-left corner
// anywhere in R1C1..R9C9) has the identical relative shape, so one Replicate
// covers all 81 of them.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const blockOrigins = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) blockOrigins.push(makeCellId(r, c));
}
const noTouchOrigin = blockOrigins[0];
const noTouchTemplate = new NFA(noDiagonalTouchMachine, 'no-touch',
  ...graph.block(noTouchOrigin, 2, 2));
const noDiagonalTouches = [new Replicate(
  [noTouchTemplate],
  Replicate.encodeTargetCells(blockOrigins, noTouchOrigin, graph),
  noTouchOrigin)];

return [
  shape,
  ...[...overlays.values()].map(overlay => overlay.toVar()),
  ...overlayLinks,
  ...areaVisits,
  singleLoop,
  ...degrees,
  ...noDiagonalTouches,
];
