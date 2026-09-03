// Title: Whisper Of The Killer Snake
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=RLvFhIxpTxw
// Source: https://app.crackingthecryptic.com/sudoku/nGtnmLtndn

// Rules encoded here, in full:
//   Normal sudoku rules apply.
//   Eleven cage totals are printed, each in a single cell. The cages themselves
//   are not drawn and must be deduced. Each cage is a snake path of orthogonally
//   connected cells that starts or ends at its total cell, is at least 2 cells
//   long, and never branches. The total cell is the cage's topmost cell, and
//   among the cage's cells in that row its leftmost. The snake may run alongside
//   itself (non-consecutive cells of one snake may be orthogonally adjacent).
//   Cages may not overlap. Digits in a cage sum to the total and do not repeat.
//   Adjacent digits along a snake differ by at least 5.
// No rule is omitted. Cells in no cage are unconstrained beyond sudoku.

// The eleven printed totals, each read from its own single-cell clue.
const CLUES = [
  ['R1C1', 7], ['R1C3', 10], ['R2C2', 40], ['R3C9', 9],
  ['R5C1', 10], ['R5C5', 8], ['R5C8', 16], ['R6C2', 40],
  ['R6C3', 14], ['R8C9', 14], ['R9C2', 10],
];

// Every digit string one cage can hold, derived from the three digit rules --
// distinct digits, adjacent digits differing by at least 5, total = the clue,
// at least two cells. Each is listed from the total cell, which is one end of
// the snake, so a cage is pinned by (which clue, which of these strings).
const sequencesFor = (total) => {
  const found = [];
  const walk = (seq, sum) => {
    if (sum === total && seq.length >= 2) found.push(seq.slice());
    if (sum >= total) return;
    for (let d = 1; d <= 9; d++) {
      if (seq.includes(d)) continue;
      if (seq.length && Math.abs(d - seq[seq.length - 1]) < 5) continue;
      if (sum + d > total) continue;
      seq.push(d);
      walk(seq, sum + d);
      seq.pop();
    }
  };
  walk([], 0);
  return found;
};
const CAGE_SEQS = CLUES.map(([, total]) => sequencesFor(total));
const MAX_LEN = CAGE_SEQS.map(seqs => Math.max(...seqs.map(s => s.length)));

const shape = new Shape('9x9', 12);   // widened only to hold the overlay states
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Four overlays carry the deduced cages. Each grid cell gets:
//   VP  the direction to its predecessor along its snake, or NONE
//   VS  the direction to its successor, or NONE
//   VG  which cage it belongs to (NO_CAGE, or 2 + the clue's index)
//   VQ  which of that cage's digit strings the cage uses (NO_CAGE, or 1 + index)
// Snakes are oriented away from the total cell, so the total cell is the cell
// with no predecessor. A cell carries at most one predecessor and at most one
// successor, which is both "must not branch" and "cages may not overlap"; two
// snake cells may still be adjacent without being joined, which is the
// "may touch itself" allowance.
const NO_CAGE = 1, NONE = 1;
const DIRS = [
  { dr: -1, dc: 0, code: 2, opp: 4 },   // up
  { dr: 0, dc: 1, code: 3, opp: 5 },    // right
  { dr: 1, dc: 0, code: 4, opp: 2 },    // down
  { dr: 0, dc: -1, code: 5, opp: 3 },   // left
];
const pred = graph.makeOverlay('VP');
const succ = graph.makeOverlay('VS');
const cage = graph.makeOverlay('VG');
const variant = graph.makeOverlay('VQ');

// Which cells cage k can reach: the total cell is the topmost, then leftmost
// cell of its cage, and a snake of at most MAX_LEN cells cannot step further
// than MAX_LEN - 1 cells away from its end.
const canHold = (cell, k) => {
  const here = parseCellId(cell), clue = parseCellId(CLUES[k][0]);
  if (here.row < clue.row) return false;
  if (here.row === clue.row && here.col < clue.col) return false;
  const dist = Math.abs(here.row - clue.row) + Math.abs(here.col - clue.col);
  return dist <= MAX_LEN[k] - 1;
};
const cagesAt = new Map(gridCells.map(
  cell => [cell, CLUES.map((_, k) => k).filter(k => canHold(cell, k))]));
const clueIndex = new Map(CLUES.map(([cell], k) => [cell, k]));

// --- Per-cell rule, reading [VP, VS, VG, VQ, digit].
// A cell outside every cage has no predecessor, no successor and no digit rule.
// A cell inside cage k using digit string s holds one of s's digits: s's first
// digit exactly when it has no predecessor (it is then the total cell), s's
// last digit exactly when it has no successor, and one of s's interior digits
// otherwise. A two-cell string has no interior, so both of its cells are ends.
// `isClue` is the "a snake can only start at a total cell" half: everywhere else
// a cell with no predecessor is in no cage at all.
const cellRule = (isClue) => NFA.encodeSpec({
  startState: 'p',
  transition: (state, value) => {
    if (state === 'p') return 's' + (value === NONE ? 1 : 0);
    if (state[0] === 's') return 'g' + state[1] + (value === NONE ? 1 : 0);
    if (state[0] === 'g') {
      const pNone = state[1] === '1', sNone = state[2] === '1';
      if (value === NO_CAGE) return (pNone && sNone) ? 'qfree' : undefined;
      const k = value - 2;
      if (k >= CLUES.length) return undefined;
      if (pNone && !isClue) return undefined;
      return 'q' + state[1] + state[2] + ':' + k;
    }
    if (state === 'qfree') {
      return value === NO_CAGE ? 'v:1_2_3_4_5_6_7_8_9' : undefined;
    }
    if (state[0] === 'q') {
      const pNone = state[1] === '1', sNone = state[2] === '1';
      const seq = CAGE_SEQS[+state.slice(4)][value - 2];
      if (!seq) return undefined;
      const first = seq[0], last = seq[seq.length - 1];
      const allowed = seq.filter(d => (pNone ? d === first : d !== first)
        && (sNone ? d === last : d !== last));
      return allowed.length ? 'v:' + allowed.join('_') : undefined;
    }
    if (state[0] === 'v') {
      return state.slice(2).split('_').includes(String(value)) ? 'done' : undefined;
    }
    return undefined;
  },
  accept: (state) => state === 'done',
  maxDepth: 5,
}, shape);
const CELL_RULE = [cellRule(false), cellRule(true)];

