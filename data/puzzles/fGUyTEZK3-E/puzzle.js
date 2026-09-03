// Title: Original Sin
// Author: Nordy
// Video: https://www.youtube.com/watch?v=fGUyTEZK3-E
// Source: https://sudokupad.app/zaputh99gx

// Rules encoded here, in full:
//  * Normal sudoku.
//  * Each snake-circle holds a different digit and is one END of a snake: an
//    orthogonally connected run of cells whose length is that digit. A snake
//    may not touch itself orthogonally and no two snakes may touch each other
//    orthogonally; diagonal contact of every kind is allowed.
//  * The orthogonally connected groups of cells no snake uses are "gardens".
//    Digits do not repeat on a snake or in a garden.
//  * A number printed in a cell's top-left corner is the total of the snake or
//    the garden that contains that cell.
//  * Digits either side of a red apple: neither is 5, they are not both low
//    (1-4), not both high (6-9), not both even, not both odd.
//
// Nine circles carrying nine different digits means the snake lengths are
// exactly 1..9, so a snake can be named by its own length. VS is that label
// layer: 1..9 name the snake of that length, GARDEN names a non-snake cell.
// The tenth value is needed only for GARDEN, so the alphabet is widened and the
// playable cells are restricted back to 1-9.
// The gardens have no such names -- how many there are is part of the puzzle --
// so each garden cell instead points at its garden's anchor, the garden's first
// cell in reading order: VR holds the anchor's row, VC its column, and VD the
// cell's distance from it. Snake cells are parked as their own anchor at
// distance 1, so "the same component" reads as "the same VS label" on a snake
// and "the same anchor" in a garden.

const GARDEN = 10;             // VS: this cell belongs to a garden, not a snake
const MAX_SNAKE = 9;           // VS values 1..9 name the snake of that length

// The nine green snake-circles, read off the circle overlays.
const CIRCLES = [
  'R1C9', 'R2C4', 'R3C3', 'R4C2', 'R5C8', 'R6C5', 'R7C1', 'R8C6', 'R9C7',
];

// The six corner numbers, each printed inside its cell's top-left corner.
const CLUES = [
  { cell: 'R2C2', total: 12 },
  { cell: 'R1C5', total: 34 },
  { cell: 'R1C7', total: 7 },
  { cell: 'R3C7', total: 45 },
  { cell: 'R4C9', total: 18 },
  { cell: 'R8C4', total: 8 },
];

// The six red apples, as the two cells each one straddles.
const APPLES = [
  ['R2C2', 'R3C2'],
  ['R1C5', 'R2C5'],
  ['R4C5', 'R5C5'],
  ['R5C7', 'R6C7'],
  ['R3C5', 'R3C6'],
  ['R6C1', 'R6C2'],
];

const shape = new Shape('9x9', GARDEN);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const vs = graph.makeOverlay('VS');
const vr = graph.makeOverlay('VR');
const vc = graph.makeOverlay('VC');
const vd = graph.makeOverlay('VD');

const rowOf = (cell) => parseCellId(cell).row;
const colOf = (cell) => parseCellId(cell).col;
const valuesUpTo = (n) => Array.from({ length: n }, (_, i) => i + 1);

// Compiling an NFA spec is expensive and most cells share one: memoise by the
// spec's parameters so each distinct machine is built once.
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};

// --- Snake shape --------------------------------------------------------
// Each label's cells are one connected region of exactly that many cells, so
// ConnectedValues carries both "a snake is connected" and "the circled digit is
// its length" once the circle's digit is tied to its label below.
const snakeRegions = valuesUpTo(MAX_SNAKE)
  .map(length => new ConnectedValues('VS', length, length));

