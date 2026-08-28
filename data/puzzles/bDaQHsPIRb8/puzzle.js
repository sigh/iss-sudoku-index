// Title: The Enigma Variations
// Author: Unknown
// Video: https://www.youtube.com/watch?v=bDaQHsPIRb8
// Source: https://cracking-the-cryptic.web.app/sudoku/2gNGNPdtHP

// Standard sudoku on the 9x9 grid (rows/cols/boxes all-different, digits 1-9).
//
// Battlefield: for each row and column, let X be the digit in its own first
// cell and Y the digit in its own last cell. The first X cells and the last Y
// cells of that row/column (both counted from its own ends) either overlap
// (when X+Y>9, over positions (10-Y)..X) or leave a gap (when X+Y<9, over
// positions (X+1)..(9-Y)); when X+Y==9 the spans meet exactly, with neither
// an overlap nor a gap. An outside clue gives the sum of that overlap or gap
// for rows 2, 3, 7, 8 and columns 2, 6, 7, 8, 9.
//
// Coloring: a cell that is an overlap cell for BOTH its row and its column is
// red; a cell that is a gap cell for BOTH its row and its column is green.
// "A cell is colored red/green if ..." is read as an exhaustive fact about
// the solved grid: the drawn red/green cells are the only ones with the
// property, so every other cell is encoded to lack it.
//
// Cages: digits in a cage sum to the number printed in its top-left corner.
// Cage cells are also all-different (the rules state only the sum, but the
// drawn cages use ordinary dashed-cage styling with no "repeats allowed"
// note, so the standard cage convention applies).
//
// Cipher: every printed clue number (cage totals, Battlefield sums) is
// written in code -- a string of one or two letters from A-J. Each letter
// stands for one digit 0-9, a bijection (10 letters, 10 digits, all
// different). A single letter is that digit; a two-letter code AB is the
// two-digit number 10*value(A) + value(B) (A the tens digit, B the units --
// not a product). The letters are modeled as a Var overlay VA..VJ, digits
// 0-9, all-different -- 10 distinct values over a 10-value domain forces
// every value to be used exactly once, so no extra "onto" constraint is
// needed.
//
// The printed A-J column beside the grid (R1C10=A, R2C10=B, ... R10C10=J) is
// a plain alphabet legend -- every letter used by a real clue already
// appears there in order, and no rule ties a row to "its" letter, so it adds
// no constraint. The solid black tenth row and the C11 margin are canvas
// padding, not board cells.

const N = 9;
const graph = cellGraph('9x9');
const rowCells = r => Array.from({ length: N }, (_, i) => makeCellId(r, i + 1));
const colCells = c => Array.from({ length: N }, (_, i) => makeCellId(i + 1, c));

// The Var overlay needs digit 0, so the alphabet is widened to 0-9; restrict
// every main-grid cell back to the true 1-9 digits with one Replicate.
const gridDigitRestriction = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const cipherCell = letter => 'V' + letter;
const cipherVars = LETTERS.map(l => new Var(l, `cipher digit for letter ${l}`));
const cipherAllDifferent = new AllDifferent(...LETTERS.map(cipherCell));

// sum(cells) equals decode(code), where decode('X') = value(X) and
// decode('XY') = 10*value(X) + value(Y). A single-letter code is a plain
// two-segment equal sum (region vs. the one cipher cell); a two-letter code
// needs the tens/units weighting, so it stays a coefficient Sum.
function sumEqualsCipher(cells, code) {
  if (code.length === 1) {
    return new EqualSum(cells, [cipherCell(code[0])]);
  }
  if (code.length !== 2) {
    throw new Error(`Unexpected cipher code "${code}"`);
  }
  const terms = cells.map(cell => [cell, 1]);
  terms.push([cipherCell(code[0]), -10]);
  terms.push([cipherCell(code[1]), -1]);
  return new Sum(0, ...terms);
}

// Provenance: the drawn cages (cell lists and their coded totals).
const cageDefs = [
  { cells: ['R1C1', 'R2C1', 'R2C2', 'R1C2'], code: 'HG' },
  { cells: ['R1C6', 'R2C6'], code: 'D' },
  { cells: ['R1C8', 'R2C8', 'R1C9', 'R2C9'], code: 'CF' },
  { cells: ['R3C4', 'R3C5'], code: 'A' },
  { cells: ['R4C1', 'R4C2'], code: 'A' },
  { cells: ['R5C3', 'R6C3'], code: 'HB' },
  { cells: ['R4C7', 'R5C7'], code: 'HC' },
  { cells: ['R6C8', 'R6C9'], code: 'G' },
  { cells: ['R7C5', 'R7C6'], code: 'HF' },
  { cells: ['R8C4', 'R9C4'], code: 'E' },
  { cells: ['R8C1', 'R9C1', 'R9C2', 'R8C2'], code: 'CE' },
  { cells: ['R8C8', 'R9C8', 'R9C9', 'R8C9'], code: 'HA' },
];
const cageConstraints = cageDefs.flatMap(({ cells, code }) => [
  new AllDifferent(...cells),
  sumEqualsCipher(cells, code),
]);

// Overlap ('from'..'to') or gap position range, 1-indexed within the line,
// for a line whose own first/last cell digits are x/y; null when x+y==N
// (spans meet exactly: no overlap, no gap).
const battlefieldRange = (x, y) => {
  if (x + y > N) return { from: N + 1 - y, to: x };
  if (x + y < N) return { from: x + 1, to: N - y };
  return null;
};

