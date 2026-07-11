// Title: 24 / 4
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=OF7CAtGkizk
// Source: https://sudokupad.app/bpxci0jt2o

// Quattro Quadri: 6x6 grid, digits 1-9. Rows and columns contain no repeated
// digit (drawn from 1-9, no coverage requirement); each of the four 3x3 boxes
// contains every digit 1-9 exactly once.
//
// Full Rank: each row read forwards and backwards, and each column read
// downwards and upwards, forms a 6-digit number, giving 24 numbers in total.
// These are ranked 1 (lowest) to 24 (highest) with no tied ranks. A purple
// circle gives the rank of the number in the direction its arrow points:
// row 1 forwards is rank 24 (the highest); column 4 downwards is rank 4.
// A third purple circle sits on cell R3C6 and points at row 5 read backwards
// (right to left): the digit placed in R3C6 is that number's rank, so row 5
// backwards is one of the nine lowest-ranked numbers.
//
// Black dot: one digit is double the other.
// Red dot: one digit is odd, the other even.
// Yellow dot: the two digits are not consecutive.

const N = 6;
const rowCells = (r) => Array.from({ length: N }, (_, i) => makeCellId(r, i + 1));
const colCells = (c) => Array.from({ length: N }, (_, i) => makeCellId(i + 1, c));

const lines = [];
for (let r = 1; r <= N; r++) {
  lines.push({ id: `R${r}F`, cells: rowCells(r) });
  lines.push({ id: `R${r}B`, cells: rowCells(r).slice().reverse() });
}
for (let c = 1; c <= N; c++) {
  lines.push({ id: `C${c}D`, cells: colCells(c) });
  lines.push({ id: `C${c}U`, cells: colCells(c).slice().reverse() });
}

function interleave(a, b) {
  const out = [];
  for (let i = 0; i < a.length; i++) out.push(a[i], b[i]);
  return out;
}

// Lexicographic comparison of two interleaved 6-digit sequences (12 cells:
// a1,b1,a2,b2,...,a6,b6). `kind` is 'greater' or 'less'.
function compareSpec(kind) {
  return NFA.encodeSpec({
    startState: { step: 0, result: 'tied', pending: null },
    transition: ({ step, result, pending }, value) => {
      if (step >= 12) return undefined;
      if (step % 2 === 0) {
        return { step: step + 1, result, pending: value };
      }
      let newResult = result;
      if (result === 'tied') {
        if (pending < value) newResult = 'less';
        else if (pending > value) newResult = 'greater';
      }
      return { step: step + 1, result: newResult, pending: null };
    },
    accept: ({ step, result }) => step === 12 && result === kind,
  }, 9);
}

// Same comparison, but the 13th cell is a flag Var that must read 2 when
// a (the C4D line) is less than b (the other line), 1 otherwise. 20 of the
// 23 other lines are greater than C4D (which is rank 4 of 24), so the flags
// sum to 20 trues + 3 falses = 23 + 20 = 43.
function compareFlagSpec() {
  return NFA.encodeSpec({
    startState: { step: 0, result: 'tied', pending: null },
    transition: ({ step, result, pending }, value) => {
      if (step < 12) {
        if (step % 2 === 0) {
          return { step: step + 1, result, pending: value };
        }
        let newResult = result;
        if (result === 'tied') {
          if (pending < value) newResult = 'less';
          else if (pending > value) newResult = 'greater';
        }
        return { step: step + 1, result: newResult, pending: null };
      }
      if (step === 12) {
        const isLess = result === 'less';
        const flagTrue = value === 2;
        if (isLess !== flagTrue) return undefined;
        return { step: 13, result, pending: null };
      }
      return undefined;
    },
    accept: ({ step }) => step === 13,
  }, 9);
}

// Any two of the 24 numbers must differ (no tied ranks anywhere).
function notEqualSpec() {
  return NFA.encodeSpec({
    startState: { step: 0, differs: false, pending: null },
    transition: ({ step, differs, pending }, value) => {
      if (step >= 12) return undefined;
      if (step % 2 === 0) {
        return { step: step + 1, differs, pending: value };
      }
      return { step: step + 1, differs: differs || pending !== value, pending: null };
    },
    accept: ({ step, differs }) => step === 12 && differs,
  }, 9);
}

