// Title: Rats in a Maze #001
// Author: Dittman Rat
// Video: https://www.youtube.com/watch?v=xV4AQTHTEgc
// Source: https://sudokupad.app/wbjj6zns2r

// Normal Sudoku. The nine given 3s mark rats. Each rat follows a solver-chosen
// orthogonal route to a corner exit. A route step is permitted only when its
// two digits differ by one. Thermometers strictly increase by one from bulb to
// tip.

// The widened alphabet is only for the route overlays; all grid cells remain
// digits 1-9. Two coprime route-position counters forbid a directed cycle:
// any cycle would need length divisible by 15 and 11, hence by 165 > 81 cells.
const NV = 16;
const MOD_A = 15, MOD_B = 11;
const OFF = 1, RIGHT = 2, DOWN = 3, LEFT = 4, UP = 5;
const graph = cellGraph(new Shape('9x9', NV));
const grid = graph.cells();
const route = graph.makeOverlay('VP');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const rats = new Set(['R1C3', 'R2C4', 'R3C9', 'R4C6', 'R5C7', 'R6C2', 'R7C1', 'R8C8', 'R9C5']);
const exits = new Set(['R1C1', 'R1C9', 'R9C1', 'R9C9']);
const directions = [[0, 1, RIGHT, LEFT], [1, 0, DOWN, UP], [0, -1, LEFT, RIGHT], [-1, 0, UP, DOWN]];

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// At an ordinary cell, an incoming route requires one outgoing step. A cell
// with no incoming step may be unused or begin a harmless branch that also
// reaches an exit. Rat cells must leave, and exits must not leave.
const degreeNFA = (role, incoming) => cached(`degree:${role}:${incoming.join(',')}`, () => NFA.encodeSpec({
  startState: { k: 0, own: null, incoming: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, own: value, incoming: 0 };
    const i = s.k - 1;
    if (i >= incoming.length) return undefined;
    const count = s.incoming + (value === incoming[i] ? 1 : 0);
    return { k: s.k + 1, own: s.own, incoming: count };
  },
  accept: s => {
    if (s.k !== incoming.length + 1) return false;
    const on = s.own !== OFF;
    if (role === 'rat') return on;
    if (role === 'exit') return !on;
    return s.incoming === 0 || on;
  },
}, NV));

// Reading a route direction and its endpoint digits: an active direction must
// cross a consecutive pair; the other three directed-neighbour probes do nothing.
const stepNFA = direction => cached(`step:${direction}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, active: value === direction };
    if (s.k === 1) return { k: 2, active: s.active, first: value };
    if (s.k === 2) return !s.active || Math.abs(s.first - value) === 1 ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, NV));

const next = (value, mod) => value === mod ? 1 : value + 1;
const orderNFA = (direction, mod) => cached(`order:${direction}:${mod}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, active: value === direction };
    if (s.k === 1) return { k: 2, active: s.active, from: value };
    if (s.k === 2) return !s.active || value === next(s.from, mod) ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, NV));

// Off-route cells have the one canonical counter assignment. Each route tree
// is anchored at its corner exit below, removing only representation symmetry.
const offPositionNFA = cached('off-position', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, off: value === OFF };
    if (s.k === 1) return !s.off || value === 1 ? { k: 2, off: s.off } : undefined;
    if (s.k === 2) return !s.off || value === 1 ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, NV));

const thermos = [
  ['R4C9', 'R3C8', 'R2C7'], ['R3C7', 'R3C6', 'R2C5', 'R1C4'],
  ['R3C2', 'R3C3'], ['R9C1', 'R8C1'], ['R1C1', 'R1C2'], ['R1C9', 'R2C9'],
  ['R9C9', 'R9C8'], ['R9C6', 'R8C6'], ['R7C6', 'R7C5', 'R7C4'],
  ['R6C5', 'R5C4', 'R6C3', 'R5C2', 'R4C1'], ['R9C7', 'R8C7'],
];

const degrees = grid.map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = graph.neighbours(cell).map(other => {
    const point = parseCellId(other);
    const incoming = point.row === row
      ? (point.col < col ? RIGHT : LEFT)
      : (point.row < row ? DOWN : UP);
    return { other, incoming };
  });
  const role = rats.has(cell) ? 'rat' : exits.has(cell) ? 'exit' : 'ordinary';
  return new NFA(degreeNFA(role, neighbours.map(n => n.incoming)), 'rat-route-degree',
    route.at(cell), ...neighbours.map(n => route.at(n.other)));
});

const counterSymmetry = [
  ...grid.map(cell => new NFA(offPositionNFA, 'off-route-position', route.at(cell), posA.at(cell), posB.at(cell))),
  ...[...exits].flatMap(cell => [new Given(posA.at(cell), 1), new Given(posB.at(cell), 1)]),
];

const stepRules = grid.flatMap(cell => directions.flatMap(([dr, dc, direction]) => {
  const other = graph.step(cell, dr, dc);
  if (!other) return [];
  return [
    new NFA(stepNFA(direction), 'rat-consecutive-step', route.at(cell), cell, other),
    new NFA(orderNFA(direction, MOD_A), 'rat-route-order', route.at(cell), posA.at(cell), posA.at(other)),
    new NFA(orderNFA(direction, MOD_B), 'rat-route-order', route.at(cell), posB.at(cell), posB.at(other)),
  ];
}));

return [
  new Shape('9x9', NV),
  graph.makeReplicate(new Given(grid[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  route.toVar('rat route direction'), posA.toVar('route position mod 15'), posB.toVar('route position mod 11'),
  route.makeReplicate(new Given(route.at(grid[0]), OFF, RIGHT, DOWN, LEFT, UP)),
  posA.makeReplicate(new Given(posA.at(grid[0]), ...Array.from({ length: MOD_A }, (_, i) => i + 1))),
  posB.makeReplicate(new Given(posB.at(grid[0]), ...Array.from({ length: MOD_B }, (_, i) => i + 1))),
  ...[...rats].map(cell => new Given(cell, 3)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...degrees,
  ...counterSymmetry,
  ...stepRules,
];
