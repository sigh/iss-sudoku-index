// Title: Poker Fillomino
// Author: Freddie Hand
// Video: https://www.youtube.com/watch?v=W6v-8Y6_Kkk
// Source: https://tinyurl.com/y95cepq5

// Poker Fillomino, 10x10. There is no Sudoku layer, so the grid is Raw: rows,
// columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Standard Fillomino. Divide the grid into polyominoes so that no two
//    polyominoes with the same area share an edge; each number is the area of
//    the polyomino it belongs to; a polyomino may contain zero, one or more of
//    the given numbers, and a hidden polyomino may carry a value not present in
//    the starting grid.
//  * The 16 given numbers.
//  * The numbers in the six drawn cages form, in any order, four of a kind, a
//    straight, a full house, three of a kind, one pair and one pair, with
//    1 = ace and 11/12/13 = jack/queen/king.
//
// Nothing is omitted. A polyomino may be as large as the board, so a number
// does not fit in one 16-value cell: every cell's number is held as its tens
// digit on an overlay and its units digit on the board.

const SIDE = 10;
const MAX_AREA = SIDE * SIDE;
const MAX_TENS = Math.floor(MAX_AREA / 10);   // 10: the tens digit of 100

const shape = new Shape('10x10', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// ---- Fillomino ----
//
// A polyomino is the set of cells that name the same root, where a
// polyomino's root is its first cell in reading order. Five overlays carry it:
//   tens    - tens digit of the cell's number (the board holds the units);
//   rootRow
//   rootCol - which cell is the root of this cell's polyomino;
//   d11, d13 - the cell's distance from its root, as residues mod 11 and 13
//              (lcm 143 > 100, so the pair is the distance itself).
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const d11 = graph.makeOverlay('VA');
const d13 = graph.makeOverlay('VB');
const MOD_A = 11;
const MOD_B = 13;

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  restrict(tens, range(0, MAX_TENS)),
  restrict(rootRow, range(1, SIDE)),
  restrict(rootCol, range(1, SIDE)),
  restrict(d11, range(0, MOD_A - 1)),
  restrict(d13, range(0, MOD_B - 1)),
];

// A cell's number is at least 1.
const positive = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'number is positive', tens.at(cell), cell));

// Reads [rootRow, rootCol, d11, d13] of one cell. The root named must not come
// after the cell in reading order, and the cell is at distance 0 exactly when
// it is its own root.
const rootSpecs = new Map();
const rootSpec = (row, col) => {
  const key = row + '_' + col;
  if (!rootSpecs.has(key)) {
    rootSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) {
          return value <= row ? { phase: 1, rowEq: value === row } : undefined;
        }
        if (state.phase === 1) {
          if (state.rowEq && value > col) return undefined;
          return { phase: 2, self: state.rowEq && value === col };
        }
        if (state.phase === 2) {
          return { phase: 3, self: state.self, zero: value === 0 };
        }
        if (state.phase === 3) {
          const zero = state.zero && value === 0;
          return zero === state.self ? { phase: 4 } : undefined;
        }
        return undefined;
      },
      accept: state => state.phase === 4,
    }, shape));
  }
  return rootSpecs.get(key);
};

const roots = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root is first in reading order',
    rootRow.at(cell), rootCol.at(cell), d11.at(cell), d13.at(cell));
});

// Every cell other than a root has an orthogonal neighbour in its own
// polyomino one step nearer the root. Following such neighbours changes the
// residue pair by one each step, so the walk cannot revisit a cell within 143
// steps and must reach a root: the polyomino is connected and contains the
// cell it names.
const stepA = Pair.fnToKey((mine, other) => other === (mine + MOD_A - 1) % MOD_A, shape);
const stepB = Pair.fnToKey((mine, other) => other === (mine + MOD_B - 1) % MOD_B, shape);
const descents = cells.map(cell => new Or([
  new And([new Given(d11.at(cell), 0), new Given(d13.at(cell), 0)]),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, rootRow.at(cell), rootRow.at(other)),
    new SameValues(2, rootCol.at(cell), rootCol.at(other)),
    new Pair(stepA, 'one step nearer the root', d11.at(cell), d11.at(other)),
    new Pair(stepB, 'one step nearer the root', d13.at(cell), d13.at(other)),
  ])),
]));

