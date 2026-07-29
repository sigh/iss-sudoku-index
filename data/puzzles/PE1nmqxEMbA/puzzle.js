// Title: Fillomino sudoku
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=PE1nmqxEMbA
// Source: https://sudokupad.app/aae5b3ci1m

// Normal sudoku. Divide the grid into orthogonally connected regions. Every
// region contains at least one drawn circle; a circled digit equals its
// region's size. Distinct regions of the same size do not share an edge.
// Nothing is omitted.

const graph = cellGraph('9x9');
const cells = graph.cells();

// The 37 white circular underlays drawn behind these cells.
const CIRCLES = [
  'R1C9', 'R2C9', 'R3C9', 'R1C8', 'R1C6', 'R2C6', 'R2C5', 'R3C5',
  'R3C4', 'R3C6', 'R4C6', 'R4C7', 'R3C7', 'R4C8', 'R5C8', 'R5C7',
  'R6C9', 'R7C8', 'R8C9', 'R9C9', 'R7C7', 'R8C6', 'R8C5', 'R9C5',
  'R9C6', 'R5C5', 'R4C4', 'R4C3', 'R5C3', 'R5C2', 'R4C1', 'R3C2',
  'R2C3', 'R6C5', 'R6C4', 'R9C1', 'R9C2',
];
const circleIndex = new Map(CIRCLES.map((cell, index) => [cell, index]));

// The 37 possible root-circle labels are split over five overlays, eight
// labels per overlay. Value 9 is the marker meaning "this cell belongs to a
// region named on another overlay". Exactly one overlay names each cell.
const MARKER = 9;
const layers = ['VA', 'VB', 'VC', 'VE', 'VF'].map(
  prefix => graph.makeOverlay(prefix));
const distance = graph.makeOverlay('VD');
const size = graph.makeOverlay('VS');
const sideOf = index => Math.floor(index / 8);
const labelOf = index => index % 8 + 1;
const layerOf = index => layers[sideOf(index)];

const coords = cell => {
  const { row, col } = parseCellId(cell);
  return [row, col];
};
const manhattan = (a, b) => {
  const [aRow, aCol] = coords(a), [bRow, bCol] = coords(b);
  return Math.abs(aRow - bRow) + Math.abs(aCol - bCol);
};

// A circled digit is a region size, so every region has at most nine cells and
// every member is at most eight orthogonal steps from its root circle. A circle
// may join only an earlier circle's region, making the first circle canonical.
const rootsFor = cell => {
  const ownIndex = circleIndex.get(cell);
  return CIRCLES.filter((root, index) =>
    manhattan(cell, root) <= 8 &&
    (ownIndex === undefined || index <= ownIndex));
};
const membersFor = root =>
  cells.filter(cell => rootsFor(cell).includes(root));

const assignment = (cell, root) => {
  const index = circleIndex.get(root);
  return layers.map((layer, side) => new Given(
    layer.at(cell),
    side === sideOf(index) ? labelOf(index) : MARKER,
  ));
};

// Domains are scoped to root circles that a cell can reach.
const layerDomains = cells.flatMap(cell => {
  const roots = rootsFor(cell);
  return layers.map((layer, side) => {
    const values = roots.flatMap((root, index) => {
      const rootIndex = circleIndex.get(root);
      return sideOf(rootIndex) === side ? [labelOf(rootIndex)] : [];
    });
    return new Given(layer.at(cell), ...new Set([...values, MARKER]));
  });
});

// Exactly one of the five overlays carries a non-marker label at each cell.
const oneLabelSpec = NFA.encodeSpec({
  startState: { count: 0 },
  transition: (state, value) => {
    const count = state.count + (value === MARKER ? 0 : 1);
    return count <= 1 ? { count } : undefined;
  },
  accept: state => state.count === 1,
}, 9);
const oneLabel = cells.map(cell => new NFA(
  oneLabelSpec,
  'one region label',
  ...layers.map(layer => layer.at(cell)),
));

