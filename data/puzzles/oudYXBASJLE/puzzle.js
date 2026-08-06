// Title: Pseudo Cluedo
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=oudYXBASJLE
// Source: https://sudokupad.app/el9sus7p0o

// Rules encoded here:
//  * Normal 9x9 sudoku.
//  * PSEUDO CELLS: every row, column and room (3x3 box) holds exactly one
//    pseudo cell; the nine pseudo cells hold the digits 1-9 once each. A pseudo
//    cell's VALUE is its room number (rooms numbered 1-9 in reading order);
//    every other cell's value is its digit. Values -- not digits -- drive the
//    path, weapon, victim and suspect rules.
//  * FIND YOUR PATH: a line through cell centres, orthogonal or diagonal steps,
//    which does not cross itself, starts and ends on lettered cells, passes
//    through all seven of them, never crosses a thick black wall (rooms are
//    joined only through the CENTRE of a doorway, which for six of the twelve
//    doorways is a lattice corner and so a diagonal step), and whose values
//    never decrease.
//  * WEAPONS: the two cells beside each X have values summing to 10.
//  * THE VICTIM: the four white-outlined cells' values read as a palindrome.
//  * THE SUSPECTS: digits do not repeat in a suspect cage; each suspect's own
//    trait, on values.
//  * The killer: one digit appears in exactly five of the six suspect cages.
//
// Omitted: nothing.
//
// Interpretation notes tied to the source text:
//  * "you can only get from room to room by travelling through the CENTRE of a
//    doorway. For some doorways this may mean you have to go through
//    diagonally" -- every gap in the drawn walls is exactly one cell long, so a
//    doorway centre is either an edge midpoint (one orthogonal step) or a
//    lattice corner (two diagonal steps). No other step may change room.
//  * "may not cross itself" is read as the drawn line never crossing: no cell is
//    used twice, and two diagonal steps may not cross at a shared corner.
//  * Professor Zipworthy's arms "sum to the digit on his central spot" -- the
//    text says digit where every other suspect rule says value, so R5C5's digit
//    is used, not its value.

const OFF = 1;                 // VD: cell is not on the path
const END = 10;                // VD: on the path, final cell
const MOD_A = 9, SENT_A = 10;  // path position counter, layer A
const MOD_B = 10, SENT_B = 11; // path position counter, layer B (lcm 90 > 81)
const NUM_VALUES = 11;

const shape = new Shape('9x9', NUM_VALUES);
const graph = cellGraph(shape);
const pseudo = graph.makeOverlay('VP');  // 1 = ordinary cell, 2 = pseudo cell
const value = graph.makeOverlay('VV');   // the cell's value, 1-9
const step = graph.makeOverlay('VD');    // OFF, 2..9 = successor direction, END
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const pseudoDigit = new Var('Q', 'digit of each room\'s pseudo cell', 9);

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rc = cell => parseCellId(cell);
const room = cell => {
  const { row, col } = rc(cell);
  return 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
};

// Direction codes 2..9 for the eight king steps, in the order used everywhere
// below.
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const dirCode = (from, to) => {
  const a = rc(from), b = rc(to);
  const i = DIRS.findIndex(([dr, dc]) => a.row + dr === b.row && a.col + dc === b.col);
  return i < 0 ? null : i + 2;
};

// --- Drawn walls ------------------------------------------------------------
// The thick black polylines exactly as drawn, in lattice coordinates
// [row, col] with 0..9 on each axis; a cell R#C# spans rows r-1..r.
const WALLS = [
  [[3.5, 3], [3, 3], [3, 4]], [[3, 3], [3, 2]],
  [[6, 4], [6, 3], [7.5, 3]], [[6, 2], [6, 3], [4.5, 3]],
  [[7.5, 6], [6, 6], [6, 8]], [[6, 5], [6, 6], [5.5, 6]],
  [[3, 7.5], [3, 6], [4.5, 6]], [[1, 6], [3, 6], [3, 5]],
  [[6, 1], [6, 0], [9, 0], [9, 9], [0, 9], [0, 3], [2, 3]],
  [[6, 0], [3, 0], [3, 1]],
  [[9, 3], [8.5, 3]], [[9, 6], [8.5, 6]], [[3, 9], [3, 8.5]],
  [[0, 3], [0, 0], [3, 0]],
];

