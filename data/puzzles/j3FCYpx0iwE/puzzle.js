// Title: A Birthday Present
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=j3FCYpx0iwE
// Source: https://cracking-the-cryptic.web.app/sudoku/MbpB7JGfnq

// Standard sudoku rows and columns; no 3x3 boxes (rules: "no 3x3 boxes").
// The letters A,B,D,H,I,M,P,R,Y each stand for a different digit 1-9; the
// grid is played and stored in digits, with 22 cells given as one of these
// letters instead of a bare digit (small corner marks in the source,
// scattered through the grid) -- each such cell's digit is whichever digit
// that letter is assigned.
// Each outside skyscraper clue is also printed as one of these letters, so
// its numeric target is unknown ahead of solving. Encoded as an Or over the
// nine possible digits per clue: each branch pins that letter's Var and
// applies the Skyscraper reading for that branch's value, so the same
// letter appearing at two clue sites (P, I) shares one Var and is forced to
// the same digit -- and a letter's given cells and clue sites all resolve
// together through that one shared Var.
// Drawn clue letters: left of row 1 and top of column 1 both show P; top
// of column 2 shows R; top of column 3 and left of row 2 both show I; top
// of columns 4-6 show Y, A, M; bottom of column 1 shows B.
// After substitution, 2 and 6 are "stars" (video clarification: they may
// not touch -- including orthogonally -- their own or each other's other
// instances). The 9 red diagonal squares (R1C1..R9C9) forbid a star; the
// video's "message" read off that diagonal is cosmetic. Rows 3 and 7 carry
// an outside count (2 and 6) of the cells strictly between that row's
// single 2 and single 6 (each occurs exactly once per row by Sudoku).
// Grey circles (R1C4, R9C1, R1C6, R9C6) hold odd digits; grey squares
// (R1C9, R9C4) hold even digits.
// A printed legend pairs each grid row with a letter in alphabetical
// order; that is a reference key for the video, not a grid constraint.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// --- Letter -> digit variables ------------------------------------------
const LETTERS = ['A', 'B', 'D', 'H', 'I', 'M', 'P', 'R', 'Y'];
const letterVars = Object.fromEntries(
  LETTERS.map(L => [L, new Var(L, `digit assigned to letter ${L}`, 1)]));
const letterCell = L => letterVars[L].cell(1);

const letterAllDifferent = new AllDifferent(...LETTERS.map(letterCell));

// --- Given letter cells --------------------------------------------------
// Each cell below is printed with a letter instead of a digit; its solved
// digit is whatever that letter is assigned. One SameValues per letter,
// splitting into as many one-cell sets as there are cells (the letter's Var
// plus every grid cell printed with that letter), ties them all to the same
// value. Provenance: small corner marks scattered through the grid.
const givenLetterCells = {
  A: ['R2C2', 'R3C6', 'R4C7', 'R5C4', 'R6C3', 'R8C8'],
  R: ['R2C5', 'R5C6'],
  P: ['R2C8', 'R7C5', 'R8C2'],
  M: ['R3C4', 'R6C5'],
  D: ['R3C5'],
  Y: ['R4C3', 'R7C4'],
  H: ['R4C5', 'R5C2', 'R7C6'],
  B: ['R5C8', 'R8C5'],
  I: ['R6C7'],
};
const letterGivenConstraints = Object.entries(givenLetterCells).map(([letter, cells]) => {
  const group = [letterCell(letter), ...cells];
  return new SameValues(group.length, ...group);
});

// --- Skyscraper clues, letter-valued ------------------------------------
// [letter, ray of cells nearest-to-farthest from the clue's viewing side]
const skyscraperClues = [
  ['P', graph.ray('R1C1', 0, 1)],   // left of row 1
  ['P', graph.ray('R1C1', 1, 0)],   // top of column 1
  ['R', graph.ray('R1C2', 1, 0)],   // top of column 2
  ['I', graph.ray('R1C3', 1, 0)],   // top of column 3
  ['I', graph.ray('R2C1', 0, 1)],   // left of row 2
  ['Y', graph.ray('R1C4', 1, 0)],   // top of column 4
  ['A', graph.ray('R1C5', 1, 0)],   // top of column 5
  ['M', graph.ray('R1C6', 1, 0)],   // top of column 6
  ['B', graph.ray('R9C1', -1, 0)],  // bottom of column 1
];

