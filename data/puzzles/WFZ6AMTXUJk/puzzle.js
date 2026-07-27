// Title: Mystery Hunt: Maze of Lies
// Author: Egregious Error
// Video: https://www.youtube.com/watch?v=WFZ6AMTXUJk
// Source: https://sudokupad.app/bo3con7363

// The grid is a maze of nine irregular nine-cell regions. Each cell is a room.
// A dark stroke drawn inside a region is a wall between two rooms; a small
// white gap drawn on a region border is a door between two regions.
//
// Nine characters make statements. Each one tells only the truth or only lies,
// and a liar's rules do not apply. Working out who lies is part of the puzzle,
// so it is left to the solver: the statements the speakers make about each
// other admit exactly three assignments of liars, and all three are offered.
//
//   world 1 -- liars Daniel, Vladimir, Annabelle
//   world 2 -- liars Daniel, Patrick, Helen, Annabelle, Jessica
//   world 3 -- liars Daniel, Patrick, Helen, Caroline
//
// Daniel is a liar in every one of them ("everyone lies all the time" cannot be
// true of its speaker), so his "Maurice is a liar" is false and Maurice always
// tells the truth. Maurice's rules are therefore unconditional; every other
// speaker's rules sit inside the world that makes them truthful.
//
//   Maurice   -- every room holds a digit 1-9 with no repeat in a row, a
//                column or a region; the one visible digit is the 5 in R7C1.
//   Patrick   -- (a) in the region whose only door faces West, rooms that are
//                orthogonally adjacent and not separated by a wall hold digits
//                at least 4 apart; (b) some region has all such pairs
//                differing by a power of two; (c) some other region has all
//                such pairs non-consecutive.
//   Jessica   -- (a) in the region whose only door faces North, no two rooms
//                that are orthogonally adjacent and not separated by a wall
//                both hold a prime; (b) in the region whose only door faces
//                East, every such pair differs by 1 or has one digit double
//                the other.
//   Caroline  -- each of the three regions with exactly two doors carries one
//                of these three rules, on the shortest path of rooms between
//                its two doors: the largest and smallest digits of the path
//                sit next to the doors; the digits strictly increase from one
//                door to the other; the digit next to one door equals the sum
//                of the remaining path digits.
//   Annabelle -- likewise one rule each on those three paths: the digits
//                alternate odd and even; the digits read in one direction form
//                a prime; the product of the digits is a perfect square.
//   Vladimir  -- in the region whose only door faces South, every number formed
//                by reading a straight line of rooms north to south or west to
//                east, from wall to wall, is a perfect square; another region
//                read that way gives primes, a third gives multiples of 7.
//   Helen     -- one region holds an exact copy of another region's digits,
//                possibly rotated. Only regions A, B and G are congruent, so
//                the copy is one of those three pairings.
//   Stephanie -- the true region-specific statements apply to different
//                regions. This is what confines the region-specific statements
//                that name no region to the regions left unclaimed.
//
// Relaxations, each of which only ever admits more grids:
//   A liar's statements are false. That is read as "their rules do not apply"
//     rather than as asserting the negations, so a world imposes nothing on
//     behalf of its liars.
//   Rules scoped "in" a region are applied only to room pairs both of which
//     lie in that region, so a pair joined across a door is not covered.
//   Vladimir's numbers are read only from straight lines of two or more rooms;
//     a lone room between two walls is not read as a one-digit number.
//   Vladimir's prime region and multiple-of-7 region are chosen independently,
//     so they are not forced to differ from each other.
//   Annabelle's prime-reading rule is dropped on a path longer than four rooms.
//     A reading machine needs one state per digit prefix, so a fifth room needs
//     9^4 = 6561 of them, past ISS's 4096-state compile ceiling. On the
//     nine-room path the rule is unsatisfiable anyway: that path covers a whole
//     region, so its digits are 1-9, and a digit sum of 45 makes every reading
//     a multiple of 9.

