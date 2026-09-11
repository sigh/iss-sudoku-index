// Title: Full Rank 20.JV - Mod 3
// Author: Justin Vitanza
// Video: https://www.youtube.com/watch?v=thzwm_JfIc8
// Source: https://sudokupad.app/n197tdko1c

// The main grid is the 5x5 inside the thick border: digits 1-5, no repeats in
// a row or column, no boxes, no givens.
//
// Full Rank: each of the 20 external cells (above/below each column, left/right
// of each row) holds the rank of the 5-digit number read from that side -- a
// row left-to-right from its left cell, right-to-left from its right cell, a
// column downward from its top cell, upward from its bottom cell -- ranked
// jointly from (1) lowest to (20) highest. Ties (N.B. and its worked example):
// a number's rank is 1 + the count of the other 19 numbers strictly below it.
// No rank is printed; every external value is determined by the grid.
//
// Mod 3 lines: any 3 consecutive cells along a line hold residues 0, 1 and 2
// mod 3 once each, an external cell's value being its rank. Three lines are
// drawn, running through four external cells: above column 1, right of row 3,
// left of row 4, right of row 5. Only those four ranks are read by any rule,
// so only they are modelled; the other 16 external cells are ranks that no
// line touches and that constrain nothing.
//
// A rank is 1-20, past ISS's 16-value cell cap, so each modelled rank is held
// as rank = 3*(q - 1) + m with q in 1..7 and m in 1..3: m is the rank mod 3
// with 3 standing for residue 0, which is exactly what the mod-3 line reads,
// so the line uses m in place of the external cell. q needs 7 values, hence
// the widened alphabet; grid cells are pinned back to 1-5.

const shape = new Shape('5x5', 7);
const graph = cellGraph(shape);

const idx = [1, 2, 3, 4, 5];
const rowCells = r => idx.map(c => makeCellId(r, c));
const colCells = c => idx.map(r => makeCellId(r, c));

// The 20 directed numbers, most significant digit first, keyed by the external
// cell that ranks them: L<r>/R<r> = row r read from its left/right cell,
// T<c>/B<c> = column c read from its top/bottom cell.
const NUMBERS = {};
for (const i of idx) {
  NUMBERS[`L${i}`] = rowCells(i);
  NUMBERS[`R${i}`] = rowCells(i).reverse();
  NUMBERS[`T${i}`] = colCells(i);
  NUMBERS[`B${i}`] = colCells(i).reverse();
}
const ALL = Object.keys(NUMBERS);

// The four external cells that drawn lines pass through.
const RANKED = ['T1', 'R3', 'L4', 'R5'];

const quotient = new Var('Q', 'rank quotient: rank = 3*(q-1) + m', RANKED.length);
const modulus = new Var('M', 'rank mod 3, with 3 for residue 0', RANKED.length);
// One flag per (ranked number, other number): 2 when the other is strictly
// lower, else 1.
const flagCount = RANKED.length * (ALL.length - 1);
const flags = new Var('F', 'other number is lower than the ranked one', flagCount);
// A locator for the flag group, only so one Replicate can state every flag's
// 1-2 domain; the 5x16 layout is the smallest that holds 76 cells.
const flagLocator = cellGraph('5x16').makeOverlay('VF');
const qOf = key => quotient.cell(RANKED.indexOf(key) + 1);
const mOf = key => modulus.cell(RANKED.indexOf(key) + 1);

// Numeric comparison of two 5-digit numbers is lexicographic. Reads the two
// numbers interleaved (own digit, other digit, ... from the most significant
// end) then the flag. `i` counts symbols read, `own` holds an own digit awaiting
// its partner, `cmp` is the sign of (own - other) at the first position where
// they differed, 0 while equal so far. Two numbers may share a cell (a row and
// the column crossing it); the same cell then appears in both readings.
const belowSpec = NFA.encodeSpec({
  startState: { i: 0, cmp: 0, own: 0 },
  transition: ({ i, cmp, own }, value) => {
    if (i === 10) {
      // Flag 2 means the other number is lower, i.e. own > other.
      return (value === 2) === (cmp > 0) ? { i: 11, cmp: 0, own: 0 } : undefined;
    }
    if (i % 2 === 0) return { i: i + 1, cmp, own: cmp === 0 ? value : 0 };
    return { i: i + 1, cmp: cmp || Math.sign(own - value), own: 0 };
  },
  accept: state => state.i === 11,
  maxDepth: 11,
}, shape);

let nextFlag = 0;
const rankRules = RANKED.flatMap(key => {
  const own = NUMBERS[key];
  const others = ALL.filter(other => other !== key);
  const ownFlags = others.map(() => flags.cell(++nextFlag));
  const comparisons = others.map((other, n) => new NFA(
    belowSpec, 'lower than ' + key,
    ...own.flatMap((cell, d) => [cell, NUMBERS[other][d]]), ownFlags[n]));
  // rank = 1 + (number of flags equal to 2) = 1 + (sum of flags - 19), with
  // rank = 3q + m - 3, so sum(flags) - 3q - m = 15.
  const rank = new Sum(15, ...ownFlags, [qOf(key), -3], [mOf(key), -1]);
  return [...comparisons, rank];
});

// (q, m) = (7, 3) would be rank 21; ranks run 1-20.
const RANK_RANGE = Pair.fnToKey((q, m) => !(q === 7 && m === 3), shape);

// The three drawn lines, with each external cell's rank represented by its m.
const modLines = [
  [mOf('T1'), 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R4C5', mOf('R3')],
  [mOf('L4'), 'R4C1', 'R4C2'],
  ['R4C4', 'R5C5', mOf('R5'), 'R4C5'],
].map(cells => new Modular(3, ...cells));

return [
  shape,
  new NoBoxes(),
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5)),
  quotient,
  modulus,
  flags,
  ...modulus.cells().map(cell => new Given(cell, 1, 2, 3)),
  flagLocator.makeReplicate(new Given(flags.cell(1), 1, 2), flags.cells()),
  ...RANKED.map(key => new Pair(RANK_RANGE, 'rank 1-20', qOf(key), mOf(key))),
  ...rankRules,
  ...modLines,
];
