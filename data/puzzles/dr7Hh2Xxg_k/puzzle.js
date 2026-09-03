// Title: Love Letter from Canada
// Author: SUDOOOOOKUfan87
// Video: https://www.youtube.com/watch?v=dr7Hh2Xxg_k
// Source: https://sudokupad.app/esjz6meusc

// Rules encoded here:
//   * Normal 9x9 sudoku. The grid has no givens.
//   * A path is drawn from R1C9 to R9C1. It moves orthogonally from cell to
//     cell and visits every 3x3 box.
//   * Digits in consecutive cells of the path differ by at least 4.
//   * Every cell is either island or water. R1C9 and R9C1 are the only island
//     cells on the path, so every other cell the path visits is water.
//   * Each of the nine lavender cells is an island cell, and the digit in it is
//     the number of cells in its island.
//   * A lavender island holds exactly one lavender cell; its digits do not
//     repeat and sum to the total printed on its lavender cell where one is
//     printed. R6C8's island total is a prime number.
//   * R1C9 (Canada) and R9C1 (Japan) are island cells carrying no lavender
//     cell, and the digits of their two islands have the same product.
//   * The digits on the flags carry no clue of their own -- unlike a lavender
//     cell, a flag cell's digit says nothing about its island -- so that
//     sentence adds no constraint.
//   * Different islands do not touch orthogonally.
//   * The water cells form one orthogonally connected region, and no 2x2 block
//     of the grid is entirely water.
// Nothing is omitted.
//
// Two readings the encoding commits to, both settled on the rules text:
//   * Every island is one of the eleven named above. "r1c9 (Canada) and r9c1
//     (Japan) are non-lavender island cells" is the sentence that carries this:
//     that they hold island cells is already given by "r1c9 and r9c1 are the
//     only island cells on the path", so the sentence does work only as the
//     exception to "an island holds one lavender cell", and only then does
//     "Both islands' digits ..." name a definite pair.
//   * The product runs over every cell of each of the two islands, the flag
//     cell included: the rules make R1C9 and R9C1 island cells, so their digits
//     are among "both islands' digits". "The digits on the flags are
//     inconsequential" says those digits are not themselves clues, the way a
//     lavender cell's digit is; it does not take them out of their island.
//
// Model: four Var overlays. VL names, per cell, the island that owns it or
// water; VD holds the direction of the path's next step out of the cell; VA and
// VB hold the path position modulo 8 and modulo 11.

// --- Value layout. The alphabet is widened to 12 so the overlays fit; grid
// cells are restricted back to 1-9 below.
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// VL: nine lavender islands, the two flag islands, and water.
const CANADA = 10, JAPAN = 11, WATER = 12;

// VD: the direction of the step leaving this cell along the path. END is the
// path's final cell, which is on the path but has no outgoing step.
const OFF = 1, NORTH = 2, EAST = 3, SOUTH = 4, WEST = 5, END = 6;
const STEPS = [[NORTH, -1, 0], [EAST, 0, 1], [SOUTH, 1, 0], [WEST, 0, -1]];
const OPPOSITE = { [NORTH]: SOUTH, [EAST]: WEST, [SOUTH]: NORTH, [WEST]: EAST };
const ON_PATH = [NORTH, EAST, SOUTH, WEST, END];

// VA/VB: position along the path modulo MOD, plus a sentinel for off-path
// cells. Coprime moduli whose lcm (88) exceeds the 81 cells of the grid.
const COUNTERS = [
  { prefix: 'VA', mod: 8 },
  { prefix: 'VB', mod: 11 },
];

const PATH_START = 'R1C9', PATH_END = 'R9C1';
const MIN_DIFFERENCE = 4;   // "a difference of at least 4"

// The nine lavender cells, in payload order, with the total printed on each.
// `PRIME` is the cell whose printed value reads "Prime".
const PRIME = 'prime';
const LAVENDER = [
  { cell: 'R3C1', total: null },
  { cell: 'R2C2', total: null },
  { cell: 'R7C9', total: null },
  { cell: 'R8C8', total: null },
  { cell: 'R4C2', total: 40 },
  { cell: 'R6C8', total: PRIME },
  { cell: 'R4C6', total: 11 },
  { cell: 'R7C5', total: 28 },
  { cell: 'R2C6', total: null },
];

const shape = new Shape('9x9', WATER);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const label = graph.makeOverlay('VL');
const step = graph.makeOverlay('VD');
const counters = COUNTERS.map(c => ({ ...c, overlay: graph.makeOverlay(c.prefix) }));

const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const sumOf = (values) => values.reduce((a, b) => a + b, 0);
// Every subset of 1-9, as the digit list it holds.
const DIGIT_SETS = [...Array(1 << DIGITS.length).keys()].map(
  mask => DIGITS.filter(d => mask & (1 << (d - 1))));

