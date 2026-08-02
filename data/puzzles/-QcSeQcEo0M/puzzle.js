// Title: It's A Wonderful Day For Pi!
// Author: SirWoezel
// Video: https://www.youtube.com/watch?v=-QcSeQcEo0M
// Source: https://sudokupad.app/pxw6dzgcdp

// Rules encoded, in full:
//
//  * Normal sudoku (ISS supplies rows, columns and boxes).
//  * Mean Diamonds: a digit N in a blue diamond means that on every line
//    leaving that diamond, the first N digits -- the diamond's own digit
//    counting as the first -- have an exact average of N, i.e. they total
//    N*N. A diamond sits at an end of each line it belongs to, so each
//    diamond/line pair gives one window.
//  * Mean Diamonds, second sentence: every cell of a line lies in at least
//    one of those windows. Each line runs between two diamonds, so its two
//    windows (one from each end) must between them reach every cell: the two
//    end digits must sum to at least the line's cell count.
//  * Pi Day: the three gold cells hold the digits 3, 1 and 4 in some order.
//
// No clause is omitted.

// The two blue strands, cell by cell, as drawn. Both are open chains of
// orthogonal and diagonal steps between neighbouring cells, with a diamond at
// each end.
//
// STRAND_1 merges the payload's two blue strokes. Their waypoint lists share
// the grid-corner point between R1C5, R1C6, R2C5 and R2C6, which is the only
// waypoint in the whole drawing that is not a cell centre; four ink rays meet
// there. Those rays are collinear in pairs -- the ray towards R3C7 continues
// straight into the ray towards R1C5 (one unbroken diagonal R3C7-R2C6-R1C5),
// and the ray towards R3C4 continues straight into the ray towards R1C6 (the
// unbroken diagonal R3C4-R2C5-R1C6). The drawn ink is therefore two straight
// strokes crossing at that corner, with no bend anywhere on it, and each
// stroke is traced straight through the crossing. Every other step in the
// drawing is centre-to-centre, as these two are once read this way.
const STRAND_1 = [
  'R6C4', 'R7C4', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R7C7', 'R6C7', 'R5C7',
  'R4C7', 'R3C7', 'R2C6', 'R1C5', 'R2C4', 'R1C3', 'R2C2', 'R3C1', 'R4C2',
  'R5C3', 'R5C4', 'R5C5', 'R6C5', 'R7C5', 'R7C6', 'R6C6', 'R5C6', 'R4C6',
  'R4C5', 'R4C4', 'R4C3', 'R3C2', 'R2C3', 'R3C3', 'R3C4', 'R2C5', 'R1C6',
];

const STRAND_2 = [
  'R3C8', 'R2C8', 'R3C9', 'R4C9', 'R5C8', 'R6C9', 'R6C8', 'R7C8', 'R8C8',
  'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R8C3', 'R8C2', 'R7C2', 'R6C1', 'R5C1',
  'R4C1',
];

// The nine blue diamonds: the 0.5x0.5 blue squares rotated 45 degrees, each
// centred on a cell.
const DIAMOND_CELLS = new Set([
  'R6C4', 'R4C7', 'R5C3', 'R7C5', 'R4C3', 'R1C6', 'R3C8', 'R9C7', 'R4C1',
]);

// The three gold cells: the 1x1 gold squares.
const GOLD_CELLS = ['R5C3', 'R5C5', 'R7C5'];

// A diamond marks where one line ends and the next begins, so each strand is
// cut into lines at its diamonds; the diamond cell belongs to both lines it
// separates. Every diamond falls on a strand, and both ends of every strand
// carry one, so each line runs diamond to diamond.
function linesOf(strand) {
  const at = [];
  strand.forEach((cell, i) => { if (DIAMOND_CELLS.has(cell)) at.push(i); });
  return at.slice(0, -1).map((start, k) => strand.slice(start, at[k + 1] + 1));
}
const LINES = [...linesOf(STRAND_1), ...linesOf(STRAND_2)];

// One machine, run from a diamond along its line. The first digit read is the
// diamond's own, and is both the window length N and the first summand; the
// machine then takes N-1 more digits and requires the N of them to total N*N.
// `done` is an accepting sink, so whatever the line holds beyond the window is
// left free. A run is dropped as soon as the digits still to come (each 1..9)
// can no longer land the total exactly on N*N, which is what keeps the
// compiled machine small. A run whose window is still open when the line runs
// out never reaches `done` and is rejected: the clue names "the first N
// digits" on the line, so a line shorter than N does not carry them.
const MEAN_WINDOW = NFA.encodeSpec({
  startState: { target: null, remaining: 0, sum: 0, done: false },
  transition: (state, value) => {
    if (state.done) return state;
    let target = state.target;
    let remaining;
    let sum;
    if (target === null) {
      target = value;
      remaining = value - 1;
      sum = value;
    } else {
      remaining = state.remaining - 1;
      sum = state.sum + value;
    }
    const shortfall = target * target - sum;
    if (remaining === 0) {
      if (shortfall !== 0) return undefined;
      return { target: null, remaining: 0, sum: 0, done: true };
    }
    if (shortfall < remaining || shortfall > 9 * remaining) return undefined;
    return { target, remaining, sum, done: false };
  },
  accept: (state) => state.done,
}, 9);

const meanWindows = LINES.flatMap((line) => [
  new NFA(MEAN_WINDOW, 'MeanDiamond', ...line),
  new NFA(MEAN_WINDOW, 'MeanDiamond', ...line.slice().reverse()),
]);

// The window from one end reaches the first N cells and the window from the
// other end reaches the last M, so they leave no cell out exactly when
// N + M is at least the line's length.
const coverage = LINES.map((line) => new Pair(
  Pair.fnToKey((a, b) => a + b >= line.length, 9),
  'MeanCoverage', line[0], line[line.length - 1]));

return [
  new Shape('9x9'),
  new AllDifferent(...GOLD_CELLS),
  ...GOLD_CELLS.map((cell) => new Given(cell, 1, 3, 4)),
  ...meanWindows,
  ...coverage,
];
