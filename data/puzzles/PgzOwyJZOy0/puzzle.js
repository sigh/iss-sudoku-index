// Title: Beyond
// Author: MaizeGator
// Video: https://www.youtube.com/watch?v=PgzOwyJZOy0
// Source: https://sudokupad.app/kfzjh67o5i

// Rules encoded here:
//   * Normal sudoku.
//   * Nurikabe: some cells are shaded (water); all shaded cells form one
//     orthogonally-connected group, and no 2x2 area is entirely shaded.
//   * Orthogonally connected groups of unshaded cells are islands; two
//     different islands never touch orthogonally.
//   * Digits do not repeat on an island.
//   * Each island holds exactly one of the nine numbered clues, and that
//     clue equals (sum of the island's digits) x (number of cells in the
//     island). A '?' clue is unrestricted.
//   * A clued cell also holds an ordinary sudoku digit, which counts towards
//     its island's sum.
//   * Each arrow cell's digit is the number of unshaded cells lying along the
//     rays it points down, over all of its arrows combined, excluding itself.
//     An arrow cell may itself be shaded or unshaded.
// Nothing is omitted. "Not all arrows are given" states that the arrows are
// not exhaustive, so unmarked cells carry no counting rule.
//
// Model: one Var per grid cell (overlay VL) names the island that owns the
// cell, or WATER, so the shading and the island partition are a single per-cell
// choice. The value range is widened to hold those ten labels.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Transcribed from the drawn art. The nine numbers are text overlays, each
// sitting in the top-left corner of the cell named here (the same nine cells
// the payload marks with an empty pencil mark). The arrows are small glyphs
// drawn inside a cell; `dirs` lists the compass directions their tips point,
// as [dRow, dCol] steps.
const CLUES = [
  { cell: 'R1C3', value: 100 },
  { cell: 'R1C7', value: 100 },
  { cell: 'R3C2', value: 90 },
  { cell: 'R3C5', value: 72 },
  { cell: 'R3C8', value: 90 },
  { cell: 'R5C3', value: null },  // '?'
  { cell: 'R5C7', value: 60 },
  { cell: 'R9C3', value: null },  // '?'
  { cell: 'R9C7', value: 150 },
];
const ARROWS = [
  { cell: 'R1C1', dirs: [[0, 1]] },                                    // E
  { cell: 'R2C2', dirs: [[1, 1]] },                                    // SE
  { cell: 'R2C9', dirs: [[0, -1], [1, -1]] },                          // W SW
  { cell: 'R3C1', dirs: [[-1, 0], [1, 1]] },                           // N SE
  { cell: 'R4C9', dirs: [[0, -1], [1, -1]] },                          // W SW
  { cell: 'R6C5', dirs: [[0, -1], [-1, -1], [-1, 0], [0, 1], [1, 1]] },// W NW N E SE
  { cell: 'R7C3', dirs: [[-1, 0], [0, 1], [1, 0], [1, -1]] },          // N E S SW
  { cell: 'R7C7', dirs: [[0, -1], [1, 0]] },                           // W S
  { cell: 'R9C1', dirs: [[-1, 1]] },                                   // NE
];

// An island of n cells holds n distinct digits, so its digit sum lies between
// 1+..+n and 9+..+(10-n), and the printed clue is that sum times n. These are
// the (cells, sum) pairs a clue admits; a '?' admits every size.
const shapesFor = (value) => DIGITS.flatMap(n => {
  if (value === null) return [{ cells: n, sum: null }];
  if (value % n) return [];
  const sum = value / n;
  const feasible = sum >= (n * (n + 1)) / 2 && sum <= (n * (19 - n)) / 2;
  return feasible ? [{ cells: n, sum }] : [];
});
const islands = CLUES.map(clue => ({ ...clue, shapes: shapesFor(clue.value) }));

const WATER = islands.length + 1;  // labels 1..9 are the islands
const shape = new Shape(GRID, WATER);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const label = graph.makeOverlay('VL');

// Which cells an island can reach. Two facts the rules below already state
// bound it, so restricting the label to this zone only prunes:
//   * the island is connected and holds its own clue, so every one of its
//     cells is within (maxCells - 1) orthogonal steps of that clue;
//   * a cell that is another clue, or orthogonally adjacent to another clue,
//     is either shaded or part of that other island -- an unshaded cell
//     touching a different island's clue would join the two islands -- so no
//     route to this island's cells passes through one either.
const clueCells = new Set(islands.map(island => island.cell));
const maxCells = (island) => Math.max(...island.shapes.map(s => s.cells));
const zoneOf = (island) => {
  const limit = maxCells(island) - 1;
  const blocked = new Set(islands.flatMap(
    other => other === island ? []
      : [other.cell, ...graph.neighbours(other.cell)]));
  const seen = new Map([[island.cell, 0]]);
  const queue = [island.cell];
  for (const cell of queue) {
    const depth = seen.get(cell);
    if (depth === limit) continue;
    for (const next of graph.neighbours(cell)) {
      if (seen.has(next) || blocked.has(next)) continue;
      seen.set(next, depth + 1);
      queue.push(next);
    }
  }
  return [...seen.keys()];
};
const zones = islands.map(zoneOf);