// A non-root cell has an orthogonal same-label neighbour whose distance is one
// smaller. Only the named circle has a distance-one branch, so following the
// strict descent proves that every label class is connected to its circle.
const distanceStep = Pair.fnToKey((from, to) => to === from - 1, 9);
const connectivity = cells.map(cell => new Or(rootsFor(cell).flatMap(root => {
  const index = circleIndex.get(root);
  const mine = layerOf(index);
  if (cell === root) {
    return [new And([
      ...assignment(cell, root),
      new Given(distance.at(cell), 1),
    ])];
  }
  const parents = graph.neighbours(cell)
    .filter(other => rootsFor(other).includes(root))
    .map(other => new And([
      new Given(mine.at(other), labelOf(index)),
      new Pair(
        distanceStep,
        'closer to region root',
        distance.at(cell),
        distance.at(other),
      ),
    ]));
  return parents.length ? [new And([
    ...assignment(cell, root),
    new Or(parents),
  ])] : [];
})));

// Every cell copies the Sudoku digit at its named circle.
const sizeCopies = cells.map(cell => new Or(
  rootsFor(cell).map(root => new And([
    ...assignment(cell, root),
    new SameValues(2, size.at(cell), root),
  ]))));

// For one root label and possible size k, count exactly k cells carrying that
// label on its overlay. The same compact machine is reusable across roots.
const countSpecs = new Map();
const countSpec = (label, target) => {
  const key = label + ':' + target;
  if (!countSpecs.has(key)) {
    countSpecs.set(key, NFA.encodeSpec({
      startState: { count: 0 },
      transition: (state, value) => {
        const count = state.count + (value === label ? 1 : 0);
        return count <= target ? { count } : undefined;
      },
      accept: state => state.count === target,
    }, 9));
  }
  return countSpecs.get(key);
};

const rootSizes = CIRCLES.map(root => {
  const index = circleIndex.get(root);
  const layer = layerOf(index);
  const label = labelOf(index);
  const candidates = membersFor(root);
  const inactiveValues = Array.from({ length: 9 }, (_, i) => i + 1)
    .filter(value => value !== label);
  const branches = [new Given(layer.at(root), ...inactiveValues)];
  for (let target = 1; target <= 9; target++) {
    branches.push(new And([
      new Given(layer.at(root), label),
      new Given(size.at(root), target),
      new NFA(
        countSpec(label, target),
        'region size',
        ...layer.at(candidates),
      ),
    ]));
  }
  return new Or(branches);
});

// Two orthogonally adjacent cells have equal sizes exactly when the same
// non-marker value names them on the same overlay. Thus two distinct regions
// of equal size cannot share an edge.
const edgeSpec = NFA.encodeSpec({
  startState: { phase: 'a', same: false, side: 0 },
  transition: (state, value) => {
    if (state.phase === 'a') {
      return { phase: 'b', same: state.same, side: state.side, a: value };
    }
    if (state.phase === 'b') {
      const same = state.same || (state.a !== MARKER && value === state.a);
      const side = state.side + 1;
      return side === layers.length
        ? { phase: 'sizeA', same }
        : { phase: 'a', same, side };
    }
    if (state.phase === 'sizeA') {
      return { phase: 'sizeB', same: state.same, size: value };
    }
    if (state.phase === 'sizeB') {
      return (value === state.size) === state.same
        ? { phase: 'done' }
        : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, 9);
const regionEdges = cells.flatMap(cell => [[0, 1], [1, 0]].flatMap(
  ([dRow, dCol]) => {
    const other = graph.step(cell, dRow, dCol);
    return other ? [new NFA(
      edgeSpec,
      'same-size region edge',
      ...layers.flatMap(layer => [layer.at(cell), layer.at(other)]),
      size.at(cell),
      size.at(other),
    )] : [];
  }));

return [
  new Shape('9x9'),
  ...layers.map((layer, index) => layer.toVar('region labels ' + (index + 1))),
  distance.toVar('distance from region root'),
  size.toVar('region size'),
  ...layerDomains,
  ...oneLabel,
  ...connectivity,
  ...sizeCopies,
  ...rootSizes,
  ...regionEdges,
  // A circled digit equals the copied size of its region.
  ...CIRCLES.map(circle => new SameValues(2, circle, size.at(circle))),
];
