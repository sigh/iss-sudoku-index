// Title: Build Your Own Region Sums
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=gFj8f3-_YdE
// Source: https://app.crackingthecryptic.com/sudoku/QH26FPT6mF

// Normal sudoku rules apply. Along 'box-sum lines', digits on the line have the
// same sum within each 3x3 box the line passes through. The lines must be
// determined by the solver. All ends of lines are marked with grey dots. Lines
// can only move orthogonally (ie never diagonally), cannot touch themselves
// orthogonally, cannot branch and cannot cross themselves or other lines. Lines
// must start and end in different boxes and cannot re-enter boxes.
//
// Nothing is drawn but the eighteen grey dots and three givens, so the lines
// themselves are the unknown. Each line has two ends and every end carries a
// dot, and a line's two ends lie in different boxes, so no line can be a single
// cell: the eighteen dots are the ends of exactly nine lines.
//
// The nine lines live on a label overlay VG, one Var per grid cell: 1-9 name a
// line, 10 means the cell is on no line. That single layer carries several of
// the rules structurally -- a cell holds one label, so lines can neither cross
// each other nor cross themselves, and the labels are only ever compared across
// orthogonal neighbours, so lines only move orthogonally.
//
// Every rule of the puzzle is encoded; nothing is omitted.

const OFF = 10;              // label value meaning "this cell is on no line"
const MAX_BOX_SUM = 45;      // 9 distinct digits is the loosest bound on a box segment
const LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('9x9', 10);   // alphabet widened to 10 so OFF has a value
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const line = graph.makeOverlay('VG');

// Drawn data, transcribed from the source. The three printed givens:
const givens = { R3C8: 6, R4C7: 1, R5C4: 9 };
// The eighteen grey dots, in row-major order (one per drawn circle underlay):
const dots = [
  'R1C7', 'R1C8', 'R2C7', 'R3C4', 'R4C5', 'R4C6', 'R4C8', 'R5C3', 'R5C7',
  'R6C1', 'R6C7', 'R6C9', 'R7C4', 'R8C3', 'R8C7', 'R9C3', 'R9C7', 'R9C8',
];

const dotSet = new Set(dots);
const boxes = graph.boxes();
const boxIndex = new Map();
boxes.forEach((cells, index) => cells.forEach(cell => boxIndex.set(cell, index)));
const dotsIn = cells => cells.filter(cell => dotSet.has(cell));
// The label-cell pairs the box-visit machine reads as its segments: this box's
// own dots (each read twice, as an end lying inside the box) and the
// orthogonally adjacent pairs straddling the box border (a step into or out of
// the box).
const boxVisitSegments = (cells) => {
  const pairs = [
    ...dotsIn(cells).map(dot => [dot, dot]),
    ...cells.flatMap(cell => graph.neighbours(cell)
      .filter(other => boxIndex.get(other) !== boxIndex.get(cell))
      .map(other => [cell, other])),
  ];
  const labelCells = line.at(pairs.flat());
  return pairs.map((pair, index) => labelCells.slice(index * 2, index * 2 + 2));
};

// The two Var groups holding each line's shared box sum, split into tens and
// ones because a Var domain caps at 16 values and a box sum reaches 45. Both are
// stored +1, so the tens digit 0 is representable in a 1-10 alphabet.
const targetTens = new Var('TT', 'box-sum tens per line', 9);
const targetOnes = new Var('TO', 'box-sum ones per line', 9);

// --- State machines --------------------------------------------------------

// Same-label orthogonal degree. Reads the cell's own label, then each of its
// orthogonal neighbours' labels; `degree` is how many neighbours must repeat the
// cell's label (1 at a dot, 2 elsewhere). Cells off every line are unconstrained.
const degreeMachine = (degree, geometry) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, label) => {
    if (state.phase === 'start') {
      return label === OFF ? { phase: 'off' } : { phase: 'on', label, count: 0 };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (label === state.label ? 1 : 0);
    return count > degree ? undefined : { phase: 'on', label: state.label, count };
  },
  accept: (state) => state.phase === 'off' || state.count === degree,
}, geometry);

// Canonical label order: scanning the dots in row-major order, the first dot of a
// line label must appear before the first dot of the next label up, and all
// `numLines` labels must appear. Breaks the label-permutation symmetry only.
const canonicalOrderMachine = (numLines, geometry) => NFA.encodeSpec({
  startState: { used: 0 },
  transition: ({ used }, label) => {
    if (label <= used) return { used };                 // a label already opened
    if (label === used + 1) return { used: used + 1 };  // opens the next label
    return undefined;
  },
  accept: ({ used }) => used === numLines,
}, geometry);