const greaterSpec = compareSpec('greater');
const flagSpec = compareFlagSpec();
const notEqSpec = notEqualSpec();

const R1F = lines.find((l) => l.id === 'R1F').cells;
const C4D = lines.find((l) => l.id === 'C4D').cells;

const rank24Constraints = lines
  .filter((l) => l.id !== 'R1F')
  .map((other) => new NFA(
    greaterSpec, 'rank24', ...interleave(R1F, other.cells)));

const rank4FlagsVar = new Var('F', 'rank4 flags', 23);
const flagCells = rank4FlagsVar.cells();
const othersForC4D = lines.filter((l) => l.id !== 'C4D');
const rank4Constraints = othersForC4D.map((other, i) => new NFA(
  flagSpec, 'rank4flag', ...interleave(C4D, other.cells), flagCells[i]));

// Third circle: the digit in R3C6 is the rank of row 5 read backwards. With
// rank X, exactly 24 - X of the other 23 numbers are greater, so the same
// greater-flags (2 = greater, 1 = not) sum to (24-X)*2 + (X-1)*1 = 47 - X,
// i.e. flags plus the R3C6 digit itself total 47.
const R5B = lines.find((l) => l.id === 'R5B').cells;
const r5bFlagsVar = new Var('G', 'r5b rank flags', 23);
const r5bFlagCells = r5bFlagsVar.cells();
const othersForR5B = lines.filter((l) => l.id !== 'R5B');
const r5bRankConstraints = othersForR5B.map((other, i) => new NFA(
  flagSpec, 'r5bRankFlag', ...interleave(R5B, other.cells), r5bFlagCells[i]));

// The remaining 22 lines (everything except R1F and C4D) must be pairwise
// distinct too, so that no two of the 24 numbers tie anywhere in the ranking.
// C4D also needs explicit not-equal against them: its rank flags alone treat
// a tie the same as "not greater", so a tie would otherwise slip through.
const remainingLines = lines.filter((l) => l.id !== 'R1F' && l.id !== 'C4D');
const noTieConstraints = [];
for (let i = 0; i < remainingLines.length; i++) {
  for (let j = i + 1; j < remainingLines.length; j++) {
    noTieConstraints.push(new NFA(
      notEqSpec, 'noTie',
      ...interleave(remainingLines[i].cells, remainingLines[j].cells)));
  }
}
for (const other of remainingLines) {
  noTieConstraints.push(new NFA(
    notEqSpec, 'noTie', ...interleave(C4D, other.cells)));
}

const dotCells = (spec) => spec.map(([r1, c1, r2, c2]) =>
  [makeCellId(r1, c1), makeCellId(r2, c2)]);

const blackDotPairs = dotCells([
  [1, 1, 1, 2],
  [4, 3, 4, 4],
  [3, 3, 4, 3],
]);
const redDotPairs = dotCells([
  [1, 1, 2, 1],
  [2, 1, 2, 2],
  [1, 2, 2, 2],
  [2, 2, 3, 2],
  [2, 2, 2, 3],
  [2, 3, 3, 3],
  [3, 4, 4, 4],
]);
const yellowDotPairs = dotCells([
  [3, 2, 3, 3],
  [3, 3, 3, 4],
]);

const redKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const yellowKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('6x6', 9),
  new RegionSize(9),

  ...blackDotPairs.map((cells) => new BlackDot(...cells)),
  ...redDotPairs.map((cells) => new Pair(redKey, 'red', ...cells)),
  ...yellowDotPairs.map((cells) => new Pair(yellowKey, 'yellow', ...cells)),

  rank4FlagsVar,
  ...flagCells.map((f) => new Given(f, 1, 2)),
  new Sum(43, ...flagCells),

  r5bFlagsVar,
  ...r5bFlagCells.map((f) => new Given(f, 1, 2)),
  new Sum(47, ...r5bFlagCells, makeCellId(3, 6)),

  ...rank24Constraints,
  ...rank4Constraints,
  ...r5bRankConstraints,
  ...noTieConstraints,
];
