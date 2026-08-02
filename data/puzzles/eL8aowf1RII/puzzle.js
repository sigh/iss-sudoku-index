// Title: Shining Loop
// Author: ElChiglia
// Video: https://www.youtube.com/watch?v=eL8aowf1RII
// Source: https://app.crackingthecryptic.com/sudoku/jfrf3mHRbN

// Normal sudoku, the 18 drawn cages, and their moon/sun markers are encoded.
// The loop's local degree, cage entry, parity, and marker rules are encoded.
// Omitted: proving that all locally valid loop components are one loop.

const OFF = 1, H = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ON = [H, VERT, UL, UR, DL, DR];
const SIDES = ['U', 'D', 'L', 'R'];
const STEP = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
const OPP = { U: 'D', D: 'U', L: 'R', R: 'L' };
const CODES = [OFF, H, VERT, UL, UR, DL, DR];
const uses = {
  U: s => s === VERT || s === UL || s === UR,
  D: s => s === VERT || s === DL || s === DR,
  L: s => s === H || s === UL || s === DL,
  R: s => s === H || s === UR || s === DR,
};
const cellList = text => text.split(' ');

// Drawn cage cells and their top-left totals; null means the cage has no total.
const CAGES = [
  [null, 'R1C3 R1C4 R2C3 R2C4 R2C5'], [null, 'R8C4 R8C5 R9C4 R9C5 R9C6'],
  [null, 'R1C5 R1C6 R1C7 R1C8'], [null, 'R4C5 R4C6 R4C7 R5C6 R5C7'],
  [null, 'R8C1 R9C1'], [null, 'R6C4 R6C5 R7C1 R7C2 R7C3 R7C4 R7C5'],
  [null, 'R8C6 R8C7 R9C7 R9C8'], [null, 'R5C8 R6C6 R6C7 R6C8'],
  [20, 'R1C9 R2C9 R3C9 R4C9'], [17, 'R5C9 R6C9 R7C9'],
  [32, 'R1C1 R1C2 R2C1 R2C2 R3C1 R3C2'], [28, 'R3C3 R4C3 R5C2 R5C3 R6C2 R6C3'],
  [32, 'R7C6 R7C7 R7C8 R8C8 R8C9 R9C9'], [16, 'R2C6 R3C5 R3C6'],
  [17, 'R3C4 R4C4 R5C4 R5C5'], [25, 'R2C7 R2C8 R3C7 R3C8 R4C8'],
  [23, 'R8C2 R8C3 R9C2 R9C3'], [22, 'R4C1 R4C2 R5C1 R6C1'],
].map(([sum, text]) => ({ sum, cells: cellList(text) }));
const MOONS = cellList('R9C1 R8C4 R7C5 R7C7 R5C9 R6C6 R4C7 R3C6 R1C7 R5C4 R4C3 R1C2');
const SUNS = cellList('R7C2 R8C2 R8C7 R9C5 R5C6 R4C2 R2C3 R3C4 R2C7 R3C9 R5C8 R7C6');

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const grid = graph.cells();
const loop = graph.makeOverlay('VS');
const cageOf = new Map(CAGES.flatMap((cage, n) => cage.cells.map(cell => [cell, n])));
const edges = grid.flatMap(a => ['R', 'D'].flatMap(side => {
  const b = graph.step(a, ...STEP[side]);
  return b ? [{ a, b, side }] : [];
}));

const edgeKey = side => Pair.fnToKey(
  (a, b) => uses[side](a) === uses[OPP[side]](b), geometry);
const parityNfa = (side, same) => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (state, value) => {
    if (state.k === 0) return { k: 1, joined: uses[side](value) };
    if (state.k === 1) return { k: 2, joined: state.joined, a: value };
    if (state.k !== 2) return undefined;
    return !state.joined || ((state.a % 2 === value % 2) === same) ? { done: true } : undefined;
  },
  accept: state => state.done === true,
}, geometry.numValues);
const cache = new Map();
const cachedParity = (side, same) => {
  const key = side + same;
  if (!cache.has(key)) cache.set(key, parityNfa(side, same));
  return cache.get(key);
};

const shapeDomains = grid.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = CODES.filter(shape =>
    !(row === 1 && uses.U(shape)) && !(row === 9 && uses.D(shape)) &&
    !(col === 1 && uses.L(shape)) && !(col === 9 && uses.R(shape)));
  return new Given(loop.at(cell), ...allowed);
});
const edgeRules = edges.flatMap(({ a, b, side }, n) => {
  const sameCage = cageOf.get(a) === cageOf.get(b);
  return [
    new NFA(cachedParity(side, sameCage), sameCage ? 'same-parity' : 'switch-parity', loop.at(a), a, b),
  ];
});
const horizontalStarts = grid.filter(cell => graph.step(cell, 0, 1));
const verticalStarts = grid.filter(cell => graph.step(cell, 1, 0));
const agreement = [
  loop.makeReplicate(new Pair(edgeKey('R'), 'edge-h', loop.at('R1C1'), loop.at('R1C2')),
    loop.at(horizontalStarts)),
  loop.makeReplicate(new Pair(edgeKey('D'), 'edge-v', loop.at('R1C1'), loop.at('R2C1')),
    loop.at(verticalStarts)),
];
const crossingNfa = sides => NFA.encodeSpec({
  startState: { k: 0, count: 0 },
  transition: ({ k, count }, shape) => {
    if (k >= sides.length) return undefined;
    const next = count + (uses[sides[k]](shape) ? 1 : 0);
    return next > 2 ? undefined : { k: k + 1, count: next };
  },
  accept: ({ k, count }) => k === sides.length && count === 2,
}, geometry.numValues);
const cageRules = CAGES.flatMap((cage, n) => {
  const boundary = edges.filter(({ a, b }) => (cageOf.get(a) === n) !== (cageOf.get(b) === n));
  const marked = [...MOONS, ...SUNS].filter(cell => cageOf.get(cell) === n);
  return [
    cage.sum === null ? new AllDifferent(...cage.cells) : new Cage(cage.sum, ...cage.cells),
    new NFA(crossingNfa(boundary.map(edge => edge.side)), 'cage-entry', ...loop.at(boundary.map(edge => edge.a))),
    new Or(marked.map(cell => new Given(loop.at(cell), ...ON))),
  ];
});
const odd = [1, 3, 5, 7, 9], even = [2, 4, 6, 8];
const symbolParities = new Or([
  new And([...MOONS.map(cell => new Given(cell, ...odd)), ...SUNS.map(cell => new Given(cell, ...even))]),
  new And([...MOONS.map(cell => new Given(cell, ...even)), ...SUNS.map(cell => new Given(cell, ...odd))]),
]);

return [
  new Shape('9x9'),
  loop.toVar('loop shape'),
  ...shapeDomains,
  ...edgeRules,
  ...agreement,
  ...cageRules,
  symbolParities,
];
