// Title: Snake Sandwich Sudoku
// Author: Ryan Oswald
// Video: https://www.youtube.com/watch?v=nt3xcGVyQNU
// Source: https://cracking-the-cryptic.web.app/sudoku/h2bfTLTQ3j

// Normal sudoku. A "snake" of orthogonally-connected, non-self-intersecting
// cells starts at the given 1 (R1C1) and finishes at the given 9 (R9C9); its
// digits read 1,2,...,9,1,2,... in order along the route (the sequence wraps
// from 9 back to 1). The snake may run orthogonally adjacent to itself
// elsewhere without that adjacency being part of the route. Outside clues
// give the ordinary sandwich sum (digits strictly between the row/column's 1
// and 9) for the clued lanes; unclued lanes carry no constraint.

// The snake's cells and route are unknown, so they are modelled as a
// directed shape code per cell (`loop`, reusing the loop-route pattern for a
// self-touching route): OFF, or one of 12 (entry side, exit side) "through"
// codes. Edge-agreement `Pair`s make entry/exit consistent between neighbours
// wherever a shared edge is actually used, so two on-route cells that are
// merely adjacent (not connected by a used edge) impose nothing on each
// other -- exactly the "can touch" rule.
//
// R1C1 and R9C9 are the route's only two endpoints. Every other cell's code
// is restricted to a "through" code whose entry AND exit sides both lead to
// real in-grid neighbours (a mid-route cell has both a predecessor and a
// successor). R1C1 and R9C9 alone are allowed a code that uses one *off-grid*
// side (U or L at R1C1's corner; U or L at R9C9's corner, since D/R are
// off-grid there): the off-grid side generates no cross-cell edge, so it
// gives that cell a real degree of exactly 1 -- out-only at R1C1, in-only at
// R9C9 -- without a separate start/end code family.
//
// The digit-successor rule (next cell's digit = this cell's digit + 1, 9
// wraps to 1) is enforced by one NFA per grid edge, scanning the upstream
// cell's shape code and the two digits: the relation only applies when that
// edge is actually used by the code, in whichever direction it is used.
//
// This alone permits an extra, disconnected on-route cycle elsewhere in the
// grid (shape-code degree and edge-agreement are purely local). The
// digit-successor rule already forces any such cycle's length to be a
// multiple of 9 (only then can its digits close consistently). A second Var
// layer, `pos`, carries a position counter modulo MOD (10, coprime to 9)
// seeded at R1C1 and advanced by one along every used edge; a spurious cycle
// would need its length to also be a multiple of 10, hence of lcm(9,10)=90 --
// impossible for at most 81 cells. `pos` is off-route sentinel or numbered
// exactly where the shape code is off-route or on-route (the `numbered`
// Pair), so it carries no free choice of its own.

const NV = 13; // 1 (OFF) + 12 through-codes; also covers pos's 1..11 range.
const MOD = 10; // coprime to the digit cycle's period 9; lcm(9,10)=90 > 81.
const OFF = 1;
const POS0 = 2;

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
const codeFor = (entry, exit) =>
  CODES.findIndex(c => c !== null && c.entry === entry && c.exit === exit);

const isOnRoute = code => code !== OFF;
const entersFrom = (code, side) => isOnRoute(code) && CODES[code].entry === side;
const exitsTo = (code, side) => isOnRoute(code) && CODES[code].exit === side;
const usesSide = (code, side) => entersFrom(code, side) || exitsTo(code, side);

const gridShape = new Shape('9x9', NV);
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const route = graph.makeOverlay('VS');
const pos = graph.makeOverlay('VP');

const START = 'R1C1';
const END = 'R9C9';

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// A "through" code is available at a non-endpoint cell only when both the
// side it enters from and the side it exits to lead to a real neighbour.
const throughCodes = cell => ALL_CODES.filter(code => SIDES.every(side => {
  if (!usesSide(code, side)) return true;
  return graph.step(cell, ...STEP[side]) !== null;
}));

// R1C1's off-grid side (U or L) is entry-only and carries no real edge
// either way, so which one the code names is not puzzle content -- only the
// exit side (which real neighbour the route leaves through) is. Fixing the
// entry side to a single canonical off-grid choice ('U') keeps both real
// exits (D, R) live while dropping the spurious U/L duplicate that would
// otherwise double-count every solution. R9C9 is the mirror: its off-grid
// exit side is fixed ('D'), and both real entries (U, L) stay live.
const START_CODES = [codeFor('U', 'D'), codeFor('U', 'R')];
const END_CODES = [codeFor('U', 'D'), codeFor('L', 'D')];

const codeDomains = gridCells
  .filter(cell => cell !== START && cell !== END)
  .map(cell => new Given(route.at(cell), OFF, ...throughCodes(cell)));
const endpointDomains = [
  new Given(route.at(START), ...START_CODES),
  new Given(route.at(END), ...END_CODES),
];

// Each real orthogonal edge once, as (a, b) with `side` the direction a -> b.
const edges = gridCells.flatMap(cell => ['D', 'R'].flatMap(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other ? [{ a: cell, b: other, side }] : [];
}));