const skyscraperConstraints = skyscraperClues.map(([letter, cells]) =>
  new Or(Array.from({ length: 9 }, (_, i) => {
    const v = i + 1;
    return new And([
      new Given(letterCell(letter), v),
      Skyscraper.fromCells(v, cells, geometry),
    ]);
  })));

// --- Stars: 2 and 6 cannot touch (own or each other), orthogonally or
// diagonally -- video clarification widening the on-screen rule.
// One Pair template per king-move direction (right, down, and both
// diagonals), replicated over every in-bounds anchor -- covers all 272
// unordered king-adjacent cell pairs without hand-listing them.
// graph.makeReplicate() anchors every template at R1C1, so a template's
// cells need not include R1C1 itself: their offsets from R1C1 (e.g. (0,1)
// and (1,0) below) are what gets carried to each target, and the relative
// offset between the two cells -- here (1,-1), a down-left diagonal step --
// is what shifts a template into every matching pair on the grid.
const isStarKey = Pair.fnToKey((a, b) => !((a === 2 || a === 6) && (b === 2 || b === 6)), 9);
const starTouchConstraints = [
  ['R1C1', 'R1C2', (row) => row <= 9, (col) => col <= 8],  // right
  ['R1C1', 'R2C1', (row) => row <= 8, (col) => col <= 9],  // down
  ['R1C1', 'R2C2', (row) => row <= 8, (col) => col <= 8],  // down-right diagonal
  ['R1C2', 'R2C1', (row) => row <= 8, (col) => col <= 8],  // down-left diagonal
].map(([a, b, rowOk, colOk]) => {
  const targets = graph.cells().filter(cell => {
    const { row, col } = parseCellId(cell);
    return rowOk(row) && colOk(col);
  });
  return graph.makeReplicate(new Pair(isStarKey, 'stars do not touch', a, b), targets);
});

// Stars cannot sit on a red diagonal square.
const redDiagonal = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];
const NON_STAR_DIGITS = [1, 3, 4, 5, 7, 8, 9];
const redDiagonalConstraints = redDiagonal.map(cell => new Given(cell, ...NON_STAR_DIGITS));

// "Cells between the stars" outside count: with rows/columns all-different
// over 1-9, each row holds exactly one 2 and one 6, so "the stars" in a row
// are unambiguous. NFA scans a row, counting non-star cells strictly
// between the first star it meets and the second.
function starsGapSpec(n) {
  return NFA.encodeSpec({
    startState: { seen: 0, k: 0 },
    transition: ({ seen, k }, v) => {
      const isStar = v === 2 || v === 6;
      if (seen === 0) return isStar ? { seen: 1, k: 0 } : { seen: 0, k: 0 };
      if (seen === 1) {
        return isStar ? { seen: 2, k } : { seen: 1, k: Math.min(k + 1, n + 1) };
      }
      return { seen: 2, k }; // both stars found; absorb the remaining cells
    },
    accept: ({ seen, k }) => seen === 2 && k === n,
  }, 9);
}
const starsGapConstraints = [
  new NFA(starsGapSpec(2), 'cells between the stars', ...graph.row(3)),  // row 3 clue
  new NFA(starsGapSpec(6), 'cells between the stars', ...graph.row(7)),  // row 7 clue
];

// --- Grey circle (odd) / grey square (even) givens ----------------------
const ODD_DIGITS = [1, 3, 5, 7, 9];
const EVEN_DIGITS = [2, 4, 6, 8];
const greyCircles = ['R1C4', 'R9C1', 'R1C6', 'R9C6'];   // grey circles
const greySquares = ['R1C9', 'R9C4'];                    // grey squares
const parityConstraints = [
  ...greyCircles.map(cell => new Given(cell, ...ODD_DIGITS)),
  ...greySquares.map(cell => new Given(cell, ...EVEN_DIGITS)),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...Object.values(letterVars),
  letterAllDifferent,
  ...letterGivenConstraints,
  ...skyscraperConstraints,
  ...starTouchConstraints,
  ...redDiagonalConstraints,
  ...starsGapConstraints,
  ...parityConstraints,
];
