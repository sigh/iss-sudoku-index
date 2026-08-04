// Title: Absolutely A Maze Thing
// Author: fjam
// Video: https://www.youtube.com/watch?v=_UXMbBMdBjg
// Source: https://app.crackingthecryptic.com/sudoku/hr2j4L9gQg

// Normal sudoku rules apply (standard rows/columns/boxes, digits 1-9). Cages
// sum to the small corner total, digits distinct within a cage. Arrows: the
// circled bulb digit equals the sum of the digits along the drawn arm. A maze
// path runs from the green cell to the red cell, orthogonally cell-to-cell; it
// must pass through every bulb+arrow, entering the bulb and then travelling
// directly along the drawn arm before continuing normally. Every grid cell's
// digit, taken modulo 4, names a cardinal direction (NESW) via one fixed but
// unknown correspondence for the whole grid; the path must leave every cell it
// enters in that cell's named direction. "Which direction corresponds to which
// digits is to be discovered" reads as a bijection between the four residues
// 0..3 and the four directions -- the puzzle's own "correspond" wording, not
// solved-grid fitting -- so all four directions are used somewhere.
// The path's final (red) cell has no exit -- "exit every cell it enters" has
// nothing left to constrain once the path has reached its destination.
//
// The alphabet is widened to 16 so the maze Var layers can carry path state;
// the 81 grid cells are pinned back to 1-9 below. A cell's chosen exit is a
// single Var value (OFF or one of N/E/S/W/TERM), so out-degree <= 1 is free;
// in-degree exactly 1 (0 at the green start) is scanned per cell. Degree rules
// alone still admit a self-contained loop disjoint from the green->red route
// (nothing pins its cells' in/out degree wrong), so two coprime modular
// position counters (mod 15, mod 11; lcm 165 > 81 cells) run along the used
// exits -- a loop's length would have to be a multiple of both moduli to close,
// which no cycle of at most 81 cells can be. The green cell seeds both counters
// so the numbering has one fixed origin.

const NV = 16;
const MOD_A = 15, MOD_B = 11;
const CODE = { OFF: 1, N: 2, E: 3, S: 4, W: 5, TERM: 6 };
const DIRS = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };
const OPPOSITE = { N: 'S', E: 'W', S: 'N', W: 'E' };
const POS_OFF = 1;      // counter value for a cell the path misses
const START_POS = 2;    // counter value of the green cell (position 0)

const GREEN = 'R5C1';   // the drawn green cell (start)
const RED = 'R5C9';     // the drawn red cell (end)

// Cages, transcribed from the drawn small-clue totals and their cells.
const CAGES = [
  [13, 'R1C1', 'R2C1'],
  [12, 'R1C8', 'R1C9'],
  [8, 'R8C9', 'R9C9'],
  [9, 'R9C1', 'R9C2'],
];

