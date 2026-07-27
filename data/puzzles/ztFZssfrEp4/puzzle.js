// Title: Sort of miraculous
// Author: apetersen
// Video: https://www.youtube.com/watch?v=ztFZssfrEp4
// Source: https://sudokupad.app/94c0vtokc3

// Rules encoded: normal sudoku (no givens), anti-knight (no repeated digit a
// knight's move apart), one black dot between R1C3/R2C3 (kropki ratio: one
// digit double the other), and a box-order rule: boxes are numbered 1-9 and
// their cells 1-9, both in normal reading order; in each odd-numbered box the
// odd digits present must occur in increasing order across the box's cell
// order, and in each even-numbered box the even digits present must occur in
// increasing order. Digits of the other parity may sit anywhere and do not
// break the sequence.

const graph = cellGraph('9x9');

// One NFA per box, scanning its 9 cells in reading order (graph.box(n) is
// already row-major). State = the last digit seen of the box's target
// parity, 0 meaning none yet. A digit of the other parity leaves the state
// unchanged (skipped); a target-parity digit must exceed the running state,
// else the box is rejected.
const boxOrderSpec = (parity) => NFA.encodeSpec({
  startState: 0,
  transition: (last, value) => {
    if ((value % 2) !== parity) return last;
    return value > last ? value : undefined;
  },
  accept: () => true,
}, 9);

const oddAscendingSpec = boxOrderSpec(1);
const evenAscendingSpec = boxOrderSpec(0);

const boxOrderConstraints = Array.from({ length: 9 }, (_, i) => {
  const boxNum = i + 1;
  const spec = (boxNum % 2 === 1) ? oddAscendingSpec : evenAscendingSpec;
  return new NFA(spec, 'BoxOrder', ...graph.box(boxNum));
});

return [
  new Shape('9x9'),
  new AntiKnight(),
  new BlackDot('R1C3', 'R2C3'),
  ...boxOrderConstraints,
];
