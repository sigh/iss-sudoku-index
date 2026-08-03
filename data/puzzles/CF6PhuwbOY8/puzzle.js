// Title: Icing disaster
// Author: dumediat
// Video: https://www.youtube.com/watch?v=CF6PhuwbOY8
// Source: https://app.crackingthecryptic.com/sudoku/9Jhfjg6FbL

// Normal sudoku on the 9x9 grid.
//
// Blue region-sum lines: digits on a blue line sum equally within each box
// the line crosses, and the whole area outside the 9x9 grid counts as one
// extra region for this rule -- a line that dips outside adds that visit's
// "digit" to the same running total as any other outside visit on the same
// line, even a second one elsewhere on the border.
//
// Outside numbers: a number outside the grid (drawn here only as the place a
// blue line's path leaves the grid, never as a printed total) equals the sum
// of the first N digits of its row/column counted from the end nearest the
// clue, where N is the value of that nearest (first) digit itself -- ISS's
// XSum rule, read from whichever edge the clue sits on. The rules text gives
// two worked examples that fix this reading precisely (quoted from
// metadata.rules, 0/10 marking the border ring outside the 9x9 grid):
//   Box 1: r0c1 + r1c0 = r1c2 + r1c3 + r2c1 + r3c1 + r3c2
//   Box 7: r8c0 + r10c3 = r7c1 + r8c1 + r9c1 + r9c2
// i.e. the two outside touches on one line (here, above column 1 and left of
// row 1) sum together and must equal that line's box-1 segment; likewise for
// box 7. Every blue line below reproduces this pattern.
//
// A dynamic-length prefix sum (length set by the row/column's own first
// digit) has no dedicated class once its target is another unknown segment's
// total rather than a printed number, and the total can run past ISS's
// 16-value Var/Shape cap (up to 45), so it is never materialized as a Var.
// Each line instead gets one multi-segment NFA that accumulates the fixed
// (in-grid) segment's total, freezes it at the first SEGMENT_BREAK, then
// accumulates the outside segment(s)' XSum-style totals and compares once at
// the end. A line with two same-length in-grid segments and no outside touch
// needs no NFA: EqualSum states that directly.

const graph = cellGraph('9x9');
const rowLeftToRight = n => graph.row(n);
const rowRightToLeft = n => [...graph.row(n)].reverse();
const colTopToBottom = n => graph.column(n);
const colBottomToTop = n => [...graph.column(n)].reverse();

// Ties a fixed (known, in-grid) segment's total to the combined total of one
// or two "outside" segments, each the full 9-cell row/column read from the
// clue's near end (index 0) to the far end -- the near end's own digit sets
// how many of that segment's digits (including itself) are counted.
// seg 0 is the fixed segment (summed in full); seg >= 1 are outside touches,
// whose per-touch running sum keeps accumulating into the same `total`
// field across a touch-to-touch SEGMENT_BREAK, only the per-touch seek/count
// phase resets. `frozen` (the fixed segment's total) is set at the first
// break and compared with the final `total` at accept.
// Track one signed balance (fixed total minus outside total so far) instead
// of the two totals separately: it is what `accept` actually needs, and
// collapsing to one field keeps the compiled state small. Neither total can
// ever legitimately exceed 45 in a real grid (at most 9 cells/digits), so
// clamping the balance to +-46 only ever swallows branches that no
// all-different constraint would have allowed anyway (e.g. nine 9s in a
// row) -- no real solution's balance ever reaches the clamp.
const CAP = 46;
const clamp = (balance) => Math.max(-CAP, Math.min(CAP, balance));

function outsideEqualsFixed(fixedCells, outsideTouches) {
  const spec = NFA.encodeSpec({
    startState: { stage: 'fixed', balance: 0, remaining: 0 },
    transition: (state, value) => {
      const { stage, balance, remaining } = state;
      if (value === SEGMENT_BREAK) {
        // Leaving the fixed segment freezes its total as the starting
        // balance; leaving one outside touch for the next just carries the
        // balance over -- either way, wait for the next segment's near cell.
        return { stage: 'seek', balance, remaining: 0 };
      }
      if (stage === 'fixed') {
        return { stage, balance: clamp(balance + value), remaining };
      }
      if (stage === 'seek') {
        // First (nearest) digit of this touch: it sets N and counts itself.
        return { stage: 'count', balance: clamp(balance - value), remaining: value - 1 };
      }
      if (remaining > 0) {
        return { stage, balance: clamp(balance - value), remaining: remaining - 1 };
      }
      return { stage, balance, remaining: 0 };
    },
    accept: (state) => state.stage !== 'fixed' && state.balance === 0,
    // Cells consumed = fixed segment + 9 per outside touch, plus one
    // SEGMENT_BREAK per boundary between segments.
    maxDepth: fixedCells.length + 9 * outsideTouches.length + outsideTouches.length,
  }, 9, { multiSegment: true });
  return new NFA(spec, 'outside-equals-fixed', fixedCells, ...outsideTouches);
}

return [
  new Shape('9x9'),

  new Given('R4C3', 5),
  new Given('R5C5', 9),
  new Given('R6C7', 4),

  // Lines with two in-grid box segments and no outside touch: a plain
  // EqualSum over the drawn per-box runs.
  new EqualSum(['R3C7'], ['R4C6', 'R5C6']),
  new EqualSum(['R8C6'], ['R7C7', 'R8C7', 'R9C8']),
  new EqualSum(['R8C2', 'R8C3'], ['R8C4']),

  // Lines with two in-grid box segments plus one outside touch: EqualSum
  // ties the two box segments together, and one NFA ties either of them
  // (they're already forced equal) to the outside touch.
  new EqualSum(['R4C4', 'R5C4'], ['R6C3', 'R5C2', 'R5C1']),
  outsideEqualsFixed(['R4C4', 'R5C4'], [rowLeftToRight(5)]), // clue left of row 5

  new EqualSum(['R5C8', 'R6C9'], ['R7C8', 'R8C9']),
  outsideEqualsFixed(['R5C8', 'R6C9'], [rowRightToLeft(8)]), // clue right of row 8

  // Lines with one in-grid box segment and one outside touch.
  outsideEqualsFixed(['R1C6', 'R2C6', 'R3C6', 'R3C5'], [colTopToBottom(6)]), // clue above column 6
  outsideEqualsFixed(['R1C8', 'R2C9'], [colTopToBottom(8)]), // clue above column 8
  outsideEqualsFixed(['R9C6', 'R9C5'], [colBottomToTop(4)]), // clue below column 4

  // Lines with one in-grid box segment and two outside touches (both count
  // toward the same "outside" total, per the Box 1 / Box 7 worked examples).
  outsideEqualsFixed(
    ['R1C3', 'R1C2', 'R2C1', 'R3C1', 'R3C2'],
    [colTopToBottom(1), rowLeftToRight(1)]), // clues above column 1 and left of row 1 (Box 1 example)
  outsideEqualsFixed(
    ['R4C9', 'R4C8', 'R5C7', 'R6C8'],
    [rowRightToLeft(2), rowRightToLeft(3)]), // clues right of rows 2 and 3
  outsideEqualsFixed(
    ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
    [rowLeftToRight(8), colBottomToTop(3)]), // clues left of row 8 and below column 3 (Box 7 example)
];