// Edge agreement across the shared border of a cell and its neighbour on
// `side`: a's exit that way is b's entry back, and a's entry that way is b's
// exit back. Applied to every real edge, this orients each used edge
// consistently and leaves an edge neither side uses unconstrained (touching
// without connecting).
const agreementKey = side => Pair.fnToKey(
  (codeA, codeB) => exitsTo(codeA, side) === entersFrom(codeB, OPPOSITE[side])
    && entersFrom(codeA, side) === exitsTo(codeB, OPPOSITE[side]),
  geometry);
const agreement = [
  route.makeReplicate(
    new Pair(agreementKey('R'), 'edge-h', route.at('R1C1'), route.at('R1C2')),
    route.at(gridCells.filter(cell => graph.step(cell, 0, 1)))),
  route.makeReplicate(
    new Pair(agreementKey('D'), 'edge-v', route.at('R1C1'), route.at('R2C1')),
    route.at(gridCells.filter(cell => graph.step(cell, 1, 0)))),
];

// Reads the upstream cell's shape code, then its digit and its `side`
// neighbour's digit. If the code exits that way, the neighbour's digit must
// be the successor (wrapping 9 -> 1); if it enters that way, this cell's
// digit must be the neighbour's successor. An edge neither direction uses
// imposes nothing.
const succ = d => d === 9 ? 1 : d + 1;
const digitSpec = side => cached(['dig', side].join('|'), () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (state, value) => {
    if (state.k === 0) return { k: 1, code: value };
    if (state.k === 1) return { k: 2, code: state.code, a: value };
    if (state.k !== 2) return undefined;
    const forward = exitsTo(state.code, side);
    const backward = entersFrom(state.code, side);
    if (!forward && !backward) return { done: true };
    if (forward) return value === succ(state.a) ? { done: true } : undefined;
    return state.a === succ(value) ? { done: true } : undefined;
  },
  accept: state => state.done === true,
}, geometry));

const digitSuccession = edges.map(({ a, b, side }) => new NFA(
  digitSpec(side), side === 'R' ? 'snake-digit-h' : 'snake-digit-v',
  route.at(a), a, b));

// Position counters run POS0, POS0+1, ... POS0+MOD-1 and wrap, seeded at the
// route's fixed start (no seam/exemption needed: the route never closes back
// on R1C1, so no edge needs excusing from the rule below).
const nextPos = value => POS0 + ((value - POS0 + 1) % MOD);
const posSpec = side => cached(['pos', side].join('|'), () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (state, value) => {
    if (state.k === 0) return { k: 1, code: value };
    if (state.k === 1) return { k: 2, code: state.code, a: value };
    if (state.k !== 2) return undefined;
    const forward = exitsTo(state.code, side);
    const backward = entersFrom(state.code, side);
    if (!forward && !backward) return { done: true };
    if (state.a === OFF || value === OFF) return undefined;
    if (forward) return value === nextPos(state.a) ? { done: true } : undefined;
    return state.a === nextPos(value) ? { done: true } : undefined;
  },
  accept: state => state.done === true,
}, geometry));

const posAdvance = edges.map(({ a, b, side }) => new NFA(
  posSpec(side), side === 'R' ? 'snake-pos-h' : 'snake-pos-v',
  route.at(a), pos.at(a), pos.at(b)));

// A cell is numbered exactly when it is on the route.
const numberedKey = Pair.fnToKey(
  (code, p) => isOnRoute(code) === (p !== OFF), geometry);
const numbered = gridCells.map(cell =>
  new Pair(numberedKey, 'route-cell', route.at(cell), pos.at(cell)));

const seam = [new Given(pos.at(START), POS0)];

const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  pos.makeReplicate(new Given(pos.at(gridCells[0]),
    ...Array.from({ length: MOD + 1 }, (_, n) => n + 1))),
];

// Outside sandwich clues (sum of digits strictly between the row/column's 1
// and 9). Direction is irrelevant to Sandwich's sum; cells are given in
// printed reading order (row left-to-right, column top-to-bottom) so
// `fromCells` resolves the canonical arrow id itself. Values from
// `overlays` (row clues on the left, column clues on top).
const rows = graph.rows();
const columns = graph.columns();
const sandwiches = [
  Sandwich.fromCells(28, rows[1], geometry),
  Sandwich.fromCells(2, rows[3], geometry),
  Sandwich.fromCells(14, rows[4], geometry),
  Sandwich.fromCells(0, rows[6], geometry),
  Sandwich.fromCells(19, rows[8], geometry),
  Sandwich.fromCells(30, columns[1], geometry),
  Sandwich.fromCells(17, columns[3], geometry),
  Sandwich.fromCells(21, columns[4], geometry),
  Sandwich.fromCells(14, columns[6], geometry),
  Sandwich.fromCells(27, columns[8], geometry),
];

return [
  gridShape,
  route.toVar('snake shape'),
  pos.toVar('snake position mod ' + MOD),
  ...domains,
  ...codeDomains,
  ...endpointDomains,
  ...seam,
  ...agreement,
  ...numbered,
  ...digitSuccession,
  ...posAdvance,
  ...sandwiches,
];
