// Title: Everything Is Rihgt
// Author: DiMono
// Video: https://www.youtube.com/watch?v=CEhHEyD4Gjs
// Source: https://app.crackingthecryptic.com/sudoku/jq4RbMd67t

// The puzzle is solved twice on the same 9x9 grid. The RIGHT phase is the
// main grid: normal sudoku plus Killer, Little Killer, Quadruple, Kropki,
// Thermometer, Palindrome, Maximum, Minimum and XV rules, and twelve red
// outside clues that are each "at least one of normal Skyscrapers, X-Sum,
// or Sandwich clues". The WROGN phase is a second sudoku over the same
// cells, modeled as the VW Var layer: "All clues in the grid must be made
// invalid in the finished solution, and red clues cannot be ANY of valid
// Skyscrapers, X-Sum, or Sandwich clues", and "no digit may be the same as
// it was in the Right version". Outside clues (Little Killers, red clues)
// are in scope of the Wrogn negation: the rules negate the red outside
// clues explicitly, and the video presents the second solve as the puzzle
// "with the clues being treated as false".
//
// Wrogn negation readings, each from the rules text:
// - Killer: the clue is "Digits cannot repeat within a cage and sum to the
//   small clue ... (if given)", so invalid = a repeated digit or a failed
//   total; for the no-total cage the claim is only the repeat ban, so
//   invalid = some pair of its cells repeats.
// - Inequality clues: "A 'less than' sign effectively becomes a
//   greater-than-or-equal-to sign. A 'greater than' sign effectively
//   becomes a less-than-or-equal-to sign."
// - "thermometers must NOT increase from bulb to tip" (every thermometer
//   here is bulb+tip only, so tip <= bulb).
// - "quadruple circles may have some BUT NOT ALL listed digits in the
//   surrounding cells": a one-digit circle's digit is absent; the 1,9
//   circle is missing at least one of 1 and 9.
// - "the maximum cell must be less than AT LEAST one adjacent cell, the
//   minimum cell must be greater than AT LEAST one adjacent cell".
// - "red clues cannot be ANY of valid Skyscrapers, X-Sum, or Sandwich
//   clues": all three readings of each red clue fail (with < and > flipped
//   per the sign rule above, and an exact clue value simply not matched).
// - Little Killer, Kropki, Palindrome and XV get no special wording, so the
//   clue's plain claim is false: diagonal sum differs from the clue, dot
//   pairs are not consecutive / not in a 1:2 ratio, the palindrome does not
//   read the same both ways, X pairs do not sum to 10.
//
// Right-phase notes:
// - Two cages carry an inequality total drawn as text (">5", "<11", and
//   "<12" as a label next to its cage); each is an Or over every total in a
//   2-cell cage's possible range (3..17) satisfying the inequality.
// - Maximum/Minimum: R8C5's four chevrons point outward past each
//   neighbour (Maximum), R3C6's point inward from each neighbour (Minimum),
//   read from the drawn chevron tips relative to the cell centres.
// - Red clues: each is an Or over every (type, value) combination whose
//   value lies in that type's structural range (Skyscraper 1-9, X-Sum 1-45,
//   Sandwich 0-35) and satisfies the printed relation. Structurally
//   unreachable combinations (e.g. an X-Sum of exactly 2) only make that
//   one branch vacuous, never an incorrect accept.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// ---------------------------------------------------------------------------
// Shared clue tables (transcribed from the drawn puzzle)
// ---------------------------------------------------------------------------

// Thermometers: bulb first, then tip (grey lines with a bulb; the R9C5 bulb
// forks into two arms, one entry per arm).
const THERMOS = [
  ['R9C2', 'R9C3'],
  ['R9C1', 'R8C1'],
  ['R9C5', 'R8C6'],
  ['R9C5', 'R8C4'],
  ['R8C8', 'R8C7'],
  ['R9C8', 'R9C7'],
  ['R6C6', 'R5C6'],
  ['R8C3', 'R9C4'],
];

// Palindromes: thinner grey lines with no bulb.
const PALINDROMES = [
  ['R8C9', 'R7C8', 'R6C7'],
  ['R7C3', 'R6C2', 'R5C2'],
];

// XV: "X" edge marks (no "V" marks are drawn).
const X_MARKS = [
  ['R3C4', 'R3C5'],
  ['R9C5', 'R9C6'],
  ['R8C9', 'R9C9'],
  ['R5C2', 'R6C2'],
];

// Quadruple circles: top-left cell of the 2x2, plus the listed digits.
const QUADS = [
  { topLeft: 'R7C8', values: [1, 9] },
  { topLeft: 'R4C7', values: [9] },
  { topLeft: 'R4C4', values: [9] },
  { topLeft: 'R1C2', values: [9] },
  { topLeft: 'R1C3', values: [9] },
];