// Region membership, read off the drawn region borders. Letters A-I run in
// reading order of each region's first cell.
const REGIONS = {
  A: ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R4C1'],
  B: ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  C: ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9'],
  D: ['R3C3', 'R4C2', 'R4C3', 'R4C4', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2'],
  E: ['R4C5', 'R4C6', 'R5C4', 'R5C5', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R7C3'],
  F: ['R3C8', 'R4C7', 'R4C8', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C9'],
  G: ['R7C1', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R9C4'],
  H: ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R8C4', 'R8C5', 'R8C6', 'R9C5', 'R9C6'],
  I: ['R6C8', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
};

// The twelve dark strokes drawn inside regions: each blocks one room border.
const WALLS = [
  ['R1C1', 'R2C1'], ['R1C7', 'R1C8'], ['R2C8', 'R2C9'], ['R4C2', 'R4C3'],
  ['R4C7', 'R5C7'], ['R5C1', 'R6C1'], ['R7C1', 'R8C1'], ['R7C5', 'R7C6'],
  ['R8C1', 'R8C2'], ['R8C2', 'R8C3'], ['R8C4', 'R8C5'], ['R8C7', 'R9C7'],
];

// The eight white door markers drawn on region borders. Each pair is listed
// with the upper or left room first.
const DOORS = [
  ['R1C5', 'R1C6'], ['R3C2', 'R4C2'], ['R3C3', 'R3C4'], ['R3C5', 'R4C5'],
  ['R4C9', 'R5C9'], ['R6C7', 'R7C7'], ['R8C6', 'R8C7'], ['R9C4', 'R9C5'],
];

const graph = cellGraph('9x9');
const regionKeys = Object.keys(REGIONS);
const edgeKey = (a, b) => [a, b].sort().join('|');
const wallSet = new Set(WALLS.map(([a, b]) => edgeKey(a, b)));
const regionOf = new Map(
  regionKeys.flatMap(k => REGIONS[k].map(cell => [cell, k])));

// Room pairs inside one region that are orthogonally adjacent with no wall
// between them -- the "orthogonally connected rooms not separated by a wall"
// that the region rules talk about.
const openPairs = (key) => {
  const seen = new Set();
  const pairs = [];
  for (const a of REGIONS[key]) {
    for (const b of graph.neighbours(a)) {
      if (regionOf.get(b) !== key) continue;
      if (wallSet.has(edgeKey(a, b)) || seen.has(edgeKey(a, b))) continue;
      seen.add(edgeKey(a, b));
      pairs.push([a, b]);
    }
  }
  return pairs;
};

// Each door of a region, as the room it opens out of plus the compass
// direction it faces from inside that region.
const doorsOf = (key) => DOORS.flatMap(([a, b]) => {
  const horizontal = parseCellId(a).row === parseCellId(b).row;
  if (regionOf.get(a) === key) return [{ room: a, dir: horizontal ? 'E' : 'S' }];
  if (regionOf.get(b) === key) return [{ room: b, dir: horizontal ? 'W' : 'N' }];
  return [];
});

const soleRegionWithSingleDoor = (dir) => {
  const matches = regionKeys.filter(k => {
    const doors = doorsOf(k);
    return doors.length === 1 && doors[0].dir === dir;
  });
  if (matches.length !== 1) throw Error(`single ${dir} door region is not unique`);
  return matches[0];
};

// Shortest room-to-room route inside a region, walking only wall-free
// orthogonal borders. Throws unless the shortest route is unique, since the
// rules speak of "the shortest path".
const shortestPath = (key, from, to) => {
  const adjacency = new Map(REGIONS[key].map(c => [c, []]));
  for (const [a, b] of openPairs(key)) {
    adjacency.get(a).push(b);
    adjacency.get(b).push(a);
  }
  const prev = new Map([[from, []]]);
  const depth = new Map([[from, 0]]);
  for (let frontier = [from]; frontier.length; ) {
    const next = [];
    for (const cell of frontier) {
      for (const n of adjacency.get(cell)) {
        if (!depth.has(n)) {
          depth.set(n, depth.get(cell) + 1);
          prev.set(n, [cell]);
          next.push(n);
        } else if (depth.get(n) === depth.get(cell) + 1) {
          prev.get(n).push(cell);
        }
      }
    }
    frontier = next;
  }
  const path = [to];
  while (path[0] !== from) {
    const parents = prev.get(path[0]);
    if (parents.length !== 1) throw Error(`shortest path in ${key} is not unique`);
    path.unshift(parents[0]);
  }
  return path;
};

const PRIMES = new Set([2, 3, 5, 7]);
// Powers of two within a 1-9 difference, counting 2^0 = 1.
const POWER_OF_TWO_APART = Pair.fnToKey(
  (a, b) => [1, 2, 4, 8].includes(Math.abs(a - b)), 9);
const NON_CONSECUTIVE = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const NOT_BOTH_PRIME = Pair.fnToKey(
  (a, b) => !(PRIMES.has(a) && PRIMES.has(b)), 9);
const STEP_OR_DOUBLE = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1 || a === 2 * b || b === 2 * a, 9);
// The first cell of the pair holds the larger digit. GreaterThan is not usable
// here because it only relates orthogonally adjacent cells.
const FIRST_IS_GREATER = Pair.fnToKey((a, b) => a > b, 9);

const isSquare = (n) => Math.round(Math.sqrt(n)) ** 2 === n;
const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};
const isMultipleOf7 = (n) => n % 7 === 0;

// "Read the digits as a number, then test the number." The machine's state is
// the number built so far, which is also its own depth counter because sudoku
// digits are never 0: a k-digit prefix always has exactly k digits. On the last
// room the test runs and the machine drops into a single accepting state, which
// is what keeps the state count to 1 + 9 + 81 + ... + 9^(k-1) + 1.
const ACCEPT = -1;
const readingNFA = (digits, test) => NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => {
    const next = state * 10 + value;
    const roomsRead = state === 0 ? 0 : String(state).length;
    if (roomsRead < digits - 1) return next;
    return test(next) ? ACCEPT : undefined;
  },
  accept: (state) => state === ACCEPT,
}, 9);
// Four rooms is the longest run or path read below. A fifth digit would need
// 9^4 = 6561 prefix states, past the 4096-state compile ceiling.
const MAX_READ_DIGITS = 4;
const readingCache = new Map();
const cachedReader = (cacheKey, build) => {
  if (!readingCache.has(cacheKey)) readingCache.set(cacheKey, build());
  return readingCache.get(cacheKey);
};
// The rooms in reading order must spell a number the test accepts. A two-room
// reading is just a relation between two digits, so it goes through Pair.
const readsNumber = (cells, test, name) => cells.length === 2
  ? new Pair(
    cachedReader(`${name}|pair`,
      () => Pair.fnToKey((a, b) => test(a * 10 + b), 9)),
    name, ...cells)
  : new NFA(
    cachedReader(`${name}|${cells.length}`,
      () => readingNFA(cells.length, test)),
    name, ...cells);

const pairwiseRegionRule = (key, binaryKey, name) =>
  openPairs(key).map(([a, b]) => new Pair(binaryKey, name, a, b));

// Caroline's three path rules. Each takes the ordered shortest path and
// returns the constraints for that reading; the door rooms are its two ends.
const extremesNextToDoors = (path) => {
  const [first, ...rest] = path;
  const last = rest.pop();
  // Every room strictly between the doors is strictly between the two door
  // rooms in value, in whichever of the two orders holds.
  const between = (low, high) => new And(rest.flatMap(mid => [
    new Pair(FIRST_IS_GREATER, 'above the smallest', mid, low),
    new Pair(FIRST_IS_GREATER, 'below the largest', high, mid),
  ]));
  return [new Or([between(first, last), between(last, first)])];
};
const increasingBetweenDoors = (path) => [new Or([
  new Thermo(...path),
  new Thermo(...[...path].reverse()),
])];
const doorDigitSumsRest = (path) => [new Or([
  new Arrow(path[0], ...path.slice(1)),
  new Arrow(path[path.length - 1], ...path.slice(0, -1)),
])];

// Annabelle's three path rules, on the same door-to-door routes.
const alternatingParity = (path) => [new Modular(2, ...path)];
const primeReading = (path) => path.length > MAX_READ_DIGITS ? [] : [new Or([
  readsNumber(path, isPrime, 'prime'),
  readsNumber([...path].reverse(), isPrime, 'prime'),
])];
// The running state is one parity bit per prime factor 2, 3, 5, 7. The product
// is a perfect square exactly when every exponent ends up even. Indexed by
// digit: 6 = 2*3 flips both low bits, 4 = 2^2 and 9 = 3^2 flip nothing.
const FACTOR_PARITY = [0, 0, 1, 2, 0, 4, 3, 8, 1, 0];
const SQUARE_PRODUCT = NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => state ^ FACTOR_PARITY[value],
  accept: (state) => state === 0,
}, 9);
const squareProduct = (path) => [
  new NFA(SQUARE_PRODUCT, 'square product', ...path)];

