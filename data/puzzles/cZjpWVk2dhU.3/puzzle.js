// Title: Zip
// Author: Bartok_the_Magnificent
// Video: https://www.youtube.com/watch?v=cZjpWVk2dhU
// Source: https://sudokupad.app/a15tt4jnj4

// Normal 6x6 sudoku, plus a line the solver must draw:
//   - it steps between orthogonally adjacent cells and visits every cell
//     exactly once, without crossing itself;
//   - it may not step across a thick black border;
//   - digits alternate odd/even along it;
//   - it starts at the bubble holding 1 and ends at the bubble holding 6, and
//     meets the six bubbles in increasing digit order;
//   - the four unlabelled bubbles hold 2, 3, 4 and 5;
//   - each bubble digit is immediately preceded or followed along the line by
//     the digit with the same residue mod 3 (1 with 4, 2 with 5, 3 with 6).
// Every clause is encoded; nothing is omitted.
//
// The line is modelled by its visit order rather than by its edges: each grid
// cell carries a position 1..36, held as two Var overlays VH (high) and VL
// (low), with position = 6 * (VH - 1) + VL.

const graph = cellGraph('6x6');
const numValues = graph.gridGeometry().numValues;
const lastPosition = numValues * numValues;

// Cell pairs separated by the two thick black strokes drawn on cell borders.
const WALLS = [['R3C2', 'R4C2'], ['R3C3', 'R4C3'], ['R5C2', 'R5C3']];
const walled = new Set(WALLS.flatMap(([a, b]) => [a + '/' + b, b + '/' + a]));
// The cells the line may step to from `cell`.
const openNeighbours = cell =>
  graph.neighbours(cell).filter(other => !walled.has(cell + '/' + other));

// The bubbles, from the drawn circles. R6C1 and R1C3 carry the printed digits.
const firstBubble = 'R6C1';
const lastBubble = 'R1C3';
const openBubbles = ['R1C4', 'R3C4', 'R4C2', 'R6C4'];

const high = graph.makeOverlay('VH');
const low = graph.makeOverlay('VL');
const positionOf = (h, l) => (h - 1) * numValues + l;   // 1..36
const positionCells = cell => [high.at(cell), low.at(cell)];

// --- The line's endpoints, as positions: first cell 1, last cell 36. ---
const endpoints = [
  new Given(high.at(firstBubble), 1),
  new Given(low.at(firstBubble), 1),
  new Given(high.at(lastBubble), numValues),
  new Given(low.at(lastBubble), numValues),
];

// --- The line itself: every cell except position 1 has an unwalled orthogonal
// neighbour whose position is one lower.
// That single rule is the whole path. Position 36 is occupied (the last cell),
// so chaining the rule downwards makes every value 1..36 occur; 36 values over
// 36 cells makes the positions a bijection, so the cell at position k+1 is
// orthogonally adjacent, across an open border, to the unique cell at position
// k -- a Hamiltonian path from position 1 to position 36.
// Reads the cell's own (high, low), then each open neighbour's (high, low).
const predecessorMachine = NFA.encodeSpec({
  startState: { phase: 'high' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'high':
        return { phase: 'low', high: value };
      case 'low': {
        const position = positionOf(state.high, value);
        // The line's first cell needs no predecessor.
        if (position === 1) return { phase: 'found' };
        return { phase: 'neighbourHigh', want: position - 1 };
      }
      case 'neighbourHigh':
        return { phase: 'neighbourLow', want: state.want, high: value };
      case 'neighbourLow':
        return positionOf(state.high, value) === state.want
          ? { phase: 'found' }
          : { phase: 'neighbourHigh', want: state.want };
      case 'found':
        return { phase: 'found' };
    }
  },
  accept: state => state.phase === 'found',
}, numValues);
const path = graph.cells().map(cell => new NFA(predecessorMachine, 'prev',
  ...positionCells(cell),
  ...openNeighbours(cell).flatMap(positionCells)));

// --- Parity alternates along the line. ---
// Cells one position apart hold digits of opposite parity, and position 1 holds
// the printed 1, so a cell's digit is odd exactly when its position is odd.
// position = 6 * (VH - 1) + VL has the parity of VL, so it is enough to tie
// each digit's parity to its own VL cell.
const parityKey = Pair.fnToKey(
  (digit, lowValue) => (digit & 1) === (lowValue & 1), numValues);
const parity = graph.cells().map(
  cell => new Pair(parityKey, 'parity', cell, low.at(cell)));

// --- The six bubbles are met in increasing digit order. ---
// Reads the two highs, the two lows, then the two digits: the sign of the
// position comparison must equal the sign of the digit comparison.
const orderMachine = NFA.encodeSpec({
  startState: { phase: 'highA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'highA':
        return { phase: 'highB', high: value };
      case 'highB':
        return { phase: 'lowA', order: Math.sign(state.high - value) };
      case 'lowA':
        return { phase: 'lowB', order: state.order, low: value };
      case 'lowB': {
        const order = state.order || Math.sign(state.low - value);
        // Distinct cells hold distinct positions.
        return order === 0 ? undefined : { phase: 'digitA', order };
      }
      case 'digitA':
        return { phase: 'digitB', order: state.order, digit: value };
      case 'digitB':
        return Math.sign(state.digit - value) === state.order
          ? { phase: 'done' }
          : undefined;
    }
  },
  accept: state => state.phase === 'done',
}, numValues);
// Only the four unlabelled bubbles need the comparison: the 1 bubble holds both
// the smallest digit and position 1, and the 6 bubble holds the largest digit
// and position 36, so their comparisons hold for free.
const bubbleOrder = openBubbles.flatMap((a, i) => openBubbles.slice(i + 1).map(b =>
  new NFA(orderMachine, 'order', high.at(a), high.at(b), low.at(a), low.at(b), a, b)));