// Little Killers: off-grid arrows entering at an edge cell (not always a
// corner), with the printed sum.
const LITTLE_KILLERS = [
  { cells: graph.ray('R8C1', 1, 1), total: 14 },
  { cells: graph.ray('R7C1', 1, 1), total: 20 },
  { cells: graph.ray('R6C1', 1, 1), total: 26 },
  { cells: graph.ray('R1C6', 1, 1), total: 19 },
  { cells: graph.ray('R9C6', -1, 1), total: 23 },
];

// Kropki dots (the only two drawn).
const WHITE_DOT = ['R6C6', 'R7C6'];
const BLACK_DOT = ['R5C3', 'R6C3'];

// Maximum / Minimum cells with their orthogonal neighbours.
const MAX_CELL = 'R8C5';
const MIN_CELL = 'R3C6';
const orthoNeighbours = (cell) => graph.neighbours(cell);

// Red outside clues: lane cells ordered from the clue side inward, plus the
// printed relation on the clue value.
const RED_CLUES = [
  { name: 'bC1', cells: graph.ray('R9C1', -1, 0), rel: { op: 'lt', bound: 4 } },
  { name: 'bC2', cells: graph.ray('R9C2', -1, 0), rel: { op: 'lt', bound: 3 } },
  { name: 'bC6', cells: graph.ray('R9C6', -1, 0), rel: { op: 'lt', bound: 3 } },
  { name: 'bC8', cells: graph.ray('R9C8', -1, 0), rel: { op: 'lt', bound: 3 } },
  { name: 'rR1', cells: graph.ray('R1C9', 0, -1), rel: { op: 'lt', bound: 3 } },
  { name: 'rR3', cells: graph.ray('R3C9', 0, -1), rel: { op: 'lt', bound: 3 } },
  { name: 'tC6', cells: graph.ray('R1C6', 1, 0), rel: { op: 'gt', bound: 3 } },
  { name: 'tC4', cells: graph.ray('R1C4', 1, 0), rel: { op: 'gt', bound: 30 } },
  { name: 'tC3', cells: graph.ray('R1C3', 1, 0), rel: { op: 'eq', bound: 4 } },
  { name: 'rR5', cells: graph.ray('R5C9', 0, -1), rel: { op: 'eq', bound: 3 } },
  { name: 'rR7', cells: graph.ray('R7C9', 0, -1), rel: { op: 'eq', bound: 8 } },
  { name: 'rR8', cells: graph.ray('R8C9', 0, -1), rel: { op: 'eq', bound: 2 } },
];

const quadCells = ({ topLeft }) => {
  const { row, col } = parseCellId(topLeft);
  return [makeCellId(row, col), makeCellId(row, col + 1),
  makeCellId(row + 1, col), makeCellId(row + 1, col + 1)];
};

const relHolds = ({ op, bound }, v) =>
  op === 'lt' ? v < bound : op === 'gt' ? v > bound : v === bound;

// ---------------------------------------------------------------------------
// RIGHT phase (main grid)
// ---------------------------------------------------------------------------

const SKY_RANGE = [1, 9];
const XSUM_RANGE = [1, 45];
const SANDWICH_RANGE = [0, 35];
const CAGE2_RANGE = [3, 17]; // two distinct digits from 1-9

const valuesInRange = ([lo, hi], rel) => {
  const out = [];
  for (let v = lo; v <= hi; v++) if (relHolds(rel, v)) out.push(v);
  return out;
};

// At least one of Skyscraper/X-Sum/Sandwich holds for `cells` (nearest the
// clue first), at a value satisfying `rel`.
const redClue = ({ cells, rel }) => new Or([
  ...valuesInRange(SKY_RANGE, rel).map(v => Skyscraper.fromCells(v, cells, geometry)),
  ...valuesInRange(XSUM_RANGE, rel).map(v => XSum.fromCells(v, cells, geometry)),
  ...valuesInRange(SANDWICH_RANGE, rel).map(v => Sandwich.fromCells(v, cells, geometry)),
]);

// A 2-cell killer cage whose drawn clue is an inequality on the total.
const cageRange = (cells, rel) =>
  new Or(valuesInRange(CAGE2_RANGE, rel).map(v => new Cage(v, ...cells)));