// Walls run only along the four room boundaries (and the outer border). Collect
// what each boundary covers, then read the doorways off as the gaps: each is one
// cell long, and its midpoint is the doorway centre a step must pass through.
const doorwayCentres = new Set();
for (const [axis, at] of [['V', 3], ['V', 6], ['H', 3], ['H', 6]]) {
  const covered = [];
  for (const poly of WALLS) {
    for (let i = 0; i + 1 < poly.length; i++) {
      const [r1, c1] = poly[i], [r2, c2] = poly[i + 1];
      if (axis === 'V' && c1 === c2 && c1 === at) covered.push([Math.min(r1, r2), Math.max(r1, r2)]);
      if (axis === 'H' && r1 === r2 && r1 === at) covered.push([Math.min(c1, c2), Math.max(c1, c2)]);
    }
  }
  covered.sort((a, b) => a[0] - b[0]);
  let end = 0;
  for (const [lo, hi] of covered.concat([[9, 9]])) {
    if (lo > end) {
      const mid = (lo + end) / 2;
      doorwayCentres.add(axis === 'V' ? `${mid},${at}` : `${at},${mid}`);
    }
    end = Math.max(end, hi);
  }
}

// A king step is legal when it stays inside one room, or when the point it
// crosses the boundary at is a doorway centre.
const legalStep = (from, to) => {
  if (room(from) === room(to)) return true;
  const a = rc(from), b = rc(to);
  return doorwayCentres.has(`${(a.row + b.row) / 2 - 0.5},${(a.col + b.col) / 2 - 0.5}`);
};
const stepNeighbours = cell => graph.kingNeighbours(cell).filter(n => legalStep(cell, n));

// --- Drawn clues ------------------------------------------------------------
// The seven lettered cells: the victim A and the six suspects' initials.
const LETTERED = ['R6C2', 'R2C2', 'R5C4', 'R2C8', 'R9C5', 'R8C9', 'R2C5'];

// The X marks, each on the edge between the two cells it separates.
const WEAPONS = [
  ['R7C1', 'R8C1'], ['R7C7', 'R7C8'], ['R1C4', 'R1C5'],
  ['R2C4', 'R3C4'], ['R4C7', 'R5C7'],
];

// The white outline round the victim, in body order across the rooms 4/7
// doorway (R6C2-R7C2).
const VICTIM = ['R6C1', 'R6C2', 'R7C2', 'R7C3'];

// The six suspect cages, each listed in the order its coloured line is drawn.
// Yellow branches, so it is given as its trunk plus the branch cell.
const REVEREND = ['R1C1', 'R1C2', 'R2C2', 'R2C3', 'R3C3'];        // green
const TENCLUMPZ = ['R1C6', 'R2C5', 'R2C6', 'R3C5', 'R3C6'];       // white
const PARITY = ['R1C9', 'R2C9', 'R2C8', 'R3C8'];                  // red
const ZIPWORTHY = ['R6C4', 'R5C4', 'R5C5', 'R5C6', 'R4C6'];       // purple
const NABNER = ['R7C5', 'R8C5', 'R9C5', 'R8C6'];                  // yellow
const SUMMER = ['R5C8', 'R6C8', 'R6C9', 'R7C9', 'R8C9'];          // blue
const CAGES = [REVEREND, TENCLUMPZ, PARITY, ZIPWORTHY, NABNER, SUMMER];

// --- Pseudo cells -----------------------------------------------------------
// One NFA per room over [VQk, VP, digit, VP, digit, ...]: exactly one cell of
// the room is pseudo, and VQk is that cell's digit. VQ1..VQ9 all-different then
// gives the nine pseudo cells the digits 1-9 once each.
const roomPseudoSpec = NFA.encodeSpec({
  startState: { q: 0, found: false, want: 0 },
  transition: (s, v) => {
    if (s.q === 0) return { q: v, found: false, want: 0 };
    if (s.want === 0) {
      if (v !== 2) return { ...s, want: 1 };   // ordinary cell: skip its digit
      if (s.found) return undefined;           // a second pseudo cell in the room
      return { ...s, want: 2 };                // pseudo cell: its digit must be q
    }
    if (s.want === 2 && v !== s.q) return undefined;
    return { q: s.q, found: s.found || s.want === 2, want: 0 };
  },
  accept: s => s.found,
  maxDepth: 19,
}, NUM_VALUES);

// One NFA per room number over [VP, digit, VV]: value = digit, or the room
// number when the cell is pseudo.
const valueSpecs = DIGITS.map(r => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (s, v) => {
    if (s.p === 0) return { p: 1, isPseudo: v === 2 };
    if (s.p === 1) return { p: 2, want: s.isPseudo ? r : v };
    return v === s.want ? { p: 3 } : undefined;
  },
  accept: s => s.p === 3,
  maxDepth: 3,
}, NUM_VALUES));

