// Title: Chaos Construction: Disconnected (6x6)
// Author: KNT
// Video: https://www.youtube.com/watch?v=08QYLWWqJaI
// Source: https://sudokupad.app/jgdFdqhmn2

// Rules encoded here:
//   Place 1-6 once in every row, column and region. The six regions are located
//   by the solver; the cells of a region are connected orthogonally OR
//   diagonally (i.e. by king moves).
//   A number in the top left corner of a cell is the sum of the digits in the
//   orthogonally connected section of the region that cell belongs to. The four
//   drawn numbers are 17 at R1C1, 10 at R1C3, 8 at R2C1 and 14 at R2C6.
//   A cell with a red X in the bottom right corner indicates the size (the
//   number of cells) of the orthogonally connected section of the region that
//   cell belongs to: the marked cell's own digit is that size. The red X carries
//   no number of its own -- it is the cell, not the mark, that "indicates the
//   size", exactly as it is the number, not the cell, that indicates the sum in
//   the sentence above. The two marks are drawn at R2C4 and R4C1.
//   All possible size clues are given, so no unmarked cell's digit equals the
//   size of its own section.
//
// The only other drawn entries are the black ring on the grid border and a white
// background rectangle over the whole grid; neither is a clue.
//
// "Section" below is short for "the orthogonally connected section of a region":
// a region splits into one or more of them and every cell lies in exactly one.
//
// The auxiliary layers are all functions of the finished grid, so the solver has
// no freedom in them beyond the grid itself: the region labels are fixed in
// row-major order of first appearance, and each other layer is defined by a
// minimum, a distance, or a count.

const shape = new Shape('6x6');
const graph = cellGraph(shape);

// The drawn corner clues: top-left numbers, then the bottom-right red Xs.
const SECTION_SUMS = [['R1C1', 17], ['R1C3', 10], ['R2C1', 8], ['R2C6', 14]];
const MARKED_CELLS = ['R2C4', 'R4C1'];

// One region label per grid cell. The labels are this script's own names for the
// six regions, not something the puzzle draws.
const region = graph.makeOverlay('VR');
// King-move distance within its own region from the region's digit-1 cell,
// counted from 1 at that cell.
const regionDepth = graph.makeOverlay('VD');
// The smallest digit in the cell's section, which names that section within its
// region because a region holds each digit once.
const sectionMin = graph.makeOverlay('VE');
// Orthogonal distance within its own section from the section's smallest-digit
// cell, counted from 1 at that cell.
const sectionDepth = graph.makeOverlay('VF');
// The number of cells in the cell's section.
const sectionSize = graph.makeOverlay('VS');
// digitLabel.cell(v, c) is the region label of the cell holding digit v in
// column c. Every column holds each digit exactly once, so this names one cell
// per (digit, column) pair and every grid cell is named exactly once.
const digitLabel = new Var('L', 'region label by digit and column', '6x6');

const sameValue = Pair.fnToKey((a, b) => a === b, shape);
// Read over [a cell's depth, a neighbour's depth]: the neighbour is one step
// closer to the root the depth counts from.
const parentDepth = Pair.fnToKey((a, b) => b === a - 1, shape);
// Read over [a cell's digit, its section's smallest digit].
const atLeastMin = Pair.fnToKey((a, b) => b <= a, shape);

const orthogonalEdges = graph.cells().flatMap(
  cell => graph.neighbours(cell).filter(other => other > cell).map(
    other => [cell, other]));
const kingEdges = graph.cells().flatMap(
  cell => graph.kingNeighbours(cell).filter(other => other > cell).map(
    other => [cell, other]));

// Each region holds each digit once.
// Cell sequence [region label, digit, digitLabel(1..6, column)]: after reading
// the cell's label L and digit d, count down d entries and require the d-th to
// be L. So the (digit, column) name of this cell carries this cell's label.
const labelLinkNFA = NFA.encodeSpec({
  startState: { phase: 'label' },
  transition(state, value) {
    switch (state.phase) {
      case 'label':
        return { phase: 'digit', label: value };
      case 'digit':
        return { phase: 'scan', label: state.label, remaining: value };
      case 'scan':
        if (state.remaining > 1) {
          return { phase: 'scan', label: state.label, remaining: state.remaining - 1 };
        }
        return value === state.label ? { phase: 'done' } : undefined;
      case 'done':
        return state;
    }
  },
  accept: (state) => state.phase === 'done',
}, shape);

const labelLinks = graph.cells().map(cell => new NFA(
  labelLinkNFA, 'digit label', region.at(cell), cell,
  ...[1, 2, 3, 4, 5, 6].map(digit => digitLabel.cell(digit, parseCellId(cell).col))));

