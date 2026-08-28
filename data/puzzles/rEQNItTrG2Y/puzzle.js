// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=rEQNItTrG2Y
// Source: https://cracking-the-cryptic.web.app/sudoku/R6mMt6mHfN

// Standard 9x9 sudoku (rows, columns, and the 9 boxes all-different).
// Three givens: R3C2=7, R4C3=2, R4C4=4.
//
// Marked diagonals: four short arrows drawn from an edge cell into the grid
// multiply to the product printed beside them (rules text: "marked diagonals
// multiply to the product shown"). Each diagonal's cells lie inside a single
// box, so the box's all-different rule already forces them distinct; only
// the product is stated here.
//
// Marked regions: 7 orange-shaded regions (four 2x2 groups straddling a
// 4-box corner, three 3-cell L-trominoes in three of the four grid corners)
// each multiply to 24 (rules text: "Marked regions, which may include
// repeats, have a product of 24" -- repeats allowed, so no distinctness is
// asserted beyond what rows/columns/boxes already force on cells that share
// one).
//
// No-24/48/96 rule: reading any two horizontally-adjacent cells in a row,
// left to right, as a two-digit number, that number is never 24, 48, or 96
// (rules text, restated by the on-grid label "No 24, 48 or 96 in rows"; no
// drawn feature suggests a different reading direction). The rules text
// opens with "Apart from the given digits" -- R4C3=2, R4C4=4 are adjacent
// givens that already read "24", so that one column-pair (row 4, columns
// 3-4) is exempt; every other adjacent pair in every row is still checked.

// Builds an NFA accepting exactly the cell tuples whose digit product
// equals `target`. State is the running product so far, capped by rejecting
// (returning undefined) as soon as it exceeds the target -- product is
// commutative, so cell order does not matter. Same pattern as
// data/scripts/factorial_cages.js.
function productNFA(target) {
  return NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      const next = state * value;
      if (next > target) return;
      return next;
    },
    accept: state => state === target,
  }, 9);
}

function product(target, ...cells) {
  // A 2-cell product is a plain binary relation -- use Pair, not a 1-cell NFA.
  if (cells.length === 2) {
    return new Pair(
      Pair.fnToKey((a, b) => a * b === target, 9), `product ${target}`,
      ...cells);
  }
  return new NFA(productNFA(target), `product ${target}`, ...cells);
}

// One NFA per row rejecting any left-to-right adjacent pair that reads as
// 24, 48, or 96, except at a column-pair whose both cells are givens (the
// rule's stated "apart from the given digits" exemption). State carries the
// previous digit plus the 1-based column just read, since which column-pair
// is exempt is positional; a forbidden pair rejects the branch in
// transition, per nfa-help's "reject as the pair is read" rule -- accept
// never needs to inspect anything itself.
const GIVENS = [
  ['R3C2', 7],
  ['R4C3', 2],
  ['R4C4', 4],
];
const givenCells = new Set(GIVENS.map(([cell]) => cell));
const FORBIDDEN_PAIRS = new Set([24, 48, 96]);

function noForbiddenRowPairSpec(exemptStartCols) {
  return NFA.encodeSpec({
    startState: { prev: null, col: 0 },
    transition: ({ prev, col }, value) => {
      // Clamp: no row is longer than 9 cells, so col never needs to climb
      // past that -- an unclamped counter blows the NFA compile-state cap.
      const nextCol = Math.min(col + 1, 9);
      const exempt = exemptStartCols.has(col);
      if (prev !== null && !exempt && FORBIDDEN_PAIRS.has(prev * 10 + value)) {
        return;
      }
      return { prev: value, col: nextCol };
    },
    accept: () => true,
  }, 9);
}

function noForbiddenRowPair(row) {
  const cells = [];
  for (let col = 1; col <= 9; col++) cells.push(makeCellId(row, col));
  const exemptStartCols = new Set();
  for (let col = 1; col <= 8; col++) {
    if (givenCells.has(makeCellId(row, col)) &&
      givenCells.has(makeCellId(row, col + 1))) {
      exemptStartCols.add(col);
    }
  }
  return new NFA(
    noForbiddenRowPairSpec(exemptStartCols), 'no-24-48-96', ...cells);
}

const markedRegions = [
  ['R3C3', 'R3C4', 'R4C3', 'R4C4'], // A: boxes 1/2/4/5 corner
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'], // B: boxes 2/3/5/6 corner
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'], // C: boxes 4/5/7/8 corner
  ['R6C6', 'R6C7', 'R7C6', 'R7C7'], // D: boxes 5/6/8/9 corner
  ['R1C1', 'R1C2', 'R2C1'],         // E: box 1, top-left corner
  ['R8C1', 'R9C1', 'R9C2'],         // F: box 7, bottom-left corner
  ['R8C9', 'R9C8', 'R9C9'],         // G: box 9, bottom-right corner
];

const markedDiagonals = [
  [40, ['R1C7', 'R2C8', 'R3C9']],
  [12, ['R1C8', 'R2C9']],
  [504, ['R7C1', 'R8C2', 'R9C3']],
  [60, ['R7C9', 'R8C8', 'R9C7']],
];

return [
  new Shape('9x9'),

  ...GIVENS.map(([cell, value]) => new Given(cell, value)),

  ...markedRegions.map(cells => product(24, ...cells)),
  ...markedDiagonals.map(([target, cells]) => product(target, ...cells)),

  ...Array.from({ length: 9 }, (_, i) => noForbiddenRowPair(i + 1)),
];
