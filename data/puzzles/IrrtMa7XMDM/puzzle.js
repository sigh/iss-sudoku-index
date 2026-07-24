// Title: RAT RUN 38: Synchronicity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=IrrtMa7XMDM
// Source: https://sudokupad.app/up5nrki10o
//
// Normal 9x9 sudoku. Finkz and Phinx start at R1C1 and R9C9 and must each
// discover an orthogonal path to a different cupcake (R2C1, R8C9). Paths may
// not revisit a cell, cross themselves, cross each other, or pass through
// thick maze walls. Any two digits visited adjacently along a path must have
// different parity and differ by at least 5. Blackcurrants: one joined digit
// is double the other. Purple arrows point to the smaller of the two digits
// they sit between and may only be traversed in the direction they point.
//
// Path model: one 81-cell Var overlay (VP) holds path membership -- 1 = on
// Finkz's path (from R1C1), 2 = on Phinx's path (from R9C9), 3 = off. Each
// path gets its own degree rule (its two endpoints have exactly one
// same-value orthogonal neighbour, every other on-path cell exactly two) and
// its own ConnectedValues, so connectivity + degree together force exactly
// one simple path per value (connectivity plus that degree sequence rules
// out extra components, branching, and stray cycles). Rat identity is not
// fixed to a cupcake by the rules text (only "two different cupcakes" is
// stated), so which cupcake ends which rat's path is a genuine disjunction,
// handled with Or/And rather than picked by proximity.
//
// "Cross themselves"/"cross each other" is read as no shared or repeated
// cell, which the one-Var-per-cell membership model already guarantees for
// free (a cell can hold only one of the three values, and a single path's
// cells are never repeated). Unlike some other Rat Run entries, this
// puzzle's rules text has no "not even diagonally" qualifier, and checking
// the parity/difference-of-5 rule's own valid-adjacency graph against the
// known grid shows each rat's route is forced onto a unique corridor with a
// structurally mandatory diagonal touch between the two corridors -- so a
// diagonal-touch prohibition would be a stricter reading than the text
// supports here, and is deliberately not added.
//
// The parity/difference-of-5 rule is applied as a conditional NFA to every
// orthogonally adjacent cell pair: if both cells hold the same path value
// (not off), their digits must differ in parity and by at least 5. Given the
// degree+connectivity result forces the same-value adjacency graph to be
// exactly a simple path, any two same-value adjacent cells are necessarily
// path-consecutive, so this local, geometry-enumerated check is sound
// without needing to know traversal order.
//
// Omitted:
// - Thick maze walls. The only "thick" (colour/width-flagged) lines in the
//   source union to exactly the four box-border grid lines with no gap, so a
//   literal reading would seal every rat inside its own starting box. That
//   is provably inconsistent with the parity/difference-of-5 rule applied to
//   R1C1..R2C1 within box 1 alone (the valid-edge subgraph splits R1C1 and
//   R2C1 into two disconnected 4-cell components). The "thin" maze-art lines
//   union to literally every interior grid edge, so they carry no
//   discriminating wall signal either. Wall geometry is undecodable from the
//   available vector art; walls are omitted rather than guessed, which can
//   only relax the model (never wrongly reject the true grid).
// - One-way door direction: the ON/OFF+degree construction has no notion of
//   edge direction or traversal order, only cell membership and degree, so
//   "may only be traversed in the direction it points" cannot be expressed.
//   The static "points to the smaller digit" clause is still encoded as
//   GreaterThan.

const ON_A = 1;   // path membership: Finkz's path (starts R1C1)
const ON_B = 2;   // path membership: Phinx's path (starts R9C9)
const OFF = 3;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const path = graph.makeOverlay('VP');
const pathCell = cell => path.at(cell);
const gridCells = graph.cells();