// ... and the six cells naming one digit carry six different labels, so that
// digit appears once per region. Each label therefore covers exactly six cells.
const digitsPerRegion = [1, 2, 3, 4, 5, 6].map(digit => new AllDifferent(
  ...[1, 2, 3, 4, 5, 6].map(col => digitLabel.cell(digit, col))));

// Relabelling the six regions leaves the puzzle unchanged, so the labels are
// fixed to appear in row-major order of first appearance.
const canonicalLabels = new NFA(
  NFA.encodeSpec({
    startState: 0,
    transition: (highest, value) => {
      if (value <= highest) return highest;
      return value === highest + 1 ? value : undefined;
    },
    accept: () => true,
  }, shape),
  'label order', ...region.cells());

// Two neighbours of the same region agree on a value carried by the whole
// section. Cell sequence [label of a, label of b, value of a, value of b].
const agreeInRegionNFA = NFA.encodeSpec({
  startState: { phase: 'labelA' },
  transition(state, value) {
    switch (state.phase) {
      case 'labelA': return { phase: 'labelB', label: value };
      case 'labelB': return { phase: 'valueA', together: value === state.label };
      case 'valueA':
        return state.together
          ? { phase: 'valueB', value } : { phase: 'valueB', value: null };
      case 'valueB':
        return (state.value === null || state.value === value)
          ? { phase: 'done' } : undefined;
      case 'done': return state;
    }
  },
  accept: (state) => state.phase === 'done',
}, shape);

// Two neighbours of the same region hold depths differing by at most one. With
// the parent step below, that makes a depth the true distance from its root, so
// the layer holds one value per grid rather than one per spanning tree.
// Cell sequence [label of a, label of b, depth of a, depth of b].
const depthStepNFA = NFA.encodeSpec({
  startState: { phase: 'labelA' },
  transition(state, value) {
    switch (state.phase) {
      case 'labelA': return { phase: 'labelB', label: value };
      case 'labelB': return { phase: 'depthA', together: value === state.label };
      case 'depthA':
        return state.together
          ? { phase: 'depthB', depth: value } : { phase: 'depthB', depth: null };
      case 'depthB':
        return (state.depth === null || Math.abs(state.depth - value) <= 1)
          ? { phase: 'done' } : undefined;
      case 'done': return state;
    }
  },
  accept: (state) => state.phase === 'done',
}, shape);

// Regions are king-connected: each region's digit-1 cell is its root at depth 1,
// and every other cell of the region has a king neighbour in the same region one
// depth closer to the root. A cell at depth 1 has no such neighbour available,
// so only the digit-1 cell can sit there.
const regionConnected = graph.cells().map(cell => new Or([
  new And([new Given(cell, 1), new Given(regionDepth.at(cell), 1)]),
  ...graph.kingNeighbours(cell).map(neighbour => new And([
    new Pair(sameValue, 'same region', region.at(cell), region.at(neighbour)),
    new Pair(parentDepth, 'region parent', regionDepth.at(cell), regionDepth.at(neighbour))])),
]));

const regionDepthSteps = kingEdges.map(([a, b]) => new NFA(
  depthStepNFA, 'region depth step',
  region.at(a), region.at(b), regionDepth.at(a), regionDepth.at(b)));

// A section is a set of cells of one region joined orthogonally, so orthogonal
// neighbours in the same region belong to the same section and name it the same
// way; and the name is the section's smallest digit, at or below every member's
// own digit.
const sectionAgreement = orthogonalEdges.map(([a, b]) => new NFA(
  agreeInRegionNFA, 'one section',
  region.at(a), region.at(b), sectionMin.at(a), sectionMin.at(b)));

const sectionMinIsSmallest = graph.cells().map(cell => new Pair(
  atLeastMin, 'section minimum', cell, sectionMin.at(cell)));

// The cell whose digit is that smallest digit roots the section at depth 1, and
// every other member reaches it through orthogonal neighbours of the same
// region, one depth closer at each step. So the cells sharing a region label and
// a section name are orthogonally connected, i.e. they are a whole section.
const sectionConnected = graph.cells().map(cell => new Or([
  new And([
    new Pair(sameValue, 'section root', cell, sectionMin.at(cell)),
    new Given(sectionDepth.at(cell), 1)]),
  ...graph.neighbours(cell).map(neighbour => new And([
    new Pair(sameValue, 'same region', region.at(cell), region.at(neighbour)),
    new Pair(parentDepth, 'section parent', sectionDepth.at(cell), sectionDepth.at(neighbour))])),
]));