// How many cells a lavender island can hold. Its digits are distinct and drawn
// from 1-9, one of them is the cell count itself, and where a total is printed
// they sum to it -- so a size is possible exactly when some digit set witnesses
// all three at once.
const sizesFor = (total) => DIGITS.filter(size => DIGIT_SETS.some(set =>
  set.length === size && set.includes(size) &&
  (total === null ||
   (total === PRIME ? isPrime(sumOf(set)) : sumOf(set) === total))));

const distance = (a, b) => {
  const p = parseCellId(a), q = parseCellId(b);
  return Math.abs(p.row - q.row) + Math.abs(p.col - q.col);
};

// Which cells a lavender island could reach: it is orthogonally connected and
// holds its lavender cell, so a cell at distance d from it drags d+1 cells into
// the island and needs the island to be at least that big.
const islands = LAVENDER.map(({ cell, total }, i) => {
  const sizes = sizesFor(total);
  const reach = Math.max(...sizes) - 1;
  return {
    id: i + 1,
    anchor: cell,
    total,
    sizes,
    zone: gridCells.filter(c => distance(c, cell) <= reach),
  };
});

// --- Sudoku digits. The widened value range exists only for the overlays.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// --- Islands and water -------------------------------------------------------

// Each cell holds the label of the island that owns it, or water. A lavender
// island's label is confined to that island's own zone; the flag islands have
// no size clue, so theirs are not confined.
const anchored = new Map([
  ...islands.map(island => [island.anchor, island.id]),
  [PATH_START, CANADA], [PATH_END, JAPAN],
]);
const labelDomain = gridCells.map(cell => new Given(label.at(cell),
  ...(anchored.has(cell)
    ? [anchored.get(cell)]
    : [WATER, CANADA, JAPAN,
       ...islands.filter(i => i.zone.includes(cell)).map(i => i.id)])));

// One connected region per island, and one for the water.
const regions = [
  ...islands.map(island => new ConnectedValues('VL', island.id)),
  new ConnectedValues('VL', CANADA),
  new ConnectedValues('VL', JAPAN),
  new ConnectedValues('VL', WATER),
];

// Two orthogonal neighbours may not carry different island labels. With one
// connected region per label, this is what makes the eleven labelled regions
// the grid's islands rather than pieces of larger ones.
const noTouching = (() => {
  const key = Pair.fnToKey(
    (a, b) => a === WATER || b === WATER || a === b, geometry);
  const origin = gridCells[0];
  return [[0, 1], [1, 0]].map(([dR, dC]) => label.makeReplicate(
    new Pair(key, 'islands-apart',
      ...label.at([origin, graph.step(origin, dR, dC)])),
    label.at(gridCells.filter(cell => graph.step(cell, dR, dC)))));
})();

// No 2x2 block of water: reads the four labels of a block and rejects the
// block that never leaves water.
const noWaterSquare = (() => {
  const machine = NFA.encodeSpec({
    startState: { waters: 0 },
    transition: ({ waters }, value) => {
      const next = waters + (value === WATER ? 1 : 0);
      return next === 4 ? undefined : { waters: next };
    },
    accept: () => true,
  }, geometry);
  return label.makeReplicate(
    new NFA(machine, 'no-2x2-water', ...label.at(graph.block(gridCells[0], 2, 2))),
    label.at(gridCells.filter(cell => graph.block(cell, 2, 2))));
})();

// --- Lavender island contents ------------------------------------------------

// The lavender cell's digit is the island's cell count. The scan reads that
// digit first, then the label of every other cell of the zone, counting the
// ones the island claims; the lavender cell itself is the count's first cell.
const islandSizes = islands.map(island => {
  const machine = NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) {
        // The lavender cell holds a digit; the wider alphabet is the overlays'.
        return value > DIGITS.length ? undefined : { target: value, count: 1 };
      }
      const next = count + (value === island.id ? 1 : 0);
      return next > target ? undefined : { target, count: next };
    },
    accept: ({ target, count }) => target !== null && count === target,
  }, geometry);
  const rest = island.zone.filter(cell => cell !== island.anchor);
  return new NFA(machine, `island-${island.id}-size`,
    island.anchor, ...label.at(rest));
});

