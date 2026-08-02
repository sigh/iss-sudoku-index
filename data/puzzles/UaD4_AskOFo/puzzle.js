// Title: poLo
// Author: Mattisahuman
// Video: https://www.youtube.com/watch?v=UaD4_AskOFo
// Source: https://sudokupad.app/w3ve69np9y

// Rules encoded, in full:
//   - Normal 9x9 Sudoku.
//   - Kropki: cells separated by a white dot are consecutive. The rules also say
//     the dots have no effect on the loop, so they carry no loop constraint.
//   - Fortress: a red cell is larger than all of its orthogonal neighbours; the
//     blue cell is smaller than all of its orthogonal neighbours.
//   - Index Line Loop: one loop that moves orthogonally and may not touch
//     itself, not even diagonally. Fortress cells are never part of the loop,
//     and every fortress cell touches the loop orthogonally or diagonally.
//   - Index Lines: box borders break the loop into segments, all oriented in
//     the same direction about the loop; the digit in the Nth cell of a segment
//     gives the position along that segment where the digit N appears.
// Nothing is omitted.

const OFF = 1, UP = 2, DOWN = 3, LEFT = 4, RIGHT = 5;
const DIRS = [UP, DOWN, LEFT, RIGHT];
const STEP = { [UP]: [-1, 0], [DOWN]: [1, 0], [LEFT]: [0, -1], [RIGHT]: [0, 1] };
const OPPOSITE = { [UP]: DOWN, [DOWN]: UP, [LEFT]: RIGHT, [RIGHT]: LEFT };

// Several machines below differ only in a per-cell parameter (which neighbour
// lies in which direction), so build one machine per distinct parameter.
const memoizeMachine = (build) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, build(...args));
    return cache.get(key);
  };
};

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;

// The loop is carried as a direction of travel rather than as bare membership,
// because the index lines have to be read "in the same direction about the
// loop": VD holds, per cell, which way the loop leaves that cell, and OFF when
// the cell is not on the loop. Loop membership is then "VD is not OFF", and one
// consistent set of travel directions gives every segment its reading order.
// VP is the second overlay: a cell's position along its segment, counted in the
// travel direction. A cell off the loop takes VP = 1.
const dir = graph.makeOverlay('VD');
const pos = graph.makeOverlay('VP');

const gridCells = graph.cells();
const boxes = graph.boxes();
const boxOf = new Map();
boxes.forEach((box, n) => box.forEach(cell => boxOf.set(cell, n)));
const sameBox = (a, b) => boxOf.get(a) === boxOf.get(b);

// The neighbour one step in direction `d`, or null off the grid.
const stepDir = (cell, d) => graph.step(cell, ...STEP[d]);
// The directions in which `cell` has a neighbour inside its own box.
const inBoxDirs = cell => DIRS.filter(d => {
  const other = stepDir(cell, d);
  return other !== null && sameBox(cell, other);
});

// Drawn clues, transcribed from the source artwork.
// White Kropki dots, as the pair of cells each dot sits between.
const dots = [
  ['R1C6', 'R1C7'], ['R2C6', 'R3C6'], ['R4C4', 'R5C4'], ['R6C7', 'R6C8'],
];
// Shaded fortress cells: red (outward arrows) and blue (inward arrows).
const redFortress = ['R2C2', 'R2C8', 'R5C2', 'R7C3', 'R8C2', 'R8C7'];
const blueFortress = ['R5C8'];
const fortress = [...redFortress, ...blueFortress];

// --- Travel directions: OFF or one of the four steps, and a cell on the edge
// of the grid may not step off it. ---
const directionDomains = [
  dir.makeReplicate(new Given(dir.cells()[0], OFF, ...DIRS)),
  ...gridCells
    .map(cell => [cell, DIRS.filter(d => stepDir(cell, d) !== null)])
    .filter(([, available]) => available.length < DIRS.length)
    .map(([cell, available]) => new Given(dir.at(cell), OFF, ...available)),
];

// --- A step lands on the loop, and no two cells step onto each other. ---
// Per ordered adjacent pair: if this cell steps onto the other, the other is on
// the loop and does not step straight back. Banning the mutual step is what
// makes the travel direction consistent the whole way round -- on a cycle whose
// cells each step to one of their two loop neighbours, "nobody steps back"
// propagates one cell at a time until every cell agrees which way round it runs.
const stepKeys = new Map(DIRS.map(d => [d, Pair.fnToKey(
  (from, to) => from !== d || (to !== OFF && to !== OPPOSITE[d]), numValues)]));
