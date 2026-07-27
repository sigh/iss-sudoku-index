// Title: Non-Consecutive Territories
// Author: masetab
// Video: https://www.youtube.com/watch?v=P6HoizVAU4c
// Source: https://sudokupad.app/h63cv2l7tp

// Rules encoded:
//   Latin square: each digit 1-9 once per row and column, no boxes.
//   Every cell outside a cage belongs to exactly one region of orthogonally
//   connected cells. Each region contains exactly one circle, and the digit in
//   that circle is the number of cells in the region.
//   No digit repeats within a cage or within a region, and no two digits
//   within a cage or within a region are consecutive.
//   White dot: the two digits are consecutive.
//   Blue dot: the two cells lie in different regions.
//   V: the two digits sum to 5.
//   Dots and symbols are not exhaustive, so no negative rule is added.
//   The outside arrow gives the sum of the digits along its diagonal.
// Nothing is omitted.

// The regions are unknown, so every cell carries a region label in a Var
// overlay and each label class is held together by a ConnectedValues.
// ConnectedValues needs one value per region, and 19 regions plus a marker
// value exceed the 16-value alphabet limit, so the labels are split over two
// overlays: 'VA' names the regions of the first nine circles and 'VB' those of
// the other ten. A cell named by one overlay takes that overlay's label and
// the other overlay's marker value, which carries no connectivity constraint.
const A_LABELS = 9;                 // circles 0..8 are labelled on VA
const A_OTHER = A_LABELS + 1;       // VA: this cell's region is not a VA one
const B_LABELS = 10;                // circles 9..18 are labelled on VB
const B_OTHER = B_LABELS + 1;       // VB: this cell's region is not a VB one

// A region's digits are distinct and pairwise non-consecutive, so the largest
// legal set is {1,3,5,7,9}: no region holds more than 5 cells, hence no cell
// is more than 4 steps from its own circle.
const MAX_REGION = 5;

const shape = new Shape('9x9', B_OTHER);
const geometry = cellGeometry(shape);
const graph = cellGraph(geometry);
const layerA = graph.makeOverlay('VA');
const layerB = graph.makeOverlay('VB');

// Drawn data. The circles are the 19 white disks drawn behind cells; the cages
// are the four dashed outlines; the dots, the V and the diagonal total are the
// drawn symbols.
const circles = [
  'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2', 'R1C6', 'R1C8', 'R2C9',
  'R3C6', 'R4C8', 'R5C5', 'R5C1', 'R7C3', 'R8C4', 'R9C4', 'R9C5', 'R7C7',
  'R6C9',
];
const cages = [['R8C6'], ['R4C3'], ['R7C5'], ['R5C6', 'R5C7', 'R6C7']];
const whiteDots = [['R1C3', 'R2C3'], ['R2C7', 'R2C8'], ['R8C3', 'R9C3']];
const blueDots = [['R6C1', 'R7C1'], ['R8C2', 'R8C3'], ['R7C8', 'R8C8']];
const vPairs = [['R6C7', 'R6C8']];
// The arrowhead sits outside the grid on the line row + col = 3, and its "7"
// badge lies on that same line one step further out; the line runs through the
// centres of R2C1 and R1C2 and no other cell.
const diagonalCells = ['R2C1', 'R1C2'];
const diagonalTotal = 7;

// Which overlay and which value name the region of circle `index`.
const overlayOf = index => (index < A_LABELS ? layerA : layerB);
const labelOf = index => (index < A_LABELS ? index + 1 : index - A_LABELS + 1);
const markerOf = index => (index < A_LABELS ? A_OTHER : B_OTHER);

const cageCells = new Set(cages.flat());
const freeCells = graph.cells().filter(cell => !cageCells.has(cell));

// Step distances between cells that never cross a cage, since a region is
// connected and holds no cage cell.
const dists = new Map(freeCells.map(cell => {
  const dist = new Map([[cell, 0]]);
  const queue = [cell];
  for (let i = 0; i < queue.length; i++) {
    const d = dist.get(queue[i]);
    for (const next of graph.neighbours(queue[i])) {
      if (cageCells.has(next) || dist.has(next)) continue;
      dist.set(next, d + 1);
      queue.push(next);
    }
  }
  return [cell, dist];
}));
const distance = (a, b) => dists.get(a).get(b);

