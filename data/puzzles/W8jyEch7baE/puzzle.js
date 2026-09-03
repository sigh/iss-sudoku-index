// Title: Public Secrecy
// Author: shadow-nexus
// Video: https://www.youtube.com/watch?v=W8jyEch7baE
// Source: https://sudokupad.app/Nf89TQFtH2

// Normal sudoku. R2C2 is 4, R3C5 is 5, and R2C8 is the green cell. A single
// closed loop runs orthogonally from cell to cell through the green cell and
// visits every 3x3 box at least once; it may touch itself, even orthogonally,
// but never enters a cell twice. Two cells consecutive along the loop hold
// digits differing by at least 5. Two "publicly secret" digits never appear on
// the loop, and the rules' count of two means the loop misses exactly those
// two, so every other digit appears on it somewhere. In each of the nine boxes
// the cell holding that box's number must be, or orthogonally neighbour, a
// secret digit. In boxes 4-9 -- the boxes with none of the three given clues,
// which sit in boxes 1, 2 and 3 -- that same cell also states how many of its
// own 3x3 surroundings, itself included, the loop does NOT visit. Nothing is
// omitted.

// One secret digit is fixed by the rules rather than by the art: every cell of
// a closed loop has two loop neighbours and each pair differs by at least 5, so
// a 5 on the loop would need a neighbour of 0 or 10. 5 is therefore always
// missing from the loop, hence always secret; the second secret is the single
// unknown VK below.

// The loop lives in one Var layer of *directed* shape codes: OFF, or the side
// the route enters a cell by paired with the side it leaves by. Edge-agreement
// Pairs orient each used edge the same way from both ends, so every on-loop
// cell has in-degree and out-degree 1 and the used edges form a disjoint union
// of directed cycles. Two counter layers then number the route modulo MOD_A and
// MOD_B, advancing by one along every used edge except the one running into the
// seam cell, so a cycle avoiding the seam would have to close after a length
// divisible by lcm(9, 10) = 90 while occupying at most 81 cells: only the cycle
// through the seam closes, which is the single-loop clause. The seam is the
// green cell, the one cell the rules force onto the loop. The alphabet is
// widened to 13 to hold the codes and the counters; the 81 grid cells are
// pinned back to 1-9.

const NV = 13;
const MOD_A = 9, MOD_B = 10;  // coprime; lcm 90 > 81 cells
const OFF = 1;                // shape code, and counter value, of an unvisited cell
const POS0 = 2;               // counter value of the seam cell (position 0)

const OFF_DIGIT = 10;         // VD entry of a cell the loop misses
const PUBLIC_SECRET = 5;      // the secret digit the whisper rule forces off the loop
const WHISPER_DIFF = 5;       // consecutive loop digits differ by at least this

const SIDES = ['U', 'D', 'L', 'R'];
const STEP = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
const OPPOSITE = { U: 'D', D: 'U', L: 'R', R: 'L' };

// Shape codes: OFF, then one code per ordered (entry side, exit side) pair.
const CODES = [null, null];
for (const entry of SIDES) {
  for (const exit of SIDES) {
    if (entry !== exit) CODES.push({ entry, exit });
  }
}
const ALL_CODES = CODES.map((_, code) => code).slice(OFF);
const ON_LOOP_CODES = ALL_CODES.filter(code => code !== OFF);

const isOnLoop = code => code !== OFF;
const entersFrom = (code, side) => isOnLoop(code) && CODES[code].entry === side;
const exitsTo = (code, side) => isOnLoop(code) && CODES[code].exit === side;
const usesSide = (code, side) => entersFrom(code, side) || exitsTo(code, side);

const gridShape = new Shape('9x9', NV);
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VS');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const loopDigit = graph.makeOverlay('VD');
// The second secret digit; the first is PUBLIC_SECRET, derived above.
const secretVar = new Var('K', 'the unknown secret digit', 1);
const SECRET = secretVar.cells()[0];

// Drawn clues: the two given digits, and the green cell.
const givens = [new Given('R2C2', 4), new Given('R3C5', 5)];
const GREEN = 'R2C8';

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// A code is available only if every side it uses leads to an in-grid cell.
const availableCodes = cell => ALL_CODES.filter(code => SIDES.every(
  side => !usesSide(code, side) || graph.step(cell, ...STEP[side]) !== null));

const codeDomains = gridCells.map(
  cell => new Given(loop.at(cell), ...availableCodes(cell)));

// Each orthogonal edge once, as (a, b) with `side` the direction a -> b.
const edges = gridCells.flatMap(cell => ['D', 'R'].flatMap(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other ? [{ a: cell, b: other, side }] : [];
}));