// One Replicate per direction, over the cells that have such a neighbour. The
// template names the origin's own east/south neighbour, so the two templates
// reading backwards (LEFT, UP) are stamped from the far cell of the same edge.
const originCell = gridCells[0];
const eastEdge = [dir.at(originCell), dir.at(stepDir(originCell, RIGHT))];
const southEdge = [dir.at(originCell), dir.at(stepDir(originCell, DOWN))];
const hasEast = dir.at(gridCells.filter(cell => stepDir(cell, RIGHT) !== null));
const hasSouth = dir.at(gridCells.filter(cell => stepDir(cell, DOWN) !== null));
const steps = [
  dir.makeReplicate(new Pair(stepKeys.get(RIGHT), 'step', ...eastEdge), hasEast),
  dir.makeReplicate(new Pair(stepKeys.get(LEFT), 'step', ...eastEdge.toReversed()),
    hasEast),
  dir.makeReplicate(new Pair(stepKeys.get(DOWN), 'step', ...southEdge), hasSouth),
  dir.makeReplicate(new Pair(stepKeys.get(UP), 'step', ...southEdge.toReversed()),
    hasSouth),
];

// --- Degree 2: each loop cell has exactly two loop cells orthogonally beside
// it, which is the loop not touching itself orthogonally. Reads the cell's own
// direction, then each neighbour's. Off cells are free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') {
      return value !== OFF ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (value !== OFF ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...dir.at([cell, ...graph.neighbours(cell)])));

// --- Nor diagonally: forbid a 2x2 whose only loop cells are a diagonal. Two
// diagonal loop cells with a loop cell between them are a corner of the loop,
// which is not the loop touching itself. Reads the four direction cells of a
// 2x2 block, left-to-right, top-to-bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value !== OFF];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, numValues);
const noDiagonalTouches = dir.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...dir.at(graph.block(originCell, 2, 2))),
  dir.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// --- Fortress cells: off the loop, but touching it with a king's move. ---
const touchMachine = NFA.encodeSpec({
  startState: { touching: false },
  transition: ({ touching }, value) => ({ touching: touching || value !== OFF }),
  accept: ({ touching }) => touching,
}, numValues);
const fortressLoop = [
  ...fortress.map(cell => new Given(dir.at(cell), OFF)),
  ...fortress.map(cell => new NFA(touchMachine, 'touch',
    ...dir.at(graph.kingNeighbours(cell)))),
];

// --- Segment position, counted forwards from the segment's first cell. ---
// Reads this cell's position, then (direction, position) for each neighbour in
// the same box. A neighbour that steps onto this cell is its predecessor along
// the segment, so it sits one place earlier; with no such neighbour this cell
// starts the segment. `enter` gives, per neighbour in the order scanned, the
// direction value that means "steps onto this cell".
const posMachine = memoizeMachine(enter => NFA.encodeSpec({
  startState: { position: null, index: 0, found: false, stepsOn: null },
  transition: ({ position, index, found, stepsOn }, value) => {
    if (position === null) return { position: value, index, found, stepsOn };
    if (stepsOn === null) {
      // Bounds the scan: there is one (direction, position) pair per neighbour.
      if (index >= enter.length) return undefined;
      return { position, index, found, stepsOn: value === enter[index] };
    }
    if (stepsOn && value !== position - 1) return undefined;
    return { position, index: index + 1, found: found || stepsOn, stepsOn: null };
  },
  accept: ({ position, found, stepsOn }) =>
    stepsOn === null && (found || position === 1),
}, numValues));
const positions = gridCells.map(cell => new NFA(
  posMachine(inBoxDirs(cell).map(d => OPPOSITE[d])), 'position',
  pos.at(cell),
  ...inBoxDirs(cell).flatMap(d => {
    const other = stepDir(cell, d);
    return [dir.at(other), pos.at(other)];
  })));

// --- One segment per box. Every segment holds the digit 1: the index rule says
// its 1st cell gives the position of the digit 1, so that digit is somewhere on
// the segment. Two segments in one box would therefore put two 1s in that box.
// A box is entered once per segment, so at most one loop step crosses into it.
// `into` gives, per boundary cell in the order scanned, the direction value that
// means "steps across the border into this box".
const entryMachine = memoizeMachine(into => NFA.encodeSpec({
  startState: { index: 0, entries: 0 },
  transition: ({ index, entries }, value) => {
    if (index >= into.length) return undefined;   // one value per boundary cell
    const next = entries + (value === into[index] ? 1 : 0);
    return next > 1 ? undefined : { index: index + 1, entries: next };
  },
  accept: ({ entries }) => entries <= 1,
}, numValues));
const boxEntries = boxes.map(box => {
  const crossings = box.flatMap(cell => DIRS
    .map(d => [d, stepDir(cell, d)])
    .filter(([, other]) => other !== null && !sameBox(cell, other))
    .map(([d, other]) => [other, OPPOSITE[d]]));
  return new NFA(entryMachine(crossings.map(([, d]) => d)), 'entry',
    ...crossings.map(([other]) => dir.at(other)));
});

