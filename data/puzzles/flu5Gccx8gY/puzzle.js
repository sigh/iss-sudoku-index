// Title: House Par(i)ty
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=flu5Gccx8gY
// Source: https://app.crackingthecryptic.com/sudoku/FRph2b4g2g

// Stage 2 is ordinary 9x9 Sudoku. VS is the independent Stage-1 grid: each
// 3x3 box is a three-symbol Latin square; cages and outside clues act there.
const stage = new Var('S', 'stage 1 mean minis', '9x9');
const s = (r, c) => stage.cell(r, c);
const g = (r, c) => makeCellId(r, c);
const cells = (r0, c0, h, w) => Array.from({ length: h * w }, (_, i) =>
  s(r0 + Math.floor(i / w), c0 + (i % w)));

// A box must use exactly three values. Local rows and columns below make each
// of those values occur once in each local row and column.
const threeSymbols = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen }, value) => {
    if (seen.includes(value)) return { seen };
    if (seen.length === 3) return undefined;
    return { seen: [...seen, value].sort((a, b) => a - b) };
  },
  accept: ({ seen }) => seen.length === 3,
}, 9);

const minis = Array.from({ length: 9 }, (_, box) => {
  const r0 = 1 + 3 * Math.floor(box / 3);
  const c0 = 1 + 3 * (box % 3);
  return [
    new NFA(threeSymbols, 'three digits in this mini', ...cells(r0, c0, 3, 3)),
    ...Array.from({ length: 3 }, (_, i) => new AllDifferent(...cells(r0 + i, c0, 1, 3))),
    ...Array.from({ length: 3 }, (_, i) => new AllDifferent(...cells(r0, c0 + i, 3, 1))),
  ];
}).flat();

// A Parity Party clue stops at its first digit of the requested parity and its
// inclusive prefix sum must equal the displayed clue. Either parity may be the
// stopping parity, as stated by the rule.
const partyNFA = (target, parity) => NFA.encodeSpec({
  startState: { sum: 0, done: false },
  transition: ({ sum, done }, value) => {
    if (done) return { sum, done: true };
    const next = sum + value;
    if (next > target) return undefined;
    if (value % 2 === parity) return next === target ? { sum: next, done: true } : undefined;
    return { sum: next, done: false };
  },
  accept: ({ done }) => done,
}, 9);
const party = (target, line) => new Or([0, 1].map(parity =>
  new NFA(partyNFA(target, parity), `Parity Party ${target}`, ...line)));

// The drawn cages apply in both stages; this table is transcribed from their
// cell lists and totals.
const CAGE_DATA = [
  [15, [[6, 7], [6, 8]]], [10, [[3, 2], [3, 3]]], [7, [[2, 6], [3, 6]]],
  [9, [[1, 4], [2, 4]]], [9, [[3, 8], [3, 9]]], [13, [[2, 7], [3, 7]]],
  [15, [[4, 2], [5, 2]]], [7, [[7, 2], [7, 3]]], [14, [[4, 5], [5, 5], [6, 5]]],
  [11, [[5, 4], [6, 4]]], [10, [[4, 6], [5, 6]]], [18, [[7, 6], [8, 6], [9, 6]]],
  [9, [[9, 4], [9, 5]]], [14, [[7, 8], [7, 9], [8, 8]]], [15, [[1, 2], [2, 2], [2, 3]]],
];
const cages = (at) => CAGE_DATA.map(([total, coords]) =>
  new Cage(total, ...coords.map(([r, c]) => at(r, c))));

const OUTSIDE_DATA = [
  [8, [[2, 1], [2, 2], [2, 3]]], [13, [[4, 1], [4, 2], [4, 3]]],
  [21, [[6, 1], [6, 2], [6, 3]]], [9, [[9, 1], [9, 2], [9, 3]]],
  [22, [[4, 9], [4, 8], [4, 7]]], [7, [[8, 9], [8, 8], [8, 7]]],
  [6, [[1, 5], [2, 5], [3, 5]]], [16, [[1, 8], [2, 8], [3, 8]]],
  [4, [[9, 3], [8, 3], [7, 3]]], [17, [[9, 5], [8, 5], [7, 5]]],
  [5, [[9, 7], [8, 7], [7, 7]]],
];
const outside = (at, full) => OUTSIDE_DATA.map(([total, coords]) => {
  const [r, c] = coords[0];
  const [r2, c2] = coords[1];
  const dr = r2 - r;
  const dc = c2 - c;
  const line = full
    ? Array.from({ length: 9 }, (_, i) => at(r + dr * i, c + dc * i))
    : coords.map(([row, col]) => at(row, col));
  return party(total, line);
});

const centres = Array.from({ length: 3 }, (_, br) => Array.from({ length: 3 }, (_, bc) =>
  [2 + 3 * br, 2 + 3 * bc])).flat();

return [
  new Shape('9x9'),
  stage,
  ...minis,
  ...cages(s),
  ...outside(s, false),
  ...cages(g),
  ...outside(g, true),
  ...centres.map(([r, c]) => new SameValues(2, s(r, c), g(r, c))),
];
