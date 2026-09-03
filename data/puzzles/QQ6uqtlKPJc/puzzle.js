// Title: Jam Packed Thick Crust Club Sandwich
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=QQ6uqtlKPJc
// Source: https://sudokupad.app/94v9ipg7hq

// Rules encoded here:
//  - Standard sudoku on a 9x9 grid with the standard boxes. No givens.
//  - Each outside clue is |(sum of the digits strictly between the 7 and the 8
//    of that row/column) - (sum of the digits strictly between the 8 and the
//    9)|. Eight clues read 0; the clue above column 5 reads '?', which the
//    rules define as a digit 0~9, so that column's difference is at most 9.
//  - "All sandwiches have at least one filling, i.e. there are no runs of three
//    adjacent cells in any row or column containing only the digits 7, 8, and
//    9." The rules define the rule with their own "i.e.", and that definition
//    is what is encoded: no three consecutive cells of a row or column all hold
//    digits from {7, 8, 9}.
// Nothing is omitted.

const shape = new Shape('9x9');

// Outside clue positions, read from the nine boxed labels in the margin: four
// to the left of rows 1, 3, 6, 8 and five above columns 1, 2, 3, 5, 6. All read
// "0" except the one above column 5, which reads "?".
const ZERO_CLUE_ROWS = [1, 3, 6, 8];
const ZERO_CLUE_COLS = [1, 2, 3, 6];
const UNKNOWN_CLUE_COLS = [5];

const indices = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rowCells = (r) => indices.map((c) => makeCellId(r, c));
const colCells = (c) => indices.map((r) => makeCellId(r, c));

// One machine per clued line, scanning the line end to end.
//
// `seen` is a bitmask of the crusts already passed (7 -> 1, 8 -> 2, 9 -> 4).
// That is enough to place the current cell: it lies strictly between the 7 and
// the 8 exactly when one of those two has been seen and the other has not, and
// likewise for the 8 and the 9. `d` is the running difference (7-8 sandwich
// sum) - (8-9 sandwich sum); a cell inside both sandwiches is added to both
// sums and so cancels in `d`. A crust bounds its own sandwiches and is never a
// filling of them, but the 9 counts as a filling of the 7-8 sandwich when it
// falls inside it, and the 7 as a filling of the 8-9 sandwich.
//
// The clue is an absolute difference, so the scan direction does not matter:
// both sandwiches are the same cell sets read either way.
//
// `accept` reads the final difference; `seen === 7` records that all three
// crusts were met, which a sudoku line always does.
const clubSandwichSpec = (acceptDifference) => NFA.encodeSpec({
  startState: { seen: 0, d: 0 },
  transition: ({ seen, d }, v) => {
    const between78 = ((seen & 1) !== 0) !== ((seen & 2) !== 0);
    const between89 = ((seen & 2) !== 0) !== ((seen & 4) !== 0);
    if (v === 7) return { seen: seen | 1, d: d - (between89 ? 7 : 0) };
    if (v === 8) return { seen: seen | 2, d: d };
    if (v === 9) return { seen: seen | 4, d: d + (between78 ? 9 : 0) };
    return {
      seen,
      d: d + (between78 ? v : 0) - (between89 ? v : 0),
    };
  },
  accept: ({ seen, d }) => seen === 7 && acceptDifference(d),
  // `d` is otherwise an unbounded running total; one symbol per cell bounds it.
  maxDepth: 9,
}, shape);

const zeroClueSpec = clubSandwichSpec((d) => d === 0);
const unknownClueSpec = clubSandwichSpec((d) => Math.abs(d) <= 9);

// `run` counts the cells since the last digit below 7; a third in a row is the
// forbidden run of three, so that branch is dropped and nothing reaches accept.
const noCrustRunSpec = NFA.encodeSpec({
  startState: { run: 0 },
  transition: ({ run }, v) => {
    const next = v >= 7 ? run + 1 : 0;
    return next >= 3 ? undefined : { run: next };
  },
  accept: () => true,
}, shape);

return [
  shape,
  ...ZERO_CLUE_ROWS.map(
    (r) => new NFA(zeroClueSpec, `club sandwich 0 R${r}`, ...rowCells(r))),
  ...ZERO_CLUE_COLS.map(
    (c) => new NFA(zeroClueSpec, `club sandwich 0 C${c}`, ...colCells(c))),
  ...UNKNOWN_CLUE_COLS.map(
    (c) => new NFA(unknownClueSpec, `club sandwich ? C${c}`, ...colCells(c))),
  // The no-three-in-a-row rule is global, so every row and column carries it.
  ...indices.map(
    (r) => new NFA(noCrustRunSpec, `no crust run R${r}`, ...rowCells(r))),
  ...indices.map(
    (c) => new NFA(noCrustRunSpec, `no crust run C${c}`, ...colCells(c))),
];