// --- Degree: each of the four named endpoints (both starts, both cupcakes)
// requires exactly one same-value orthogonal neighbour; every other cell
// requires exactly two when it holds a path value, and is unconstrained when
// off. The own-value match is read dynamically (not a fixed constant), so
// one machine per required degree serves both path values.
const ENDPOINTS = ['R1C1', 'R9C9', 'R2C1', 'R8C9'];
const makeDegreeMachine = requiredDegree => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, match, count }, value) => {
    if (phase === 'start') {
      return value === OFF ? { phase: 'off' } : { phase: 'on', match: value, count: 0 };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === match ? 1 : 0);
    return next > requiredDegree ? undefined : { phase: 'on', match, count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === requiredDegree,
}, geometry.numValues);
const degree1Machine = makeDegreeMachine(1);
const degree2Machine = makeDegreeMachine(2);

// --- Parity/difference-of-5 rule: for every orthogonally adjacent cell
// pair, if both cells hold the same path value (not off), their digits must
// differ in parity and by at least 5. Sound given the degree+connectivity
// result above (see header).
function parityDiffOk(a, b) {
  return (a % 2) !== (b % 2) && Math.abs(a - b) >= 5;
}
const samePathParityMachine = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    const { phase } = state;
    if (phase === 'skip' || phase === 'done') return { phase };
    if (phase === 0) return { phase: 1, vpU: value };
    if (phase === 1) return { phase: 2, vpU: state.vpU, digitU: value };
    if (phase === 2) {
      const { vpU, digitU } = state;
      if (value !== vpU || vpU === OFF) return { phase: 'skip' };
      return { phase: 3, digitU };
    }
    // phase === 3
    return parityDiffOk(state.digitU, value) ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'skip' || phase === 'done',
}, geometry.numValues);

const originCell = path.cells()[0];
const seenEdges = new Set();

return [
  new Shape('9x9'),
  path.toVar('path'),
  // --- Blackcurrants: one digit is double the other.
  new BlackDot('R2C4', 'R2C5'),
  new BlackDot('R3C4', 'R4C4'),
  // --- Purple arrows point to the smaller of the two adjacent digits
  // (direction of traversal is omitted, see header).
  new GreaterThan('R8C6', 'R8C5'),
  new GreaterThan('R8C9', 'R9C9'),
  // --- Path membership domain: every cell is Finkz's path, Phinx's path, or
  // off.
  path.makeReplicate(new Given(originCell, ON_A, ON_B, OFF)),
  // --- Fixed starts.
  new Given(pathCell('R1C1'), ON_A),
  new Given(pathCell('R9C9'), ON_B),
  // --- Cupcake endpoints: the rules only require "two different cupcakes",
  // not a fixed rat/cupcake pairing, so which rat ends at which cupcake is a
  // genuine disjunction.
  new Or([
    new And([new Given(pathCell('R2C1'), ON_A), new Given(pathCell('R8C9'), ON_B)]),
    new And([new Given(pathCell('R2C1'), ON_B), new Given(pathCell('R8C9'), ON_A)]),
  ]),
  // --- Single connected path per value: combined with the degree rules below
  // (two fixed-identity endpoints per value at degree 1, all other on-value
  // cells at degree 2), this forces the on-value cells to form exactly one
  // simple path, applied once per path value.
  new ConnectedValues('VP', ON_A),
  new ConnectedValues('VP', ON_B),
  ...gridCells.map(cell => {
    const machine = ENDPOINTS.includes(cell) ? degree1Machine : degree2Machine;
    return new NFA(machine, 'degree', pathCell(cell), ...path.at(graph.neighbours(cell)));
  }),
  ...gridCells.flatMap(u => {
    return graph.neighbours(u).flatMap(v => {
      const key = [u, v].sort().join('-');
      if (seenEdges.has(key)) return [];
      seenEdges.add(key);
      return [new NFA(samePathParityMachine, 'path-parity', pathCell(u), u, pathCell(v), v)];
    });
  }),
];