// --- A box holds one segment, so the box's loop cells are that segment. Its
// digits are exactly 1..L and its positions are exactly 1..L, where L is how
// many of the box's cells lie on the loop: each digit names a position the
// segment has, and the index rule then makes the digits a self-inverse
// permutation of the positions, so both run over 1..L. The box's remaining
// digits are therefore exactly L+1..9. Each machine reads a (direction, value)
// pair per box cell and checks one extreme of that statement; the four digit
// views and two position views are equivalent given the box's all-different,
// but each of them propagates in its own right.
const extremeMachine = memoizeMachine((onLoop, largestOf) => NFA.encodeSpec({
  startState: { phase: 'flag', count: 0, extreme: largestOf ? 0 : numValues + 1 },
  transition: ({ phase, count, extreme, on }, value) => {
    if (phase === 'flag') {
      const isOn = value !== OFF;
      return { phase: 'value', extreme, on: isOn,
        count: Math.min(count + (isOn ? 1 : 0), numValues + 1) };
    }
    const counted = on === onLoop;
    return { phase: 'flag', count,
      extreme: !counted ? extreme
        : largestOf ? Math.max(extreme, value) : Math.min(extreme, value) };
  },
  accept: ({ phase, count, extreme }) => {
    if (phase !== 'flag') return false;
    if (onLoop) return largestOf ? extreme === count : count === 0 || extreme === 1;
    return largestOf
      ? count === numValues || extreme === numValues
      : extreme === count + 1;
  },
}, numValues));
const ON_LOOP = true, OFF_LOOP = false, LARGEST = true, SMALLEST = false;
const boxSegments = boxes.flatMap(box => {
  const digits = box.flatMap(cell => [dir.at(cell), cell]);
  const segmentPositions = box.flatMap(cell => [dir.at(cell), pos.at(cell)]);
  return [
    new NFA(extremeMachine(ON_LOOP, LARGEST), 'seg-digit-max', ...digits),
    new NFA(extremeMachine(ON_LOOP, SMALLEST), 'seg-digit-min', ...digits),
    new NFA(extremeMachine(OFF_LOOP, SMALLEST), 'off-digit-min', ...digits),
    new NFA(extremeMachine(OFF_LOOP, LARGEST), 'off-digit-max', ...digits),
    new NFA(extremeMachine(ON_LOOP, LARGEST), 'seg-pos-max', ...segmentPositions),
    new NFA(extremeMachine(ON_LOOP, SMALLEST), 'seg-pos-min', ...segmentPositions),
  ];
});

// --- Index lines. A segment lies inside one box and is the whole of that box's
// loop, so the rule relates any two loop cells of a box: one's digit is the
// other's position exactly when the reverse also holds, which with the digits
// running over 1..L is the rule "the digit in the Nth cell gives the position of
// digit N". Reads the two directions, then digit(a), position(b), digit(b),
// position(a); a pair with a cell off the loop is unconstrained.
const indexMachine = NFA.encodeSpec({
  startState: { phase: 'dirA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'dirA':
        return value === OFF ? { phase: 'other', left: 5 } : { phase: 'dirB' };
      case 'dirB':
        return value === OFF ? { phase: 'other', left: 4 } : { phase: 'digitA' };
      case 'other':
        return { phase: state.left > 1 ? 'other' : 'done', left: state.left - 1 };
      case 'digitA':
        return { phase: 'positionB', digit: value };
      case 'positionB':
        return { phase: 'digitB', aAtB: state.digit === value };
      case 'digitB':
        return { phase: 'positionA', aAtB: state.aAtB, digit: value };
      case 'positionA':
        return (state.digit === value) === state.aAtB
          ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);
const indexLines = boxes.flatMap(box => box.flatMap((a, i) =>
  box.slice(i + 1).map(b => new NFA(indexMachine, 'index',
    dir.at(a), dir.at(b), a, pos.at(b), b, pos.at(a)))));

return [
  new Shape('9x9'),
  dir.toVar('dir'),
  pos.toVar('pos'),
  ...dots.map(([a, b]) => new WhiteDot(a, b)),
  ...redFortress.map(cell => new GreaterThan(cell, ...graph.neighbours(cell))),
  ...blueFortress.map(cell => new GreaterThan(...graph.neighbours(cell), cell)),
  ...directionDomains,
  ...steps,
  ...degrees,
  noDiagonalTouches,
  // Single loop: the loop cells form one orthogonally-connected region, and a
  // connected 2-regular graph is a single cycle.
  new ConnectedValues('VD', DIRS),
  ...fortressLoop,
  ...positions,
  ...boxEntries,
  ...boxSegments,
  ...indexLines,
];
