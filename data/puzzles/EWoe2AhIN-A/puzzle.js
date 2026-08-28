// Title: Sandwich Sudoku
// Author: Mark Goodliffe
// Video: https://www.youtube.com/watch?v=EWoe2AhIN-A
// Source: https://cracking-the-cryptic.web.app/sudoku/gdppdmtf9r

// Normal sudoku rules apply: each row, column and 3x3 box holds 1-9 once each.
// No digits are given.
//
// Sandwich: the digits between the 1 and the 9 in a row or column sum to the
// clue printed outside that lane. Clues are drawn left of R1..R9 and above
// C1..C9 (source overlays #12-#29).
//
// Letters: twelve letter glyphs are drawn inside grid cells, spelling JAMES
// along R3C1-R3C5 and CHARLES along R7C3-R7C9 (source overlays #0-#11). A
// letter is the digit of the cell it is drawn in; the same letter is the same
// digit and different letters are different digits. The clues above column 1
// and column 7 are printed as the letter M rather than as an integer, so both
// of those sandwich totals equal the digit M stands for.
//
// The source publishes no rules text, so that letter reading is taken from the
// art: those two lanes print a letter where every other lane prints an
// integer, which means something only if a letter is a digit, and the glyphs
// drawn in the grid come to exactly nine distinct letters -- one per grid
// digit. An alternative reading in which distinct letters may share a digit is
// not encoded; it drops only the eight cross-row inequalities between {J, M}
// and {C, H, R, L}, since each name already lies within a single row.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Sandwich clues as printed, outer lane order R1..R9 and C1..C9; null marks
// the two column clues printed as the letter M (source overlays #12, #13).
const rowClues = [29, 19, 4, 31, 15, 2, 35, 6, 19];
const colClues = [null, 12, 27, 25, 12, 5, null, 6, 21];

const rowSandwiches = rowClues.map(
  (total, i) => Sandwich.fromCells(total, graph.row(i + 1), geometry));

const colSandwiches = colClues
  .map((total, i) => total === null
    ? null
    : Sandwich.fromCells(total, graph.column(i + 1), geometry))
  .filter(c => c !== null);

// Sandwich needs a literal total, so the two "M" lanes are disjoined over the
// nine digits M could be, each branch pinning M's own cell (R3C3) to that digit
// alongside the two totals it then fixes. Not a relaxation: every branch states
// the full rule for one value of M, and M is a grid digit so 1-9 is exhaustive.
const mSandwiches = new Or(
  [1, 2, 3, 4, 5, 6, 7, 8, 9].map(m => new And([
    new Given('R3C3', m),
    Sandwich.fromCells(m, graph.column(1), geometry),
    Sandwich.fromCells(m, graph.column(7), geometry),
  ])));

// One representative cell per distinct letter, taken from the two names as
// drawn (JAMES on row 3, CHARLES on row 7).
const letterCell = {
  J: 'R3C1', A: 'R3C2', M: 'R3C3', E: 'R3C4', S: 'R3C5',
  C: 'R7C3', H: 'R7C4', R: 'R7C6', L: 'R7C7',
};

// The three letters that appear twice: A, E and S each occur once in each name.
const sameLetter = [
  new SameValues(2, letterCell.A, 'R7C5'),
  new SameValues(2, letterCell.E, 'R7C8'),
  new SameValues(2, letterCell.S, 'R7C9'),
];

return [
  new Shape('9x9'),
  ...rowSandwiches,
  ...colSandwiches,
  mSandwiches,
  ...sameLetter,
  new AllDifferent(...Object.values(letterCell)),
];