// The island's digits do not repeat, and where a total is printed they sum to
// it. The scan reads the zone as (label, digit) pairs and collects the island's
// digits as a 9-bit mask, which carries both the repeat check and the sum.
const islandDigits = islands.map(island => {
  const maxSize = Math.max(...island.sizes);
  const machine = NFA.encodeSpec({
    startState: { mask: 0, phase: 'label' },
    transition: ({ mask, phase }, value) => {
      if (phase === 'label') {
        return { mask, phase: value === island.id ? 'mine' : 'other' };
      }
      if (phase === 'other') return { mask, phase: 'label' };
      // Only a grid cell reaches this phase, and grid cells hold 1-9; the wider
      // alphabet belongs to the overlays.
      if (value > DIGITS.length) return undefined;
      const bit = 1 << (value - 1);
      if (mask & bit) return undefined;
      const next = mask | bit;
      if (DIGIT_SETS[next].length > maxSize) return undefined;
      return { mask: next, phase: 'label' };
    },
    accept: ({ mask, phase }) => {
      if (phase !== 'label') return false;
      if (island.total === null) return true;
      const total = sumOf(DIGIT_SETS[mask]);
      return island.total === PRIME ? isPrime(total) : total === island.total;
    },
  }, geometry);
  return new NFA(machine, `island-${island.id}-digits`,
    ...island.zone.flatMap(cell => [label.at(cell), cell]));
});

// The lavender digit is the island's size, so only a size the island can
// actually have is available to it.
const islandSizeDomain = islands.map(
  island => new Given(island.anchor, ...island.sizes));

// --- Equal products ----------------------------------------------------------

// Digits 1-9 factor over 2, 3, 5 and 7 alone, so two products are equal exactly
// when they agree in the exponent of each of those four primes. One machine per
// prime scans the grid as (label, digit) pairs and carries the running
// difference between the two islands' exponent totals, which must come back to
// zero.
const exponent = (prime, digit) => {
  let count = 0;
  while (digit % prime === 0) { digit /= prime; count++; }
  return count;
};
const productCells = gridCells;
const equalProducts = [2, 3, 5, 7].map(prime => {
  const machine = NFA.encodeSpec({
    startState: { diff: 0, phase: 'label' },
    transition: ({ diff, phase }, value) => {
      if (phase === 'label') {
        if (value === CANADA) return { diff, phase: 'canada' };
        if (value === JAPAN) return { diff, phase: 'japan' };
        return { diff, phase: 'other' };
      }
      if (phase === 'other') return { diff, phase: 'label' };
      if (value > DIGITS.length) return undefined;
      const delta = exponent(prime, value) * (phase === 'canada' ? 1 : -1);
      return { diff: diff + delta, phase: 'label' };
    },
    accept: ({ diff, phase }) => phase === 'label' && diff === 0,
    // Bounds the running difference, which is otherwise unbounded state.
    maxDepth: 2 * productCells.length,
  }, geometry);
  return new NFA(machine, `equal-product-${prime}`,
    ...productCells.flatMap(cell => [label.at(cell), cell]));
});

// --- The path ----------------------------------------------------------------

// Each cell records the direction of the path's next step out of it, so the
// route is a set of directed edges. A cell the route passes twice is not
// representable, which is the "path" of the rules: it is drawn once from R1C9
// to R9C1.
const stepDomain = gridCells.map(cell => {
  const available = STEPS
    .filter(([, dR, dC]) => graph.step(cell, dR, dC))
    .map(([direction]) => direction);
  if (cell === PATH_START) return new Given(step.at(cell), ...available);
  if (cell === PATH_END) return new Given(step.at(cell), END);
  return new Given(step.at(cell), OFF, ...available);
});

// The neighbours of a cell in a fixed direction order, so that a machine
// scanning them knows which direction each one lies in.
const orderedNeighbours = (cell) => STEPS
  .map(([direction, dR, dC]) => ({ direction, cell: graph.step(cell, dR, dC) }))
  .filter(entry => entry.cell);

// Every cell of the route is stepped into exactly once, except R1C9 where the
// route starts; cells off the route are stepped into not at all. The scan reads
// the cell's own direction, then each neighbour's: a neighbour lying to the
// north steps into this cell when its own direction is south.
const inDegrees = gridCells.map(cell => {
  const neighbours = orderedNeighbours(cell);
  const wanted = neighbours.map(entry => OPPOSITE[entry.direction]);
  const machine = NFA.encodeSpec({
    startState: { want: null, index: 0, count: 0 },
    transition: ({ want, index, count }, value) => {
      if (want === null) {
        return { want: cell === PATH_START || value === OFF ? 0 : 1, index: 0, count: 0 };
      }
      const next = count + (value === wanted[index] ? 1 : 0);
      return next > want ? undefined : { want, index: index + 1, count: next };
    },
    accept: ({ want, count }) => want !== null && count === want,
    maxDepth: 1 + neighbours.length,   // bounds the neighbour index
  }, geometry);
  return new NFA(machine, 'path-in-degree',
    ...step.at([cell, ...neighbours.map(entry => entry.cell)]));
});