const pseudoRules = [
  pseudo.toVar('pseudo cells'),
  value.toVar('cell values'),
  pseudoDigit,
  pseudo.makeReplicate(new Given(pseudo.at('R1C1'), 1, 2)),
  value.makeReplicate(new Given(value.at('R1C1'), ...DIGITS)),
  graph.makeReplicate(new Given('R1C1', ...DIGITS)),  // grid keeps digits 1-9
  ...pseudoDigit.cells().map(c => new Given(c, ...DIGITS)),
  new AllDifferent(...pseudoDigit.cells()),
  ...graph.rows().map(cells => new ContainExact('2', ...pseudo.at(cells))),
  ...graph.columns().map(cells => new ContainExact('2', ...pseudo.at(cells))),
  ...graph.boxes().map((cells, i) => new NFA(
    roomPseudoSpec, 'pseudo cell',
    pseudoDigit.cell(i + 1),
    ...cells.flatMap(c => [pseudo.at(c), c]))),
  ...graph.cells().map(c => new NFA(
    valueSpecs[room(c) - 1], 'cell value', pseudo.at(c), c, value.at(c))),
];

// --- The path ---------------------------------------------------------------
// VD holds each cell's successor: OFF, one of the eight direction codes, or END.
// Out-degree is therefore at most one by construction; the per-cell machine
// below counts in-degree from the neighbours that could point back.
//  - an OFF cell must have in-degree 0;
//  - an unlettered path cell must have in-degree exactly 1, so it can never be
//    the start;
//  - a lettered path cell may have in-degree 0 (it is the start) or 1.
// Exactly one END plus at-most-one in/out degree makes the used edges a single
// path together with any number of disjoint cycles, and the two position
// counters below rule the cycles out.
// The two position counters are read last: the path's only in-degree-0 cell is
// its start, and numbering it 1 in both layers fixes the otherwise free offset.
const inDegreeSpec = (dirsIn, strict) => NFA.encodeSpec({
  startState: { i: -1, cnt: 0, off: false },
  transition: (s, v) => {
    if (s.i === -1) return { i: 0, cnt: 0, off: v === OFF };
    if (s.i < dirsIn.length) {
      const cnt = s.cnt + (v === dirsIn[s.i] ? 1 : 0);
      if (cnt > 1 || (s.off && cnt > 0)) return undefined;
      return { i: s.i + 1, cnt, off: s.off };
    }
    if (!s.off && s.cnt === 0 && v !== 1) return undefined;
    return { i: s.i + 1, cnt: s.cnt, off: s.off };
  },
  accept: s => s.i === dirsIn.length + 2
    && (s.off ? s.cnt === 0 : (strict ? s.cnt === 1 : s.cnt <= 1)),
  maxDepth: dirsIn.length + 3,
}, NUM_VALUES);

// [VD(u), VV(u), VD(v), VV(v)]: whichever way the step is taken, the value must
// not fall.
const monotoneSpec = (codeUV, codeVU) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (s, v) => {
    if (s.p === 0) return { p: 1, fwd: v === codeUV };
    if (s.p === 1) return { p: 2, fwd: s.fwd, vu: v };
    if (s.p === 2) return { p: 3, fwd: s.fwd, vu: s.vu, back: v === codeVU };
    if (s.fwd && s.vu > v) return undefined;
    if (s.back && v > s.vu) return undefined;
    return { p: 4 };
  },
  accept: s => s.p === 4,
  maxDepth: 4,
}, NUM_VALUES);

// [VD(a), VD(b), VD(c), VD(d)] for the two diagonals a-b and c-d of one lattice
// corner: the drawn line may not cross itself, so at most one may be used.
const noCrossSpec = codes => NFA.encodeSpec({
  startState: { i: 0, first: false, second: false },
  transition: (s, v) => {
    const hit = v === codes[s.i];
    const first = s.first || (s.i < 2 && hit);
    const second = s.second || (s.i >= 2 && hit);
    if (first && second) return undefined;
    return { i: s.i + 1, first, second };
  },
  accept: s => s.i === 4,
  maxDepth: 4,
}, NUM_VALUES);

// [VD(u), pos(u), pos(v)]: the successor's counter is one more, cyclically.
const counterSpec = (codeUV, mod) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (s, v) => {
    if (s.p === 0) return { p: 1, on: v === codeUV };
    if (s.p === 1) return s.on ? (v > mod ? undefined : { p: 2, want: (v % mod) + 1 }) : { p: 2, want: 0 };
    return (s.want === 0 || v === s.want) ? { p: 3 } : undefined;
  },
  accept: s => s.p === 3,
  maxDepth: 3,
}, NUM_VALUES);

const onPathSpec = sentinel => Pair.fnToKey((d, p) => (d === OFF) === (p === sentinel), shape);

const stepCells = graph.cells();
const orderedEdges = [];   // each legal step once, as [u, v] with u before v
for (const u of stepCells) {
  for (const v of stepNeighbours(u)) {
    if (stepCells.indexOf(u) < stepCells.indexOf(v)) orderedEdges.push([u, v]);
  }
}

const corners = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const a = makeCellId(r, c), b = makeCellId(r + 1, c + 1);
    const p = makeCellId(r, c + 1), q = makeCellId(r + 1, c);
    if (legalStep(a, b) && legalStep(p, q)) corners.push([a, b, p, q]);
  }
}