// Smallest connected cell set holding all three cells: for three terminals it
// is a meeting point plus three shortest paths.
const steiner = (a, b, c) => 1 + Math.min(...freeCells.map(
  meet => distance(a, meet) + distance(b, meet) + distance(c, meet)));

// Cells that could carry each circle's label, and the circles that could claim
// each cell. Both follow from the region size limit above; they only scope the
// constraints to the cells that can be involved.
const reach = circles.map(
  circle => freeCells.filter(cell => distance(circle, cell) < MAX_REGION));
const candidates = new Map(freeCells.map(cell => [cell, []]));
reach.forEach(
  (cells, i) => cells.forEach(cell => candidates.get(cell).push(i)));
circles.forEach((cell, i) => candidates.set(cell, [i]));

function overlayDomain(cell, isLayerA) {
  const marker = isLayerA ? A_OTHER : B_OTHER;
  if (cageCells.has(cell)) return [marker];
  const mine = candidates.get(cell).filter(i => (i < A_LABELS) === isLayerA);
  return mine.length === candidates.get(cell).length
    ? mine.map(labelOf)
    : [...mine.map(labelOf), marker];
}

// A cell's region is named by exactly one of the two overlays.
const oneLabel = Pair.fnToKey(
  (a, b) => (a < A_OTHER) !== (b < B_OTHER), shape);

// Region size: read the circled digit from the first segment, then count the
// cells carrying this region's label in the second.
function regionSizeMachine(label) {
  return NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (value === SEGMENT_BREAK) return { target, count };
      if (target === null) return { target: value, count: 0 };
      const next = count + (value === label ? 1 : 0);
      return next > target ? undefined : { target, count: next };
    },
    accept: ({ target, count }) => count === target,
  }, shape, { multiSegment: true });
}

// Scans [label(x), label(y), digit(x), digit(y)] for one pair of cells. Equal
// labels other than the marker mean one region, and then the two digits must
// differ by at least 2 -- which forbids both a repeat and a consecutive pair.
// Unequal labels leave the pair unconstrained.
function sharedRegionMachine(marker) {
  return NFA.encodeSpec({
    startState: { phase: 'labelX' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'labelX':
          return { phase: 'labelY', label: value };
        case 'labelY':
          return (value === state.label && value !== marker)
            ? { phase: 'digitX' } : { phase: 'done' };
        case 'digitX':
          return { phase: 'digitY', digit: value };
        case 'digitY':
          return Math.abs(value - state.digit) >= 2
            ? { phase: 'done' } : undefined;
        default:
          return { phase: 'done' };
      }
    },
    accept: () => true,
  }, shape);
}
const sharedRegion = new Map(
  [A_OTHER, B_OTHER].map(marker => [marker, sharedRegionMachine(marker)]));

const regionSizes = circles.map((circle, i) => new NFA(
  regionSizeMachine(labelOf(i)), `region-size-${i + 1}`,
  [circle], overlayOf(i).at(reach[i])));

// One pair constraint per overlay per cell pair that some region could hold:
// the pair must fit with a circle inside MAX_REGION connected cells.
const regionDigits = freeCells.flatMap((x, i) => freeCells.slice(i + 1)
  .filter(y => distance(x, y) < MAX_REGION)
  .flatMap(y => {
    const shared = circles.flatMap(
      (circle, k) => (steiner(circle, x, y) <= MAX_REGION ? [k] : []));
    return [layerA, layerB].flatMap((layer, side) => {
      const marker = side === 0 ? A_OTHER : B_OTHER;
      const onSide = shared.some(k => (k < A_LABELS) === (side === 0));
      return onSide
        ? [new NFA(sharedRegion.get(marker), 'region-digits',
          layer.at(x), layer.at(y), x, y)]
        : [];
    });
  }));

