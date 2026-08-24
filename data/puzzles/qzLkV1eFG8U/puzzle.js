// Title: Perfect Squares
// Author: Emre Kolotoglu
// Video: https://www.youtube.com/watch?v=qzLkV1eFG8U
// Source: https://app.crackingthecryptic.com/sudoku/4hGmbgHm4d

// Normal sudoku rules apply; the payload's own 9 regions are the standard 3x3
// boxes, so no Jigsaw/NoBoxes override is needed.
//
// Six horizontal 2-cell pills each hold a distinct two-digit number (left
// cell = tens digit, right cell = ones digit); six horizontal 3-cell pills
// each hold that number's square (left = hundreds, middle = tens, right =
// ones), all read left to right. The rules text pins the correspondence: "the
// leftmost digits of a two-digit number and its square are on the same
// column." Each of the six columns spanned by a 2-digit pill's left cell
// (1, 2, 3, 4, 5, 7) is also spanned by exactly one 3-digit pill's left cell,
// so the pairing below is forced by that sentence, not chosen freely.
//
// Two-digit pill cells: the six drawn rounded-rect marks spanning 2 cells.
// Three-digit pill cells: the six drawn rounded-rect marks spanning 3 cells.
// Pairing is by shared leftmost column, per the rules sentence above.
const PILL_PAIRS = [
  { twoDigit: ['R1C1', 'R1C2'], threeDigit: ['R9C1', 'R9C2', 'R9C3'] }, // col 1
  { twoDigit: ['R2C2', 'R2C3'], threeDigit: ['R8C2', 'R8C3', 'R8C4'] }, // col 2
  { twoDigit: ['R3C3', 'R3C4'], threeDigit: ['R7C3', 'R7C4', 'R7C5'] }, // col 3
  { twoDigit: ['R4C4', 'R4C5'], threeDigit: ['R6C4', 'R6C5', 'R6C6'] }, // col 4
  { twoDigit: ['R2C5', 'R2C6'], threeDigit: ['R9C5', 'R9C6', 'R9C7'] }, // col 5
  { twoDigit: ['R4C7', 'R4C8'], threeDigit: ['R3C7', 'R3C8', 'R3C9'] }, // col 7
];

// Two further drawn marks sit fully off the 9x9 board, with no border/fill
// and no text. They touch no cell and the rules name no such mark, so they
// are non-functional artwork and are omitted.

// Sudoku digits are 1-9, so a two-digit number and its square can only use
// pill cells if neither number contains a 0 digit. That leaves a small,
// exhaustively enumerable candidate list -- computed here from the rule's own
// arithmetic rather than hand-typed -- of [tens, ones, hundreds, sqTens,
// sqOnes] digit tuples. (19 candidates; well under any per-cell domain, so no
// materialised Var is needed for this relation.)
const SQUARE_CANDIDATES = [];
for (let n = 10; n <= 31; n++) {
  const nDigits = String(n);
  if (nDigits.length !== 2 || nDigits.includes('0')) continue;
  const sq = n * n;
  const sqDigits = String(sq);
  if (sqDigits.length !== 3 || sqDigits.includes('0')) continue;
  SQUARE_CANDIDATES.push([...nDigits, ...sqDigits].map(Number));
}

// Each pill pair holds one of the enumerated (number, square) digit tuples:
// an Or over the candidates, each an And pinning all five pill cells.
function pillSquareConstraint({ twoDigit, threeDigit }) {
  const [tensCell, onesCell] = twoDigit;
  const [hundredsCell, sqTensCell, sqOnesCell] = threeDigit;
  return new Or(SQUARE_CANDIDATES.map(([t, o, h, st, so]) => new And([
    new Given(tensCell, t),
    new Given(onesCell, o),
    new Given(hundredsCell, h),
    new Given(sqTensCell, st),
    new Given(sqOnesCell, so),
  ])));
}

// "The two-digit pills contain distinct two-digit numbers": since pill digits
// are 1-9, a two-digit number is determined by (tens, ones), so two pills
// differ iff their tens cells differ or their ones cells differ.
const NOT_EQUAL = Pair.fnToKey((a, b) => a !== b, 9);
function distinctTwoDigitPills([tA, oA], [tB, oB]) {
  return new Or([
    new Pair(NOT_EQUAL, 'diffTens', tA, tB),
    new Pair(NOT_EQUAL, 'diffOnes', oA, oB),
  ]);
}
const distinctnessConstraints = [];
for (let i = 0; i < PILL_PAIRS.length; i++) {
  for (let j = i + 1; j < PILL_PAIRS.length; j++) {
    distinctnessConstraints.push(distinctTwoDigitPills(
      PILL_PAIRS[i].twoDigit, PILL_PAIRS[j].twoDigit));
  }
}

return [
  new Shape('9x9'),
  ...PILL_PAIRS.map(pillSquareConstraint),
  ...distinctnessConstraints,
];