// At most one visit to a box. Each segment is a pair of label cells: a box's own
// dot read twice (an end of the line inside the box) or an orthogonally adjacent
// pair straddling the box border (a step of the line into or out of the box).
// A line's cells form an induced path, so an adjacent same-label pair is always a
// step of that line; each visit therefore contributes exactly two of these
// (an end or a crossing at each of its two extremities), and `ends <= 2` is
// exactly "at most one visit".
const boxVisitMachine = (label, geometry) => NFA.encodeSpec({
  startState: { pending: null, ends: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { pending: null, ends: state.ends };
    if (state.pending === null) return { pending: value, ends: state.ends };
    const ends = state.ends + (state.pending === label && value === label ? 1 : 0);
    return ends > 2 ? undefined : { pending: null, ends };
  },
  accept: (state) => state.pending === null,
}, geometry, { multiSegment: true });

// One box's contribution to one line's box sum. The first segment interleaves the
// box's nine (label, digit) pairs; the second reads that line's target sum as
// (tens + 1, ones + 1). A box holding none of the line's cells sums to 0 and is
// exempt, which is the rule's "each 3x3 box the line passes through".
const boxSumMachine = (label, geometry) => NFA.encodeSpec({
  startState: { phase: 'label', sum: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { phase: 'tens', sum: state.sum };
    switch (state.phase) {
      case 'label':
        return { phase: value === label ? 'digitOn' : 'digitOff', sum: state.sum };
      case 'digitOn': {
        const sum = state.sum + value;
        return sum > MAX_BOX_SUM ? undefined : { phase: 'label', sum };
      }
      case 'digitOff':
        return { phase: 'label', sum: state.sum };
      case 'tens':
        return { phase: 'ones', sum: state.sum, tens: value - 1 };
      case 'ones':
        return {
          phase: 'done',
          matches: state.sum === 0 || state.sum === state.tens * 10 + (value - 1),
        };
      default:
        return undefined;
    }
  },
  accept: (state) => state.phase === 'done' && state.matches,
}, geometry, { multiSegment: true });

const visitMachines = LABELS.map(label => boxVisitMachine(label, geometry));
const sumMachines = LABELS.map(label => boxSumMachine(label, geometry));
const endDegree = degreeMachine(1, geometry);
const pathDegree = degreeMachine(2, geometry);

// --- Domains and givens ----------------------------------------------------

const gridDomain = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const tensDomain = LABELS.map(
  label => new Given(targetTens.cell(label), 1, 2, 3, 4, 5));
const printedGivens = Object.entries(givens).map(([cell, v]) => new Given(cell, v));
// Every dot is an end of a line, so no dot cell is off the lines.
const dotsAreOnLines = dots.map(dot => new Given(line.at(dot), ...LABELS));

// --- The nine lines --------------------------------------------------------

// Each label's cells form one connected region ...
const connected = LABELS.map(label => new ConnectedValues('VG', label));
// ... whose two ends are dots and whose other cells run through: with exactly two
// degree-1 cells and every other cell degree 2, a connected region is a simple
// path. Because the degree is counted over the cell's own label, a line touching
// itself or branching would push a cell past its allowed count, and a dot in the
// middle of a line would exceed 1.
const degrees = graph.cells().map(cell => (dotSet.has(cell)
  ? new NFA(endDegree, 'line-end-degree', ...line.at([cell, ...graph.neighbours(cell)]))
  : new NFA(pathDegree, 'line-degree', ...line.at([cell, ...graph.neighbours(cell)]))));
// Each of the nine labels is carried by exactly two of the eighteen dots.
const endsPerLine = new ContainExact(
  LABELS.flatMap(label => [label, label]).join('_'), ...line.at(dots));
// A line starts and ends in different boxes, so two dots in one box cannot be
// the two ends of the same line -- and two dots are only ever ends of the same
// line, never anything else.
const differentBoxes = boxes.map(dotsIn).filter(inBox => inBox.length > 1)
  .map(inBox => new AllDifferent(...line.at(inBox)));
// A line cannot re-enter a box.
const boxVisits = LABELS.flatMap((label, i) => boxes.map(cells => new NFA(
  visitMachines[i], `box-visit-${label}`, ...boxVisitSegments(cells))));
// The nine line labels are interchangeable, which would multiply every answer by
// 9!; this fixes the labelling and constrains nothing about the puzzle itself.
const canonicalLabels = new NFA(
  canonicalOrderMachine(LABELS.length, geometry), 'canonical-label-order',
  ...line.at(dots));

// --- Box sums --------------------------------------------------------------

const boxSums = LABELS.flatMap((label, i) => boxes.map(cells => new NFA(
  sumMachines[i], `box-sum-${label}`,
  cells.flatMap(cell => [line.at(cell), cell]),
  [targetTens.cell(label), targetOnes.cell(label)])));

return [
  shape,
  line.toVar('line labels'),
  targetTens,
  targetOnes,
  gridDomain,
  ...tensDomain,
  ...printedGivens,
  ...dotsAreOnLines,
  ...connected,
  ...degrees,
  endsPerLine,
  ...differentBoxes,
  ...boxVisits,
  canonicalLabels,
  ...boxSums,
];