// --- Per-directed-edge rule, reading
// [VS(a), VP(b), VG(a), VG(b), VQ(a), VQ(b), digit(a), digit(b)] for the step
// from a to its neighbour b in direction `code`. The first two cells decide
// whether the snake actually steps a -> b, and the two overlays must agree on
// that (a points at b exactly when b points back at a); when it does not, the
// rest is unconstrained. When it does, b is in the same cage using the same
// digit string as a, and b's digit is the one that follows a's digit in that
// string -- which also forbids a's digit from being the string's last.
const edgeRule = (code, opp) => NFA.encodeSpec({
  startState: 'a',
  transition: (state, value) => {
    if (state === 'a') return 'b' + (value === code ? 1 : 0);
    if (state === 'b1') return value === opp ? 'ga' : undefined;
    if (state === 'b0') return value === opp ? undefined : 'skip';
    if (state === 'skip') return 'skip';
    if (state === 'ga') {
      const k = value - 2;
      return (k >= 0 && k < CLUES.length) ? 'gb:' + k : undefined;
    }
    if (state.startsWith('gb:')) {
      const k = +state.slice(3);
      return value === k + 2 ? 'qa:' + k : undefined;
    }
    if (state.startsWith('qa:')) {
      const seq = CAGE_SEQS[+state.slice(3)][value - 2];
      return seq ? 'qb:' + value + ':' + seq.join('') : undefined;
    }
    if (state.startsWith('qb:')) {
      const parts = state.split(':');
      return value === +parts[1] ? 'da:' + parts[2] : undefined;
    }
    if (state.startsWith('da:')) {
      const seq = state.slice(3).split('').map(Number);
      const i = seq.indexOf(value);
      return (i >= 0 && i < seq.length - 1) ? 'db:' + seq[i + 1] : undefined;
    }
    if (state.startsWith('db:')) {
      return value === +state.slice(3) ? 'done' : undefined;
    }
    return undefined;
  },
  accept: (state) => state === 'done' || state === 'skip',
  maxDepth: 8,
}, shape);
const EDGE_RULE = DIRS.map(d => edgeRule(d.code, d.opp));

// Where each snake step may go: only to a neighbour that shares a cage with
// this cell, so a cell no cage can reach is never entered or left.
const linkable = (a, b) => cagesAt.get(a).some(k => cagesAt.get(b).includes(k));
const stepsFrom = (cell) => DIRS.map((d, i) => {
  const to = graph.step(cell, d.dr, d.dc);
  return (to && linkable(cell, to)) ? { dir: d, to, ruleIndex: i } : null;
}).filter(Boolean);

const domains = gridCells.flatMap(cell => {
  const ks = cagesAt.get(cell);
  const dirCodes = stepsFrom(cell).map(s => s.dir.code);
  const maxVariants = Math.max(0, ...ks.map(k => CAGE_SEQS[k].length));
  const variants = [];
  for (let i = 1; i <= maxVariants; i++) variants.push(i + 1);
  return [
    new Given(pred.at(cell), NONE, ...dirCodes),
    new Given(succ.at(cell), NONE, ...dirCodes),
    new Given(cage.at(cell), NO_CAGE, ...ks.map(k => k + 2)),
    new Given(variant.at(cell), NO_CAGE, ...variants),
  ];
});

const cellRules = gridCells
  .filter(cell => cagesAt.get(cell).length > 0)
  .map(cell => new NFA(
    CELL_RULE[clueIndex.has(cell) ? 1 : 0], 'cell',
    pred.at(cell), succ.at(cell), cage.at(cell), variant.at(cell), cell));

const edgeRules = gridCells.flatMap(cell => stepsFrom(cell).map(({ to, ruleIndex }) =>
  new NFA(EDGE_RULE[ruleIndex], 'step',
    succ.at(cell), pred.at(to), cage.at(cell), cage.at(to),
    variant.at(cell), variant.at(to), cell, to)));

// Each total cell is the start of its own cage's snake.
const clueGivens = CLUES.flatMap(([cell], k) => [
  new Given(cage.at(cell), k + 2),
  new Given(pred.at(cell), NONE),
]);

return [
  shape,
  // The widened alphabet is for the overlays only; the board holds 1-9.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  pred.toVar('pred'),
  succ.toVar('succ'),
  cage.toVar('cage'),
  variant.toVar('digits'),
  ...domains,
  ...clueGivens,
  ...cellRules,
  ...edgeRules,
];