// Read as [VS of the cell, then VS of each in-grid neighbour]. `limit` is the
// number of same-label orthogonal neighbours allowed: 2 in general, 1 at a
// circle because the circle is an END of its snake. A connected region of
// exactly n cells whose vertices all have degree <= 2 and which contains a
// vertex of degree <= 1 is a simple path, and being an INDUCED path is exactly
// "the snake does not touch itself orthogonally".
const degreeMachine = memo((limit) => NFA.encodeSpec({
  startState: { phase: 'own' },
  transition: (state, value) => {
    if (state.phase === 'own') {
      return value === GARDEN
        ? { phase: 'free' } : { phase: 'nbr', label: value, seen: 0 };
    }
    if (state.phase === 'free') return { phase: 'free' };
    const seen = state.seen + (value === state.label ? 1 : 0);
    if (seen > limit) return undefined;
    return { phase: 'nbr', label: state.label, seen };
  },
  accept: () => true,
}, shape));

const circleSet = new Set(CIRCLES);
const snakeDegrees = gridCells.map(cell => {
  const neighbours = graph.neighbours(cell);
  return new NFA(degreeMachine(circleSet.has(cell) ? 1 : 2),
    'snake-degree', vs.at(cell), ...vs.at(neighbours));
});

// Two orthogonally adjacent snake cells belong to the same snake: no two
// snakes touch orthogonally.
const noTouchKey = Pair.fnToKey(
  (a, b) => a === GARDEN || b === GARDEN || a === b, shape);
// One template per direction, stamped on every cell that has such a neighbour.
const snakeNoTouch = [[0, 1], [1, 0]].map(([dRow, dCol]) => {
  const targets = gridCells.filter(cell => graph.step(cell, dRow, dCol) !== null);
  const origin = targets[0];
  return vs.makeReplicate(
    new Pair(noTouchKey, 'snake-no-touch',
      vs.at(origin), vs.at(graph.step(origin, dRow, dCol))),
    vs.at(targets));
});