// Arrow bulb+arm chains (bulb first, then arm cells in drawn order), transcribed
// from the drawn arrow paths and their circled bulbs.
const ARROWS = [
  ['R5C2', 'R4C2', 'R4C3'],
  ['R5C4', 'R6C4', 'R7C4'],
  ['R2C4', 'R1C4', 'R1C5'],
  ['R2C6', 'R2C7', 'R3C7', 'R4C7'],
  ['R4C5', 'R3C5', 'R3C4'],
  ['R7C7', 'R6C7', 'R5C7'],
  ['R8C2', 'R8C3', 'R8C4', 'R8C5'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const dirLayer = graph.makeOverlay('VD');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const dirAt = cell => dirLayer.at(cell);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

function dirBetween(a, b) {
  const A = parseCellId(a), B = parseCellId(b);
  const dR = B.row - A.row, dC = B.col - A.col;
  for (const d of ['N', 'E', 'S', 'W']) {
    if (DIRS[d][0] === dR && DIRS[d][1] === dC) return d;
  }
  throw new Error(`${a} -> ${b} is not one orthogonal step`);
}

// Every cell but each chain's last is forced onward along the drawn arm; the
// last arm cell (the arrowhead) is on the path but its own exit is free, set
// by the usual digit-direction rule like any other cell.
const FORCED = new Map();
for (const chain of ARROWS) {
  for (let i = 0; i < chain.length - 1; i++) {
    FORCED.set(chain[i], dirBetween(chain[i], chain[i + 1]));
  }
}

function dirsFrom(cell) {
  return ['N', 'E', 'S', 'W'].filter(d => graph.step(cell, ...DIRS[d]));
}

// Legal domain for a cell's exit-direction Var: red only ever terminates; a
// forced arrow cell takes exactly its drawn direction; green must leave (no
// OFF, no TERM); every other cell is OFF or one of its in-grid directions.
function domainFor(cell) {
  if (cell === RED) return [CODE.TERM];
  if (FORCED.has(cell)) return [CODE[FORCED.get(cell)]];
  const dirs = dirsFrom(cell).map(d => CODE[d]);
  return cell === GREEN ? dirs : [CODE.OFF, ...dirs];
}

// --- Degree: exactly one predecessor per visited cell (zero for green) -----
// Reads, in order, the exit-direction of each in-grid neighbour (accepting
// only the one code that would point back at this cell), then this cell's own
// exit-direction to learn whether it is visited.
function inDegreeSpec(expected, isGreen) {
  const key = 'indeg|' + expected.join(',') + '|' + (isGreen ? 1 : 0);
  return cached(key, () => NFA.encodeSpec({
    startState: { k: 0, count: 0 },
    transition: (s, value) => {
      if (s.k < expected.length) {
        return { k: s.k + 1, count: s.count + (value === expected[s.k] ? 1 : 0) };
      }
      if (s.k !== expected.length) return undefined;
      const visited = value !== CODE.OFF;
      const want = isGreen ? 0 : (visited ? 1 : 0);
      return s.count === want ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));
}

const inDegreeNFAs = gridCells.map(cell => {
  const incoming = dirsFrom(cell).map(d => {
    const other = graph.step(cell, ...DIRS[d]);
    return { cell: other, expected: CODE[OPPOSITE[d]] };
  });
  const spec = inDegreeSpec(incoming.map(x => x.expected), cell === GREEN);
  return new NFA(spec, 'in-degree', ...incoming.map(x => dirAt(x.cell)), dirAt(cell));
});

// --- A cell's two position counters are OFF exactly when it is unvisited ---
const syncKey = Pair.fnToKey(
  (dv, pv) => (dv === CODE.OFF) === (pv === POS_OFF), NV);
const posSync = gridCells.flatMap(cell => [
  new Pair(syncKey, 'pos-sync', dirAt(cell), posA.at(cell)),
  new Pair(syncKey, 'pos-sync', dirAt(cell), posB.at(cell)),
]);

// --- Position counters advance by one along each used exit ----------------
const nextPos = (v, mod) => 2 + ((v - 2 + 1) % mod);
function counterSpec(dirCode, mod) {
  return cached('cnt|' + dirCode + '|' + mod, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, dv: value };
      if (s.k === 1) return { k: 2, dv: s.dv, a: value };
      if (s.k !== 2) return undefined;
      if (s.dv !== dirCode) return { done: true };  // exit unused here
      return value === nextPos(s.a, mod) ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));
}
const counters = gridCells.flatMap(cell => dirsFrom(cell).flatMap(d => {
  const other = graph.step(cell, ...DIRS[d]);
  return [
    new NFA(counterSpec(CODE[d], MOD_A), 'path-order', dirAt(cell), posA.at(cell), posA.at(other)),
    new NFA(counterSpec(CODE[d], MOD_B), 'path-order', dirAt(cell), posB.at(cell), posB.at(other)),
  ];
}));

// --- Digit-modulo-4 direction, one unknown bijection for the whole grid ----
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    for (const rest of permutations(arr.slice(0, i).concat(arr.slice(i + 1)))) {
      out.push([arr[i], ...rest]);
    }
  }
  return out;
}
const residueDirs = permutations([CODE.N, CODE.E, CODE.S, CODE.W]);
const directionRule = new Or(residueDirs.map(perm => {
  const key = Pair.fnToKey(
    (d, v) => v === CODE.OFF || v === CODE.TERM || v === perm[d % 4], NV);
  return new And(gridCells.map(
    cell => new Pair(key, 'digit-direction', cell, dirAt(cell))));
}));

return [
  shape,
  dirLayer.toVar('exit direction'),
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
  ...gridCells.map(cell => new Given(dirAt(cell), ...domainFor(cell))),
  new Given(posA.at(GREEN), START_POS),
  new Given(posB.at(GREEN), START_POS),
  ...inDegreeNFAs,
  ...posSync,
  ...counters,
  directionRule,
  ...CAGES.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...ARROWS.map(chain => new Arrow(...chain)),
];
