// Title: Voxas
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=Ij-n1AFh3ug
// Source: https://tinyurl.com/5fuvrxe9

// Rules:
//   Divide the grid into 1x2 and 1x3 regions. Borders must separate two
//   different regions. Borders with white dots separate regions with the same
//   size and orientation. Borders with black dots separate regions with neither
//   the same size nor the same orientation. Borders with grey dots separate
//   regions with either the same size or the same orientation, but not both.
//
// No digits are placed: the answer is the dissection itself. The grid is Raw
// (no row/column/box rules) and each cell holds a state naming its region's
// shape and the cell's position within it, so a region is a maximal run of
// states that chain together.
//
// One rule is encoded as a disjunction rather than resolved. The three dot
// colours are drawn as three distinct marker groups of 6, 4 and 10 borders, but
// the source records each marker only as a numeric style id (1, 2 and 5), and
// nothing in the puzzle says which id is drawn white, black or grey. The three
// rule predicates are mutually exclusive and cover every pair of regions, so the
// three groups match the three predicates one-to-one; the encoding therefore
// disjoins over all six bijections instead of picking one.

// --- Cell states -----------------------------------------------------------
// A cell's value names its region's size (2 or 3) and orientation (H or V) plus
// the cell's position in that region: L/M/R along a row, T/M/B down a column.
const H2L = 1, H2R = 2, V2T = 3, V2B = 4;
const H3L = 5, H3M = 6, H3R = 7, V3T = 8, V3M = 9, V3B = 10;

const SIZE = { [H2L]: 2, [H2R]: 2, [V2T]: 2, [V2B]: 2 };
const HORIZONTAL = new Set([H2L, H2R, H3L, H3M, H3R]);
const sizeOf = (v) => SIZE[v] || 3;
const isHorizontal = (v) => HORIZONTAL.has(v);

// The partner a state demands in each direction; absent means "this state ends
// the region on that side", which says nothing about the neighbouring cell.
const RIGHT_OF = { [H2L]: H2R, [H3L]: H3M, [H3M]: H3R };
const LEFT_OF = { [H2R]: H2L, [H3M]: H3L, [H3R]: H3M };
const BELOW = { [V2T]: V2B, [V3T]: V3M, [V3M]: V3B };
const ABOVE = { [V2B]: V2T, [V3M]: V3T, [V3B]: V3M };

const shape = new Shape('9x9', 10, 'Raw');
const graph = cellGraph(shape);

// --- Divide the grid into 1x2 and 1x3 regions ------------------------------
// Every cell carries a state, so every cell is in exactly one region. Two
// mutually-consistent neighbours are all that the shapes need: a state that
// demands a partner must get it, and a state that is a partner must have its
// own predecessor. Runs of four or more cannot form -- H3M requires H3L to its
// left, so a second H3M in a row is rejected.
const compatible = (need, back) => (a, b) =>
  (need[a] === undefined || need[a] === b) &&
  (back[b] === undefined || back[b] === a);

const rowChainKey = Pair.fnToKey(compatible(RIGHT_OF, LEFT_OF), shape);
const colChainKey = Pair.fnToKey(compatible(BELOW, ABOVE), shape);

const chains = [
  ...graph.rows().map(cells => new Pair(rowChainKey, 'row run', ...cells)),
  ...graph.columns().map(cells => new Pair(colChainKey, 'column run', ...cells)),
];

// A cell on an edge of the board cannot hold a state whose partner would fall
// outside it; no adjacent pair exists there to reject it.
const edgeStates = graph.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = [H2L, H2R, V2T, V2B, H3L, H3M, H3R, V3T, V3M, V3B].filter(
    v => (col < 9 || RIGHT_OF[v] === undefined) &&
      (col > 1 || LEFT_OF[v] === undefined) &&
      (row < 9 || BELOW[v] === undefined) &&
      (row > 1 || ABOVE[v] === undefined));
  return allowed.length < 10 ? new Given(cell, ...allowed) : null;
}).filter(g => g !== null);

// --- Drawn borders ---------------------------------------------------------
// The 20 dotted borders, transcribed from the source's drawn edge segments and
// cross-checked against the drawn dots (both name the same 20 cell pairs). Each
// entry is [row, col] of the upper/left cell, [row, col] of the lower/right
// cell, and the marker group the dot belongs to.
const BORDERS = [
  [[1, 5], [2, 5], 1], [[4, 8], [5, 8], 1], [[6, 3], [7, 3], 1],
  [[3, 3], [3, 4], 1], [[7, 6], [7, 7], 1], [[8, 5], [8, 6], 1],

  [[2, 4], [3, 4], 2], [[3, 7], [4, 7], 2], [[4, 1], [5, 1], 2],
  [[7, 6], [8, 6], 2],

  [[5, 2], [6, 2], 5], [[5, 9], [6, 9], 5], [[8, 5], [9, 5], 5],
  [[1, 5], [1, 6], 5], [[2, 4], [2, 5], 5], [[4, 7], [4, 8], 5],
  [[5, 1], [5, 2], 5], [[5, 8], [5, 9], 5], [[6, 2], [6, 3], 5],
  [[9, 4], [9, 5], 5],
];

const borders = BORDERS.map(([[r1, c1], [r2, c2], group]) => ({
  a: makeCellId(r1, c1),
  b: makeCellId(r2, c2),
  horizontal: r1 === r2,
  group,
}));

// Borders must separate two different regions: the two cells are in the same
// region exactly when the first chains directly into the second.
const splitRowKey = Pair.fnToKey((a, b) => RIGHT_OF[a] !== b, shape);
const splitColKey = Pair.fnToKey((a, b) => BELOW[a] !== b, shape);

const separations = borders.map(({ a, b, horizontal }) =>
  new Pair(horizontal ? splitRowKey : splitColKey, 'border', a, b));

// --- Dot colours -----------------------------------------------------------
const sameSize = (a, b) => sizeOf(a) === sizeOf(b);
const sameOrientation = (a, b) => isHorizontal(a) === isHorizontal(b);

const DOT_RULES = {
  white: Pair.fnToKey((a, b) => sameSize(a, b) && sameOrientation(a, b), shape),
  black: Pair.fnToKey((a, b) => !sameSize(a, b) && !sameOrientation(a, b), shape),
  grey: Pair.fnToKey((a, b) => sameSize(a, b) !== sameOrientation(a, b), shape),
};

// The three marker groups carry the three dot colours one-to-one; which group
// is which is not recorded by the source. Each branch is one of the six
// bijections from the groups {1, 2, 5} to {white, black, grey}, applied to all
// 20 borders at once, so the colours stay consistent across the whole grid.
const GROUPS = [1, 2, 5];
const bijections = (colours) => colours.length <= 1 ? [colours] :
  colours.flatMap((colour, i) => bijections(
    colours.filter((_, j) => j !== i)).map(rest => [colour, ...rest]));

const dots = new Or(
  bijections(Object.keys(DOT_RULES)).map(assignment => new And(
    borders.map(({ a, b, group }) => new Pair(
      DOT_RULES[assignment[GROUPS.indexOf(group)]],
      `group ${group} dot`, a, b)))));

return [shape, ...chains, ...edgeStates, ...separations, dots];