// Edge agreement across the shared border of a cell and its neighbour on
// `side`: a's exit that way is b's entry back, and a's entry that way is b's
// exit back. Applied to every edge, this orients each used edge consistently.
const agreementKey = side => Pair.fnToKey(
  (codeA, codeB) => exitsTo(codeA, side) === entersFrom(codeB, OPPOSITE[side])
    && entersFrom(codeA, side) === exitsTo(codeB, OPPOSITE[side]),
  geometry);
const agreement = [
  loop.makeReplicate(
    new Pair(agreementKey('R'), 'edge-h', loop.at('R1C1'), loop.at('R1C2')),
    loop.at(gridCells.filter(cell => graph.step(cell, 0, 1)))),
  loop.makeReplicate(
    new Pair(agreementKey('D'), 'edge-v', loop.at('R1C1'), loop.at('R2C1')),
    loop.at(gridCells.filter(cell => graph.step(cell, 1, 0)))),
];

// Counter values run POS0, POS0+1, ... POS0+mod-1 and wrap.
const nextPos = (value, mod) => POS0 + ((value - POS0 + 1) % mod);

// Reads a cell's shape code, then its counter and its `side` neighbour's
// counter. If the loop leaves the first cell towards the second, the second
// counter is one further on, and vice versa; an unused edge says nothing.
// `intoBSeam` / `intoASeam` mark an edge whose target is the seam cell, the one
// edge exempted so that the loop through the seam can close.
const counterSpec = (side, mod, intoBSeam, intoASeam) => cached(
  ['cnt', side, mod, intoBSeam, intoASeam].join('|'), () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { k: 1, code: value };
      if (state.k === 1) return { k: 2, code: state.code, a: value };
      if (state.k !== 2) return undefined;
      const forward = exitsTo(state.code, side);
      const backward = entersFrom(state.code, side);
      if (!forward && !backward) return { done: true };
      if (state.a === OFF || value === OFF) return undefined;
      if (forward) {
        return intoBSeam || value === nextPos(state.a, mod)
          ? { done: true } : undefined;
      }
      return intoASeam || state.a === nextPos(value, mod)
        ? { done: true } : undefined;
    },
    accept: state => state.done === true,
  }, geometry));

const counters = edges.flatMap(({ a, b, side }) => [
  new NFA(counterSpec(side, MOD_A, b === GREEN, a === GREEN), 'loop-order',
    loop.at(a), posA.at(a), posA.at(b)),
  new NFA(counterSpec(side, MOD_B, b === GREEN, a === GREEN), 'loop-order',
    loop.at(a), posB.at(a), posB.at(b)),
]);

// A cell is numbered exactly when it is on the loop, so the counters carry no
// choice of their own on cells the loop misses.
const numberedKey = Pair.fnToKey(
  (code, pos) => isOnLoop(code) === (pos !== OFF), geometry);
const numbered = gridCells.flatMap(cell => [
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posA.at(cell)),
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posB.at(cell)),
]);

// The green cell is on the loop, and is the seam the counters number from. Its
// codes are cut to the six whose entry side precedes its exit side in SIDES
// order, one from each (entry, exit) / (exit, entry) pair: a loop through the
// seam can be traversed either way round, and this keeps one of the two.
const seamCodes = ON_LOOP_CODES.filter(
  code => SIDES.indexOf(CODES[code].entry) < SIDES.indexOf(CODES[code].exit));
const seam = [
  new Given(loop.at(GREEN), ...seamCodes),
  new Given(posA.at(GREEN), POS0),
  new Given(posB.at(GREEN), POS0),
];

// Reads a cell's shape code, then that cell's digit and its `side` neighbour's
// digit; the two digits must differ by at least WHISPER_DIFF when the loop uses
// the edge between them.
const whisperSpec = side => cached(['whisper', side].join('|'), () =>
  NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { k: 1, joined: usesSide(value, side) };
      if (state.k === 1) return { k: 2, joined: state.joined, a: value };
      if (state.k !== 2) return undefined;
      if (!state.joined) return { done: true };
      return Math.abs(state.a - value) >= WHISPER_DIFF ? { done: true } : undefined;
    },
    accept: state => state.done === true,
  }, geometry));

const whispers = edges.map(({ a, b, side }) => new NFA(
  whisperSpec(side), side === 'R' ? 'loop-whisper-h' : 'loop-whisper-v',
  loop.at(a), a, b));