const sectionDepthSteps = orthogonalEdges.map(([a, b]) => new NFA(
  depthStepNFA, 'section depth step',
  region.at(a), region.at(b), sectionDepth.at(a), sectionDepth.at(b)));

// A cell's section size is how many cells carry both its region label and its
// section name. Cell sequence [label, section name, claimed size, then every
// cell's label and section name]: the claim counts down and must reach zero
// exactly as the grid runs out.
const sectionSizeNFA = NFA.encodeSpec({
  startState: { phase: 'label' },
  transition(state, value) {
    switch (state.phase) {
      case 'label':
        return { phase: 'min', label: value };
      case 'min':
        return { phase: 'size', label: state.label, min: value };
      case 'size':
        return { phase: 'scanLabel', label: state.label, min: state.min, left: value };
      case 'scanLabel':
        return {
          phase: 'scanMin', label: state.label, min: state.min, left: state.left,
          sameRegion: value === state.label,
        };
      case 'scanMin': {
        const counted = state.sameRegion && value === state.min;
        const left = counted ? state.left - 1 : state.left;
        if (left < 0) return undefined;
        return { phase: 'scanLabel', label: state.label, min: state.min, left };
      }
    }
  },
  accept: (state) => state.phase === 'scanLabel' && state.left === 0,
}, shape);

const sectionSizes = graph.cells().map(cell => new NFA(
  sectionSizeNFA, 'section size',
  region.at(cell), sectionMin.at(cell), sectionSize.at(cell),
  ...graph.cells().flatMap(other => [region.at(other), sectionMin.at(other)])));

// The red X cells are the cells whose digit is the size of their own section,
// and the exhaustiveness clause says they are the only ones.
const marked = new Set(MARKED_CELLS);
const sizeClues = graph.cells().map(cell => marked.has(cell)
  ? new SameValues(2, cell, sectionSize.at(cell))
  : new AllDifferent(cell, sectionSize.at(cell)));

// Sums reachable by k distinct digits of 1-6, keyed by k. A section lies inside
// one region, so its digits are distinct; this bounds a clue's section size.
const sumsBySize = new Map();
for (let mask = 1; mask < 1 << 6; mask++) {
  const digits = [1, 2, 3, 4, 5, 6].filter(digit => mask & (1 << (digit - 1)));
  const total = digits.reduce((a, b) => a + b);
  if (!sumsBySize.has(digits.length)) sumsBySize.set(digits.length, new Set());
  sumsBySize.get(digits.length).add(total);
}

// Every orthogonally connected set of at most six cells (a region's size)
// containing `cell`.
const candidateSections = (cell) => {
  const found = new Map([[cell, [cell]]]);
  let frontier = [[cell]];
  while (frontier.length) {
    const next = [];
    for (const section of frontier) {
      if (section.length >= 6) continue;
      for (const grown of section.flatMap(c => graph.neighbours(c))) {
        if (section.includes(grown)) continue;
        const cells = [...section, grown].sort();
        const key = cells.join();
        if (found.has(key)) continue;
        found.set(key, cells);
        next.push(cells);
      }
    }
    frontier = next;
  }
  return [...found.values()];
};

// A sum clue holds when the cell's section is exactly one of those candidates:
// the candidate's cells all share a region label, no cell outside it that
// touches it orthogonally shares that label, and its digits total the clue.
const sumClues = SECTION_SUMS.map(([cell, total]) => new Or(
  candidateSections(cell)
    .filter(cells => sumsBySize.get(cells.length).has(total))
    .map(cells => {
      const inSection = new Set(cells);
      const border = [...new Set(
        cells.flatMap(c => graph.neighbours(c)).filter(c => !inSection.has(c)))];
      return new And([
        new SameValues(cells.length, ...region.at(cells)),
        new Sum(total, ...cells),
        ...border.map(outside => new AllDifferent(
          region.at(outside), region.at(cells[0]))),
      ]);
    })));

return [
  shape,
  // The regions are found by the solver, so the default 2x3 boxes are not a rule.
  new NoBoxes(),
  region.toVar('region'),
  regionDepth.toVar('region depth'),
  sectionMin.toVar('section name'),
  sectionDepth.toVar('section depth'),
  sectionSize.toVar('section size'),
  digitLabel,
  ...labelLinks,
  ...digitsPerRegion,
  canonicalLabels,
  ...regionConnected,
  ...regionDepthSteps,
  ...sectionAgreement,
  ...sectionMinIsSmallest,
  ...sectionConnected,
  ...sectionDepthSteps,
  ...sectionSizes,
  ...sizeClues,
  ...sumClues,
];
