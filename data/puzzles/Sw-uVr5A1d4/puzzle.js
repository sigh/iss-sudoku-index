// Title: Building between
// Author: Paletron
// Video: https://www.youtube.com/watch?v=Sw-uVr5A1d4
// Source: https://app.crackingthecryptic.com/sudoku/JqgBdhMBbn

// Normal sudoku rules apply. R8C1 < R8C2 and R2C8 < R2C9 (both drawn "<"
// marks are unrotated, so both read left-cell-less-than-right-cell).
//
// Four coloured circle pairs (green R1C1/R1C3, purple R4C4/R2C7, red
// R4C2/R2C5, gold R6C7/R9C1, transcribed from the drawn overlay fills) must
// each be joined by a "between line": an orthogonal-or-diagonal king-move
// path the solver discovers between its two circles. Every cell strictly
// between the two circles on that path holds a digit strictly between the
// two circles' own digits; no two lines share a cell or cross each other;
// and a circle's own digit equals how many of its up to 8 king-move
// neighbours belong to its own line (not counting the circle itself).
//
// Modelled as one shared colour layer (which line, if any, owns each cell)
// plus one used/unused Var per king-move edge, so a line is: degree 1 at its
// two circles, degree 2 elsewhere on it, 0 off it -- counted only over edges
// this construction has marked used (an edge used forces its two cells to
// share a colour). Counting used edges rather than same-coloured neighbours
// directly is what lets a line touch itself, which the rules never forbid.
// Two degree-1 cells with everywhere else degree-2 already forces each
// circle-to-circle path to exist as one component of its own coloured cells
// (a graph with exactly two odd-degree vertices has exactly one path between
// them); the residual gap -- an extra closed loop of the same colour,
// disjoint from that path -- is the omitted rule below.
//
// "Can't cross" is read as a rule between the four different-coloured lines,
// never a line crossing itself: at every lattice point where two diagonal
// edges meet in an X, both may not be marked used unless they share a colour.

const OFF = 5, GREEN = 1, PURPLE = 2, RED = 3, GOLD = 4;
const UNUSED = 1, USED = 2;

// Circle pairs, transcribed from the four fill colours drawn on the grid.
const COLOURS = [
  { colour: GREEN, ends: ['R1C1', 'R1C3'] },
  { colour: PURPLE, ends: ['R4C4', 'R2C7'] },
  { colour: RED, ends: ['R4C2', 'R2C5'] },
  { colour: GOLD, ends: ['R6C7', 'R9C1'] },
];
const circleColour = new Map();
for (const { colour, ends } of COLOURS) {
  for (const cell of ends) circleColour.set(cell, colour);
}

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();
const colours = graph.makeOverlay('VC');

// --- King-move edges, one Var each. Each of the 4 forward directions is
// stepped from every cell, so every undirected edge is created exactly once.
const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const edges = [];
const incident = new Map(cells.map(cell => [cell, []]));
for (const a of cells) {
  for (const [dR, dC] of DIRECTIONS) {
    const b = graph.step(a, dR, dC);
    if (!b) continue;
    const id = 'VS' + (edges.length + 1);
    edges.push({ id, a, b });
    incident.get(a).push(id);
    incident.get(b).push(id);
  }
}
const edgeGroup = new Var('S', 'king-move edge used', edges.length);

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// Reads [own colour, ...incident edge-used flags]. A circle needs exactly one
// used incident edge and a real (non-OFF) colour; any other coloured cell
// needs exactly two; an OFF cell needs none.
const cellSpec = isCircle => cached(`cell|${isCircle}`, () => NFA.encodeSpec({
  startState: { colour: null, count: 0 },
  transition: (state, value) => {
    if (state.colour === null) return { colour: value, count: 0 };
    if (value !== UNUSED && value !== USED) return undefined;
    const count = state.count + (value === USED ? 1 : 0);
    return count <= 2 ? { colour: state.colour, count } : undefined;
  },
  accept: state => isCircle
    ? state.colour !== OFF && state.count === 1
    : (state.colour === OFF ? state.count === 0 : state.count === 2),
}, 9));

// Reads [edge-used flag, colour of one end, colour of the other end]. A used
// edge forces both ends to share one real colour.
const edgeSpec = cached('edge', () => NFA.encodeSpec({
  startState: { pos: 0 },
  transition: (state, value) => {
    if (state.pos === 0) return { pos: 1, step: value };
    if (state.pos === 1) return { pos: 2, step: state.step, a: value };
    if (state.pos !== 2) return undefined;
    if (state.step === UNUSED) return { pos: 3, done: true };
    return (value === state.a && value !== OFF) ? { pos: 3, done: true } : undefined;
  },
  accept: state => state.done === true,
}, 9));

