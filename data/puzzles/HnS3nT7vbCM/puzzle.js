// Title: Miracle Triomino
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=HnS3nT7vbCM
// Source: https://app.crackingthecryptic.com/sudoku/dHq6Q9nhhd
//
// Normal sudoku rules apply (default row/column/box all-different; the
// payload's regions are the standard nine 3x3 boxes). The marked diagonal
// contains 9 different digits in ascending or descending order. Along the
// thermometer, digits must increase from the bulb end. The sum of the
// digits in every possible straight triomino (orthogonal or diagonal) is
// divisible by 3 -- read as a global rule about the grid's own lines (every
// row, column, and diagonal in both directions), not only the marked
// diagonal, since the rule says "every possible" and does not scope itself
// to the drawn diagonal.

const puzzleShape = new Shape('9x9');
const graph = cellGraph('9x9');

// The marked diagonal: the red line drawn corner to corner, R1C1 to R9C9.
const markedDiagonal = graph.ray('R1C1', 1, 1);

// "9 different digits in ascending or descending order": a strictly
// monotonic run of exactly 9 cells drawn from the 1-9 range is already
// all-different, and can only be the run 1..9 or 9..1 in that order, so
// Or(fwd, reversed) is exactly the rule. Thermo enforces strict pairwise
// increase along the given cell order regardless of grid adjacency, so it
// applies here even though the diagonal is not drawn as a thermometer.
const diagonalOrder = new Or([
  new Thermo(...markedDiagonal),
  new Thermo(...[...markedDiagonal].reverse()),
]);

// The thermometer: grey line R6C5-R5C6-R4C6-R4C5, bulb (filled circle
// underlay) on R6C5.
const thermo = new Thermo('R6C5', 'R5C6', 'R4C6', 'R4C5');

// Every straight line of length >= 3 anywhere in the grid: all 9 rows, all
// 9 columns, and every grid diagonal in both directions -- not just the
// marked diagonal, per the "every possible" scope above. Diagonal starts
// are the cells along the top row and left column (down-right direction) or
// top row and right column (down-left direction); each ray runs to the
// grid edge, and lines shorter than 3 cells hold no triomino.
const mainDiagStarts = [...graph.row(1), ...graph.column(1).slice(1)];
const antiDiagStarts = [...graph.row(1), ...graph.column(9).slice(1)];
const diagonalLines = (starts, dRow, dCol) => starts
  .map(start => graph.ray(start, dRow, dCol))
  .filter(line => line.length >= 3);

const triominoLines = [
  ...graph.rows(),
  ...graph.columns(),
  ...diagonalLines(mainDiagStarts, 1, 1),
  ...diagonalLines(antiDiagStarts, 1, -1),
];

// Every consecutive-cell window (i, i+1, i+2) along a line must sum to a
// multiple of 3. State carries the previous two digits read along the line
// (null until enough symbols have been seen); each new digit checks against
// the two behind it once both are known, and a failing window kills the
// branch immediately. `accept` is trivially true -- correctness lives
// entirely in `transition` rejecting a bad window as soon as it is read, not
// in any end-of-line condition. One spec compiled once and reused for every
// line, since the rule is identical everywhere it applies.
const triomino3Spec = NFA.encodeSpec({
  startState: { prev2: null, prev1: null },
  transition({ prev2, prev1 }, value) {
    if (prev1 === null) return { prev2: null, prev1: value };
    if (prev2 === null) return { prev2: prev1, prev1: value };
    if ((prev2 + prev1 + value) % 3 !== 0) return undefined;
    return { prev2: prev1, prev1: value };
  },
  accept: () => true,
}, puzzleShape);

const triominoConstraints = triominoLines.map((line, i) =>
  new NFA(triomino3Spec, `triomino sum ${i}`, ...line));

return [
  puzzleShape,
  diagonalOrder,
  thermo,
  ...triominoConstraints,
];