// The VD layer copies a visited cell's digit and marks an unvisited cell with
// OFF_DIGIT, so the loop's digits can be read without its shape codes. Reads a
// cell's shape code, then its digit, then its VD entry.
const loopDigitSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (state, value) => {
    if (state.k === 0) return { k: 1, on: isOnLoop(value) };
    if (state.k === 1) return state.on ? { k: 2, digit: value } : { k: 2, digit: OFF_DIGIT };
    if (state.k !== 2) return undefined;
    return value === state.digit ? { done: true } : undefined;
  },
  accept: state => state.done === true,
}, geometry);

const loopDigits = gridCells.map(cell => new NFA(
  loopDigitSpec, 'loop-digit', loop.at(cell), cell, loopDigit.at(cell)));

// Neither secret digit is on the loop: PUBLIC_SECRET is derived above, and the
// unknown one is compared against each visited cell's digit.
const noSecretsOnLoopKey = Pair.fnToKey(
  (digit, secret) => digit !== PUBLIC_SECRET && digit !== secret, geometry);
const noSecretsOnLoop = gridCells.map(cell => new Pair(
  noSecretsOnLoopKey, 'loop-no-secret', loopDigit.at(cell), SECRET));

// Exactly two digits are missing from the loop: every digit other than
// PUBLIC_SECRET is either on the loop or is the unknown second secret.
const loopMissesTwo = [new ContainAtLeast(
  [1, 2, 3, 4, 6, 7, 8, 9].join('_'), ...loopDigit.at(gridCells), SECRET)];

// Reads the unknown secret, then the box-number cell's digit, then that cell's
// orthogonal neighbours: when the digit is the box number, it or one of the
// neighbours must be a secret digit.
const boxNumberSpec = box => cached(['boxnum', box].join('|'), () =>
  NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { secret: value, k: 1 };
      if (state.done) return { done: true };
      const isSecret = value === PUBLIC_SECRET || value === state.secret;
      if (state.k === 1) {
        return value !== box || isSecret
          ? { done: true } : { secret: state.secret, k: 2 };
      }
      return isSecret ? { done: true } : { secret: state.secret, k: 2 };
    },
    accept: state => state.done === true,
  }, geometry));

const boxNumberNeighbours = graph.boxes().flatMap((cells, index) =>
  cells.map(cell => new NFA(
    boxNumberSpec(index + 1), 'box-number-secret',
    SECRET, cell, ...graph.neighbours(cell))));

// Reads the box-number cell's digit, then the shape codes of its own 3x3
// surroundings (itself included, clipped at the grid edge): when the digit is
// the box number, exactly that many of those cells are off the loop.
const notVisitedSpec = box => cached(['notvisited', box].join('|'), () =>
  NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return value === box ? { count: 0 } : { done: true };
      if (state.done) return { done: true };
      const count = state.count + (isOnLoop(value) ? 0 : 1);
      return count > box ? undefined : { count };
    },
    accept: state => state.done === true || state.count === box,
  }, geometry));

// Boxes 1-3 hold the three given clues (R2C2, R3C5, the green R2C8), so their
// box numbers do not carry the counting clue.
const CLUED_BOXES = 3;
const notVisitedCounts = graph.boxes().flatMap((cells, index) =>
  (index < CLUED_BOXES ? [] : cells.map(cell => new NFA(
    notVisitedSpec(index + 1), 'box-number-count',
    cell, ...loop.at([cell, ...graph.kingNeighbours(cell)])))));

// The loop visits every box: at least one cell of each box carries a loop code.
const boxVisitedSpec = NFA.encodeSpec({
  startState: { seen: false },
  transition: (state, value) => ({ seen: state.seen || isOnLoop(value) }),
  accept: state => state.seen === true,
}, geometry);

const boxesVisited = graph.boxes().map(cells => new NFA(
  boxVisitedSpec, 'box-visited', ...loop.at(cells)));

const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new Given(SECRET, ...[1, 2, 3, 4, 6, 7, 8, 9]),  // 5 is the other secret
  loopDigit.makeReplicate(new Given(loopDigit.at(gridCells[0]),
    1, 2, 3, 4, 5, 6, 7, 8, 9, OFF_DIGIT)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
];

return [
  gridShape,
  loop.toVar('loop shape'),
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  loopDigit.toVar('digit on the loop'),
  secretVar,
  ...domains,
  ...givens,
  ...codeDomains,
  ...seam,
  ...agreement,
  ...numbered,
  ...counters,
  ...whispers,
  ...loopDigits,
  ...noSecretsOnLoop,
  ...loopMissesTwo,
  ...boxNumberNeighbours,
  ...notVisitedCounts,
  ...boxesVisited,
];
