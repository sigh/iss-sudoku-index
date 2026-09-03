// Title: Operation: Trick or Treat!
// Author: Ricky Cruz
// Video: https://www.youtube.com/watch?v=rRCy9xfRldI
// Source: https://app.crackingthecryptic.com/webapp/MLPrTD2pB6

// Rules encoded below:
//   1. Normal sudoku.
//   2. Cells a knight's move apart cannot hold the same digit.
//   3. A one-cell wide path forms a single loop starting and ending in the
//      central cell R5C5.
//   4. The path orthogonally touches each grey cell at least once and never
//      enters a grey cell.
//   5. The path never touches itself orthogonally.
//   6. The central cell holds the lowest digit appearing on the path.
//   7. The path visits the six circled cells in strictly ascending digit order,
//      a cell being visited the first time the path orthogonally touches it.
//      The direction the loop runs is the solver's choice.
// Nothing is omitted.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Grey cells ("houses") and the circles drawn on six of them, transcribed from
// the full-cell grey squares and the 0.7-wide circles of the drawn grid.
const houses = [
  'R2C2', 'R2C4', 'R2C6', 'R2C7', 'R2C8',
  'R4C2', 'R4C7', 'R4C8',
  'R6C2', 'R6C3', 'R6C8',
  'R8C2', 'R8C3', 'R8C4', 'R8C6', 'R8C8',
];
const candy = ['R2C2', 'R2C8', 'R4C7', 'R6C3', 'R8C2', 'R8C8'];
const home = 'R5C5';

// Transcribed from the drawn givens.
const givens = {
  R1C7: 7, R2C3: 9, R2C9: 1, R3C1: 5, R3C7: 2, R4C2: 7,
  R6C8: 5, R7C3: 1, R7C9: 5, R8C1: 7, R8C7: 3, R9C3: 4,
};

// --- Route overlay -------------------------------------------------------
// One Var cell per grid cell (VP1..VP81, in grid order) carrying a single code
// that does two jobs at once: it says whether the cell is on the route, and if
// it is, how far the route has got through the candy houses when it reaches
// that cell.
//   OFF        the cell is not on the route
//   1 + k      the cell is on the route, and the k highest-ranked candy houses
//              (see the rank Vars below) have been visited at or before it
// Levels run 1..TOP because there are six candy houses, so k is 0..6.
const OFF = 8;
const TOP = 1 + candy.length;
const LEVELS = Array.from({ length: TOP }, (_, i) => i + 1);

const route = graph.makeOverlay('VP');
const gridCells = graph.cells();

// --- Candy ranks ---------------------------------------------------------
// One Var per circled house holding its position 1..6 in the required visiting
// order. The ranks are a permutation of 1..6 fixed by the digits (below), so
// they add no freedom of their own; they exist so that "the next candy house
// visited is the next one in order" becomes the local test "the level rises by
// at most one", which a route cell can check against its own neighbours.
const rank = new Var('R', 'candy-rank', candy.length);
const rankCells = rank.cells();
const rankOf = new Map(candy.map((cell, i) => [cell, rankCells[i]]));

// The rank Var of the candy house a route cell touches, or null. Each cell
// touches at most one candy house: no two circled cells are within a taxicab
// distance of 2 of each other, so they share no orthogonal neighbour.
const touchedRank = new Map(gridCells.map(cell => {
  const touched = graph.neighbours(cell).filter(n => rankOf.has(n));
  return [cell, touched.length ? rankOf.get(touched[0]) : null];
}));

// --- Route membership ----------------------------------------------------
const originCell = route.cells()[0];
const membership = [
  route.makeReplicate(new Given(originCell, ...LEVELS, OFF)),
  ...route.at(houses).map(cell => new Given(cell, OFF)),
  // The loop runs through the central cell, before any candy house is visited.
  new Given(route.at(home), 1),
];

// --- Degree 2: each route cell has exactly two route neighbours. ---
// Reads the code of the cell, then of each neighbour. Off cells are free.
// This is also rule 5: a cell the route came alongside would have three.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (value > OFF) return undefined;
    if (state.phase === 'start') {
      return value === OFF ? { phase: 'off' } : { phase: 'on', onNeighbours: 0 };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.onNeighbours + (value === OFF ? 0 : 1);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: (state) => state.phase === 'off' || state.onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...route.at([cell, ...graph.neighbours(cell)])));

// --- Each grey cell is touched by the route at least once. ---
const touchMachine = NFA.encodeSpec({
  startState: { seen: false },
  transition: ({ seen }, value) =>
    value > OFF ? undefined : { seen: seen || value !== OFF },
  accept: ({ seen }) => seen,
}, geometry.numValues);
const touches = houses.map(house => new NFA(touchMachine, 'touch',
  ...route.at(graph.neighbours(house))));