// Reads [d11(cell), d13(cell), tens(cell), units(cell), then rootRow and
// rootCol of this cell and of every cell after it in reading order]. A cell at
// distance 0 is a root, and exactly its number's worth of cells name it; only
// cells at or after it in reading order can, so `maxArea` (how many there are)
// bounds the count. A cell at positive distance is named by nobody.
const sizeSpecs = new Map();
const sizeSpec = (row, col, maxArea) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'd11' },
      transition: (state, value) => {
        if (state.phase === 'd11') return { phase: 'd13', zero: value === 0 };
        if (state.phase === 'd13') {
          return state.zero && value === 0
            ? { phase: 'tens' } : { phase: 'skip', left: 2 };
        }
        if (state.phase === 'skip') {
          // Not a root: its own number is read past, then nobody may name it.
          return state.left > 1 ? { phase: 'skip', left: 1 } : { phase: 'row', rem: 0 };
        }
        if (state.phase === 'tens') {
          return 10 * value <= maxArea ? { phase: 'units', rem: 10 * value } : undefined;
        }
        if (state.phase === 'units') {
          const rem = state.rem + value;
          return rem <= maxArea ? { phase: 'row', rem } : undefined;
        }
        if (state.phase === 'row') {
          return { phase: 'col', rem: state.rem, rowEq: value === row };
        }
        if (state.rowEq && value === col) {
          return state.rem > 0 ? { phase: 'row', rem: state.rem - 1 } : undefined;
        }
        return { phase: 'row', rem: state.rem };
      },
      accept: state => state.phase === 'row' && state.rem === 0,
    }, shape));
  }
  return sizeSpecs.get(key);
};

const sizes = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  return new NFA(sizeSpec(row, col, later.length), 'polyomino area equals its number',
    d11.at(cell), d13.at(cell), tens.at(cell), cell,
    ...later.flatMap(other => [rootRow.at(other), rootCol.at(other)]));
});

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b)] and ends in a state
// recording whether a and b are in the same polyomino.
const readSameRegion = (state, value) => {
  if (state.phase === 0) return { phase: 1, mine: value };
  if (state.phase === 1) return { phase: 2, same: value === state.mine };
  if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
  return { phase: 4, same: state.same && value === state.mine };
};

// Reads [tens(a), tens(b), units(a), units(b), rootRow(a), rootRow(b),
// rootCol(a), rootCol(b)] for one orthogonal edge: the two numbers are equal
// exactly when the two cells are in the same polyomino. Within a polyomino
// that makes the number uniform; across a boundary it is "polyominoes of
// equal area do not share an edge".
const numberEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
    if (state.phase === 3) {
      return { phase: 4, sameNumber: state.same && value === state.mine };
    }
    if (state.phase === 4) return { phase: 5, sameNumber: state.sameNumber, mine: value };
    if (state.phase === 5) {
      return { phase: 6, sameNumber: state.sameNumber, same: value === state.mine };
    }
    if (state.phase === 6) {
      return { phase: 7, sameNumber: state.sameNumber, same: state.same, mine: value };
    }
    if (state.phase === 7) {
      const sameRegion = state.same && value === state.mine;
      return sameRegion === state.sameNumber ? { phase: 8 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 8,
}, shape);

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), d11(a), d11(b),
// d13(a), d13(b)]: within a polyomino, one step changes the distance to the
// root by -1, 0 or +1, the same amount in both residues. This is what makes
// the residue pair the true distance rather than any descending chain.
const distanceEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase < 4) return readSameRegion(state, value);
    // Different polyominoes: the four residues are unconstrained, read them past.
    if (!state.same) {
      return state.phase < 8 ? { phase: state.phase + 1, same: false } : undefined;
    }
    if (state.phase === 4) return { phase: 5, same: true, mine: value };
    if (state.phase === 5) {
      const delta = (value - state.mine + MOD_A) % MOD_A;
      if (delta !== 0 && delta !== 1 && delta !== MOD_A - 1) return undefined;
      return { phase: 6, same: true, delta: delta === MOD_A - 1 ? -1 : delta };
    }
    if (state.phase === 6) return { phase: 7, same: true, delta: state.delta, mine: value };
    if (state.phase === 7) {
      const delta = (value - state.mine + MOD_B) % MOD_B;
      const expected = (state.delta + MOD_B) % MOD_B;
      return delta === expected ? { phase: 8 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 8,
}, shape);

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a polyomino',
    tens.at(a), tens.at(b), a, b,
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    d11.at(a), d11.at(b), d13.at(a), d13.at(b)),
]);