// One outside cipher-coded Battlefield clue: an Or over every (x, y) digit
// pair for the line's own first/last cells that yields a non-empty overlap
// or gap, each branch pinning those two cells and tying the region's sum to
// the decoded cipher value.
const battlefieldClue = (cells, code) => {
  const branches = [];
  for (let x = 1; x <= N; x++) {
    for (let y = 1; y <= N; y++) {
      const range = battlefieldRange(x, y);
      if (range === null) continue;
      const region = cells.slice(range.from - 1, range.to);
      branches.push(new And([
        new Given(cells[0], x),
        new Given(cells[N - 1], y),
        sumEqualsCipher(region, code),
      ]));
    }
  }
  return new Or(branches);
};

// Provenance: printed outside-clue letters (row/column number, cipher code).
const rowClues = [[2, 'JE'], [3, 'CG'], [7, 'HJ'], [8, 'A']];
const colClues = [[2, 'I'], [6, 'JG'], [7, 'H'], [8, 'JB'], [9, 'E']];

const battlefieldClues = [
  ...rowClues.map(([r, code]) => battlefieldClue(rowCells(r), code)),
  ...colClues.map(([c, code]) => battlefieldClue(colCells(c), code)),
];

// Coloring is an exhaustive fact, encoded both ways below.
const rangeArr = (from, to) => {
  const out = [];
  for (let v = from; v <= to; v++) out.push(v);
  return out;
};
const isFullRange = values => values.length === N;

// Force cell (r, c) to be an overlap cell for both its row and its column:
// rowFirst>=c, rowLast>=10-c, colFirst>=r, colLast>=10-r.
const forceOverlapBoth = (r, c) => {
  const rowFirst = makeCellId(r, 1), rowLast = makeCellId(r, N);
  const colFirst = makeCellId(1, c), colLast = makeCellId(N, c);
  return [
    [rowFirst, rangeArr(c, N)],
    [rowLast, rangeArr(N + 1 - c, N)],
    [colFirst, rangeArr(r, N)],
    [colLast, rangeArr(N + 1 - r, N)],
  ].filter(([, values]) => !isFullRange(values))
    .map(([cell, values]) => new Given(cell, ...values));
};

// Force cell (r, c) to be a gap cell for both its row and its column:
// rowFirst<=c-1, rowLast<=9-c, colFirst<=r-1, colLast<=9-r.
const forceGapBoth = (r, c) => {
  const rowFirst = makeCellId(r, 1), rowLast = makeCellId(r, N);
  const colFirst = makeCellId(1, c), colLast = makeCellId(N, c);
  return [
    [rowFirst, rangeArr(1, c - 1)],
    [rowLast, rangeArr(1, N - c)],
    [colFirst, rangeArr(1, r - 1)],
    [colLast, rangeArr(1, N - r)],
  ].filter(([, values]) => !isFullRange(values))
    .map(([cell, values]) => {
      if (values.length === 0) {
        throw new Error(`forceGapBoth(${r},${c}): impossible border cell`);
      }
      return new Given(cell, ...values);
    });
};

// Or-of-Givens for "NOT overlap-in-both" / "NOT gap-in-both" at (r, c). Each
// branch negates one of the four conditions above; a branch whose negated
// range would be the full 1..9 domain means the property is already
// geometrically impossible there, so the whole Or is omitted (vacuously
// true).
const notOverlapBoth = (r, c) => {
  const rowFirst = makeCellId(r, 1), rowLast = makeCellId(r, N);
  const colFirst = makeCellId(1, c), colLast = makeCellId(N, c);
  const branches = [
    [rowFirst, rangeArr(1, c - 1)],
    [rowLast, rangeArr(1, N - c)],
    [colFirst, rangeArr(1, r - 1)],
    [colLast, rangeArr(1, N - r)],
  ].filter(([, values]) => values.length > 0);
  return new Or(branches.map(([cell, values]) => new Given(cell, ...values)));
};

const notGapBoth = (r, c) => {
  const rowFirst = makeCellId(r, 1), rowLast = makeCellId(r, N);
  const colFirst = makeCellId(1, c), colLast = makeCellId(N, c);
  const branches = [
    [rowFirst, rangeArr(c, N)],
    [rowLast, rangeArr(N + 1 - c, N)],
    [colFirst, rangeArr(r, N)],
    [colLast, rangeArr(N + 1 - r, N)],
  ];
  if (branches.some(([, values]) => isFullRange(values))) return null;
  return new Or(branches.map(([cell, values]) => new Given(cell, ...values)));
};

// Provenance: the drawn cell shading (red = overlap-in-both, green =
// gap-in-both).
const redCells = [[2, 7], [2, 8], [5, 4], [5, 5]];
const greenCells = [[3, 6], [4, 3]];

const shadingConstraints = [];
for (let r = 1; r <= N; r++) {
  for (let c = 1; c <= N; c++) {
    const isRed = redCells.some(([rr, rc]) => rr === r && rc === c);
    const isGreen = greenCells.some(([gr, gc]) => gr === r && gc === c);
    if (isRed) {
      shadingConstraints.push(...forceOverlapBoth(r, c));
    } else if (isGreen) {
      shadingConstraints.push(...forceGapBoth(r, c));
    } else {
      shadingConstraints.push(notOverlapBoth(r, c));
      const notGap = notGapBoth(r, c);
      if (notGap !== null) shadingConstraints.push(notGap);
    }
  }
}

return [
  new Shape('9x9', '0-9'),
  gridDigitRestriction,
  ...cipherVars,
  cipherAllDifferent,
  ...cageConstraints,
  ...battlefieldClues,
  ...shadingConstraints,
];