const rightPhase = [
  // Killer cages (the raw source also carries metadata stub entries that are
  // not cages).
  new Cage(7, 'R4C3', 'R4C4'),
  new AllDifferent('R6C6', 'R7C5', 'R7C6'), // no-total cage
  cageRange(['R5C8', 'R6C8'], { op: 'lt', bound: 12 }),
  cageRange(['R8C2', 'R8C3'], { op: 'gt', bound: 5 }),
  cageRange(['R5C9', 'R6C9'], { op: 'lt', bound: 11 }),

  ...LITTLE_KILLERS.map(({ cells, total }) =>
    LittleKiller.fromCells(total, cells, geometry)),

  ...QUADS.map(({ topLeft, values }) => new Quad(topLeft, ...values)),

  new WhiteDot(...WHITE_DOT),
  new BlackDot(...BLACK_DOT),

  ...THERMOS.map(cells => new Thermo(...cells)),

  ...PALINDROMES.map(cells => new Palindrome(...cells)),

  // Maximum: greater than every orthogonal neighbour.
  new GreaterThan(MAX_CELL, ...orthoNeighbours(MAX_CELL)),
  // Minimum: less than every orthogonal neighbour -- each neighbour listed
  // ahead of R3C6 so list-order + adjacency gives neighbour > R3C6.
  new GreaterThan(...orthoNeighbours(MIN_CELL), MIN_CELL),

  ...X_MARKS.map(cells => new X(...cells)),

  ...RED_CLUES.map(redClue),
];

// ---------------------------------------------------------------------------
// WROGN phase (second grid, VW layer)
// ---------------------------------------------------------------------------

const w = new Var('W', 'Wrogn (second) grid', '9x9');
// Var cells are named VW1..VW81; always address them via w.cell(row, col).
const wc = (cell) => {
  const { row, col } = parseCellId(cell);
  return w.cell(row, col);
};

// The Wrogn solve is still a sudoku; a Var layer has no implicit groups, so
// its rows, columns and standard 3x3 boxes are stated explicitly.
const range9 = Array.from({ length: 9 }, (_, i) => i + 1);
const wrognSudoku = [
  ...range9.map(r => new AllDifferent(...range9.map(c => w.cell(r, c)))),
  ...range9.map(c => new AllDifferent(...range9.map(r => w.cell(r, c)))),
  ...[0, 3, 6].flatMap(br => [0, 3, 6].map(bc => new AllDifferent(
    ...[1, 2, 3].flatMap(r => [1, 2, 3].map(c => w.cell(br + r, bc + c)))))),
];

// "no digit may be the same as it was in the Right version": every cell
// differs from its Wrogn counterpart.
const crossGrid = graph.cells().map(cell => new AllDifferent(cell, wc(cell)));

// Custom two-cell relation on the Wrogn layer (Wrogn cells are not
// grid-adjacent, so the dot/inequality marker classes cannot be used there).
const wPair = (fn, name, a, b) =>
  new Pair(Pair.fnToKey(fn, 9), name, wc(a), wc(b));
const wEqual = (name, a, b) => wPair((x, y) => x === y, name, a, b);

// Killer cages made invalid: a repeated digit or a failed total. The repeat
// branch is the clue's negation even where the Wrogn grid's own sudoku makes
// it empty (all four totalled cages sit in one row or column).
const wrognCages = [
  wPair((a, b) => a === b || a + b !== 7, 'w-cage7', 'R4C3', 'R4C4'),
  // No-total cage: invalid = some pair of its three cells repeats.
  new Or([
    wEqual('w-cage0a', 'R6C6', 'R7C5'),
    wEqual('w-cage0b', 'R6C6', 'R7C6'),
    wEqual('w-cage0c', 'R7C5', 'R7C6'),
  ]),
  wPair((a, b) => a === b || a + b >= 12, 'w-cageLT12', 'R5C8', 'R6C8'),
  wPair((a, b) => a === b || a + b <= 5, 'w-cageGT5', 'R8C2', 'R8C3'),
  wPair((a, b) => a === b || a + b >= 11, 'w-cageLT11', 'R5C9', 'R6C9'),
];

// Little Killers made invalid: the diagonal sums to any achievable total
// other than the printed one (n cells of 1-9 always sum within n..9n).
const wrognLittleKillers = LITTLE_KILLERS.map(({ cells, total }) => {
  const lane = cells.map(wc);
  const sums = [];
  for (let v = lane.length; v <= 9 * lane.length; v++) {
    if (v !== total) sums.push(new Sum(v, ...lane));
  }
  return new Or(sums);
});

// Quadruples made invalid: not all listed digits appear in the four cells.
// A Given excluding one digit from each of the four cells removes it from
// the quad entirely; the 1,9 circle needs only one of its digits absent.
const notDigit = (cell, d) => new Given(wc(cell), ...range9.filter(v => v !== d));
const wrognQuads = QUADS.map(quad => {
  const cells = quadCells(quad);
  const absent = (d) => new And(cells.map(c => notDigit(c, d)));
  return quad.values.length === 1
    ? absent(quad.values[0])
    : new Or(quad.values.map(absent));
});

// Kropki dots made invalid.
const wrognDots = [
  wPair((a, b) => Math.abs(a - b) !== 1, 'w-white', ...WHITE_DOT),
  wPair((a, b) => a !== 2 * b && b !== 2 * a, 'w-black', ...BLACK_DOT),
];