// Grid cells hold digits; the widened value range exists only for the labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every cell carries exactly one label, so the islands and the water are a
// partition of the grid. A clued cell is pinned to its own island's label.
const labelDomain = gridCells.map(cell => new Given(
  label.at(cell),
  ...(clueCells.has(cell) ? [] : [WATER]),
  ...zones.flatMap((zone, i) => zone.includes(cell) ? [i + 1] : [])));

// Two orthogonally adjacent unshaded cells are in the same connected unshaded
// group, so they must carry the same island label. Together with one
// ConnectedValues per label -- and each label anchored on its own clue -- this
// makes the label classes exactly the islands, nine of them, one clue each.
const noTouchKey = Pair.fnToKey(
  (a, b) => a === WATER || b === WATER || a === b, geometry);
const noTouch = [
  ...DIGITS.map(n => new Pair(noTouchKey, 'islands-do-not-touch',
    ...label.row(n))),
  ...DIGITS.map(n => new Pair(noTouchKey, 'islands-do-not-touch',
    ...label.column(n))),
];

// The water is one region. It is never empty: the nine clues cap the total
// number of unshaded cells at 52, so at least 29 cells are shaded.
const connectivity = [
  new ConnectedValues('VL', WATER),
  ...islands.map((island, i) => new ConnectedValues('VL', i + 1)),
];

// No 2x2 area is entirely shaded.
const noWaterBlock = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => {
    const next = count + (value === WATER ? 1 : 0);
    return next === 4 ? undefined : next;
  },
  accept: () => true,
}, geometry);
const water2x2 = label.makeReplicate(
  new NFA(noWaterBlock, 'no-shaded-2x2',
    ...label.at(graph.block(gridCells[0], 2, 2))),
  label.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// The clue value, the island's cell count and "digits may not repeat on an
// island" are all functions of the set of digits the island holds, so one
// machine per island scans its zone as (label, digit) pairs and accumulates
// that set as a 9-bit mask. `reading` is true while the next value read is the
// digit belonging to the label just seen; `inIsland` says whether that label
// was this island's.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const sumOfMask = (mask) => digitsOfMask(mask).reduce((a, b) => a + b, 0);
// A partial digit set is still live while some admissible (cells, sum) pair
// can still accommodate it.
const liveMask = (island, mask) => island.shapes.some(
  s => digitsOfMask(mask).length <= s.cells &&
    (s.sum === null || sumOfMask(mask) <= s.sum));
const islandContents = islands.map((island, i) => {
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inIsland: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inIsland: value === i + 1 };
      }
      if (!state.inIsland) {
        return { mask: state.mask, reading: false, inIsland: false };
      }
      // Grid cells never exceed 9; the wider alphabet is only for labels.
      if (value > DIGITS.length) return undefined;
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;  // digits do not repeat
      const mask = state.mask | bit;
      if (!liveMask(island, mask)) return undefined;
      return { mask, reading: false, inIsland: false };
    },
    accept: (state) => {
      if (state.reading || !state.mask) return false;
      const digits = digitsOfMask(state.mask);
      const sum = digits.reduce((a, b) => a + b, 0);
      return island.value === null || sum * digits.length === island.value;
    },
  }, geometry);
  return new NFA(machine, `island-${i + 1}-clue`,
    ...zones[i].flatMap(cell => [label.at(cell), cell]));
});

// One machine per arrow cell: it reads the cell's own digit, then the labels of
// every cell along its rays, and counts the unshaded ones.
const arrowCounts = ARROWS.map((arrow, i) => {
  const machine = NFA.encodeSpec({
    startState: { digit: 0, count: 0 },
    transition: (state, value) => {
      if (!state.digit) return { digit: value, count: 0 };
      const count = state.count + (value === WATER ? 0 : 1);
      return count > state.digit ? undefined : { digit: state.digit, count };
    },
    accept: (state) => state.count === state.digit,
  }, geometry);
  const rays = arrow.dirs.flatMap(
    ([dR, dC]) => graph.ray(arrow.cell, dR, dC).slice(1));
  return new NFA(machine, `arrow-${i + 1}-count`,
    arrow.cell, ...label.at(rays));
});

return [
  shape,
  label.toVar('island'),
  digitDomain,
  ...labelDomain,
  ...noTouch,
  ...connectivity,
  water2x2,
  ...islandContents,
  ...arrowCounts,
];
