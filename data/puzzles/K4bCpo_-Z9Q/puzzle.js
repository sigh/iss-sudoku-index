// Title: Summing up Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=K4bCpo_-Z9Q
// Source: https://app.crackingthecryptic.com/sudoku/h92bTBgj9h

// Normal sudoku rules apply (Shape's default row/column/box all-different).
// Each outside clue gives the maximum sum of any "connected ascending"
// group in its row/column, scanned from the labelled side inward: split the
// 9 digits into runs that break wherever a digit is not greater than the one
// immediately before it (a lone digit is a run of length one); the clue is
// the largest run total. The scan direction (which side reads first) comes
// from the rules text ("from that side") together with each clue's drawn
// position; the rule names row/column reading, not the diagonal alternative
// a corner-adjacent outside badge could otherwise suggest.

function col(c) {
  return Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));
}
function row(r) {
  return Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
}

// DFA for "the maximum ascending-run sum along this scan equals `target`".
// State: prev = previous digit read (null before the first cell); cur =
// running sum of the ascending run currently open; achieved = whether some
// run's sum has hit `target` exactly at some point. `cur` is kept <= target
// by killing any continuation that would push it over -- since digits are
// positive, a run that ever exceeds `target` makes the row's true maximum
// exceed the clue, so no completion of that branch can be valid. Because a
// run's sum only grows while it stays open, checking equality at every
// growth step catches its final total, whichever way it stops growing (a
// break, or the end of the line).
function ascendingMaxSumSpec(target) {
  return NFA.encodeSpec({
    startState: { prev: null, cur: 0, achieved: false },
    transition: ({ prev, cur, achieved }, value) => {
      if (prev === null) {
        if (value > target) return undefined;
        return { prev: value, cur: value, achieved: achieved || value === target };
      }
      if (value > prev) {
        const newCur = cur + value;
        if (newCur > target) return undefined;
        return { prev: value, cur: newCur, achieved: achieved || newCur === target };
      }
      // Break: current run ends (its total was already checked above on the
      // step that grew it to `cur`), a new run starts at `value`.
      if (value > target) return undefined;
      return { prev: value, cur: value, achieved: achieved || value === target };
    },
    accept: ({ achieved }) => achieved,
  }, 9);
}

function ascendingMaxSum(target, ...cells) {
  return new NFA(ascendingMaxSumSpec(target), `max ascending run = ${target}`, ...cells);
}

const outsideClues = [
  ascendingMaxSum(36, ...col(3)),                       // top C3
  ascendingMaxSum(33, ...col(5)),                       // top C5
  ascendingMaxSum(24, ...col(8)),                       // top C8
  ascendingMaxSum(22, ...[...col(1)].reverse()),        // bottom C1
  ascendingMaxSum(20, ...[...col(7)].reverse()),        // bottom C7
  ascendingMaxSum(12, ...[...col(9)].reverse()),        // bottom C9
  ascendingMaxSum(17, ...row(1)),                       // left R1
  ascendingMaxSum(10, ...row(4)),                       // left R4
  ascendingMaxSum(12, ...row(6)),                       // left R6
  ascendingMaxSum(9,  ...[...row(4)].reverse()),        // right R4
  ascendingMaxSum(24, ...[...row(5)].reverse()),        // right R5
  ascendingMaxSum(16, ...[...row(8)].reverse()),        // right R8
];

return [
  new Shape('9x9'),
  ...outsideClues,
];