// Vladimir reads a region as numbers: each maximal straight line of rooms,
// north to south or west to east, bounded by a wall, a door or the region edge.
const straightRuns = (key) => {
  const cells = new Set(REGIONS[key]);
  const runs = [];
  for (const [dRow, dCol] of [[1, 0], [0, 1]]) {
    for (const id of REGIONS[key]) {
      const { row, col } = parseCellId(id);
      const before = makeCellId(row - dRow, col - dCol);
      if (cells.has(before) && !wallSet.has(edgeKey(before, id))) continue;
      const run = [id];
      for (;;) {
        const tail = run[run.length - 1];
        const { row: r, col: c } = parseCellId(tail);
        const next = makeCellId(r + dRow, c + dCol);
        if (!cells.has(next) || wallSet.has(edgeKey(tail, next))) break;
        run.push(next);
      }
      if (run.length > 1) runs.push(run);
    }
  }
  return runs;
};
const readsAs = (key, test, name) => straightRuns(key).map(
  run => readsNumber(run, test, name));

// Helen's clone. Two regions are candidates when one of the four rotations
// carries the first region's cells exactly onto the second's; the rotation
// then gives the room-to-room correspondence whose digits must agree.
const ROTATIONS = [
  (r, c) => [r, c], (r, c) => [c, -r], (r, c) => [-r, -c], (r, c) => [-c, r]];