// ---- Poker hands ----
//
// The six drawn cages, each a straight run of five cells:
// [startRow, startCol, rowStep, colStep], transcribed from the dashed
// outlines in the grid.
const CAGE_RUNS = [
  [1, 8, 1, 0],
  [2, 1, 0, 1],
  [4, 1, 0, 1],
  [6, 3, 1, 0],
  [7, 6, 0, 1],
  [9, 6, 0, 1],
];
const CAGE_SIZE = 5;
const CAGES = CAGE_RUNS.map(([row, col, rowStep, colStep]) => Array.from(
  { length: CAGE_SIZE },
  (_, i) => makeCellId(row + i * rowStep, col + i * colStep)));

// A cage cell holds a card. The conversion the rules give names ace..king as
// 1..13, so a cage number is one of those; read as [tens, units].
const RANKS = 13;
const isCard = Pair.fnToKey((t, u) => 10 * t + u >= 1 && 10 * t + u <= RANKS, shape);
const cards = CAGES.flat().map(
  cell => new Pair(isCard, 'cage cell holds a card', tens.at(cell), cell));

const FOUR_OF_A_KIND = 1;
const STRAIGHT = 2;
const FULL_HOUSE = 3;
const THREE_OF_A_KIND = 4;
const ONE_PAIR = 5;
// Each named hand as the multiset of "how many cards of the hand share my
// rank", one entry per card. These are the exclusive poker categories: a full
// house is not a three of a kind, two pair is not one pair, and five equal
// cards are no hand at all.
const HAND_SHAPES = new Map([
  [FOUR_OF_A_KIND, [4, 4, 4, 4, 1]],
  [STRAIGHT, [1, 1, 1, 1, 1]],
  [FULL_HOUSE, [3, 3, 3, 2, 2]],
  [THREE_OF_A_KIND, [3, 3, 3, 1, 1]],
  [ONE_PAIR, [2, 2, 1, 1, 1]],
]);

const hands = new Var('H', 'hand formed by each cage', CAGES.length);
const mults = new Var('M', 'rank multiplicity of each card',
  CAGES.length * CAGE_SIZE);
const lows = new Var('L', 'low card of the straight', CAGES.length);
const handCell = i => 'VH' + (i + 1);
const multCell = (i, j) => 'VM' + (i * CAGE_SIZE + j + 1);
const lowCell = i => 'VL' + (i + 1);

// Reads [tens, units of one card, its multiplicity, then tens, units of every
// card in its cage]. The multiplicity is how many of the cage's five cards
// share that card's rank (the card itself included).
const multSpec = NFA.encodeSpec({
  startState: { phase: 'cardTens' },
  transition: (state, value) => {
    // A card's tens digit is 0 or 1; anything else is rejected as it is read.
    if (state.phase === 'cardTens') {
      return value <= 1 ? { phase: 'cardUnits', tens: value } : undefined;
    }
    if (state.phase === 'cardUnits') {
      const card = 10 * state.tens + value;
      return card >= 1 && card <= RANKS ? { phase: 'mult', card } : undefined;
    }
    if (state.phase === 'mult') {
      return value >= 1 && value <= CAGE_SIZE
        ? { phase: 'tens', card: state.card, mult: value, count: 0 } : undefined;
    }
    if (state.phase === 'tens') {
      return value <= 1
        ? { phase: 'units', card: state.card, mult: state.mult, count: state.count, tens: value }
        : undefined;
    }
    const other = 10 * state.tens + value;
    if (other < 1 || other > RANKS) return undefined;
    const count = state.count + (other === state.card ? 1 : 0);
    return count <= state.mult
      ? { phase: 'tens', card: state.card, mult: state.mult, count } : undefined;
  },
  accept: state => state.phase === 'tens' && state.count === state.mult,
}, shape);