const pathRules = [
  step.toVar('path successor'),
  posA.toVar('path position mod 9'),
  posB.toVar('path position mod 10'),
  // Only steps the walls allow are in a cell's domain. A lettered cell has no
  // OFF (all seven are on the path) and is the only kind that may carry END.
  ...stepCells.map(c => new Given(
    step.at(c),
    ...(LETTERED.includes(c) ? [END] : [OFF]),
    ...stepNeighbours(c).map(n => dirCode(c, n)))),
  // Layer A's sentinel is 10, so 11 is not a value it may take; layer B uses the
  // whole alphabet (counters 1-10 plus sentinel 11) and needs no restriction.
  posA.makeReplicate(new Given(
    posA.at('R1C1'), ...Array.from({ length: MOD_A }, (_, i) => i + 1), SENT_A)),
  new ContainExact(String(END), ...step.at(stepCells)),
  ...stepCells.map(c => {
    const ns = stepNeighbours(c);
    return new NFA(
      inDegreeSpec(ns.map(n => dirCode(n, c)), !LETTERED.includes(c)),
      'path degree', step.at(c), ...step.at(ns), posA.at(c), posB.at(c));
  }),
  ...orderedEdges.map(([u, v]) => new NFA(
    monotoneSpec(dirCode(u, v), dirCode(v, u)), 'path values',
    step.at(u), value.at(u), step.at(v), value.at(v))),
  ...corners.map(([a, b, p, q]) => new NFA(
    noCrossSpec([dirCode(a, b), dirCode(b, a), dirCode(p, q), dirCode(q, p)]),
    'no crossing', step.at(a), step.at(b), step.at(p), step.at(q))),
  ...stepCells.map(c => new Pair(onPathSpec(SENT_A), 'on path', step.at(c), posA.at(c))),
  ...stepCells.map(c => new Pair(onPathSpec(SENT_B), 'on path', step.at(c), posB.at(c))),
  ...orderedEdges.flatMap(([u, v]) => [
    new NFA(counterSpec(dirCode(u, v), MOD_A), 'path position', step.at(u), posA.at(u), posA.at(v)),
    new NFA(counterSpec(dirCode(v, u), MOD_A), 'path position', step.at(v), posA.at(v), posA.at(u)),
    new NFA(counterSpec(dirCode(u, v), MOD_B), 'path position', step.at(u), posB.at(u), posB.at(v)),
    new NFA(counterSpec(dirCode(v, u), MOD_B), 'path position', step.at(v), posB.at(v), posB.at(u)),
  ]),
];

// --- Suspects, weapons, victim ---------------------------------------------
// Colonel Nabner's rule is over every pair of his cells, not just neighbours.
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) >= 2, shape);

// Miss Tenclumpz's five cells split into orthogonally connected groups each
// summing to 10, so two groups totalling 20. Only three splits of her shape are
// connected on both sides; the disjunction covers all of them.
const tenSplits = [
  ['R1C6', 'R2C6'], ['R2C5', 'R3C5'], ['R3C5', 'R3C6'],
].map(pair => new Sum(10, ...value.at(pair)));

// The killer's cage is the one missing the shared digit, so exactly five of the
// six cages contain it. One machine per candidate digit, cages as segments.
const killerSpec = d => NFA.encodeSpec({
  startState: { seen: false, cages: 0 },
  transition: (s, v) => {
    if (v === SEGMENT_BREAK) {
      const cages = s.cages + (s.seen ? 1 : 0);
      return cages > 5 ? undefined : { seen: false, cages };
    }
    return { seen: s.seen || v === d, cages: s.cages };
  },
  accept: s => s.cages + (s.seen ? 1 : 0) === 5,
  maxDepth: 32,
}, NUM_VALUES, { multiSegment: true });

const clueRules = [
  ...CAGES.map(cells => new AllDifferent(...cells)),
  ...WEAPONS.map(pair => new Sum(10, ...value.at(pair))),
  new Palindrome(...value.at(VICTIM)),
  new Modular(2, ...value.at(PARITY)),
  new EqualSum(value.at(SUMMER.slice(0, 3)), value.at(SUMMER.slice(3))),
  new Sum(20, ...value.at(TENCLUMPZ)),
  new Or(tenSplits),
  new PairX(nabnerKey, 'Nabner', ...value.at(NABNER)),
  new EqualSum(value.at(['R5C4', 'R5C6']), value.at(['R6C4', 'R4C6']), ['R5C5']),
  new Whisper(5, ...value.at(REVEREND)),
  new Or(DIGITS.map(d => new NFA(killerSpec(d), 'killer digit', ...CAGES))),
];

return [shape, ...pseudoRules, ...pathRules, ...clueRules];