// Thermometers made invalid: tip <= bulb (all thermometers are bulb+tip).
const wrognThermos = THERMOS.map(([bulb, tip], i) =>
  wPair((b, t) => t <= b, `w-thermo${i}`, bulb, tip));

// Palindromes made invalid: a 3-cell line reads the same both ways exactly
// when its end cells match, so the end cells differ.
const wrognPalindromes = PALINDROMES.map(
  cells => new AllDifferent(wc(cells[0]), wc(cells[2])));

// Maximum/Minimum made invalid: "the maximum cell must be less than AT
// LEAST one adjacent cell, the minimum cell must be greater than AT LEAST
// one adjacent cell".
const wrognMaxMin = [
  new Or(orthoNeighbours(MAX_CELL).map(n =>
    wPair((a, b) => a < b, 'w-max', MAX_CELL, n))),
  new Or(orthoNeighbours(MIN_CELL).map(n =>
    wPair((a, b) => a > b, 'w-min', MIN_CELL, n))),
];

// X marks made invalid: the pair does not sum to 10.
const wrognXs = X_MARKS.map((cells, i) =>
  wPair((a, b) => a + b !== 10, `w-x${i}`, ...cells));

// Red clues made invalid: the lane fails as a Skyscraper AND as an X-Sum
// AND as a Sandwich clue. Each reading is one NFA scanning the lane from
// the clue side; its accept keeps only final values breaking the printed
// relation (with < and > flipped per the sign rule).
//
// skySpec state {max, count}: tallest cell so far and cells visible so far.
const skySpec = (ok) => NFA.encodeSpec({
  startState: { max: 0, count: 0 },
  transition: ({ max, count }, v) =>
    v > max ? { max: v, count: count + 1 } : { max, count },
  accept: ({ count }) => ok(count),
}, 9);
// Both sum machines clamp their running sum one past the largest value a
// real lane can reach (X-Sum 45, sandwich 35): the compiled automaton must
// terminate over arbitrary inputs, and every relation used here treats all
// sums at or beyond the clamp alike (each bound is at most 30).
//
// xsumSpec: the first cell N asks for the sum of the first N cells; state
// {left, sum} counts down the cells still to be added (the first cell both
// sets N and joins the sum).
const XSUM_CLAMP = 46;
const xsumSpec = (ok) => NFA.encodeSpec({
  startState: { left: null, sum: 0 },
  transition: ({ left, sum }, v) =>
    left === null ? { left: v - 1, sum: v } :
      left > 0 ? { left: left - 1, sum: Math.min(sum + v, XSUM_CLAMP) } :
        { left, sum },
  accept: ({ left, sum }) => left !== null && ok(sum),
}, 9);
// sandSpec phase 0/1/2 = before / between / after the 1-9 crusts; sum is
// the between-crust total. A third crust rejects: a sudoku lane holds
// exactly one 1 and one 9, so those branches never describe a real lane.
const SANDWICH_CLAMP = 36;
const sandSpec = (ok) => NFA.encodeSpec({
  startState: { phase: 0, sum: 0 },
  transition: ({ phase, sum }, v) => {
    const crust = v === 1 || v === 9;
    if (phase === 0) return crust ? { phase: 1, sum: 0 } : { phase: 0, sum: 0 };
    if (phase === 1) {
      return crust ? { phase: 2, sum }
        : { phase: 1, sum: Math.min(sum + v, SANDWICH_CLAMP) };
    }
    return crust ? undefined : { phase: 2, sum };
  },
  accept: ({ phase, sum }) => phase === 2 && ok(sum),
}, 9);

// The negated relation: "<" becomes ">=", ">" becomes "<=", an exact value
// becomes "any other value".
const negatedRel = ({ op, bound }) =>
  op === 'lt' ? (v => v >= bound) :
    op === 'gt' ? (v => v <= bound) :
      (v => v !== bound);

const wrognRedClues = RED_CLUES.flatMap(({ name, cells, rel }) => {
  const lane = cells.map(wc);
  const ok = negatedRel(rel);
  return [
    new NFA(skySpec(ok), `w-${name}-sky`, ...lane),
    new NFA(xsumSpec(ok), `w-${name}-xsum`, ...lane),
    new NFA(sandSpec(ok), `w-${name}-sandwich`, ...lane),
  ];
});

return [
  new Shape('9x9'),
  ...rightPhase,
  w,
  ...wrognSudoku,
  ...crossGrid,
  ...wrognCages,
  ...wrognLittleKillers,
  ...wrognQuads,
  ...wrognDots,
  ...wrognThermos,
  ...wrognPalindromes,
  ...wrognMaxMin,
  ...wrognXs,
  ...wrognRedClues,
];