// What a region can hold, given its circle's digit. A region of size t holds
// t distinct pairwise non-consecutive digits, one of which is t itself, so a
// cell d steps from the circle needs t >= d + 1 and its digit must fit into
// such a set alongside t (for t = 5 the only set is {1,3,5,7,9}). All of this
// follows from the rules already encoded above, but without it the search
// takes several times as many backtracks.
const antichains = [];
(function collect(chosen, next) {
  if (chosen.length) antichains.push(chosen);
  for (let v = next; v <= 9; v++) collect([...chosen, v], v + 2);
})([], 1);
const fitsRegion = (size, digit, other) => antichains.some(
  set => set.length === size && set.includes(digit) && set.includes(other));

const regionFitKeys = new Map();
function regionFitMachine(label, minSize) {
  const id = `${label}:${minSize}`;
  if (!regionFitKeys.has(id)) {
    // Scans [label(x), digit(circle), digit(x)].
    regionFitKeys.set(id, NFA.encodeSpec({
      startState: { phase: 'label' },
      transition: (state, value) => {
        switch (state.phase) {
          case 'label':
            return value === label ? { phase: 'size' } : { phase: 'done' };
          case 'size':
            return value >= minSize
              ? { phase: 'digit', size: value } : undefined;
          case 'digit':
            return fitsRegion(state.size, state.size, value)
              ? { phase: 'done' } : undefined;
          default:
            return { phase: 'done' };
        }
      },
      accept: () => true,
    }, shape));
  }
  return regionFitKeys.get(id);
}
const regionFits = circles.flatMap((circle, i) => reach[i]
  .filter(cell => cell !== circle)
  .map(cell => new NFA(
    regionFitMachine(labelOf(i), distance(circle, cell) + 1), 'region-fits',
    overlayOf(i).at(cell), circle, cell)));

// Cages: the same digit rule as regions, over every pair of cells in a cage.
const nonConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) >= 2, shape);
const cageDigits = cages.flatMap(cells => cells.flatMap((a, i) =>
  cells.slice(i + 1).map(
    b => new Pair(nonConsecutive, 'no-consecutive', a, b))));

// Two cells share a region exactly when they carry the same label on the same
// overlay, so "different regions" is one such test per overlay.
const differentRegion = marker => Pair.fnToKey(
  (a, b) => a !== b || a === marker, shape);
const differentA = differentRegion(A_OTHER);
const differentB = differentRegion(B_OTHER);

// Also redundant: the 19 regions tile the cells outside the cages, so the
// circled digits total that many cells, and none of them exceeds MAX_REGION.
const regionTotals = [
  new Sum(freeCells.length, ...circles),
  ...circles.map(circle => new Given(circle, 1, 2, 3, 4, 5)),
];

return [
  shape,
  new NoBoxes(),
  layerA.toVar('region A'),
  layerB.toVar('region B'),
  // The alphabet is widened for the region labels; playable cells stay 1-9.
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...graph.cells().flatMap(cell => [
    new Given(layerA.at(cell), ...overlayDomain(cell, true)),
    new Given(layerB.at(cell), ...overlayDomain(cell, false)),
  ]),
  ...freeCells.map(
    cell => new Pair(oneLabel, 'one-label', layerA.at(cell), layerB.at(cell))),
  // Each region is a single orthogonally connected group of cells.
  ...circles.map(
    (_, i) => new ConnectedValues(i < A_LABELS ? 'VA' : 'VB', labelOf(i))),
  ...regionSizes,
  ...regionDigits,
  ...regionFits,
  ...regionTotals,
  ...cageDigits,
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blueDots.flatMap(([a, b]) => [
    new Pair(differentA, 'different-region', layerA.at(a), layerA.at(b)),
    new Pair(differentB, 'different-region', layerB.at(a), layerB.at(b)),
  ]),
  ...vPairs.map(([a, b]) => new V(a, b)),
  LittleKiller.fromCells(diagonalTotal, diagonalCells, geometry),
  // Branching on digits ahead of region labels; the labels then follow from
  // them far more often than the reverse. Correctness-neutral.
  new SearchPriority(1, ...graph.cells()),
];
