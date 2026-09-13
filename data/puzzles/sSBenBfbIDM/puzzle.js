// Title: Star Nurikabe?
// Author: BenceJoful
// Video: https://www.youtube.com/watch?v=sSBenBfbIDM
// Source: https://git.io/Jzwdj

// (Almost) standard 2-star Star Battle plus Nurikabe:
// - Shade some cells so all shaded cells form one orthogonally-connected
//   area, with no 2x2 block of cells entirely shaded.
// - Every clue cell is unshaded. Every maximal orthogonally-connected area
//   of unshaded cells contains exactly one clue. Nurikabe usually reads the
//   clue's printed value as that area's size, but every clue here is printed
//   "?" and the rules say "? is any number" -- so no area-size rule applies
//   in this instance; area size is unconstrained.
// - Place 2 stars in every unshaded region and in every row and column.
//   Stars sit on unshaded cells, never on a clue cell, and never touch
//   another star, including diagonally.
//
// Modelling: the main grid holds one value per cell -- SHADED, or the label
// (1-10) of the unshaded region the cell belongs to. The ten clue cells
// anchor the ten labels in reading order (top-to-bottom, left-to-right),
// which fixes the label<->clue correspondence outright and avoids the
// interchangeable-label symmetry a free labelling would add. A region's
// label class is tied into one connected piece by ConnectedValues, and an
// explicit Pair rule forces any two orthogonally-adjacent unshaded cells to
// share a label -- without it, two different labels could sit side by side
// while each still passes its own ConnectedValues, silently splitting one
// drawn island into two label classes.
//
// A second, same-shaped VS overlay holds star membership (NOT_STAR/STAR)
// per cell. Row and column star counts are a plain Sum over the overlay
// (2 stars <=> the row's ten NOT_STAR/STAR values sum to 12). A region's
// star count has no fixed cell list to Sum over -- the region's shape is
// itself part of the solution -- so it is read by one small NFA per label,
// scanning the whole board as interleaved (region label, star) pairs and
// counting STAR only where the label matches that NFA's own target.

const SHADED = 11;
const NOT_STAR = 1;
const STAR = 2;

const shape = new Shape('10x10', SHADED, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const stars = graph.makeOverlay('VS');

// Clue cells, row-major reading order (as drawn on the board). Built with
// makeCellId, not literal 'R#C#' strings: row/column 10 is 'a', not '10'.
const clueCells = [
  [1, 2], [1, 9], [3, 2], [4, 1], [4, 5],
  [4, 8], [5, 6], [6, 10], [7, 4], [10, 10],
].map(([row, col]) => makeCellId(row, col));
const UNSHADED_LABELS = clueCells.map((_, i) => i + 1);

// --- Clues: unshaded, each pinned to its own region label. ---
const clueGivens = clueCells.map((cell, i) => new Given(cell, i + 1));

// --- Region partition: shading plus each of the 10 labels is one
// connected, non-empty region (non-emptiness comes free from the clue
// Given above). ---
const connectivity = [
  new ConnectedValues('', SHADED),
  ...UNSHADED_LABELS.map(label => new ConnectedValues('', label)),
];

// One Pair per adjacent cell edge, translated across the grid/overlay with
// Replicate instead of stamped out by hand: for each direction, the
// template pair is built at the first in-grid position and Replicate
// translates it to every other position where that direction stays on the
// board.
function replicateDirectionalPairs(key, name, locator, directions) {
  return directions.map(([dRow, dCol]) => {
    const targets = locator.cells().filter(
      cell => locator.step(cell, dRow, dCol) !== null);
    const origin = targets[0];
    const neighbour = locator.step(origin, dRow, dCol);
    return new Replicate(
      [new Pair(key, name, origin, neighbour)],
      Replicate.encodeTargetCells(targets, origin, locator),
      origin);
  });
}

// Two orthogonally-adjacent unshaded cells must carry the same label --
// see the header note.
const labelsAgreeKey = Pair.fnToKey(
  (a, b) => a === SHADED || b === SHADED || a === b, shape);
const labelAgreement = replicateDirectionalPairs(
  labelsAgreeKey, 'label-agreement', graph, [[0, 1], [1, 0]]);

// --- No 2x2 block entirely shaded: at least one of the four cells carries
// an unshaded (non-SHADED) label. ---
const twoByTwoBlocks = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    twoByTwoBlocks.push(graph.block(makeCellId(r, c), 2, 2));
  }
}
const noFullyShaded2x2 = twoByTwoBlocks.map(
  block => new Or(block.map(cell => new Given(cell, ...UNSHADED_LABELS))));

// --- Star overlay domain: every VS cell is NOT_STAR or STAR. ---
const starDomain = stars.makeReplicate(
  new Given(stars.cells()[0], NOT_STAR, STAR));

// --- Stars never sit on a clue cell. ---
const starsAvoidClues = clueCells.map(
  cell => new Given(stars.at(cell), NOT_STAR));

// --- A star's cell is unshaded. ---
const starUnshadedKey = Pair.fnToKey(
  (g, s) => !(g === SHADED && s === STAR), shape);
const starsAreUnshaded = gridCells.map(
  cell => new Pair(starUnshadedKey, 'star-unshaded', cell, stars.at(cell)));

// --- Stars never touch, including diagonally (king adjacency: the four
// unordered directions right/down/down-right/down-left cover every edge
// once). ---
const starNoTouchKey = Pair.fnToKey(
  (a, b) => !(a === STAR && b === STAR), shape);
const starsDoNotTouch = replicateDirectionalPairs(
  starNoTouchKey, 'star-no-touch', stars,
  [[0, 1], [1, 0], [1, 1], [1, -1]]);

// --- 2 stars per row and per column. Ten NOT_STAR/STAR values sum to 12
// exactly when two of them are STAR (2) and eight are NOT_STAR (1). ---
const rowStarCounts = Array.from(
  { length: 10 }, (_, i) => new Sum(12, ...stars.row(i + 1)));
const colStarCounts = Array.from(
  { length: 10 }, (_, i) => new Sum(12, ...stars.column(i + 1)));

// --- 2 stars per unshaded region. One NFA per label scans the whole board
// as [label, star, label, star, ...] (reading order), counting STAR only
// while the just-read label matched this NFA's own target, and accepting
// only when that count is exactly 2. Count saturates at 3 so the machine
// stays small; matched resets every step. ---
function regionStarCountMachine(label) {
  const spec = {
    startState: { phase: 'label', matched: false, count: 0 },
    transition: ({ phase, matched, count }, value) => {
      if (phase === 'label') {
        return { phase: 'star', matched: value === label, count };
      }
      const hit = matched && value === STAR;
      return {
        phase: 'label', matched: false,
        count: Math.min(count + (hit ? 1 : 0), 3),
      };
    },
    accept: ({ phase, count }) => phase === 'label' && count === 2,
  };
  return NFA.encodeSpec(spec, geometry.numValues);
}
const regionStarSequence = gridCells.flatMap(cell => [cell, stars.at(cell)]);
const regionStarCounts = UNSHADED_LABELS.map(label => new NFA(
  regionStarCountMachine(label), `region-${label}-stars`,
  ...regionStarSequence));

return [
  shape,
  ...clueGivens,
  ...connectivity,
  ...labelAgreement,
  ...noFullyShaded2x2,
  stars.toVar('stars'),
  starDomain,
  ...starsAvoidClues,
  ...starsAreUnshaded,
  ...starsDoNotTouch,
  ...rowStarCounts,
  ...colStarCounts,
  ...regionStarCounts,
];