// --- Levels rise along the route, one candy house at a time. ---
// Segments: the cell's own code, then its four neighbours' codes, then (only
// for a cell that touches a candy house) that house's rank Var.
//
// Along the loop from the central cell the level is
//   level(next) = max(level(previous), 1 + rank of the candy house next touches)
// and the level of the previous cell is the smaller of the cell's two route
// neighbours, because the level never falls going round. So each route cell
// checks, against the smaller neighbouring level `min`:
//   own === max(min, 1 + rank)   the level records exactly the houses visited
//   own <= min + 1               no candy house is skipped over
// Together these force the levels to climb 1, 2, ... 1+6 in step with the candy
// houses being touched in rank order.
//
// The central cell's two route neighbours are the two ends of the loop, and one
// of them carries the wrap from level TOP back to level 1, so neither can read
// its predecessor off `min`. `seam` builds their variant, which is given only
// their other neighbours: the one at level TOP is the loop's last cell and takes
// its predecessor from them, the other is the loop's first cell and takes its
// predecessor from the central cell, at level 1. Which of the two is which is
// exactly the choice of direction round the loop. No cell beside the central
// cell touches a candy house, so the last cell's level simply repeats its
// predecessor's, which is what pins that predecessor at TOP and leaves the
// levels no room to dip anywhere round the loop.
const levelMachine = (seam) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.phase === 'own') return { phase: 'nb', own: state.own, min: 0 };
      if (state.phase === 'nb') return { phase: 'rank', own: state.own, min: state.min };
      return undefined;
    }
    if (value > OFF) return undefined;
    switch (state.phase) {
      case 'start':
        return { phase: 'own', own: value };
      case 'nb':
        return {
          phase: 'nb',
          own: state.own,
          min: value === OFF ? state.min
            : (state.min === 0 ? value : Math.min(state.min, value)),
        };
      case 'rank':
        return { phase: 'done', own: state.own, min: state.min, rank: value };
      default:
        return undefined;
    }
  },
  accept: (state) => {
    if (state.phase !== 'nb' && state.phase !== 'done') return false;
    if (state.own === OFF) return true;
    const reached = state.phase === 'done' ? state.rank + 1 : 1;
    // The loop's first cell: its predecessor is the central cell, at level 1.
    if (seam && state.own !== TOP) {
      return state.own === Math.max(1, reached) && state.own <= 2;
    }
    if (state.min === 0) return false;
    return state.own === Math.max(state.min, reached) && state.own <= state.min + 1;
  },
}, geometry.numValues, { multiSegment: true });
const levelPlain = levelMachine(false);
const levelSeam = levelMachine(true);

const homeNeighbours = graph.neighbours(home);
const levels = gridCells.filter(cell => cell !== home).map(cell => {
  const rankCell = touchedRank.get(cell);
  const seam = homeNeighbours.includes(cell);
  const neighbours = graph.neighbours(cell).filter(n => !seam || n !== home);
  return new NFA(seam ? levelSeam : levelPlain, 'level',
    [route.at(cell)],
    route.at(neighbours),
    ...(rankCell ? [[rankCell]] : []));
});

// --- The central cell is the seam. ---
// Reads its own code, then its four neighbours' codes. Its two route
// neighbours are the two ends of the loop: one is the last cell, at level TOP
// with all six candy houses visited, the other the first, still at level 1 or
// (if it already touches the first candy house) 2.
const homeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (value > OFF) return undefined;
    if (state.phase === 'start') {
      return value === 1 ? { phase: 'nb', last: 0, first: 0, on: 0 } : undefined;
    }
    if (value === OFF) return state;
    const on = state.on + 1;
    if (on > 2) return undefined;
    return {
      phase: 'nb',
      last: state.last + (value === TOP ? 1 : 0),
      first: state.first + (value <= 2 ? 1 : 0),
      on,
    };
  },
  accept: (state) =>
    state.phase === 'nb' && state.on === 2 && state.last === 1 && state.first === 1,
}, geometry.numValues);
const homeSeam = new NFA(homeMachine, 'home',
  ...route.at([home, ...homeNeighbours]));

// --- Candy order: rank order and digit order agree. ---
// Reads two candy houses' ranks then their two digits. Requiring the digit
// comparison to match the rank comparison in both directions makes the two
// digits differ, which is the "strictly" in strictly ascending.
const orderMachine = NFA.encodeSpec({
  startState: { phase: 'rankA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'rankA': return { phase: 'rankB', rankA: value };
      case 'rankB': return { phase: 'digitA', earlier: state.rankA < value };
      case 'digitA': return { phase: 'digitB', earlier: state.earlier, digitA: value };
      case 'digitB':
        return (state.earlier ? state.digitA < value : state.digitA > value)
          ? { phase: 'done' } : undefined;
      default: return undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const candyOrder = candy.flatMap((a, i) => candy.slice(i + 1).map(b =>
  new NFA(orderMachine, 'candy-order', rankOf.get(a), rankOf.get(b), a, b)));
const rankDomain = [
  ...rankCells.map(cell => new Given(cell, ...candy.map((_, i) => i + 1))),
  new AllDifferent(...rankCells),
];

// --- No digit on the route is lower than the central cell's. ---
// Reads the central cell's digit, then the cell's route code and its digit.
const floorMachine = NFA.encodeSpec({
  startState: { phase: 'home' },
  transition: (state, value) => {
    if (state.phase === 'home') return { phase: 'member', floor: value };
    if (state.phase === 'member') {
      if (value > OFF) return undefined;
      return value === OFF ? { phase: 'skip' } : { phase: 'digit', floor: state.floor };
    }
    if (state.phase === 'digit') {
      return value >= state.floor ? { phase: 'done' } : undefined;
    }
    // An off-route cell still has its digit to read, and it is unconstrained.
    if (state.phase === 'skip') return { phase: 'done' };
    return undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const floors = gridCells
  .filter(cell => cell !== home && !houses.includes(cell))
  .map(cell => new NFA(floorMachine, 'floor', home, route.at(cell), cell));

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, digit]) => new Given(cell, digit)),
  new AntiKnight(),
  route.toVar('route'),
  rank,
  ...membership,
  ...rankDomain,
  // Single loop: the route cells form one orthogonally-connected region, and
  // degree 2 makes them 2-regular, so they form exactly one simple cycle.
  new ConnectedValues('VP', LEVELS),
  ...degrees,
  ...touches,
  ...levels,
  homeSeam,
  ...candyOrder,
  ...floors,
];
