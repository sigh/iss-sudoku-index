// Title: Build Your Own Between Lines
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=G9H-K4ScuA8
// Source: https://app.crackingthecryptic.com/sudoku/D4n4GJB7Jf

// Normal sudoku. Ten circles come in five same-coloured pairs (no digits are
// pre-printed in them). Each pair is joined by a hidden Between Line: an
// orthogonal, non-branching path (no diagonal steps, no full 2x2 square of
// line cells) that shares no cell with any other Between Line. Every cell on
// a line strictly between its two circles must have a value strictly between
// the two circles' values. The line's layout is entirely solver-discovered:
// only the two endpoint cells of each pair are known.
//
// Modelled with one Var overlay 'VP' holding, per cell, which line (1-5) it
// belongs to, or 0 for off-line. The five circle pairs, keyed by the colour
// pairing read from the underlays:
const PAIRS = [
  ['R1C6', 'R1C8'],   // purple  (#D23BE7)
  ['R3C3', 'R4C8'],   // yellow-green (#A3E048)
  ['R5C6', 'R6C7'],   // gold (#F7D038)
  ['R7C4', 'R9C1'],   // deepskyblue (#34BBE6)
  ['R8C7', 'R9C3'],   // grey (#CFCFCF, one bordered/one not -- same colour)
];

const GIVENS = { R1C2: 8, R2C4: 4, R2C9: 7, R6C2: 4, R6C4: 9, R9C3: 5 };

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// Widen the alphabet to 0-9 so VP can hold 0 (off-line); grid cells are
// restricted back to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const cells = graph.cells();
const label = graph.makeOverlay('VP');

// Endpoint bookkeeping: which line (if any) each cell is a fixed circle of.
const endpointLine = new Map();
PAIRS.forEach(([a, b], i) => { endpointLine.set(a, i + 1); endpointLine.set(b, i + 1); });

// --- Domains: grid digits 1-9; VP in {0..5}; circles pinned to their line. ---
const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),
  label.makeReplicate(new Given(label.cells()[0], 0, 1, 2, 3, 4, 5)),
  ...Object.entries(GIVENS).map(([cell, v]) => new Given(cell, v)),
  ...PAIRS.flatMap(([a, b], i) => [
    new Given(label.at(a), i + 1), new Given(label.at(b), i + 1),
  ]),
];

// --- Degree: a cell whose VP is nonzero must have exactly that many
// same-VP orthogonal neighbours -- 1 at a pinned circle (its line's only
// other connection), 2 at any other on-line cell (mid-line, both ways).
// A VP-0 cell is unconstrained (off every line). This forces every VP-k
// class into a single simple path once paired with ConnectedValues below:
// connected + one degree-1 pair + degree-2 elsewhere = one simple path
// (no branch), and only orthogonal neighbours are ever read, so a diagonal
// step is never treated as a connection.
// Read as [own VP, neighbour VP, neighbour VP, ...] in a fixed order.
const degreeSpecs = new Map();
const degreeSpec = (numNeighbours, target) => {
  const key = `${numNeighbours}-${target}`;
  if (!degreeSpecs.has(key)) {
    degreeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'start' },
      transition: (s, v) => {
        if (s.phase === 'start') {
          return v === 0 ? { phase: 'free' } : { phase: 'count', own: v, n: 0 };
        }
        if (s.phase === 'free') return { phase: 'free' };
        const n = s.n + (v === s.own ? 1 : 0);
        return n > target ? undefined : { phase: 'count', own: s.own, n };
      },
      accept: (s) => s.phase === 'free' || (s.phase === 'count' && s.n === target),
      maxDepth: numNeighbours + 1,
    }, shape));
  }
  return degreeSpecs.get(key);
};
const degreeChecks = cells.map((cell) => {
  const neighbours = graph.neighbours(cell);
  const target = endpointLine.has(cell) ? 1 : 2;
  return new NFA(degreeSpec(neighbours.length, target), 'line degree',
    [label.at(cell), ...label.at(neighbours)]);
});

// No full 2x2 is a separate rule sentence, but not a separate constraint here:
// each corner of a 2x2 already has 2 of its up-to-4 orthogonal neighbours
// inside the block, so all four cells sharing one nonzero VP would already
// force each corner's same-VP degree to (at least) 2 from the block alone.
// A corner that is a pinned circle needs degree 1, so the degree check above
// rejects it outright; if none of the four are circles, none of them may
// carry any further same-VP neighbour without exceeding degree 2 either, so
// the block could never connect back to its line's two real circles --
// which ConnectedValues below forbids as a second component. Either way the
// degree + connectivity pair already excludes a full 2x2, so it needs no NFA
// of its own.

// --- Each line is one connected VP-k class (rules out a disjoint loop or
// second fragment carrying the same label away from its two circles).
const connectivity = PAIRS.map((_, i) => new ConnectedValues('VP', i + 1));

// --- Between: for line k, every cell other than its own two circles must
// -- if it is actually on line k -- lie strictly between the two circles'
// digits. Off-line (VP != k) or a different line: unconstrained.
// Read as [own VP, own digit, circle-A digit, circle-B digit].
const betweenSpecs = PAIRS.map((_, i) => {
  const k = i + 1;
  return NFA.encodeSpec({
    startState: 'start',
    transition: (s, v) => {
      if (s === 'skip' || s === 'ok') return s;
      if (s === 'start') return { stage: 'digit', vp: v };
      if (s.stage === 'digit') return { stage: 'a', vp: s.vp, digit: v };
      if (s.stage === 'a') return { stage: 'b', vp: s.vp, digit: s.digit, a: v };
      if (s.vp !== k) return 'skip';
      const lo = Math.min(s.a, v), hi = Math.max(s.a, v);
      return (s.digit > lo && s.digit < hi) ? 'ok' : undefined;
    },
    accept: (s) => s === 'skip' || s === 'ok',
    maxDepth: 4,
  }, shape);
});
const betweenChecks = PAIRS.flatMap(([a, b], i) => cells
  .filter((cell) => cell !== a && cell !== b)
  .map((cell) => new NFA(betweenSpecs[i], 'between',
    [label.at(cell), cell, a, b])));

return [
  shape,
  label.toVar('path'),
  ...domains,
  ...degreeChecks,
  ...connectivity,
  ...betweenChecks,
];
