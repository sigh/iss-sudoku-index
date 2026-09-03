// Title: Everything in its Right Place
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=Cb-HAH8lLkU
// Source: https://sudokupad.app/pTPD72D9qP

// Normal sudoku rules apply. Draw 3 snakes which must each begin and end at a
// different grey spot. Snakes are lines which may move orthogonally and
// diagonally between cells. They may touch each other (or themselves), and can
// even cross each other, but they must not branch, share cells with each other,
// or enter cages. A digit on a snake indicates exactly how many times that digit
// appears on that snake. One snake is a "German Whisper" line; along it,
// adjacent digits must differ by at least 5. One snake is a "slow thermometer";
// along this line, reading from one end to the other, digits must always
// increase or stay the same. One snake is "entropic"; along it, any group of 3
// adjacent cells must contain one low digit (1, 2 or 3), one medium digit
// (4, 5 or 6) and one high digit (7, 8 or 9). Digits in a cage must sum to the
// small clue given in that cage. Digits separated by a V sum to 5.
//
// Nothing is omitted. Three snakes give six endpoints, all different grey spots,
// and six grey spots are drawn, so every spot is an endpoint of exactly one
// snake.
//
// The snakes are drawn by the solver, so they live in Var overlays over the
// grid:
//   VL  the snake a cell belongs to: OFF, or one of the three line types. The
//       line type is the label, so no relabelling symmetry exists.
//   VP  which king neighbour is this cell's predecessor along its snake, as an
//       index into that cell's own neighbour list (NONE for a snake's start
//       cell and for cells off every snake).
//   VA  position along the snake modulo 7, VB modulo 8 (see the subtour note).
// A successor pointer is not stored: a cell's successors are exactly the
// neighbours whose VP points back at it, which every per-cell machine below can
// read off the neighbour list it already scans.

const OFF = 1, WHISPER = 2, THERMO = 3, ENTROPIC = 4;
const NONE = 1;                       // VP value meaning "no predecessor"
// Coprime moduli for the two position layers; lcm 56 exceeds the 45-cell bound
// on a snake, which is what makes a stray closed loop impossible.
const MOD_A = 7, MOD_B = 8;

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const numValues = graph.gridGeometry().numValues;

// Drawn clues, transcribed from the puzzle's art.
const cageClues = [
  [15, ['R4C5', 'R5C5']],
  [9, ['R8C7', 'R9C7', 'R9C8']],
  [9, ['R2C1', 'R3C1']],
];
const vClues = [
  ['R2C8', 'R3C8'], ['R1C9', 'R2C9'], ['R4C3', 'R4C4'],
  ['R8C5', 'R9C5'], ['R7C4', 'R8C4'],
];
// The six grey circles, in reading order.
const spots = ['R2C2', 'R3C8', 'R6C6', 'R8C4', 'R9C1', 'R9C9'];

const cageCells = new Set(cageClues.flatMap(([, cells]) => cells));
const spotSet = new Set(spots);
const isOpen = cell => !cageCells.has(cell);
const openCells = gridCells.filter(isOpen);

// A snake may never enter a cage, so cage cells are removed from every
// neighbour list: no snake step can start or end in one.
const neighbours = new Map(gridCells.map(
  cell => [cell, graph.kingNeighbours(cell).filter(isOpen)]));
// VP value v >= 2 means "my predecessor is neighbours[v - 2]".
const predValue = (cell, neighbour) => 2 + neighbours.get(cell).indexOf(neighbour);

const label = graph.makeOverlay('VL');
const pred = graph.makeOverlay('VP');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

const memo = (fn) => {
  const m = new Map();
  return (...args) => {
    const k = JSON.stringify(args);
    if (!m.has(k)) m.set(k, fn(...args));
    return m.get(k);
  };
};

// --- Var domains. Every Var cell is pinned to the codes it can actually hold.
// The two stamped domains cover the whole layer and the clue Givens below
// intersect with them, narrowing spots and cage cells further. VB needs no stamp
// of its own: MOD_B + 1 is already the grid's value count.
const range = n => Array.from({ length: n }, (_, i) => i + 1);
const domains = [
  label.makeReplicate(new Given(label.at(gridCells[0]), OFF, WHISPER, THERMO, ENTROPIC)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]), ...range(MOD_A + 1))),
  // A cell's predecessor is an index into its own neighbour list, so this domain
  // is the one thing that differs cell by cell.
  ...gridCells.map(cell => new Given(pred.at(cell),
    ...(isOpen(cell) ? range(neighbours.get(cell).length + 1) : [NONE]))),
  // A grey spot is an end of a snake, so it is never off every snake.
  ...spots.map(cell => new Given(label.at(cell), WHISPER, THERMO, ENTROPIC)),
  // Snakes may not enter cages.
  ...[...cageCells].flatMap(cell => [new Given(label.at(cell), OFF),
    new Given(posA.at(cell), 1), new Given(posB.at(cell), 1)]),
];

