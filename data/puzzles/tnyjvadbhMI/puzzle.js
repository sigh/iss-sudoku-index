// Title: Yin Yang Sum Frame Sudoku
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=tnyjvadbhMI
// Source: https://sudokupad.app/64pxbo25nr

// Normal sudoku. Colour each cell one of two colours such that each colour
// forms a single orthogonally connected region and no 2x2 block is entirely
// one colour (Yin Yang). Each outside clue gives the sum of the first three
// digits of its own colour seen from that direction, skipping any cell of
// the other colour; which colour each clue reads is not given and must be
// deduced (guaranteed to see at least three of that colour).
//
// Model: the native YinYang constraint supplies the YY shade Var (YIN/YANG)
// per cell, its connectivity, and the no-monochrome-2x2 rule. Each Sum Frame
// clue is Or(NFA reading the line as it would if the clue targets YIN,
// NFA reading it as if it targets YANG): the NFA scans the line's cells as
// an interleaved (digit, shade) stream, counts cells matching its baked-in
// target colour, sums their digits while count < 3, and accepts when exactly
// three have been seen and their sum equals the clue.

const YIN = 1, YANG = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
const shadeOf = cell => shade.at(cell);

// --- Coloured Sum Frame clues. ---
// For a fixed target colour, reads the line's cells (interleaved with their
// shade) in order: while fewer than 3 target-colour digits have been seen,
// each target-colour cell's digit is added to the running sum (clamped at
// clue+1, a permanent-fail sink) and the count incremented; non-target cells
// are skipped entirely (their digit never counted, matching "completely
// meaningless"). Accepts iff exactly 3 have been seen and they sum to `sum`.
function sumFrameNFA(targetShade, sum) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', count: 0, total: 0, pending: null },
    transition: ({ phase, count, total, pending }, value) => {
      if (phase === 'digit') return { phase: 'shade', count, total, pending: value };
      // phase === 'shade': `value` is this cell's shade, `pending` its digit.
      if (count < 3 && value === targetShade) {
        return {
          phase: 'digit', count: count + 1,
          total: Math.min(total + pending, sum + 1), pending: null,
        };
      }
      return { phase: 'digit', count, total, pending: null };
    },
    accept: ({ count, total }) => count === 3 && total === sum,
  }, 9);
}

// One Sum Frame clue: `cells` in scan order from the border inward. The
// target colour is unknown, so try both and accept if either works.
function sumFrame(cells, sum) {
  const stream = cells.flatMap(cell => [cell, shadeOf(cell)]);
  return new Or([
    new NFA(sumFrameNFA(YIN, sum), 'sum-frame-yin', ...stream),
    new NFA(sumFrameNFA(YANG, sum), 'sum-frame-yang', ...stream),
  ]);
}

const colDown = c => graph.column(c);                   // R1Cc .. R9Cc
const colUp = c => [...graph.column(c)].reverse();       // R9Cc .. R1Cc
const rowRight = r => graph.row(r);                      // RrC1 .. RrC9
const rowLeft = r => [...graph.row(r)].reverse();         // RrC9 .. RrC1

// [column, sum] pairs read downward from the top border.
const TOP = [[1, 7], [2, 6], [3, 18], [8, 18], [9, 19]];
// [column, sum] pairs read upward from the bottom border.
const BOTTOM = [[1, 6], [2, 7], [3, 17], [8, 19], [9, 20]];
// [row, sum] pairs read rightward from the left border.
const LEFT = [[1, 23], [2, 21], [5, 13], [7, 14], [8, 20], [9, 16]];
// [row, sum] pairs read leftward from the right border.
const RIGHT = [[1, 24], [2, 9], [5, 10], [8, 8], [9, 8]];

const sumFrameClues = [
  ...TOP.map(([c, sum]) => sumFrame(colDown(c), sum)),
  ...BOTTOM.map(([c, sum]) => sumFrame(colUp(c), sum)),
  ...LEFT.map(([r, sum]) => sumFrame(rowRight(r), sum)),
  ...RIGHT.map(([r, sum]) => sumFrame(rowLeft(r), sum)),
];

return [
  new Shape('9x9'),
  new YinYang(),

  new Given('R3C7', 7),
  new Given('R5C5', 8),
  new Given('R7C3', 6),

  // The rules never name which colour is which, and every constraint above
  // and below is exactly invariant under swapping YIN<->YANG everywhere (a
  // Sum Frame clue's Or tries both colours), so any solution's full swap is
  // also a solution with the identical digit grid and physical partition,
  // just the two arbitrary colour names exchanged. Pin one reference cell so
  // the model reports that single canonical labeling instead of counting the
  // redundant relabeling as a second solution.
  new Given(shadeOf('R1C1'), YIN),

  ...sumFrameClues,
];