const multiplicities = CAGES.flatMap((cage, i) => cage.map(
  (cell, j) => new NFA(multSpec, 'rank multiplicity',
    tens.at(cell), cell, multCell(i, j),
    ...cage.flatMap(other => [tens.at(other), other]))));

// Reads [the cage's hand, then its five multiplicities]. The multiplicities are
// exactly the shape of the named hand, in any order.
const handSpec = NFA.encodeSpec({
  startState: { need: null },
  transition: (state, value) => {
    if (state.need === null) {
      const wanted = HAND_SHAPES.get(value);
      return wanted ? { need: wanted } : undefined;
    }
    const at = state.need.indexOf(value);
    if (at < 0) return undefined;
    const need = state.need.slice();
    need.splice(at, 1);
    return { need };
  },
  accept: state => state.need !== null && state.need.length === 0,
}, shape);

const handShapes = CAGES.map((cage, i) => new NFA(
  handSpec, 'hand shape', handCell(i),
  ...cage.map((cell, j) => multCell(i, j))));

// Reads [the cage's hand, its low card, then tens, units of each card]. When
// the cage is the straight its five cards are five consecutive ranks up from
// the low card, one of them the low card itself. The rules name the ranks as
// cards, so the ace closes the run at either end: lows 1..9 are the plain runs
// and low 10 is ten-jack-queen-king-ace. No other wrap is a straight, which is
// why the low card stops at 10. A cage that is not the straight pins its
// unused low card to 1.
const MAX_LOW = 10;
const straightSpec = NFA.encodeSpec({
  startState: { phase: 'hand' },
  transition: (state, value) => {
    if (state.phase === 'hand') {
      return { phase: 'low', straight: value === STRAIGHT };
    }
    if (state.phase === 'low') {
      if (!state.straight) return value === 1 ? { phase: 'idle' } : undefined;
      return value >= 1 && value <= MAX_LOW
        ? { phase: 'tens', low: value, sawLow: false } : undefined;
    }
    if (state.phase === 'idle') return state;
    if (state.phase === 'tens') {
      return value <= 1
        ? { phase: 'units', low: state.low, sawLow: state.sawLow, tens: value }
        : undefined;
    }
    const card = 10 * state.tens + value;
    if (card < 1 || card > RANKS) return undefined;
    const offset = (card - state.low + RANKS) % RANKS;
    return offset < CAGE_SIZE
      ? { phase: 'tens', low: state.low, sawLow: state.sawLow || offset === 0 }
      : undefined;
  },
  accept: state =>
    state.phase === 'idle' || (state.phase === 'tens' && state.sawLow),
}, shape);

const straights = CAGES.map((cage, i) => new NFA(
  straightSpec, 'straight run', handCell(i), lowCell(i),
  ...cage.flatMap(cell => [tens.at(cell), cell])));

// The six cages form each named hand once, and one pair twice.
const handList = new ContainExact(
  [FOUR_OF_A_KIND, STRAIGHT, FULL_HOUSE, THREE_OF_A_KIND, ONE_PAIR, ONE_PAIR]
    .join('_'),
  ...CAGES.map((cage, i) => handCell(i)));

// ---- Givens ----
//
// Transcribed from the 16 numbers printed in the grid: [row, col, number].
const GIVENS = [
  [1, 4, 13], [1, 10, 11], [2, 9, 7], [3, 2, 11], [3, 4, 13], [4, 9, 6],
  [5, 4, 2], [5, 6, 1], [6, 5, 4], [6, 7, 2], [7, 2, 10], [8, 7, 8],
  [8, 9, 7], [9, 2, 9], [10, 1, 6], [10, 7, 12],
];
const givens = GIVENS.flatMap(([row, col, number]) => {
  const cell = makeCellId(row, col);
  return [
    new Given(tens.at(cell), Math.floor(number / 10)),
    new Given(cell, number % 10),
  ];
});

return [
  shape,
  tens.toVar('tens digit of the number'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  hands,
  mults,
  lows,
  ...domains,
  ...givens,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...cards,
  ...multiplicities,
  ...handShapes,
  ...straights,
  handList,
];
