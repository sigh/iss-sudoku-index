// Title: Through the Comet's Eye
// Author: Secret Santa
// Video: https://www.youtube.com/watch?v=A7CPYMUnafw
// Source: https://sudokupad.app/6xsugxgm9r

// Normal Sudoku (default row/column/box all-different) plus:
//
// Resonance -> AntiKnight: identical digits may not be a knight's move apart.
//
// Star Battle -> a hidden per-cell "is this a star" flag (the VS overlay,
// value 1 = no star, 2 = star). Exactly two stars per row/column/box
// (ContainExact), and no two stars touch orthogonally or diagonally
// (king-move Pair over the flags). "Stars also contain digits and behave as
// normal Sudoku cells" is not an extra constraint: stars are just a marked
// subset of the same 81 cells, already bound by ordinary Sudoku/AntiKnight
// rules regardless of star status.
//
// Habitable Zone -> for every orthogonal edge: either neither cell is a star,
// or the pair's digits differ by >= 3. Sound (not just sufficient) because
// the no-touch rule above already forbids both cells of one orthogonal edge
// being stars at once, so this covers "if either is a star" exactly.
//
// Comets -> 12 little-killer diagonals (read from the drawn outside
// arrows/badges; five share the "0" sum and one off-grid anchor point serves
// two of them) that total only the digits of cells that turn out to be
// stars. Encoded as one NFA per diagonal scanning interleaved [flag, digit]
// pairs along the diagonal and accumulating the digit only when its flag
// reads "star".

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const NOT_STAR = 1;
const STAR = 2;

const star = graph.makeOverlay('VS');
const starAt = cell => star.at(cell);

// Every star-flag cell is either NOT_STAR or STAR.
const firstStar = star.cells()[0];
const starDomain = star.makeReplicate(
  new Given(firstStar, NOT_STAR, STAR));

// Star Battle: exactly two stars per row/column/box.
const starCount = graph.houses().map(
  house => new ContainExact(`${STAR}_${STAR}`, ...star.at(house)));

// Star Battle: no two stars touch orthogonally or diagonally (king-move).
const noTouchKey = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), 9);
const seenTouch = new Set();
const noTouchPairs = [];
for (const cell of gridCells) {
  for (const nb of graph.kingNeighbours(cell)) {
    const key = [cell, nb].sort().join('_');
    if (seenTouch.has(key)) continue;
    seenTouch.add(key);
    noTouchPairs.push([cell, nb]);
  }
}
const noTouchSpecs = [
  { offset: [0, 1], template: ['R1C1', 'R1C2'], anchor: ([a]) => a },
  { offset: [1, -1], template: ['R1C2', 'R2C1'], anchor: ([a]) => graph.step(a, 0, -1) },
  { offset: [1, 0], template: ['R1C1', 'R2C1'], anchor: ([a]) => a },
  { offset: [1, 1], template: ['R1C1', 'R2C2'], anchor: ([a]) => a },
];
const noTouch = noTouchSpecs.map(({ offset: [dRow, dCol], template, anchor }) => {
  const pairs = noTouchPairs.filter(([a, b]) => {
    const from = parseCellId(a), to = parseCellId(b);
    return to.row - from.row === dRow && to.col - from.col === dCol;
  });
  const [origin, adjacent] = template;
  const constraint = new Pair(
    noTouchKey, 'Star Battle: no touch', starAt(origin), starAt(adjacent));
  return star.makeReplicate(constraint, pairs.map(pair => starAt(anchor(pair))));
});

// Habitable Zone: every orthogonal edge either has no star, or differs by >= 3.
const diffKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 3, 9);
const seenEdge = new Set();
const habitableZone = [];
for (const cell of gridCells) {
  for (const nb of graph.neighbours(cell)) {
    const key = [cell, nb].sort().join('_');
    if (seenEdge.has(key)) continue;
    seenEdge.add(key);
    habitableZone.push(new Or([
      new And([
        new Given(starAt(cell), NOT_STAR),
        new Given(starAt(nb), NOT_STAR),
      ]),
      new Pair(diffKey, 'Habitable Zone', cell, nb),
    ]));
  }
}

// Comets: each entry is the on-grid cell nearest the drawn arrow/badge, and
// the step direction continuing further into the grid, derived from the
// drawn arrow and sum-badge positions outside the grid.
const comets = [
  { cell: 'R9C8', dir: [-1, -1], sum: 5 },
  { cell: 'R3C1', dir: [1, 1], sum: 15 },
  { cell: 'R9C6', dir: [-1, -1], sum: 2 },
  { cell: 'R8C1', dir: [-1, 1], sum: 21 },
  { cell: 'R9C3', dir: [-1, -1], sum: 3 },
  { cell: 'R5C1', dir: [-1, 1], sum: 14 },
  { cell: 'R5C9', dir: [-1, -1], sum: 7 },
  { cell: 'R4C9', dir: [1, -1], sum: 0 },
  { cell: 'R2C9', dir: [-1, -1], sum: 0 },
  { cell: 'R1C6', dir: [1, -1], sum: 0 },
  { cell: 'R1C9', dir: [1, -1], sum: 0 },
  { cell: 'R1C3', dir: [1, -1], sum: 0 },
];

// Scans [flag1, digit1, flag2, digit2, ...] along a diagonal, adding digit_i
// to the running sum only when flag_i reads STAR. Ends back in 'flag' phase
// after the last digit, so accept just checks the final sum. The running sum
// is clamped at target+1 (a sink meaning "already too high") to bound the
// compiled state count; maxDepth bounds it against the longest diagonal (9
// cells = 18 scanned [flag, digit] steps).
function cometMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'flag', sum: 0, pendingStar: false },
    transition: ({ phase, sum, pendingStar }, value) => {
      if (phase === 'flag') {
        return { phase: 'digit', sum, pendingStar: value === STAR };
      }
      const added = pendingStar ? value : 0;
      return { phase: 'flag', sum: Math.min(sum + added, target + 1), pendingStar: false };
    },
    accept: ({ phase, sum }) => phase === 'flag' && sum === target,
    maxDepth: 18,
  }, geometry.numValues);
}

const cometClues = comets.map(({ cell, dir, sum }, i) => {
  const line = graph.ray(cell, dir[0], dir[1]);
  const cells = line.flatMap(c => [starAt(c), c]);
  return new NFA(cometMachine(sum), `comet-${i + 1}`, ...cells);
});

return [
  new Shape('9x9'),
  new AntiKnight(),
  star.toVar('star'),
  starDomain,
  ...starCount,
  ...noTouch,
  ...habitableZone,
  ...cometClues,
];