// --- Each snake ends on two different grey spots and there are three snakes, so
// the six spots split two-two-two between the three line types.
const spotSplit = new ContainExact(
  `${WHISPER}_${WHISPER}_${THERMO}_${THERMO}_${ENTROPIC}_${ENTROPIC}`,
  ...label.at(spots));

// --- Degree. Reads [VL(c), VP(c), VP(n) for each neighbour n of c]. The
// in-degree is 1 exactly when VP(c) names a predecessor; the out-degree counts
// the neighbours pointing back at c, so `back[j]` is the VP value neighbour j
// would hold if its predecessor were c. A cell off every snake has degree 0, a
// grey spot degree 1 (it is an end of its snake), and every other snake cell
// degree 2. Out-degree above 1 is where "must not branch" is enforced.
const degreeSpec = memo((back, isSpot) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (s, value) => {
    if (s.phase === 0) return { phase: 1, label: value };
    if (s.phase === 1) {
      return { phase: 2, label: s.label, inDeg: value === NONE ? 0 : 1, out: 0 };
    }
    const out = s.out + (value === back[s.phase - 2] ? 1 : 0);
    if (out > 1) return undefined;
    return { phase: s.phase + 1, label: s.label, inDeg: s.inDeg, out };
  },
  accept: (s) => {
    if (s.label === OFF) return s.inDeg === 0 && s.out === 0;
    return isSpot ? s.inDeg + s.out === 1 : (s.inDeg === 1 && s.out === 1);
  },
  maxDepth: back.length + 2,
}, numValues));

const degreeRules = openCells.map(cell => new NFA(
  degreeSpec(neighbours.get(cell).map(n => predValue(n, cell)), spotSet.has(cell)),
  'degree', label.at(cell), pred.at(cell), ...pred.at(neighbours.get(cell))));

// --- A cell and its predecessor are on the same snake. Reads
// [VL(c), VP(c), VL(n) ...]; VP value v lands on neighbour index v - 2, which is
// scan position v. Applying this at every cell covers every snake step once, so
// no successor-side copy is needed. Phase -1 is the satisfied sink.
const labelSpec = memo((degree) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (s, value) => {
    if (s.phase === -1) return { phase: -1 };
    if (s.phase === 0) return { phase: 1, label: value };
    if (s.phase === 1) {
      return value === NONE ? { phase: -1 } : { phase: 2, label: s.label, pred: value };
    }
    if (s.phase === s.pred) {
      return value === s.label ? { phase: -1 } : undefined;
    }
    return { phase: s.phase + 1, label: s.label, pred: s.pred };
  },
  accept: (s) => s.phase === -1,
  maxDepth: degree + 2,
}, numValues));

const labelRules = openCells.map(cell => new NFA(
  labelSpec(neighbours.get(cell).length),
  'same-snake', label.at(cell), pred.at(cell), ...label.at(neighbours.get(cell))));

// --- The line rule for each snake type, applied to the step from a cell's
// predecessor into that cell. Reads [VL(c), VP(c), digit(c), digit(n) ...];
// VP value v is scan position v + 1 here because the cell's own digit is read
// first. The whisper relation is symmetric; the other two also fix the snake's
// reading direction, see the orientation note below.
const lineStep = (type, before, after) => {
  if (type === WHISPER) return Math.abs(after - before) >= 5;
  if (type === THERMO) return before <= after;
  // Entropic: with every window of three cells holding one low, one medium and
  // one high digit, the low/medium/high class must advance by the same step
  // around 1 -> 2 -> 3 -> 1 at every move along the line. Requiring the +1
  // direction rather than allowing either picks the snake's reading direction.
  const cls = d => Math.ceil(d / 3);
  return cls(after) === cls(before) % 3 + 1;
};

const lineSpec = memo((degree) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (s, value) => {
    if (s.phase === -1) return { phase: -1 };
    if (s.phase === 0) return value === OFF ? { phase: -1 } : { phase: 1, label: value };
    if (s.phase === 1) {
      return value === NONE ? { phase: -1 } : { phase: 2, label: s.label, pred: value };
    }
    if (s.phase === 2) {
      return { phase: 3, label: s.label, pred: s.pred, digit: value };
    }
    if (s.phase === s.pred + 1) {
      return lineStep(s.label, value, s.digit) ? { phase: -1 } : undefined;
    }
    return { phase: s.phase + 1, label: s.label, pred: s.pred, digit: s.digit };
  },
  accept: (s) => s.phase === -1,
  maxDepth: degree + 3,
}, numValues));

const lineRules = openCells.map(cell => new NFA(
  lineSpec(neighbours.get(cell).length),
  'line-step', label.at(cell), pred.at(cell), cell, ...neighbours.get(cell)));