// --- Gardens: anchors ---------------------------------------------------
// Read as [VR, VC, VD] of one cell. A garden's anchor is its first cell in
// reading order, so no cell may name an anchor that follows it, and the anchor
// is exactly the cell that stands at distance 1 from itself.
const anchorMachine = memo((row, col) => NFA.encodeSpec({
  startState: { phase: 'vr' },
  transition: (state, value) => {
    if (state.phase === 'vr') {
      if (value > row) return undefined;
      return { phase: 'vc', sameRow: value === row };
    }
    if (state.phase === 'vc') {
      if (state.sameRow && value > col) return undefined;
      return { phase: 'vd', isAnchor: state.sameRow && value === col };
    }
    return (value === 1) === state.isAnchor ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, shape));

const anchors = gridCells.map(cell => new NFA(
  anchorMachine(rowOf(cell), colOf(cell)), 'anchor',
  vr.at(cell), vc.at(cell), vd.at(cell)));

// Snake cells are parked at distance 1, which the machine above resolves to
// VR/VC naming the cell itself: a snake cell carries no free garden state, and
// since it is its own anchor no garden cell can name it as one.
const parkedSnakeDepth = Pair.fnToKey(
  (label, depth) => label === GARDEN || depth === 1, shape);
const snakeDepthPins = gridCells.map(cell => new Pair(
  parkedSnakeDepth, 'snake-depth', vs.at(cell), vd.at(cell)));

// Read as [VS, VR, VC of the cell, then VS, VR, VC of the neighbour]: two
// orthogonally adjacent garden cells lie in the same garden, so they name the
// same anchor.
const sameAnchorMachine = NFA.encodeSpec({
  startState: { phase: 'vs1' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'vs1':
        return { phase: 'vr1', garden: value === GARDEN };
      case 'vr1':
        return { phase: 'vc1', garden: state.garden, row: value };
      case 'vc1':
        return { phase: 'vs2', garden: state.garden, row: state.row, col: value };
      case 'vs2':
        return {
          phase: 'vr2', both: state.garden && value === GARDEN,
          row: state.row, col: state.col,
        };
      case 'vr2':
        if (state.both && value !== state.row) return undefined;
        return { phase: 'vc2', both: state.both, col: state.col };
      default:
        return !state.both || value === state.col ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);

const sameAnchor = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(sameAnchorMachine, 'same-garden',
    vs.at(cell), vr.at(cell), vc.at(cell),
    vs.at(other), vr.at(other), vc.at(other))));

// Read as [VS, VD of the cell, then VS, VD of each in-grid neighbour]: a garden
// cell that is not an anchor stands one step further out than some garden
// neighbour, and no garden neighbour is more than one step nearer. VD is then
// the distance to the anchor, which puts the anchor inside the cell's own
// garden and leaves VD no freedom.
const distanceMachine = NFA.encodeSpec({
  startState: { phase: 'vs' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'vs':
        return value === GARDEN ? { phase: 'vd' } : { phase: 'done' };
      case 'vd':
        return value === 1
          ? { phase: 'done' } : { phase: 'ns', d: value, found: false };
      case 'done':
        return { phase: 'done' };
      case 'ns':
        return { phase: 'nd', d: state.d, found: state.found, garden: value === GARDEN };
      default:
        if (!state.garden) return { phase: 'ns', d: state.d, found: state.found };
        if (value < state.d - 1) return undefined;
        return {
          phase: 'ns', d: state.d, found: state.found || value === state.d - 1,
        };
    }
  },
  accept: (state) => state.phase === 'done' || (state.phase === 'ns' && state.found),
}, shape);

const distances = gridCells.map(cell => {
  const neighbours = graph.neighbours(cell);
  return new NFA(distanceMachine, 'anchor-distance',
    vs.at(cell), vd.at(cell),
    ...neighbours.flatMap(other => [vs.at(other), vd.at(other)]));
});

// --- No repeated digit on a snake or in a garden ------------------------
// Read as [VS, VS, VR, VR, VC, VC, digit, digit] of a pair of cells. The two
// cells share a component when they carry the same snake label, or when both
// are garden cells naming the same anchor; then their digits differ. Pairs
// sharing a row, column or box are left out -- Sudoku already keeps those
// distinct. Every other pair is covered, so no component can hold ten cells,
// which is what makes VD's nine values enough to reach any of them.
const distinctMachine = NFA.encodeSpec({
  startState: { phase: 'vs1' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'vs1':
        return { phase: 'vs2', label: value };
      case 'vs2':
        if (value !== state.label) return { phase: 'done' };
        // Same snake: the anchors are the cells themselves, so skip them.
        return value === GARDEN ? { phase: 'vr1' } : { phase: 'skip', i: 0 };
      case 'skip':
        return state.i === 3 ? { phase: 'd1' } : { phase: 'skip', i: state.i + 1 };
      case 'vr1':
        return { phase: 'vr2', row: value };
      case 'vr2':
        return value === state.row ? { phase: 'vc1', row: state.row } : { phase: 'done' };
      case 'vc1':
        return { phase: 'vc2', col: value };
      case 'vc2':
        return value === state.col ? { phase: 'd1' } : { phase: 'done' };
      case 'd1':
        return { phase: 'd2', digit: value };
      case 'd2':
        return value === state.digit ? undefined : { phase: 'done' };
      default:
        return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);

const boxOf = (cell) =>
  Math.floor((rowOf(cell) - 1) / 3) * 3 + Math.floor((colOf(cell) - 1) / 3);
const keptApartBySudoku = (a, b) =>
  rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b);

const componentDistinct = gridCells.flatMap((cell, index) => gridCells
  .slice(index + 1)
  .filter(other => !keptApartBySudoku(cell, other))
  .map(other => new NFA(distinctMachine, 'component-distinct',
    vs.at(cell), vs.at(other), vr.at(cell), vr.at(other),
    vc.at(cell), vc.at(other), cell, other)));

// --- Corner clues -------------------------------------------------------
// One overlay per clue carries the component that contains that clue: 1 where a
// cell is outside it, digit + 1 where the cell is inside. Holding membership and
// digit in the same layer turns the printed total into a plain Sum -- every cell
// contributes 1 and a member contributes its digit on top -- and the same layer
// serves a clue on a snake and a clue in a garden without distinguishing them.
const CLUE_PREFIXES = ['VE', 'VF', 'VG', 'VH', 'VI', 'VJ'];
const MEMBER_VALUES = valuesUpTo(GARDEN).slice(1);   // 2..10 == digits 1..9

// Read as [member value, digit] of one cell.
const maskedDigitKey = Pair.fnToKey(
  (mask, digit) => mask === 1 || mask === digit + 1, shape);

// Read as [member value, VS, VS, member value] over an orthogonally adjacent
// pair. Two adjacent cells share a snake or a garden exactly when they carry the
// same VS label -- no two snakes touch, so a label change is always a component
// boundary -- so a clue's component is closed under same-label adjacency and
// stops at every label change.
const clueSpreadMachine = NFA.encodeSpec({
  startState: { phase: 'm1' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'm1':
        return { phase: 's1', in1: value > 1 };
      case 's1':
        return { phase: 's2', in1: state.in1, label: value };
      case 's2':
        return { phase: 'm2', in1: state.in1, same: value === state.label };
      default: {
        const in2 = value > 1;
        if (state.same) return state.in1 === in2 ? { phase: 'done' } : undefined;
        return state.in1 && in2 ? undefined : { phase: 'done' };
      }
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);

const clueConstraints = CLUES.flatMap((clue, index) => {
  const prefix = CLUE_PREFIXES[index];
  const layer = graph.makeOverlay(prefix);
  return [
    layer.toVar(`total${clue.total}`),
    ...gridCells.map(cell => new Pair(maskedDigitKey, 'clue-digit',
      layer.at(cell), cell)),
    // The clue's own cell is a member, and the members form one region: without
    // that a second garden elsewhere could join the layer unnoticed.
    new Given(layer.at(clue.cell), ...MEMBER_VALUES),
    new ConnectedValues(prefix, MEMBER_VALUES),
    ...gridCells.flatMap(cell => [[0, 1], [1, 0]]
      .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
      .filter(Boolean)
      .map(other => new NFA(clueSpreadMachine, 'clue-component',
        layer.at(cell), vs.at(cell), vs.at(other), layer.at(other)))),
    new Sum(gridCells.length + clue.total, ...layer.cells()),
  ];
});

// --- Forbidden fruit ----------------------------------------------------
// Neither digit is 5, they are not both low, not both high, not both even and
// not both odd -- which leaves one low digit and one high digit of opposite
// parity on the two sides of every apple.
const isLow = (d) => d >= 1 && d <= 4;
const isHigh = (d) => d >= 6 && d <= 9;
const appleKey = Pair.fnToKey((a, b) =>
  a !== 5 && b !== 5
  && !(isLow(a) && isLow(b)) && !(isHigh(a) && isHigh(b))
  && a % 2 !== b % 2, shape);
const apples = APPLES.map(([a, b]) => new Pair(appleKey, 'apple', a, b));

return [
  shape,
  // The tenth value exists only so VS can mark a garden cell.
  graph.makeReplicate(new Given(gridCells[0], ...valuesUpTo(MAX_SNAKE))),

  vs.toVar('snakeLabel'),
  vr.toVar('gardenAnchorRow'),
  vc.toVar('gardenAnchorCol'),
  vd.toVar('gardenAnchorDistance'),
  // Anchor coordinates and distances are grid coordinates, never the tenth value.
  vr.makeReplicate(new Given(vr.cells()[0], ...valuesUpTo(9))),
  vc.makeReplicate(new Given(vc.cells()[0], ...valuesUpTo(9))),
  vd.makeReplicate(new Given(vd.cells()[0], ...valuesUpTo(9))),

  // Each snake-circle holds a different digit, and that digit is both the
  // length of its snake and, by the labelling, the snake's name.
  new AllDifferent(...CIRCLES),
  ...CIRCLES.map(cell => new SameValues(2, cell, vs.at(cell))),

  ...snakeRegions,
  ...snakeDegrees,
  ...snakeNoTouch,

  ...snakeDepthPins,
  ...anchors,
  ...sameAnchor,
  ...distances,
  ...componentDistinct,

  ...clueConstraints,
  ...apples,
];