const rotatedShape = (key, rotate) => {
  const points = REGIONS[key].map(id => {
    const { row, col } = parseCellId(id);
    return rotate(row, col);
  });
  const minRow = Math.min(...points.map(p => p[0]));
  const minCol = Math.min(...points.map(p => p[1]));
  return new Map(points.map(
    ([r, c], i) => [`${r - minRow},${c - minCol}`, REGIONS[key][i]]));
};
const clonePairings = () => {
  const pairings = [];
  for (const [i, from] of regionKeys.entries()) {
    for (const to of regionKeys.slice(i + 1)) {
      const target = rotatedShape(to, ROTATIONS[0]);
      for (const rotate of ROTATIONS) {
        const source = rotatedShape(from, rotate);
        const keys = [...source.keys()];
        if (!keys.every(k => target.has(k))) continue;
        pairings.push(keys.map(k => [source.get(k), target.get(k)]));
      }
    }
  }
  return pairings;
};

const permutations = (items) => items.length <= 1 ? [items] :
  items.flatMap((item, i) => permutations(
    [...items.slice(0, i), ...items.slice(i + 1)]).map(p => [item, ...p]));

const westRegion = soleRegionWithSingleDoor('W');
const northRegion = soleRegionWithSingleDoor('N');
const eastRegion = soleRegionWithSingleDoor('E');
const southRegion = soleRegionWithSingleDoor('S');
const twoDoorRegions = regionKeys.filter(k => doorsOf(k).length === 2);