// --- Position along a snake, modulo two coprime numbers. A snake's start cell
// is numbered 2 (value 1 is reserved for "off every snake") and each further
// cell is one more than its predecessor, wrapping at MOD + 1. Degree alone
// leaves a snake label free to carry a closed loop as well as its path; a loop
// of length L would need L = 0 modulo both 7 and 8, and 56 is more than the 45
// cells a snake can hold, so the two layers together forbid one.
const positionSpec = memo((mod, degree) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (s, value) => {
    if (s.phase === -1) return { phase: -1 };
    if (s.phase === 0) return value === NONE ? { phase: -2 } : { phase: 1, pred: value };
    // No predecessor: the cell is either off every snake (1) or a start (2).
    if (s.phase === -2) return (value === 1 || value === 2) ? { phase: -1 } : undefined;
    if (s.phase === 1) return { phase: 2, pred: s.pred, pos: value };
    if (s.phase === s.pred) {
      if (value === 1) return undefined;
      return s.pos === (value === mod + 1 ? 2 : value + 1) ? { phase: -1 } : undefined;
    }
    return { phase: s.phase + 1, pred: s.pred, pos: s.pos };
  },
  accept: (s) => s.phase === -1,
  maxDepth: degree + 2,
}, numValues));

const positionRules = [[MOD_A, posA], [MOD_B, posB]].flatMap(([mod, layer]) =>
  openCells.flatMap(cell => [
    new NFA(positionSpec(mod, neighbours.get(cell).length), `position-${mod}`,
      pred.at(cell), layer.at(cell), ...layer.at(neighbours.get(cell))),
    // Position value 1 is exactly the off-every-snake marker.
    new Pair(Pair.fnToKey((l, p) => (l === OFF) === (p === 1), numValues),
      'off-marker', label.at(cell), layer.at(cell)),
  ]));

// --- A digit on a snake appears on that snake exactly as many times as its own
// value. Scanning [digit, VL] cell by cell, one machine per (snake, digit)
// counts the cells of that snake holding that digit and accepts a count of 0 or
// of the digit itself.
const countSpec = memo((type, digit) => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count, isDigit }, value) => {
    if (isDigit === undefined) return { count, isDigit: value === digit };
    if (!isDigit || value !== type) return { count };
    return count === digit ? undefined : { count: count + 1 };
  },
  accept: ({ count, isDigit }) =>
    isDigit === undefined && (count === 0 || count === digit),
}, numValues));

const countEntries = gridCells.flatMap(cell => [cell, label.at(cell)]);
const countRules = [WHISPER, THERMO, ENTROPIC].flatMap(type =>
  range(9).map(digit =>
    new NFA(countSpec(type, digit), `count-${type}-${digit}`, ...countEntries)));

// --- Orientation. VP orients each snake, and the puzzle does not: reversing a
// snake is the same drawing, so each snake is pinned to one of its two
// orientations. The thermometer's non-decreasing direction and the entropic
// line's +1 class direction each do that on their own: no two grey spots are a
// king's move apart, so every snake is at least three cells long and the
// entropic window rule always applies; and no snake can hold one digit
// throughout, since equal digits a king's move apart need different rows,
// columns and boxes, which forces a diagonal run crossing a box boundary at
// every step -- of the four grey-spot pairs on a common diagonal, R2C2/R6C6 and
// R2C2/R9C9 pass through the caged R5C5, R6C6/R9C9 puts R7C7 and R8C8 in one
// box, and R6C6/R8C4 has only R7C5 between them, in R8C4's box. The whisper rule
// is symmetric, so its orientation is pinned here instead: of its two grey
// spots, the one earlier in reading order is the start. Reads
// [VL(a), VL(b), VP(b)] for each ordered pair of spots.
const orientSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (s, value) => {
    if (s.phase === 0) return { phase: 1, a: value };
    if (s.phase === 1) return { phase: 2, both: s.a === WHISPER && value === WHISPER };
    return { phase: 3, bad: s.both && value === NONE };
  },
  accept: (s) => s.phase === 3 && !s.bad,
  maxDepth: 3,
}, numValues);

const orientRules = spots.flatMap((first, i) => spots.slice(i + 1).map(second =>
  new NFA(orientSpec, 'whisper-orientation',
    label.at(first), label.at(second), pred.at(second))));

return [
  new Shape('9x9'),
  label.toVar('snake'),
  pred.toVar('predecessor'),
  posA.toVar(`position mod ${MOD_A}`),
  posB.toVar(`position mod ${MOD_B}`),
  ...cageClues.map(([total, cells]) => new Sum(total, ...cells)),
  ...vClues.map(cells => new V(...cells)),
  ...domains,
  spotSplit,
  ...degreeRules,
  ...labelRules,
  ...lineRules,
  ...positionRules,
  ...countRules,
  ...orientRules,
];