// Reads [step of the down-right diagonal, step of the down-left diagonal,
// colour of the down-right diagonal's cell, colour of the down-left
// diagonal's cell]. Forbidden only when both diagonals are used and their
// colours differ.
const crossingSpec = cached('crossing', () => NFA.encodeSpec({
  startState: { pos: 0 },
  transition: (state, value) => {
    if (state.pos === 0) return { pos: 1, s1: value };
    if (state.pos === 1) return { pos: 2, s1: state.s1, s2: value };
    if (state.pos === 2) return { pos: 3, s1: state.s1, s2: state.s2, cA: value };
    if (state.pos !== 3) return undefined;
    if (state.s1 === USED && state.s2 === USED && state.cA !== value) return undefined;
    return { pos: 4, done: true };
  },
  accept: state => state.done === true,
}, 9));

// Reads [candidate cell's own colour, one circle's digit, its partner's
// digit, the candidate's own digit]. When the candidate's colour matches
// this pair, its digit must sit strictly between the two circles' digits.
const betweenSpec = colour => cached(`between|${colour}`, () => NFA.encodeSpec({
  startState: { pos: 0 },
  transition: (state, value) => {
    if (state.pos === 0) return { pos: 1, active: value === colour };
    if (state.pos === 1) return { pos: 2, active: state.active, a: value };
    if (state.pos === 2) {
      return {
        pos: 3, active: state.active,
        lo: Math.min(state.a, value), hi: Math.max(state.a, value),
      };
    }
    if (state.pos !== 3) return undefined;
    if (!state.active) return { pos: 4, done: true };
    return (value > state.lo && value < state.hi) ? { pos: 4, done: true } : undefined;
  },
  accept: state => state.done === true,
}, 9));

// Reads [circle's own digit, ...its king-move neighbours' colours]. The
// digit must equal how many neighbours share this circle's own (fixed,
// known) colour.
const countSpec = colour => cached(`count|${colour}`, () => NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: (state, value) => {
    if (state.target === null) return { target: value, count: 0 };
    const hit = value === colour ? 1 : 0;
    return { target: state.target, count: Math.min(state.count + hit, state.target + 1) };
  },
  accept: state => state.target !== null && state.count === state.target,
}, 9));

// --- Domains: every cell may be any colour or OFF, then each circle is
// pinned down further to its own single colour.
const colourDomains = [
  colours.makeReplicate(new Given(colours.cells()[0], GREEN, PURPLE, RED, GOLD, OFF)),
  ...[...circleColour].map(([cell, colour]) => new Given(colours.at(cell), colour)),
];

// --- Local colour-degree rule, every cell.
const localDegrees = cells.map(cell => new NFA(
  cellSpec(circleColour.has(cell)), 'colour degree',
  colours.at(cell), ...incident.get(cell)));

// --- A used edge's two ends share a colour.
const edgeColourAgreement = edges.map(({ id, a, b }) => new NFA(
  edgeSpec, 'edge colour agreement', id, colours.at(a), colours.at(b)));

// --- No cross-colour diagonal crossing, every interior lattice point.
const crossing = [];
for (let r = 1; r < 9; r++) {
  for (let c = 1; c < 9; c++) {
    const a = makeCellId(r, c), b = makeCellId(r + 1, c + 1);
    const d = makeCellId(r, c + 1), e = makeCellId(r + 1, c);
    const edge1 = edges.find(edge => edge.a === a && edge.b === b);
    const edge2 = edges.find(edge => edge.a === d && edge.b === e);
    crossing.push(new NFA(crossingSpec, 'no cross-colour crossing',
      edge1.id, edge2.id, colours.at(a), colours.at(d)));
  }
}

// --- Between-value rule: every non-circle cell, against every colour pair.
const betweenRules = [];
for (const cell of cells) {
  if (circleColour.has(cell)) continue;
  for (const { colour, ends } of COLOURS) {
    betweenRules.push(new NFA(betweenSpec(colour), 'between the pair',
      colours.at(cell), ends[0], ends[1], cell));
  }
}

// --- Minesweeper neighbour-count rule: every circle.
const neighbourCounts = [];
for (const { colour, ends } of COLOURS) {
  for (const circle of ends) {
    neighbourCounts.push(new NFA(countSpec(colour), 'circle neighbour count',
      circle, ...colours.at(graph.kingNeighbours(circle))));
  }
}

return [
  shape,
  colours.toVar('circle-pair colour'),
  edgeGroup,
  new GreaterThan('R8C2', 'R8C1'),
  new GreaterThan('R2C9', 'R2C8'),
  ...colourDomains,
  ...localDegrees,
  ...edgeColourAgreement,
  ...crossing,
  ...betweenRules,
  ...neighbourCounts,
];