// The route reaches every 3x3 box.
const boxVisits = (() => {
  const machine = NFA.encodeSpec({
    startState: { seen: false },
    transition: ({ seen }, value) => ({ seen: seen || value !== OFF }),
    accept: ({ seen }) => seen,
  }, geometry);
  return graph.boxes().map(
    (box, i) => new NFA(machine, `path-visits-box-${i + 1}`, ...step.at(box)));
})();

// Consecutive digits along the route differ by at least 4. The scan reads the
// cell's direction and digit, then its neighbours' digits in the same order, so
// only the neighbour the route steps into is compared.
const pathDifferences = gridCells.map(cell => {
  const neighbours = orderedNeighbours(cell);
  const directions = neighbours.map(entry => entry.direction);
  const machine = NFA.encodeSpec({
    startState: { phase: 'direction' },
    transition: (state, value) => {
      if (state.phase === 'direction') {
        return { phase: 'digit', direction: value };
      }
      if (state.phase === 'digit') {
        return { phase: 'neighbours', direction: state.direction, digit: value, index: 0 };
      }
      const stepped = state.direction === directions[state.index];
      if (stepped && Math.abs(state.digit - value) < MIN_DIFFERENCE) return undefined;
      return { ...state, index: state.index + 1 };
    },
    accept: ({ phase }) => phase === 'neighbours',
    maxDepth: 2 + neighbours.length,   // bounds the neighbour index
  }, geometry);
  return new NFA(machine, 'path-difference',
    step.at(cell), cell, ...neighbours.map(entry => entry.cell));
});

// A cell the route visits is water, except the two flag cells, which the rules
// put on the route as its only island cells.
const pathIsWater = (() => {
  const key = Pair.fnToKey((s, l) => s === OFF || l === WATER, geometry);
  return gridCells
    .filter(cell => cell !== PATH_START && cell !== PATH_END)
    .map(cell => new Pair(key, 'path-is-water', step.at(cell), label.at(cell)));
})();

// The route's cells form one orthogonally connected region.
const pathConnected = new ConnectedValues('VD', ON_PATH);

// Position along the route, modulo 8 and modulo 11. Stepping from one cell to
// the next advances the position by one in both, so a closed circuit of route
// cells would have to have a length divisible by both moduli; 88 exceeds the
// grid, so no such circuit exists and the route is the single path the rules
// draw. The two rules above -- one step out of each route cell, one step in --
// leave exactly that possibility open.
const positions = counters.flatMap(({ prefix, mod, overlay }) => {
  const sentinel = mod + 1;
  const domain = overlay.makeReplicate(
    new Given(overlay.cells()[0], ...[...Array(mod).keys()].map(i => i + 1), sentinel));
  const offKey = Pair.fnToKey(
    (s, position) => (s === OFF) === (position === sentinel), geometry);
  const offPath = gridCells.map(cell => new Pair(offKey, `${prefix}-off-path`,
    step.at(cell), overlay.at(cell)));
  const advances = gridCells.map(cell => {
    const neighbours = orderedNeighbours(cell);
    const directions = neighbours.map(entry => entry.direction);
    const machine = NFA.encodeSpec({
      startState: { phase: 'direction' },
      transition: (state, value) => {
        if (state.phase === 'direction') {
          return { phase: 'position', direction: value };
        }
        if (state.phase === 'position') {
          return { phase: 'neighbours', direction: state.direction, position: value, index: 0 };
        }
        const stepped = state.direction === directions[state.index];
        if (stepped && value !== (state.position % mod) + 1) return undefined;
        return { ...state, index: state.index + 1 };
      },
      accept: ({ phase }) => phase === 'neighbours',
      maxDepth: 2 + neighbours.length,   // bounds the neighbour index
    }, geometry);
    return new NFA(machine, `${prefix}-advance`, step.at(cell),
      ...overlay.at([cell, ...neighbours.map(entry => entry.cell)]));
  });
  // The route is numbered from its first cell; without this seam every rotation
  // of the numbering is a separate solution.
  const seam = new Given(overlay.at(PATH_START), 1);
  return [domain, seam, ...offPath, ...advances];
});

return [
  shape,
  label.toVar('island'),
  step.toVar('path step'),
  ...counters.map(({ overlay, mod }) => overlay.toVar(`path position mod ${mod}`)),
  digitDomain,
  ...labelDomain,
  ...regions,
  ...noTouching,
  noWaterSquare,
  ...islandSizeDomain,
  ...islandSizes,
  ...islandDigits,
  ...equalProducts,
  ...stepDomain,
  ...inDegrees,
  ...boxVisits,
  ...pathDifferences,
  ...pathIsWater,
  pathConnected,
  ...positions,
];