const twoDoorPaths = twoDoorRegions.map(k => {
  const [start, end] = doorsOf(k);
  return shortestPath(k, start.room, end.room);
});

// Stephanie: within one world the true region statements take different
// regions, so a statement that names no region falls on a region that the
// world's door-identified and two-door statements have not already claimed.
const unclaimedBy = (...claims) => {
  const claimed = new Set(claims.flat());
  return regionKeys.filter(k => !claimed.has(k));
};

// One rule per two-door path, over the ways of matching the three rules to the
// three paths.
const perPathRules = (rules) => new Or(permutations([0, 1, 2]).map(
  order => new And(order.flatMap(
    (ruleIndex, i) => rules[ruleIndex](twoDoorPaths[i])))));

// Vladimir's three readings: the south-door region gives perfect squares, and
// one region each from `candidates` gives primes and multiples of 7.
const vladimirReadings = (candidates) => [
  ...readsAs(southRegion, isSquare, 'perfect square'),
  new Or(candidates.map(k => new And(readsAs(k, isPrime, 'prime')))),
  new Or(candidates.map(k => new And(readsAs(k, isMultipleOf7, 'multiple of 7')))),
];

// Patrick's two statements that name no region, over the ordered choices of
// which unclaimed region takes the power-of-two rule and which takes the
// non-consecutive rule.
const patrickUnplaced = (candidates) => new Or(candidates.flatMap(
  powerRegion => candidates.filter(k => k !== powerRegion).map(
    gapRegion => new And([
      ...pairwiseRegionRule(powerRegion, POWER_OF_TWO_APART, 'power of two apart'),
      ...pairwiseRegionRule(gapRegion, NON_CONSECUTIVE, 'non-consecutive'),
    ]))));

// World 1: Stephanie, Maurice, Patrick, Caroline, Helen and Jessica tell the
// truth; Daniel, Vladimir and Annabelle lie.
const world1 = new And([
  ...openPairs(westRegion).map(([a, b]) => new Whisper(4, a, b)),
  ...pairwiseRegionRule(northRegion, NOT_BOTH_PRIME, 'not both prime'),
  ...pairwiseRegionRule(eastRegion, STEP_OR_DOUBLE, 'differ by 1 or double'),

  patrickUnplaced(
    unclaimedBy([westRegion, northRegion, eastRegion], twoDoorRegions)),

  perPathRules([extremesNextToDoors, increasingBetweenDoors, doorDigitSumsRest]),

  // Helen's cloned region, over the congruent region pairings.
  new Or(clonePairings().map(pairing => new And(
    pairing.map(([a, b]) => new SameValues(2, a, b))))),
]);

// World 2: Stephanie, Maurice, Caroline and Vladimir tell the truth; Daniel,
// Patrick, Helen, Annabelle and Jessica lie.
const world2 = new And([
  perPathRules([extremesNextToDoors, increasingBetweenDoors, doorDigitSumsRest]),
  ...vladimirReadings(unclaimedBy([southRegion], twoDoorRegions)),
]);

// World 3: Stephanie, Maurice, Vladimir, Annabelle and Jessica tell the truth;
// Daniel, Patrick, Helen and Caroline lie.
const world3 = new And([
  ...pairwiseRegionRule(northRegion, NOT_BOTH_PRIME, 'not both prime'),
  ...pairwiseRegionRule(eastRegion, STEP_OR_DOUBLE, 'differ by 1 or double'),
  perPathRules([alternatingParity, primeReading, squareProduct]),
  ...vladimirReadings(unclaimedBy(
    [southRegion, northRegion, eastRegion], twoDoorRegions)),
]);

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regionKeys.map(k => new Jigsaw('9x9', ...REGIONS[k])),

  new Given('R7C1', 5),

  new Or([world1, world2, world3]),
];