// --- Each bubble digit sits next to its mod-3 partner along the line. ---
// Reads the bubble's digit and position, then each open neighbour's position
// and digit; a neighbour counts only when its position differs by one, which is
// exactly what it means to be the bubble's predecessor or successor on the line.
const partnerMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'digit':
        return { phase: 'high', residue: value % 3 };
      case 'high':
        return { phase: 'low', residue: state.residue, high: value };
      case 'low':
        return {
          phase: 'neighbourHigh',
          residue: state.residue,
          position: positionOf(state.high, value),
        };
      case 'neighbourHigh':
        return {
          phase: 'neighbourLow',
          residue: state.residue,
          position: state.position,
          high: value,
        };
      case 'neighbourLow':
        return {
          phase: 'neighbourDigit',
          residue: state.residue,
          position: state.position,
          onLine: Math.abs(positionOf(state.high, value) - state.position) === 1,
        };
      case 'neighbourDigit':
        return state.onLine && value % 3 === state.residue
          ? { phase: 'found' }
          : { phase: 'neighbourHigh', residue: state.residue, position: state.position };
      case 'found':
        return { phase: 'found' };
    }
  },
  accept: state => state.phase === 'found',
}, numValues);
const partners = [firstBubble, ...openBubbles, lastBubble].map(cell =>
  new NFA(partnerMachine, 'partner', cell, ...positionCells(cell),
    ...openNeighbours(cell).flatMap(other => [...positionCells(other), other])));

// --- Consequences of the constraints above, restated for the solver. ---
// Each is derived below from the rules already encoded, so none of them changes
// which grids are accepted; they exist only because the search is far cheaper
// with them than without.

// The mirror image of the path rule: every cell except position 36 has an open
// neighbour one position later. It follows from the same bijection, reading the
// chain upwards instead of downwards.
const successorMachine = NFA.encodeSpec({
  startState: { phase: 'high' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'high':
        return { phase: 'low', high: value };
      case 'low': {
        const position = positionOf(state.high, value);
        if (position === lastPosition) return { phase: 'found' };
        return { phase: 'neighbourHigh', want: position + 1 };
      }
      case 'neighbourHigh':
        return { phase: 'neighbourLow', want: state.want, high: value };
      case 'neighbourLow':
        return positionOf(state.high, value) === state.want
          ? { phase: 'found' }
          : { phase: 'neighbourHigh', want: state.want };
      case 'found':
        return { phase: 'found' };
    }
  },
  accept: state => state.phase === 'found',
}, numValues);
const pathForwards = graph.cells().map(cell => new NFA(successorMachine, 'next',
  ...positionCells(cell),
  ...openNeighbours(cell).flatMap(positionCells)));

// The line reaches a cell in position - 1 steps from R6C1 and leaves it in
// 36 - position steps to R1C3, and neither run can be shorter than the shortest
// wall-respecting route, so those two distances box in every cell's position.
const distancesFrom = source => {
  const distance = new Map([[source, 0]]);
  const queue = [source];
  for (let i = 0; i < queue.length; i++) {
    for (const other of openNeighbours(queue[i])) {
      if (distance.has(other)) continue;
      distance.set(other, distance.get(queue[i]) + 1);
      queue.push(other);
    }
  }
  return distance;
};
const fromFirst = distancesFrom(firstBubble);
const fromLast = distancesFrom(lastBubble);
const rangeKeys = new Map();
const rangeKey = (lowest, highest) => {
  const id = lowest + ':' + highest;
  if (!rangeKeys.has(id)) {
    rangeKeys.set(id, Pair.fnToKey(
      (h, l) => positionOf(h, l) >= lowest && positionOf(h, l) <= highest, numValues));
  }
  return rangeKeys.get(id);
};
const positionRanges = graph.cells().map(cell => new Pair(
  rangeKey(1 + fromFirst.get(cell), lastPosition - fromLast.get(cell)),
  'reach', ...positionCells(cell)));

// Cells one position apart are orthogonally adjacent, so row + column changes
// parity in step with the position along the whole line. At the line's first
// cell, R6C1, row + column is odd and the position is 1, so every cell's
// position -- and hence, by the parity rule, its digit -- is odd exactly when
// its row + column is odd.
const checkerboard = graph.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  return (row + col) % 2 === 1
    ? new Given(cell, 1, 3, 5)
    : new Given(cell, 2, 4, 6);
});

return [
  new Shape('6x6'),
  new Given(lastBubble, 6),
  new Given(firstBubble, 1),
  high.toVar('position high'),
  low.toVar('position low'),
  ...endpoints,
  ...path,
  ...parity,
  // The unlabelled bubbles hold 2, 3, 4 and 5 between them.
  ...openBubbles.map(cell => new Given(cell, 2, 3, 4, 5)),
  new AllDifferent(...openBubbles),
  ...bubbleOrder,
  ...partners,
  ...pathForwards,
  ...positionRanges,
  ...checkerboard,
];
